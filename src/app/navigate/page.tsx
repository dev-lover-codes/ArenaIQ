"use client"

export const dynamic = 'force-dynamic'

import React from 'react'
import AppShell from '@/components/layout/AppShell'
import {
  MapPin,
  ShieldAlert,
  Sparkles,
  Loader2,
  ArrowRight,
} from 'lucide-react'
import { useRoutePlanner } from '@/hooks/useRoutePlanner'
import RouteAlerts from '@/components/navigate/RouteAlerts'
import SpatialPathBreakdown from '@/components/navigate/SpatialPathBreakdown'
import RouteForm from '@/components/navigate/RouteForm'

interface ParsedExplanation {
  steps: string[];
  estimated_minutes: number;
  congestion_warning: string | null;
  urgency: string;
  accessibility_note: string;
  ai_reasoning: string;
}

export default function NavigatePage() {
  const {
    zones,
    loadingZones,
    startZone,
    setStartZone,
    endZone,
    setEndZone,
    language,
    setLanguage,
    wheelchairMode,
    setWheelchairMode,
    calculating,
    routeResult,
    liveNavAnnouncement,
    handleGetRoute
  } = useRoutePlanner()

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleGetRoute()
  }

  let parsedExplanation: ParsedExplanation | null = null
  if (routeResult?.success && routeResult.explanation) {
    try {
      parsedExplanation = JSON.parse(routeResult.explanation)
    } catch (e) {
      console.error('Failed to parse explanation JSON', e)
    }
  }

  return (
    <AppShell title="Smart Route Planner">
      <div className="sr-only" aria-live="assertive" aria-atomic="true">{liveNavAnnouncement}</div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-10">
        <div className="mb-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight" style={{ letterSpacing: '-0.03em' }}>
            FIND YOUR <span className="text-gold">ROUTE</span>
          </h1>
          <p className="text-slate-400 mt-2 text-sm">AI-powered crowd-aware pathfinding</p>
        </div>

        {loadingZones ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gold" />
          </div>
        ) : (
          <RouteForm
            zones={zones}
            startZone={startZone}
            setStartZone={setStartZone}
            endZone={endZone}
            setEndZone={setEndZone}
            language={language}
            setLanguage={setLanguage}
            wheelchairMode={wheelchairMode}
            setWheelchairMode={setWheelchairMode}
            calculating={calculating}
            onSubmit={handleFormSubmit}
          />
        )}

        {!routeResult && !calculating && !loadingZones && (
          <div className="mt-8 border border-dashed border-navy-border rounded-2xl p-12 text-center text-slate-500">
            <MapPin className="mx-auto h-10 w-10 text-navy-border mb-3" />
            <p className="text-sm">Select zones above and hit Calculate to generate a crowd-aware route.</p>
          </div>
        )}

        {calculating && (
          <div className="mt-8 arena-card text-center flex flex-col items-center py-10 gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-gold" />
            <p className="text-white font-bold">Calculating Graph Traversal…</p>
            <p className="text-sm text-slate-400">Running Dijkstra + Gemini localization</p>
          </div>
        )}

        {routeResult && !routeResult.success && (
          <div className="mt-8 border border-red-500/30 bg-red-500/5 p-6 rounded-2xl text-center text-red-400" role="alert">
            <ShieldAlert className="mx-auto h-10 w-10 mb-3" />
            <p className="font-bold text-white">Route Planning Alert</p>
            <p className="text-sm mt-1">{routeResult.error || 'A problem occurred calculating the route.'}</p>
          </div>
        )}

        {routeResult?.success && (
          <div className="mt-8 space-y-5" aria-live="polite" aria-label="Route result">
            <div className="arena-card border-emerald-500/30" style={{ borderColor: 'rgba(16,185,129,0.3)' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  <h2 className="text-sm font-black text-emerald-400 tracking-widest uppercase">Optimal Route Found</h2>
                </div>
                <span className="stat-number text-3xl" style={{ fontSize: '2rem' }}>
                  ~{Math.round((routeResult.rawTime || 0) / 60)} MIN WALK
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <span className="text-electric-blue font-semibold">{routeResult.path?.length} zones traversed</span>
                <span>•</span>
                <span>Dijkstra optimized</span>
              </div>
            </div>

            {parsedExplanation ? (
              <div className="space-y-4">
                <RouteAlerts
                  congestionWarning={parsedExplanation.congestion_warning}
                  accessibilityNote={parsedExplanation.accessibility_note}
                />

                <div className="arena-card space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-gold" />
                    <h3 className="text-sm font-black text-white">Step-by-Step Directions</h3>
                  </div>
                  <ol className="space-y-3">
                    {parsedExplanation.steps?.map((step: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="flex-shrink-0 h-7 w-7 rounded-full bg-gold text-navy-deep text-xs font-black flex items-center justify-center shadow-[0_0_8px_rgba(245,197,24,0.3)]">
                          {idx + 1}
                        </span>
                        <div className="flex items-start gap-2 pt-0.5 flex-1">
                          <ArrowRight className="h-3.5 w-3.5 text-slate-600 shrink-0 mt-0.5" />
                          <span className="text-sm text-slate-300 leading-relaxed">{step}</span>
                        </div>
                      </li>
                    ))}
                  </ol>

                  {parsedExplanation.ai_reasoning && (
                    <details className="mt-4 border border-navy-border rounded-lg bg-navy-deep/40">
                      <summary className="cursor-pointer px-4 py-2.5 text-sm font-semibold text-electric-blue hover:text-white select-none focus:outline-hidden">
                        Why this route? ›
                      </summary>
                      <div className="px-4 pb-4 pt-2 text-sm text-slate-400 border-t border-navy-border/40 leading-relaxed">
                        {parsedExplanation.ai_reasoning}
                      </div>
                    </details>
                  )}
                </div>
              </div>
            ) : routeResult.explanation ? (
              <div className="arena-card">
                <p className="text-slate-300 leading-relaxed text-sm whitespace-pre-line">{routeResult.explanation}</p>
              </div>
            ) : null}

            <SpatialPathBreakdown
              pathNames={routeResult.pathNames}
              path={routeResult.path}
              congestedZones={routeResult.congestedZones}
            />
          </div>
        )}
      </div>
    </AppShell>
  )
}
