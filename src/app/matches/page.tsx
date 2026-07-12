'use client'

export const dynamic = 'force-dynamic'

import AppShell from '@/components/layout/AppShell'
import { Trophy } from 'lucide-react'

export default function MatchesPage() {
  return (
    <AppShell title="Matches">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 pb-24 md:pb-16 flex flex-col items-center justify-center min-h-[60vh] text-center gap-6">
        <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gold/10 border border-gold/25 shadow-[0_0_30px_rgba(245,197,24,0.1)]">
          <Trophy className="h-10 w-10 text-gold" />
        </span>
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">
            Matches <span className="text-gold">2026</span>
          </h1>
          <p className="mt-3 text-slate-400 max-w-md">
            Live match schedules, scores, and FIFA World Cup 2026™ fixtures — coming soon.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black tracking-widest uppercase bg-gold/10 text-gold border border-gold/25">
          🏆 Coming Soon
        </span>
      </div>
    </AppShell>
  )
}
