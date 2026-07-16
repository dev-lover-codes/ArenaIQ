"use client"

export const dynamic = 'force-dynamic'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import AppShell from '@/components/layout/AppShell'
import { 
  ListTodo, 
  LayoutGrid, 
  Megaphone, 
  ShieldAlert, 
  Loader2, 
  Check, 
  AlertCircle,
  Bell
} from 'lucide-react'

interface Zone {
  id: string
  name: string
  section: string
  capacity: number
  current_occupancy: number
  status: 'open' | 'crowded' | 'closed'
}

interface Task {
  id: string
  title: string
  description: string | null
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'pending' | 'in_progress' | 'completed'
  zone_id: string
}

interface AlertBroadcast {
  id: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  created_at: string
}

export default function StaffPage() {
  const router = useRouter()
  const supabase = createClient()

  const [profile, setProfile] = useState<{ role?: string; full_name?: string } | null>(null)
  const [zones, setZones] = useState<Zone[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  // Broadcast state
  const [alertMsg, setAlertMsg] = useState('')
  const [alertSeverity, setAlertSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('medium')
  const [alertZone, setAlertZone] = useState('')
  const [broadcasting, setBroadcasting] = useState(false)
  const [broadcastSuccess, setBroadcastSuccess] = useState(false)

  // Live alerts state
  const [activeAlerts, setActiveAlerts] = useState<AlertBroadcast[]>([])
  const [liveAnnouncement, setLiveAnnouncement] = useState('')

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user }, error: authErr } = await supabase.auth.getUser()
      if (authErr || !user) {
        router.push('/login')
        return
      }

      // Fetch user profile to check role
      const { data: profileData, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileErr || !profileData || (profileData.role !== 'staff' && profileData.role !== 'organizer')) {
        // Access Denied: redirect to dashboard
        router.push('/dashboard')
        return
      }
      setProfile(profileData)

      // Fetch zones and tasks
      const [zonesRes, tasksRes] = await Promise.all([
        supabase.from('zones').select('*').order('name', { ascending: true }),
        supabase.from('staff_tasks').select('*').order('created_at', { ascending: false })
      ])

      if (zonesRes.data) setZones(zonesRes.data)
      if (tasksRes.data) setTasks(tasksRes.data)

      setLoading(false)
    }

    fetchUserData()
  }, [router, supabase])

  // Setup Realtime subscriptions for updates
  useEffect(() => {
    if (!profile) return

    // Listen to changes on zones
    const zoneChannel = supabase
      .channel('staff-zones')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'zones' },
        (payload) => {
          const updatedZone = payload.new as Zone
          setZones((prev) => prev.map((z) => (z.id === updatedZone.id ? updatedZone : z)))
        }
      )
      .subscribe()

    // Listen to changes on tasks
    const taskChannel = supabase
      .channel('staff-tasks')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'staff_tasks' },
        async () => {
          // Re-fetch tasks
          const { data } = await supabase.from('staff_tasks').select('*').order('created_at', { ascending: false })
          if (data) setTasks(data)
        }
      )
      .subscribe()

    // Listen to Realtime Broadcast alerts from crowd_events (staff_alert)
    const alertChannel = supabase
      .channel('staff-alerts')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'crowd_events' },
        (payload) => {
          const newEvent = payload.new
          if (newEvent.event_type === 'staff_alert') {
            const freshAlert: AlertBroadcast = {
              id: newEvent.id,
              severity: newEvent.severity,
              description: newEvent.description,
              created_at: newEvent.created_at
            }
            setActiveAlerts((prev) => [freshAlert, ...prev])
            setLiveAnnouncement(`Priority alert received: ${newEvent.description}`)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(zoneChannel)
      supabase.removeChannel(taskChannel)
      supabase.removeChannel(alertChannel)
    }
  }, [profile, supabase])



  // Update Zone Status in database
  const updateZoneStatus = async (zoneId: string, status: 'open' | 'crowded' | 'closed') => {
    setLiveAnnouncement(`Updating status of zone to ${status}...`)
    const { error } = await supabase
      .from('zones')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', zoneId)

    if (error) {
      alert(`Error updating zone status: ${error.message}`)
    } else {
      setLiveAnnouncement(`Zone status updated successfully.`)
    }
  }

  // Broadcast Alert (Insert to crowd_events)
  const handleBroadcastAlert = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!alertMsg.trim() || broadcasting) return

    setBroadcasting(true)
    setBroadcastSuccess(false)

    const { error } = await supabase
      .from('crowd_events')
      .insert({
        zone_id: alertZone || null,
        event_type: 'staff_alert',
        severity: alertSeverity,
        description: alertMsg.trim(),
        occupancy_count: 0 // dummy for event schema constraint if necessary, otherwise defaults
      })

    if (error) {
      alert(`Error broadcasting alert: ${error.message}`)
    } else {
      setAlertMsg('')
      setBroadcastSuccess(true)
      setTimeout(() => setBroadcastSuccess(false), 3000)
    }
    setBroadcasting(false)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500 text-white border-red-400'
      case 'high': return 'bg-orange-500 text-white border-orange-400'
      case 'medium': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      default: return 'bg-zinc-800 text-slate-300 border-zinc-700'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-emerald-400 border border-emerald-500/30 bg-emerald-500/10'
      case 'in_progress': return 'text-amber-400 border border-amber-500/30 bg-amber-500/10'
      default: return 'text-slate-400 border border-zinc-800 bg-zinc-900/60'
    }
  }

  if (loading) {
    return (
      <AppShell title="Staff Ops">
        <div className="flex min-h-full items-center justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell title="Staff Ops">
      
      {/* Screen Reader Live announcements */}
      <div className="sr-only" aria-live="assertive" aria-atomic="true">
        {liveAnnouncement}
      </div>

      {/* Main Staff Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-20 md:pb-8">
        
        {/* Banner */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Operations & Volunteer Coordination Panel
          </h1>
          <p className="mt-2 text-slate-400">
            Real-time zone management, volunteer task scheduling, and priority message broadcasting for the matchday crew.
          </p>
        </div>

        {/* Live Broadcast Feed */}
        {activeAlerts.length > 0 && (
          <section aria-label="Incoming Staff Alerts" className="space-y-3">
            <h2 className="text-md font-bold text-red-400 flex items-center gap-2">
              <Bell className="h-5 w-5 animate-bounce" />
              Incoming Live Operational Broadcasts
            </h2>
            <div className="grid grid-cols-1 gap-2">
              {activeAlerts.slice(0, 3).map((alert) => (
                <div 
                  key={alert.id} 
                  className={`flex items-center justify-between p-4 border rounded-xl shadow-md ${
                    alert.severity === 'critical' 
                      ? 'bg-red-950/40 border-red-500/50 text-red-200' 
                      : alert.severity === 'high' 
                        ? 'bg-orange-950/20 border-orange-500/40 text-orange-200' 
                        : 'bg-zinc-900 border-zinc-800 text-slate-200'
                  }`}
                  role="alert"
                >
                  <div className="flex items-center space-x-3">
                    <ShieldAlert className="h-5 w-5 shrink-0" />
                    <span className="text-sm font-medium">{alert.description}</span>
                  </div>
                  <span className="text-xs text-slate-500">
                    {new Date(alert.created_at).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Column 1: Broadcast & Zone Management */}
          <div className="space-y-8 lg:col-span-1">
            
            {/* Broadcast Form */}
            <section aria-label="Alert Broadcast Form" className="border border-zinc-800 bg-zinc-900/30 p-6 rounded-2xl shadow-xl">
              <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-emerald-400" />
                Broadcast Staff Alert
              </h2>

              <form onSubmit={handleBroadcastAlert} className="space-y-4" aria-label="Broadcast alert form">
                
                <div>
                  <label htmlFor="alert-text" className="block text-sm font-semibold text-slate-300">
                    Message Description
                  </label>
                  <textarea
                    id="alert-text"
                    value={alertMsg}
                    onChange={(e) => setAlertMsg(e.target.value)}
                    required
                    placeholder="Enter details of incident or instruction..."
                    rows={3}
                    className="mt-1 block w-full rounded-lg border border-zinc-800 bg-zinc-950 py-2 px-3 text-white focus:border-emerald-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="alert-severity" className="block text-sm font-semibold text-slate-300">
                    Severity Level
                  </label>
                  <select
                    id="alert-severity"
                    value={alertSeverity}
                    onChange={(e) => setAlertSeverity(e.target.value as 'low' | 'medium' | 'high' | 'critical')}
                    className="mt-1 block w-full rounded-lg border border-zinc-800 bg-zinc-950 py-2 px-3 text-white focus:border-emerald-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 sm:text-sm"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                    <option value="critical">Critical (Urgent)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="alert-zone" className="block text-sm font-semibold text-slate-300">
                    Target Zone (Optional)
                  </label>
                  <select
                    id="alert-zone"
                    value={alertZone}
                    onChange={(e) => setAlertZone(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-zinc-800 bg-zinc-950 py-2 px-3 text-white focus:border-emerald-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 sm:text-sm"
                  >
                    <option value="">All Zones</option>
                    {zones.map((z) => (
                      <option key={z.id} value={z.id}>{z.name}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={broadcasting || !alertMsg.trim()}
                  className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition focus:outline-hidden focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                  aria-label="Broadcast alert message to all staff"
                >
                  {broadcasting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Broadcasting...
                    </>
                  ) : (
                    'Send Real-time Broadcast'
                  )}
                </button>

                {broadcastSuccess && (
                  <div className="flex items-center text-xs text-emerald-400 bg-emerald-950/20 border border-emerald-900/30 px-3 py-2 rounded-lg" role="alert">
                    <Check className="h-4 w-4 mr-2" />
                    <span>Broadcast alert sent successfully.</span>
                  </div>
                )}

              </form>
            </section>

          </div>

          {/* Column 2 & 3: Tasks and Zone status list */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Zone Status Management */}
            <section aria-label="Zone Status Overview" className="border border-zinc-800 bg-zinc-900/30 p-6 rounded-2xl shadow-xl">
              <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <LayoutGrid className="h-5 w-5 text-teal-400" />
                Zone Status Overview
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="text-xs uppercase bg-zinc-950 text-slate-400 border-b border-zinc-800">
                    <tr>
                      <th scope="col" className="px-6 py-3">Zone Name</th>
                      <th scope="col" className="px-6 py-3">Capacity</th>
                      <th scope="col" className="px-6 py-3">Occupancy</th>
                      <th scope="col" className="px-6 py-3">Operational Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-850">
                    {zones.map((zone) => (
                      <tr key={zone.id} className="hover:bg-zinc-900/40">
                        <td className="px-6 py-4 font-bold text-white">{zone.name}</td>
                        <td className="px-6 py-4">{zone.capacity.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <span className={zone.current_occupancy / zone.capacity >= 0.85 ? 'text-red-400 font-semibold' : 'text-slate-300'}>
                            {zone.current_occupancy.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <label htmlFor={`zone-status-${zone.id}`} className="sr-only">Change status for {zone.name}</label>
                          <select
                            id={`zone-status-${zone.id}`}
                            value={zone.status}
                            onChange={(e) => updateZoneStatus(zone.id, e.target.value as 'open' | 'crowded' | 'closed')}
                            className="bg-zinc-950 border border-zinc-800 rounded-md py-1 px-2.5 text-xs text-white focus:border-emerald-500 focus:outline-hidden"
                          >
                            <option value="open">Open</option>
                            <option value="crowded">Crowded</option>
                            <option value="closed">Closed</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Task Assignments */}
            <section aria-label="Volunteer Task Log" className="border border-zinc-800 bg-zinc-900/30 p-6 rounded-2xl shadow-xl">
              <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <ListTodo className="h-5 w-5 text-blue-400" />
                Staff & Volunteer Tasks
              </h2>

              {tasks.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <AlertCircle className="mx-auto h-8 w-8 text-zinc-700 mb-2" />
                  <span>No operational tasks registered.</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <article 
                      key={task.id} 
                      className="border border-zinc-850 bg-zinc-950/60 p-4 rounded-xl flex items-start justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider ${getStatusColor(task.status)}`}>
                            {task.status.replace('_', ' ')}
                          </span>
                        </div>
                        <h3 className="font-bold text-white text-md mt-1.5">{task.title}</h3>
                        {task.description && (
                          <p className="text-xs text-slate-400 leading-relaxed">{task.description}</p>
                        )}
                        <span className="text-[10px] text-slate-500 block">
                          Location Ref: {zones.find((z) => z.id === task.zone_id)?.name || 'Unknown Zone'}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

          </div>

        </div>

      </div>
    </AppShell>
  )
}
