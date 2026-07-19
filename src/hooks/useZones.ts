import { useState, useEffect, useRef, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface Zone {
  id: string;
  name: string;
  section: string;
  capacity: number;
  current_occupancy: number;
  status: 'open' | 'crowded' | 'closed';
}

export function useZones() {
  // Stabilize the client reference so effect deps don't change on every render,
  // preventing unnecessary re-fetches and duplicate realtime subscriptions.
  const supabaseRef = useRef<SupabaseClient | null>(null);
  if (!supabaseRef.current) supabaseRef.current = createClient();
  const supabase = supabaseRef.current;

  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [simError, setSimError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [liveAnnouncement, setLiveAnnouncement] = useState('');
  const prevZonesRef = useRef<Record<string, number>>({});

  useEffect(() => {
    const fetchData = async () => {
      const { data: zonesData, error: zonesErr } = await supabase
        .from('zones')
        .select('*')
        .order('name', { ascending: true });

      if (!zonesErr && zonesData) {
        setZones(zonesData);
        const initialMap: Record<string, number> = {};
        zonesData.forEach((z) => {
          initialMap[z.id] = z.current_occupancy;
        });
        prevZonesRef.current = initialMap;
        setLastUpdated(new Date());
      }
      setLoading(false);
    };
    fetchData();
  // supabase is stabilized via useRef — empty dep array is correct here.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (zones.length === 0) return;
    const channel = supabase
      .channel('live-zones')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'zones'
      }, (payload) => {
        const updatedZone = payload.new as Zone;
        setZones(prev => prev.map(z =>
          z.id === updatedZone.id
            ? { ...z, ...updatedZone }
            : z
        ));
        setLastUpdated(new Date());

        const prevOccupancy = prevZonesRef.current[updatedZone.id] ?? 0;
        if (prevOccupancy !== updatedZone.current_occupancy) {
          const ratio = updatedZone.current_occupancy / updatedZone.capacity;
          let density = 'low';
          if (ratio >= 0.9) density = 'critical';
          else if (ratio >= 0.7) density = 'high';
          else if (ratio >= 0.4) density = 'medium';
          setLiveAnnouncement(
            `Alert: ${updatedZone.name} occupancy updated to ${updatedZone.current_occupancy} out of ${updatedZone.capacity}. Density status is now ${density}.`
          );
          prevZonesRef.current[updatedZone.id] = updatedZone.current_occupancy;
        }
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  // supabase is stabilized via useRef; zones.length triggers re-subscription when zones first load.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zones.length]);

  const triggerSimulation = async () => {
    setSimulating(true);
    setSimError(null);
    try {
      const res = await fetch('/api/simulate-crowd');
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to simulate crowd.');
    } catch (err) {
      setSimError(err instanceof Error ? err.message : 'Unknown simulation error');
    } finally {
      setSimulating(false);
    }
  };

  const stats = useMemo(() => ({
    totalFans: zones.reduce((sum, z) => sum + (z.current_occupancy || 0), 0),
    highDensityCount: zones.filter(z =>
      z.status === 'crowded' || z.status === 'closed').length,
    openCount: zones.filter(z => z.status === 'open').length,
  }), [zones]);

  return {
    zones,
    loading,
    simulating,
    simError,
    lastUpdated,
    liveAnnouncement,
    triggerSimulation,
    stats
  };
}
