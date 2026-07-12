"use client"

export const dynamic = 'force-dynamic'

import React, { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { 
  Activity, 
  LogOut, 
  Accessibility, 
  Loader2,
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
  Compass,
  Zap
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
        barColor: 'bg-red-500',
        indicatorColor: 'bg-red-500',
        text: 'text-red-400 font-black',
        badge: 'bg-red-500/20 text-red-400 font-bold border border-red-500/40',
        statusLabel: 'CRITICAL',
      }
    }
    if (ratio >= 0.7) {
      return {
        level: 'High',
        barColor: 'bg-orange-500',
        indicatorColor: 'bg-orange-500',
        text: 'text-orange-400 font-black',
        badge: 'bg-orange-500/20 text-orange-400 font-semibold border border-orange-500/40',
        statusLabel: 'CROWDED',
      }
    }
    if (ratio >= 0.4) {
      return {
        level: 'Medium',
        barColor: 'bg-amber-500',
        indicatorColor: 'bg-amber-500',
        text: 'text-amber-400 font-bold',
        badge: 'bg-amber-500/20 text-amber-400 font-medium border border-amber-500/40',
        statusLabel: 'FILLING',
      }
    }
    return {
      level: 'Low',
      barColor: 'bg-emerald-500',
      indicatorColor: 'bg-emerald-500',
      text: 'text-emerald-400 font-bold',
      badge: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40',
      statusLabel: 'OPEN',
    }
  }

  const handleQuickNavSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!quickStart || !quickEnd) return
    router.push(`/navigate?startZone=${quickStart}&endZone=${quickEnd}`)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy-deep text-white">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-navy-deep text-slate-100 font-sans stadium-grid">
      
      {/* Accessibility Announcement Container */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {liveAnnouncement}
      </div>

      {/* ── COMMAND CENTER TOP BAR ─────────────────────────── */}
      <header className="border-b border-navy-border bg-navy-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            
            {/* Left: Logo + COMMAND CENTER label */}
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-gold to-yellow-500 shadow-[0_0_10px_rgba(255,215,0,0.3)]">
                <Activity className="h-5 w-5 text-navy-deep" />
              </span>
              <div>
                <span className="text-xl font-bold tracking-tight text-white">
                  Arena<span className="text-gold">IQ</span>
                </span>
                <span className="hidden sm:block text-[10px] font-black tracking-[0.18em] text-electric-blue uppercase">
                  Command Center
                </span>
              </div>
            </div>

            {/* Center: MATCHDAY OPERATIONS — LIVE */}
            <div className="hidden md:flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-red-400 animate-ping"></span>
              <span className="text-xs font-black tracking-widest text-white uppercase">
                Matchday Operations
              </span>
              <span className="text-xs font-black tracking-widest text-red-400 uppercase">— Live</span>
            </div>

            {/* Navigation links */}
            <nav className="hidden lg:flex space-x-1" aria-label="Main Navigation">
              <Link 
                href="/dashboard" 
                className="px-3 py-2 rounded-lg text-sm font-semibold bg-navy-deep text-gold border border-navy-border"
                aria-current="page"
              >
                Heatmap Dashboard
              </Link>
              <Link 
                href="/navigate" 
                className="px-3 py-2 rounded-lg text-sm font-semibold text-slate-300 hover:text-white hover:bg-navy-card"
              >
                Smart Route Planner
              </Link>
              <Link 
                href="/assistant" 
                className="px-3 py-2 rounded-lg text-sm font-semibold text-slate-300 hover:text-white hover:bg-navy-card"
              >
                Multilingual AI Assistant
              </Link>
              {(profile?.role === 'staff' || profile?.role === 'organizer') && (
                <Link 
                  href="/staff" 
                  className="px-3 py-2 rounded-lg text-sm font-semibold text-slate-300 hover:text-white hover:bg-navy-card"
                >
                  Staff Panel
                </Link>
              )}
            </nav>

            {/* Right: Role badge + logout */}
            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-[10px] font-bold tracking-widest text-electric-blue uppercase">
                  {profile?.role || 'Operator'}
                </span>
                <span className="text-xs font-semibold text-slate-300 truncate max-w-[140px]">{user?.email}</span>
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
      <main role="main" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Title and Controls Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3" style={{ fontWeight: 900, letterSpacing: '-0.04em' }}>
              Crowd Density Heatmap
              <span className="inline-flex items-center gap-1 text-xs font-bold text-red-400 bg-red-950/30 border border-red-500/30 rounded-full px-2 py-0.5 ml-2">
                <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-ping" />
                LIVE
              </span>
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
            {/* Prominent gold Simulate button */}
            <button
              onClick={triggerSimulation}
              disabled={simulating}
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-lg bg-gold hover:bg-yellow-400 text-navy-deep font-black text-sm transition focus:outline-hidden focus:ring-2 focus:ring-gold disabled:opacity-50 shadow-[0_0_20px_rgba(245,197,24,0.15)]"
              aria-label="Trigger crowd movement simulation step"
            >
              {simulating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Simulating...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Simulate Crowd Movement
                </>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation fallback */}
        <div className="md:hidden grid grid-cols-4 gap-2">
          <Link href="/dashboard" className="px-2 py-2 rounded-lg text-xs font-bold text-center bg-navy-card text-gold border border-navy-border">Heatmap</Link>
          <Link href="/navigate" className="px-2 py-2 rounded-lg text-xs font-bold text-center bg-navy-deep text-slate-300 border border-navy-border">Navigate</Link>
          <Link href="/assistant" className="px-2 py-2 rounded-lg text-xs font-bold text-center bg-navy-deep text-slate-300 border border-navy-border">AI Chat</Link>
          {(profile?.role === 'staff' || profile?.role === 'organizer') && (
            <Link href="/staff" className="px-2 py-2 rounded-lg text-xs font-bold text-center bg-navy-deep text-slate-300 border border-navy-border">Staff</Link>
          )}
        </div>

        {/* Top Info Cards: Match Card & Quick Navigation widget */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* ── SCOREBOARD MATCH CARD ─────────────────────── */}
          <section aria-label="Current Matchday Information" className="border border-navy-border bg-navy-card/40 p-6 rounded-2xl shadow-[0_0_30px_rgba(245,197,24,0.1)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black bg-red-500/10 text-red-400 border border-red-500/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-ping"></span>
                  LIVE MATCHDAY
                </span>
                <span className="text-xs text-electric-blue flex items-center gap-1 font-black tracking-widest">
                  <Clock className="h-3.5 w-3.5" />
                  80&apos; PLAYED
                </span>
              </div>
              
              {/* Scoreboard */}
              <div className="mt-2 p-6 rounded-xl bg-navy-deep/90 border border-navy-border flex items-center justify-between shadow-inner">
                <span className="text-2xl sm:text-3xl font-black tracking-widest uppercase text-white">MEXICO</span>
                <div className="flex flex-col items-center">
                  <span className="text-5xl font-black tracking-widest font-mono" style={{ color: '#f5c518' }}>
                    2 — 1
                  </span>
                  <span className="text-xs text-electric-blue font-bold tracking-wider mt-1">ESTADIO AZTECA • 80&apos;</span>
                </div>
                <span className="text-2xl sm:text-3xl font-black tracking-widest uppercase text-white">USA</span>
              </div>
              <p className="text-xs text-slate-500 mt-3 font-semibold text-center">FIFA World Cup 2026™ • Group Stage Match</p>
            </div>
            
            <div className="mt-6 pt-6 border-t border-navy-border grid grid-cols-2 gap-4 text-xs text-slate-400">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-electric-blue" />
                <span>Monday, July 6, 2026</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-electric-blue" />
                <span>Estadio Azteca, CDMX</span>
              </div>
            </div>
          </section>

          {/* Quick Navigation widget */}
          <section aria-label="Quick Routing Tool" className="border border-navy-border bg-navy-card/40 p-6 rounded-2xl shadow-xl">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Compass className="h-5 w-5 text-gold" />
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
                    className="mt-1.5 block w-full rounded-lg border border-navy-border bg-navy-deep py-2 px-3 text-xs text-white focus:border-gold focus:outline-hidden"
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
                    className="mt-1.5 block w-full rounded-lg border border-navy-border bg-navy-deep py-2 px-3 text-xs text-white focus:border-gold focus:outline-hidden"
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
                className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-gold hover:bg-yellow-400 text-navy-deep font-bold text-xs transition focus:outline-hidden disabled:opacity-50"
              >
                Plan Crowd-Aware Route
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </form>
          </section>

        </div>

        {/* ── ZONE CARDS GRID ──────────────────────────────── */}
        <section aria-label="Stadium Zones Heatmap" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {zones.map((zone) => {
            const details = getDensityDetails(zone.current_occupancy, zone.capacity)
            const ratio = zone.current_occupancy / zone.capacity
            const percent = Math.round(ratio * 100)

            return (
              <article 
                key={zone.id} 
                className="border border-navy-border rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg bg-navy-card/40 flex"
              >
                {/* Left colored density indicator bar */}
                <div className={`w-2 shrink-0 ${details.indicatorColor}`} aria-hidden="true" />
                
                {/* Card content */}
                <div className="flex-1 p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h2 className="text-sm font-bold text-white tracking-tight leading-tight">{zone.name}</h2>
                      <span className="text-xs text-slate-500 block mt-0.5">{zone.section}</span>
                    </div>
                    {/* Large percentage on the right */}
                    <span className={`text-2xl font-black ${details.text} ml-2 shrink-0`}>
                      {percent}%
                    </span>
                  </div>

                  {/* Occupancy as X,XXX / Y,XXX */}
                  <div className="text-sm text-slate-400 mb-3">
                    <span className="font-semibold text-slate-200">{zone.current_occupancy.toLocaleString()}</span>
                    <span className="text-slate-500"> / </span>
                    <span>{zone.capacity.toLocaleString()}</span>
                  </div>

                  {/* Progress bar */}
                  <div className="h-1.5 w-full rounded-full bg-navy-deep overflow-hidden mb-3">
                    <div 
                      className={`h-full rounded-full transition-all duration-700 ${details.barColor}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  {/* Status badge */}
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black tracking-widest uppercase ${details.badge}`}>
                      {details.statusLabel}
                    </span>
                    <span className="text-[10px] text-slate-500 capitalize">
                      Zone: <span className={zone.status === 'closed' ? 'text-red-400' : 'text-slate-300'}>{zone.status}</span>
                    </span>
                  </div>
                </div>
              </article>
            )
          })}
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-navy-border bg-navy-deep/85 py-6 mt-16 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 FIFA World Cup ArenaIQ. Real-time operations dashboard.</p>
          <div className="flex items-center space-x-2 text-emerald-400">
            <Accessibility className="h-4 w-4" />
            <span>WCAG 2.1 AA Compliant (High Contrast Checked)</span>
          </div>
        </div>
      </footer>

    </div>
  )
}
