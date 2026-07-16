"use client"

export const dynamic = 'force-dynamic'

import React, { useEffect, useState, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import AppShell from '@/components/layout/AppShell'
import {
  Loader2,
  Zap,
  Users,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react'

interface Zone {
  id: string
  name: string
  section: string
  capacity: number
  current_occupancy: number
  status: 'open' | 'crowded' | 'closed'
}

function getDensityDetails(occupancy: number, capacity: number) {
  const ratio = occupancy / capacity
  if (ratio >= 0.9) return {
    barColor: 'bg-red-500',
    indicatorColor: 'bg-red-500',
    pctColor: 'text-red-400',
    badge: 'status-critical border',
    statusLabel: 'CRITICAL',
  }
  if (ratio >= 0.7) return {
    barColor: 'bg-orange-500',
    indicatorColor: 'bg-orange-500',
    pctColor: 'text-orange-400',
    badge: 'status-crowded border',
    statusLabel: 'CROWDED',
  }
  if (ratio >= 0.4) return {
    barColor: 'bg-amber-500',
    indicatorColor: 'bg-amber-500',
    pctColor: 'text-amber-400',
    badge: 'bg-amber-500/10 text-amber-400 border border-amber-500/30',
    statusLabel: 'FILLING',
  }
  return {
    barColor: 'bg-emerald-500',
    indicatorColor: 'bg-emerald-500',
    pctColor: 'text-emerald-400',
    badge: 'status-open border',
    statusLabel: 'OPEN',
  }
}

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()

  const [zones, setZones] = useState<Zone[]>([])
  const [loading, setLoading] = useState(true)
  const [simulating, setSimulating] = useState(false)
  const [simError, setSimError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Accessibility Live Announcements
  const [liveAnnouncement, setLiveAnnouncement] = useState('')
  const prevZonesRef = useRef<Record<string, number>>({})

  useEffect(() => {
    const fetchData = async () => {
      const { data: zonesData, error: zonesErr } = await supabase
        .from('zones')
        .select('*')
        .order('name', { ascending: true })

      if (!zonesErr && zonesData) {
        setZones(zonesData)
        const initialMap: Record<string, number> = {}
        zonesData.forEach((z) => { initialMap[z.id] = z.current_occupancy })
        prevZonesRef.current = initialMap
        setLastUpdated(new Date())
      }
      setLoading(false)
    }
    fetchData()
  }, [supabase])

  // Realtime subscription
  useEffect(() => {
    if (zones.length === 0) return
    const channel = supabase
      .channel('live-zones')
      .on('postgres_changes', { 
        event: 'UPDATE',  // Only UPDATE events, not INSERT/DELETE
        schema: 'public', 
        table: 'zones' 
      }, (payload) => {
        const updatedZone = payload.new as Zone
        // Efficient: updates only the changed zone in O(n) without
        // a full database refetch
        setZones(prev => prev.map(z => 
          z.id === updatedZone.id 
            ? { ...z, ...updatedZone } 
            : z
        ))
        setLastUpdated(new Date())

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
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [zones.length, supabase])

  const triggerSimulation = async () => {
    setSimulating(true)
    setSimError(null)
    try {
      const res = await fetch('/api/simulate-crowd')
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to simulate crowd.')
    } catch (err) {
      setSimError(err instanceof Error ? err.message : 'Unknown simulation error')
    } finally {
      setSimulating(false)
    }
  }

  // ── Derived stats (memoized to avoid recalculation on unrelated renders) ──
  const stats = useMemo(() => ({
    totalFans: zones.reduce((sum, z) => sum + (z.current_occupancy || 0), 0),
    highDensityCount: zones.filter(z => 
      z.status === 'crowded' || z.status === 'closed').length,
    openCount: zones.filter(z => z.status === 'open').length,
  }), [zones])
  const { totalFans, highDensityCount, openCount } = stats

  if (loading) {
    return (
      <AppShell title="Command Center">
        <div className="flex min-h-full items-center justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-gold" />
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell title="Command Center">

      {/* Accessibility Announcement */}
      <div
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
        id="density-announcer"
      >
        {liveAnnouncement}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-10 space-y-8">

        {/* ── PAGE HEADER ─────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              Crowd Density Heatmap
              <span className="inline-flex items-center gap-1 text-[10px] font-black text-red-400 bg-red-950/30 border border-red-500/30 rounded-full px-2 py-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-ping" />
                LIVE
              </span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">Live zone occupancy via Supabase Realtime.</p>
          </div>
          <div className="flex items-center gap-3">
            {simError && (
              <span className="text-xs text-red-400 bg-red-950/20 border border-red-500/30 px-3 py-1.5 rounded-lg" role="alert">
                {simError}
              </span>
            )}
            <button
              onClick={triggerSimulation}
              disabled={simulating}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold hover:bg-yellow-400 text-navy-deep font-black text-sm transition focus:outline-hidden focus:ring-2 focus:ring-gold disabled:opacity-50 shadow-[0_0_18px_rgba(245,197,24,0.2)]"
              aria-label="Trigger crowd movement simulation"
            >
              {simulating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
              {simulating ? 'Simulating…' : '⚡ Simulate'}
            </button>
          </div>
        </div>

        {/* ── TOP ROW: 4 STAT CARDS ───────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

          {/* Total Fans */}
          <div className="arena-card flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="section-heading">Total Fans Tracked</p>
              <span className="p-1.5 rounded-lg bg-gold/10">
                <Users className="h-4 w-4 text-gold" />
              </span>
            </div>
            <p className="stat-number">{totalFans.toLocaleString()}</p>
          </div>

          {/* High Density Zones */}
          <div className="arena-card flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="section-heading">High Density Zones</p>
              <span className="p-1.5 rounded-lg bg-red-500/10">
                <AlertTriangle className="h-4 w-4 text-red-400" />
              </span>
            </div>
            <p className="stat-number" style={{ color: highDensityCount > 0 ? '#ef4444' : '#f5c518' }}>
              {highDensityCount}
            </p>
          </div>

          {/* Zones Clear */}
          <div className="arena-card flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="section-heading">Zones Clear</p>
              <span className="p-1.5 rounded-lg bg-emerald-500/10">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              </span>
            </div>
            <p className="stat-number" style={{ color: '#10b981' }}>{openCount}</p>
          </div>

          {/* Last Updated */}
          <div className="arena-card flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="section-heading">Last Updated</p>
              <span className="p-1.5 rounded-lg bg-electric-blue/10">
                <RefreshCw className="h-4 w-4 text-electric-blue" />
              </span>
            </div>
            <p className="stat-number text-electric-blue" style={{ color: '#00a8e8', fontSize: '1.4rem' }}>
              {lastUpdated ? lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '—'}
            </p>
          </div>
        </div>

        {/* ── MATCH SCOREBOARD ────────────────────────────── */}
        <section aria-label="Current Match" className="arena-card border border-gold/20 shadow-[0_0_40px_rgba(245,197,24,0.07)]">
          {/* Header row */}
          <div className="flex items-center justify-between mb-6">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black bg-red-500/10 text-red-400 border border-red-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-ping" />
              LIVE MATCHDAY
            </span>
            <span className="text-xs text-electric-blue font-black tracking-widest">FIFA WORLD CUP 2026™ • GROUP STAGE</span>
          </div>

          {/* Score row */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col items-center gap-1 flex-1">
              <span className="text-4xl">🇲🇽</span>
              <span className="text-xl sm:text-3xl font-black tracking-widest text-white uppercase">Mexico</span>
            </div>

            <div className="flex flex-col items-center">
              <span className="text-5xl sm:text-6xl font-black font-mono text-gold" style={{ letterSpacing: '-0.02em' }}>
                2 — 1
              </span>
              <span className="text-xs text-electric-blue font-bold tracking-wider mt-1">Estadio Azteca • Mexico City</span>
            </div>

            <div className="flex flex-col items-center gap-1 flex-1">
              <span className="text-4xl">🇺🇸</span>
              <span className="text-xl sm:text-3xl font-black tracking-widest text-white uppercase">USA</span>
            </div>
          </div>

          {/* Match time progress bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500 font-semibold">Match Progress</span>
              <span className="text-xs font-black text-electric-blue tracking-widest">80&apos; / 90&apos;</span>
            </div>
            <div className="h-1 w-full rounded-full bg-navy-deep overflow-hidden">
              <div
                className="h-full rounded-full bg-gold transition-all duration-700 shadow-[0_0_8px_rgba(245,197,24,0.5)]"
                style={{ width: `${Math.round((80 / 90) * 100)}%` }}
              />
            </div>
          </div>
        </section>

        {/* ── ZONE HEATMAP GRID ───────────────────────────── */}
        <section aria-label="Stadium Zones Heatmap">
          <h2 className="section-heading">Zone Status — Live Heatmap</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {zones.map((zone) => {
              const details = getDensityDetails(zone.current_occupancy, zone.capacity)
              const ratio = zone.current_occupancy / zone.capacity
              const percent = Math.round(ratio * 100)

              return (
                <article
                  key={zone.id}
                  onClick={() => router.push(`/navigate?startZone=${zone.id}`)}
                  className="arena-card-sm flex overflow-hidden cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all duration-200"
                  role="button"
                  tabIndex={0}
                  aria-label={`${zone.name}: ${percent}% capacity. Click to navigate.`}
                  onKeyDown={(e) => e.key === 'Enter' && router.push(`/navigate?startZone=${zone.id}`)}
                  style={{ padding: 0 }}
                >
                  {/* Left accent bar */}
                  <div className={`w-2 shrink-0 ${details.indicatorColor}`} aria-hidden="true" />

                  {/* Card body */}
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm font-bold text-white leading-tight">{zone.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{zone.section}</p>
                      </div>
                      <span className={`text-2xl font-black ml-2 shrink-0 ${details.pctColor}`}>
                        {percent}%
                      </span>
                    </div>

                    {/* Occupancy numbers */}
                    <p className="text-xs text-slate-400 mb-2">
                      <span className="font-semibold text-slate-200">{zone.current_occupancy.toLocaleString()}</span>
                      <span className="text-slate-600"> / </span>
                      {zone.capacity.toLocaleString()}
                    </p>

                    {/* Progress bar — 4px */}
                    <div className="h-1 w-full rounded-full bg-navy-deep overflow-hidden mb-3">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${details.barColor}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    {/* Status pill */}
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black tracking-widest uppercase ${details.badge}`}>
                      {details.statusLabel}
                    </span>
                  </div>
                </article>
              )
            })}
          </div>
        </section>

      </div>
    </AppShell>
  )
}
