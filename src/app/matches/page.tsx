'use client'

export const dynamic = 'force-dynamic'

import AppShell from '@/components/layout/AppShell'
import { Trophy } from 'lucide-react'
import { useState, useMemo } from 'react'
import { MATCHES, type Match } from '@/lib/data/matches'

const FILTER_TABS = ['ALL', 'LIVE', 'UPCOMING', 'COMPLETED'] as const
type FilterTab = typeof FILTER_TABS[number]

function MatchCard({ match }: { match: Match }) {
  return (
    <article
      className="arena-card hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
      aria-label={`${match.home} vs ${match.away}, status: ${match.status}`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-black tracking-widest uppercase text-slate-500">
          {match.date} · {match.time}
        </span>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-widest uppercase ${
          match.status === 'LIVE'
            ? 'bg-red-500/15 text-red-400 border border-red-500/25'
            : match.status === 'COMPLETED'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25'
              : 'bg-gold/10 text-gold border border-gold/25'
        }`}>
          {match.status === 'LIVE' && <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-ping mr-1.5" aria-hidden="true" />}
          {match.status}
        </span>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col items-center gap-1 flex-1">
          <span className="text-3xl" role="img" aria-label={match.home}>{match.homeFlag}</span>
          <span className="text-sm font-black text-white uppercase tracking-wide">{match.home}</span>
        </div>

        <div className="flex flex-col items-center shrink-0">
          {match.homeScore !== null && match.awayScore !== null ? (
            <span className="text-2xl font-black font-mono text-gold">
              {match.homeScore} — {match.awayScore}
            </span>
          ) : (
            <span className="text-lg font-black text-slate-500">VS</span>
          )}
        </div>

        <div className="flex flex-col items-center gap-1 flex-1">
          <span className="text-3xl" role="img" aria-label={match.away}>{match.awayFlag}</span>
          <span className="text-sm font-black text-white uppercase tracking-wide">{match.away}</span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-navy-border flex items-center justify-between text-[10px] text-slate-500">
        <span>{match.venue}</span>
        <span>{match.city}</span>
      </div>
    </article>
  )
}

export default function MatchesPage() {
  const [activeFilter, setActiveFilter] = useState<FilterTab>('ALL')

  const filteredMatches = useMemo(() => 
    activeFilter === 'ALL' 
      ? MATCHES 
      : MATCHES.filter(m => m.status === activeFilter),
    [activeFilter]
  )

  return (
    <AppShell title="Matches">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-10">

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/10 border border-gold/25 shadow-[0_0_20px_rgba(245,197,24,0.1)]">
              <Trophy className="h-6 w-6 text-gold" />
            </span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">
            Matches <span className="text-gold">2026</span>
          </h1>
          <p className="mt-2 text-slate-400 text-sm">FIFA World Cup 2026™ — Match Schedule</p>
        </div>

        {/* Filter Tabs */}
        <div
          role="tablist"
          aria-label="Filter matches by status"
          className="flex gap-2 mb-6 flex-wrap justify-center"
        >
          {FILTER_TABS.map(tab => (
            <button
              key={tab}
              role="tab"
              aria-selected={activeFilter === tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase transition border ${
                activeFilter === tab
                  ? 'bg-gold text-navy-deep border-gold'
                  : 'text-slate-400 border-navy-border hover:border-gold/50 hover:text-gold'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Match Cards */}
        {filteredMatches.length === 0 ? (
          <p className="text-center text-slate-500 py-12">No {activeFilter.toLowerCase()} matches.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredMatches.map(match => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        )}

        {/* Coming Soon note */}
        <p className="mt-8 text-center text-slate-600 text-xs">
          Live scores and full tournament bracket coming soon · Data updates via Supabase Realtime
        </p>
      </div>
    </AppShell>
  )
}
