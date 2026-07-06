"use client"

import React, { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { 
  Activity, 
  LogOut, 
  Accessibility, 
  Play, 
  Loader2,
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
  Compass
} from 'lucide-react'

interface Zone {
  id: string
  name: string
  section: string
  capacity: number
  current_occupancy: number
  status: 'open' | 'crowded' | 'closed'
}

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [profile, setProfile] = useState<any>(null)
  const [zones, setZones] = useState<Zone[]>([])
  const [loading, setLoading] = useState(true)
  const [simulating, setSimulating] = useState(false)
  const [simError, setSimError] = useState<string | null>(null)
  
  // Quick Nav State
  const [quickStart, setQuickStart] = useState('')
  const [quickEnd, setQuickEnd] = useState('')

  // Accessibility Live Announcements
  const [liveAnnouncement, setLiveAnnouncement] = useState('')
  const prevZonesRef = useRef<Record<string, number>>({})

  useEffect(() => {
    const fetchSessionAndData = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) {
        router.push('/login')
        return
      }
      setUser(user)

      // Fetch user profile role
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      setProfile(profileData)

      // Fetch zones
      const { data: zonesData, error: zonesErr } = await supabase
        .from('zones')
        .select('*')
        .order('name', { ascending: true })

      if (!zonesErr && zonesData) {
        setZones(zonesData)
        // Store initial occupancies
        const initialMap: Record<string, number> = {}
        zonesData.forEach((z) => {
          initialMap[z.id] = z.current_occupancy
        })
        prevZonesRef.current = initialMap
      }
      setLoading(false)
    }
    
    fetchSessionAndData()
  }, [router, supabase])

  // Setup Realtime subscription for zones updates
  useEffect(() => {
    if (zones.length === 0) return

    const channel = supabase
      .channel('live-zones')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'zones'
        },
        (payload) => {
          const updatedZone = payload.new as Zone
          
          setZones((prev) =>
            prev.map((z) => (z.id === updatedZone.id ? updatedZone : z))
          )

          // Calculate density transition for screen readers
          const prevOccupancy = prevZonesRef.current[updatedZone.id] ?? 0
          if (prevOccupancy !== updatedZone.current_occupancy) {
            const ratio = updatedZone.current_occupancy / updatedZone.capacity
            let density = 'low'
            if (ratio >= 0.9) density = 'critical'
            else if (ratio >= 0.7) density = 'high'
            else if (ratio >= 0.4) density = 'medium'

            setLiveAnnouncement(
              `Alert: ${updatedZone.name} occupancy updated to ${updatedZone.current_occupancy} out of ${updatedZone.capacity}. Density status is now ${density}.`
            )
            prevZonesRef.current[updatedZone.id] = updatedZone.current_occupancy
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [zones.length, supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.refresh()
    router.push('/login')
  }

  // Trigger local API simulator to update database
  const triggerSimulation = async () => {
    setSimulating(true)
    setSimError(null)
    try {
      const res = await fetch('/api/simulate-crowd')
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to simulate crowd.')
      }
    } catch (err) {
      setSimError(err instanceof Error ? err.message : 'Unknown simulation error')
    } finally {
      setSimulating(false)
    }
  }

  const getDensityDetails = (occupancy: number, capacity: number) => {
    const ratio = occupancy / capacity
    if (ratio >= 0.9) {
      return {
        level: 'Critical',
        bg: 'bg-red-950/70 border-red-500/50',
        text: 'text-red-200 font-bold',
        badge: 'bg-red-500 text-white font-bold',
      }
    }
    if (ratio >= 0.7) {
      return {
        level: 'High',
        bg: 'bg-orange-950/40 border-orange-500/40',
        text: 'text-orange-300 font-semibold',
        badge: 'bg-orange-600 text-white font-semibold',
      }
    }
    if (ratio >= 0.4) {
      return {
        level: 'Medium',
        bg: 'bg-amber-950/20 border-amber-600/30',
        text: 'text-amber-300',
        badge: 'bg-amber-500 text-zinc-950 font-medium',
      }
    }
    return {
      level: 'Low',
      bg: 'bg-zinc-900/40 border-zinc-800',
      text: 'text-emerald-400',
      badge: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    }
  }

  const handleQuickNavSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!quickStart || !quickEnd) return
    router.push(`/navigate?startZone=${quickStart}&endZone=${quickEnd}`)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-slate-100 font-sans">
      
      {/* Accessibility Announcement Container */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {liveAnnouncement}
      </div>

      {/* Navigation Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-500">
                <Activity className="h-5 w-5 text-white" />
              </span>
              <span className="text-xl font-bold tracking-tight text-white">
                Stadium<span className="text-emerald-400">IQ</span>
              </span>
            </div>

            {/* Navigation links */}
            <nav className="hidden md:flex space-x-1" aria-label="Main Navigation">
              <Link 
                href="/dashboard" 
                className="px-3 py-2 rounded-lg text-sm font-semibold bg-zinc-800 text-emerald-400 border border-zinc-700"
                aria-current="page"
              >
                Heatmap Dashboard
              </Link>
              <Link 
                href="/navigate" 
                className="px-3 py-2 rounded-lg text-sm font-semibold text-slate-300 hover:text-white hover:bg-zinc-800"
              >
                Smart Route Planner
              </Link>
              <Link 
                href="/assistant" 
                className="px-3 py-2 rounded-lg text-sm font-semibold text-slate-300 hover:text-white hover:bg-zinc-800"
              >
                Multilingual AI Assistant
              </Link>
              {(profile?.role === 'staff' || profile?.role === 'organizer') && (
                <Link 
                  href="/staff" 
                  className="px-3 py-2 rounded-lg text-sm font-semibold text-slate-300 hover:text-white hover:bg-zinc-800"
                >
                  Staff Panel
                </Link>
              )}
            </nav>

            {/* Profile & Controls */}
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs text-slate-400">Operator</span>
                <span className="text-sm font-semibold text-slate-200">{user?.email}</span>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm font-semibold transition focus:outline-hidden focus:ring-2 focus:ring-red-500"
                aria-label="Sign out of operations dashboard"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Main Dashboard Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Title and Controls Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              Crowd Density Heatmap
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" aria-hidden="true"></span>
            </h1>
            <p className="mt-1 text-slate-400">
              Live updates of stadium zones. Changes propagate instantly using Supabase Realtime subscriptions.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {simError && (
              <div className="flex items-center text-xs text-red-400 bg-red-950/20 border border-red-900/30 px-3 py-2 rounded-lg" role="alert">
                <span>Error: {simError}</span>
              </div>
            )}
            <button
              onClick={triggerSimulation}
              disabled={simulating}
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition focus:outline-hidden focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
              aria-label="Trigger crowd movement simulation step"
            >
              {simulating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Simulating...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Trigger Simulation Nudge
                </>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation fallback */}
        <div className="md:hidden grid grid-cols-4 gap-2">
          <Link href="/dashboard" className="px-2 py-2 rounded-lg text-xs font-bold text-center bg-zinc-800 text-emerald-400 border border-zinc-700">Heatmap</Link>
          <Link href="/navigate" className="px-2 py-2 rounded-lg text-xs font-bold text-center bg-zinc-900 text-slate-300">Navigate</Link>
          <Link href="/assistant" className="px-2 py-2 rounded-lg text-xs font-bold text-center bg-zinc-900 text-slate-300">AI Chat</Link>
          {(profile?.role === 'staff' || profile?.role === 'organizer') && (
            <Link href="/staff" className="px-2 py-2 rounded-lg text-xs font-bold text-center bg-zinc-900 text-slate-300">Staff</Link>
          )}
        </div>

        {/* Top Info Cards: Match Card & Quick Navigation widget */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Match Info Card */}
          <section aria-label="Current Matchday Information" className="border border-zinc-800 bg-zinc-900/30 p-6 rounded-2xl shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                  LIVE MATCHDAY
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  80&apos; Played
                </span>
              </div>
              <h2 className="text-2xl font-black tracking-tight text-white mt-4 flex items-center justify-between">
                <span>Mexico</span>
                <span className="text-emerald-400 px-4">2 - 1</span>
                <span>USA</span>
              </h2>
              <p className="text-sm text-slate-400 mt-2 font-medium">FIFA World Cup 2026™ • Group Stage Match</p>
            </div>
            
            <div className="mt-6 pt-6 border-t border-zinc-850 grid grid-cols-2 gap-4 text-xs text-slate-400">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-emerald-500" />
                <span>Monday, July 6, 2026</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-emerald-500" />
                <span>Estadio Azteca, CDMX</span>
              </div>
            </div>
          </section>

          {/* Quick Navigation widget */}
          <section aria-label="Quick Routing Tool" className="border border-zinc-800 bg-zinc-900/30 p-6 rounded-2xl shadow-xl">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Compass className="h-5 w-5 text-emerald-400" />
              Quick Navigation Assistant
            </h2>
            <form onSubmit={handleQuickNavSubmit} className="space-y-4" aria-label="Quick Navigation Form">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="quick-start-select" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Where are you?
                  </label>
                  <select
                    id="quick-start-select"
                    value={quickStart}
                    onChange={(e) => setQuickStart(e.target.value)}
                    required
                    className="mt-1.5 block w-full rounded-lg border border-zinc-800 bg-zinc-950 py-1.5 px-3.5 text-xs text-white focus:border-emerald-500 focus:outline-hidden"
                  >
                    <option value="">Select current gate...</option>
                    {zones.filter(z => z.name.toLowerCase().includes('gate')).map((z) => (
                      <option key={z.id} value={z.id}>{z.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="quick-end-select" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Where is your seat?
                  </label>
                  <select
                    id="quick-end-select"
                    value={quickEnd}
                    onChange={(e) => setQuickEnd(e.target.value)}
                    required
                    className="mt-1.5 block w-full rounded-lg border border-zinc-800 bg-zinc-950 py-1.5 px-3.5 text-xs text-white focus:border-emerald-500 focus:outline-hidden"
                  >
                    <option value="">Select section...</option>
                    {zones.filter(z => !z.name.toLowerCase().includes('gate')).map((z) => (
                      <option key={z.id} value={z.id}>{z.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                type="submit"
                disabled={!quickStart || !quickEnd}
                className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition focus:outline-hidden disabled:opacity-50"
              >
                Plan Crowd-Aware Route
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </form>
          </section>

        </div>

        {/* Grid Layout of Zones */}
        <section aria-label="Stadium Zones Heatmap" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {zones.map((zone) => {
            const details = getDensityDetails(zone.current_occupancy, zone.capacity)
            const ratio = zone.current_occupancy / zone.capacity
            const percent = Math.round(ratio * 100)

            return (
              <article 
                key={zone.id} 
                className={`border rounded-2xl p-6 transition shadow-md flex flex-col justify-between ${details.bg}`}
              >
                <div>
                  {/* Header Row */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-lg font-bold text-white tracking-tight">{zone.name}</h2>
                      <span className="text-xs text-slate-400 block mt-0.5">{zone.section}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${details.badge}`}>
                      {details.level}
                    </span>
                  </div>

                  {/* Occupancy stats */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Current Occupancy:</span>
                      <span className={`font-semibold ${details.text}`}>{zone.current_occupancy.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Max Capacity:</span>
                      <span className="text-slate-300 font-medium">{zone.capacity.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-6 space-y-1.5">
                  <div className="h-2 w-full rounded-full bg-zinc-950 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        ratio >= 0.9 ? 'bg-red-500' : ratio >= 0.7 ? 'bg-orange-500' : ratio >= 0.4 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span className="font-semibold">{percent}% Filled</span>
                    <span className="capitalize">Status: <strong className={zone.status === 'closed' ? 'text-red-400' : 'text-slate-300'}>{zone.status}</strong></span>
                  </div>
                </div>

              </article>
            )
          })}
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 bg-zinc-950 py-6 mt-16 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 FIFA World Cup StadiumIQ. Real-time operations dashboard.</p>
          <div className="flex items-center space-x-2 text-emerald-400">
            <Accessibility className="h-4 w-4" />
            <span>WCAG 2.1 AA Compliant (High Contrast Checked)</span>
          </div>
        </div>
      </footer>

    </div>
  )
}
