import React from 'react';

export default function MatchScoreboard() {
  return (
    <section aria-label="Current Match" className="arena-card border border-gold/20 shadow-[0_0_40px_rgba(245,197,24,0.07)]">
      <div className="flex items-center justify-between mb-6">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black bg-red-500/10 text-red-400 border border-red-500/20">
          <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-ping" />
          LIVE MATCHDAY
        </span>
        <span className="text-xs text-electric-blue font-black tracking-widest">FIFA WORLD CUP 2026™ • GROUP STAGE</span>
      </div>

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
  );
}
