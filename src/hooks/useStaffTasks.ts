import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';

import type { Zone, Task, AlertBroadcast } from '@/types';

/**
 * Custom React hook for the Staff Operations Panel.
 * Validates staff/organizer roles, retrieves current zones and incidents tasks,
 * and maintains realtime updates for crowd density events and custom broadcasts.
 * 
 * @returns State variables, loading states, and update status/broadcast handler functions.
 */
// eslint-disable-next-line max-lines-per-function -- State composition hook that handles user authentication validation, real-time table listeners, and updates.
export function useStaffTasks() {
  const router = useRouter();
  // Stabilize the client so effect deps don't change on every render,
  // preventing repeated auth checks and duplicate realtime subscriptions.
  const supabaseRef = useRef<SupabaseClient | null>(null);
  if (!supabaseRef.current) supabaseRef.current = createClient();
  const supabase = supabaseRef.current;

  const [profile, setProfile] = useState<{ role?: string; full_name?: string } | null>(null);
  const [zones, setZones] = useState<Zone[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeAlerts, setActiveAlerts] = useState<AlertBroadcast[]>([]);
  const [liveAnnouncement, setLiveAnnouncement] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user }, error: authErr } = await supabase.auth.getUser();
      if (authErr || !user) {
        router.push('/login');
        return;
      }

      const { data: profileData, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileErr || !profileData || (profileData.role !== 'staff' && profileData.role !== 'organizer')) {
        router.push('/dashboard');
        return;
      }
      setProfile(profileData);

      const [zonesRes, tasksRes] = await Promise.all([
        supabase.from('zones').select('*').order('name', { ascending: true }),
        supabase.from('staff_tasks').select('*').order('created_at', { ascending: false })
      ]);

      if (zonesRes.data) setZones(zonesRes.data);
      if (tasksRes.data) setTasks(tasksRes.data);

      setLoading(false);
    };

    fetchUserData();
  // supabase is stabilized via useRef — only router is a real dep here.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  useEffect(() => {
    if (!profile) return;

    const zoneChannel = supabase
      .channel('staff-zones')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'zones' },
        (payload) => {
          const updatedZone = payload.new as Zone;
          setZones((prev) => prev.map((z) => (z.id === updatedZone.id ? updatedZone : z)));
        }
      )
      .subscribe();

    const taskChannel = supabase
      .channel('staff-tasks')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'staff_tasks' },
        async () => {
          const { data } = await supabase.from('staff_tasks').select('*').order('created_at', { ascending: false });
          if (data) setTasks(data);
        }
      )
      .subscribe();

    const alertChannel = supabase
      .channel('staff-alerts')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'crowd_events' },
        (payload) => {
          const newEvent = payload.new;
          if (newEvent.event_type === 'staff_alert') {
            const freshAlert: AlertBroadcast = {
              id: newEvent.id,
              severity: newEvent.severity,
              description: newEvent.description,
              created_at: newEvent.created_at
            };
            setActiveAlerts((prev) => [freshAlert, ...prev]);
            setLiveAnnouncement(`Priority alert received: ${newEvent.description}`);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(zoneChannel);
      supabase.removeChannel(taskChannel);
      supabase.removeChannel(alertChannel);
    };
  // supabase is stabilized via useRef; profile drives when subscriptions start.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  const updateZoneStatus = async (zoneId: string, status: 'open' | 'crowded' | 'closed') => {
    setLiveAnnouncement(`Updating status of zone to ${status}...`);
    const { error } = await supabase
      .from('zones')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', zoneId);

    if (error) {
      alert(`Error updating zone status: ${error.message}`);
    } else {
      setLiveAnnouncement(`Zone status updated successfully.`);
    }
  };

  const broadcastAlert = async (alertMsg: string, alertSeverity: string, alertZone: string) => {
    const { error } = await supabase
      .from('crowd_events')
      .insert({
        zone_id: alertZone || null,
        event_type: 'staff_alert',
        severity: alertSeverity,
        description: alertMsg.trim(),
        occupancy_count: 0
      });
    if (error) {
      throw error;
    }
  };

  return {
    profile,
    zones,
    tasks,
    loading,
    activeAlerts,
    liveAnnouncement,
    setLiveAnnouncement,
    updateZoneStatus,
    broadcastAlert
  };
}
