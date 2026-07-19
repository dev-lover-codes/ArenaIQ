"use client"

export const dynamic = 'force-dynamic'

import React from 'react'
import { useRouter } from 'next/navigation'
import AppShell from '@/components/layout/AppShell'
import { Loader2, Zap, Users, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react'
import { useZones } from '@/hooks/useZones'
import { ZONE_STATUS_STYLES } from '@/lib/constants'
import StatCard from '@/components/dashboard/StatCard'
import MatchScoreboard from '@/components/dashboard/MatchScoreboard'
import ZoneCard from '@/components/dashboard/ZoneCard'

// eslint-disable-next-line max-lines-per-function -- Page component layout consists of stats grid, scoreboard and zone heatmap render elements.
export default function DashboardPage() {
  const router = useRouter()
  const {
    zones,
    loading,
    simulating,
    simError,
    lastUpdated,
    liveAnnouncement,
    triggerSimulation,
    stats
  } = useZones()

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
      <div
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
        id="density-announcer"
      >
        {liveAnnouncement}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-10 space-y-8">
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

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Fans Tracked"
            value={totalFans.toLocaleString()}
            icon={<Users className="h-4 w-4 text-gold" />}
            iconBgClass="bg-gold/10"
          />
          <StatCard
            title="High Density Zones"
            value={highDensityCount}
            icon={<AlertTriangle className={`h-4 w-4 ${ZONE_STATUS_STYLES.closed.text}`} />}
            iconBgClass={ZONE_STATUS_STYLES.closed.bg}
            valueStyle={{ color: highDensityCount > 0 ? '#ef4444' : '#f5c518' }}
          />
          <StatCard
            title="Zones Clear"
            value={openCount}
            icon={<CheckCircle2 className={`h-4 w-4 ${ZONE_STATUS_STYLES.open.text}`} />}
            iconBgClass={ZONE_STATUS_STYLES.open.bg}
            valueStyle={{ color: '#10b981' }}
          />
          <StatCard
            title="Last Updated"
            value={lastUpdated ? lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '—'}
            icon={<RefreshCw className="h-4 w-4 text-electric-blue" />}
            iconBgClass="bg-electric-blue/10"
            valueStyle={{ color: '#00a8e8', fontSize: '1.4rem' }}
          />
        </div>

        <MatchScoreboard />

        <section aria-label="Stadium Zones Heatmap">
          <h2 className="section-heading">Zone Status — Live Heatmap</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {zones.map((zone) => (
              <ZoneCard
                key={zone.id}
                zone={zone}
                onClick={() => router.push(`/navigate?startZone=${zone.id}`)}
                onKeyDown={(e) => e.key === 'Enter' && router.push(`/navigate?startZone=${zone.id}`)}
              />
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  )
}
