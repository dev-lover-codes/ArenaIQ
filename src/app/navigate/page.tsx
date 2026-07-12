"use client"

export const dynamic = 'force-dynamic'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import AppShell from '@/components/layout/AppShell'
import {
  MapPin,
  ShieldAlert,
  Accessibility,
  Sparkles,
  Loader2,
  ArrowRight,
  Zap,
  Navigation,
} from 'lucide-react'

interface Zone {
  id: string
  name: string
  status: 'open' | 'crowded' | 'closed'
}

interface RouteResponse {
  success: boolean
  path?: string[]
  pathNames?: string[]
  rawTime?: number
  totalTime?: number
  congestedZones?: string[]
  explanation?: string
  error?: string
}

interface ParsedExplanation {
  steps: string[]
  estimated_minutes: number
  congestion_warning: string | null
  urgency: string
  accessibility_note: string
  ai_reasoning: string
}

const LANGUAGES = [
  { code: 'en', name: 'English',    flag: '🇬🇧' },
  { code: 'es', name: 'Español',    flag: '🇪🇸' },
  { code: 'fr', name: 'Français',   flag: '🇫🇷' },
  { code: 'ar', name: 'العربية',    flag: '🇸🇦' },
  { code: 'pt', name: 'Português',  flag: '🇧🇷' },
  { code: 'hi', name: 'हिन्दी',     flag: '🇮🇳' },
]

function statusBadge(status: Zone['status']) {
  if (status === 'closed')  return <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-black tracking-widest border status-closed">CLOSED</span>
  if (status === 'crowded') return <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-black tracking-widest border status-crowded">CROWDED</span>
  return <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-black tracking-widest border status-open">OPEN</span>
}

export default function NavigatePage() {
  const supabase = createClient()

  const [zones, setZones] = useState<Zone[]>([])
  const [loadingZones, setLoadingZones] = useState(true)

  const [startZone, setStartZone] = useState('')
  const [endZone, setEndZone] = useState('')
  const [language, setLanguage] = useState('en')

  const [wheelchairMode, setWheelchairMode] = useState(false)
  const [calculating, setCalculating] = useState(false)
  const [routeResult, setRouteResult] = useState<RouteResponse | null>(null)
  const [liveNavAnnouncement, setLiveNavAnnouncement] = useState('')

  useEffect(() => {
    const fetchZones = async () => {
      const { data, error } = await supabase
        .from('zones')
        .select('id, name, status')
        .order('name', { ascending: true })
      if (!error && data) setZones(data)
      setLoadingZones(false)
    }
    fetchZones()
  }, [supabase])

  const handleGetRoute = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!startZone || !endZone) return

    setCalculating(true)
    setRouteResult(null)
    setLiveNavAnnouncement('Calculating optimal route and generating step-by-step instructions…')

    try {
      const res = await fetch('/api/navigate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startZone, endZone, language, wheelchairMode }),
      })
      const data: RouteResponse = await res.json()
      setRouteResult(data)
      if (data.success) {
        setLiveNavAnnouncement(`Route calculated. Estimated ${Math.round((data.rawTime || 0) / 60)} minutes. Instructions ready.`)
      } else {
        setLiveNavAnnouncement(`Routing failed: ${data.error || 'No path found.'}`)
      }
    } catch {
      setRouteResult({ success: false, error: 'Network error calculating route. Please check connection.' })
      setLiveNavAnnouncement('Error calculating route.')
    } finally {
      setCalculating(false)
    }
  }

  let parsedExplanation: ParsedExplanation | null = null
  if (routeResult?.success && routeResult.explanation) {
    try {
      parsedExplanation = JSON.parse(routeResult.explanation)
    } catch (e) {
      console.error('Failed to parse explanation JSON', e)
    }
  }

  const selectedLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0]
  const fromZone = zones.find(z => z.id === startZone)
  const toZone   = zones.find(z => z.id === endZone)

  return (
    <AppShell title="Smart Route Planner">
      {/* SR live region */}
      <div className="sr-only" aria-live="assertive" aria-atomic="true">{liveNavAnnouncement}</div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-10">

        {/* ── PAGE HEADING ────────────────────────────────── */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight" style={{ letterSpacing: '-0.03em' }}>
            FIND YOUR <span className="text-gold">ROUTE</span>
          </h1>
          <p className="text-slate-400 mt-2 text-sm">AI-powered crowd-aware pathfinding</p>
        </div>

        {/* ── ZONE SELECTORS ──────────────────────────────── */}
        {loadingZones ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gold" />
          </div>
        ) : (
          <form onSubmit={handleGetRoute} className="space-y-5" aria-label="Route Selection Form">

            {/* FROM / TO cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* FROM */}
              <div className="arena-card space-y-3">
                <p className="section-heading flex items-center gap-1.5">
                  <MapPin className="h-3 w-3" /> 📍 Departing From
                </p>
                <select
                  id="start-zone-select"
                  value={startZone}
                  onChange={(e) => setStartZone(e.target.value)}
                  required
                  className="block w-full rounded-xl border border-navy-border bg-navy-deep py-3 px-4 text-xl font-bold text-white focus:border-gold focus:outline-hidden focus:ring-1 focus:ring-gold"
                  aria-label="Select departure zone"
                >
                  <option value="">Select zone…</option>
                  {zones.map((z) => (
                    <option key={z.id} value={z.id} disabled={z.status === 'closed'} className="text-base font-normal">
                      {z.name}{z.status === 'closed' ? ' (Closed)' : ''}
                    </option>
                  ))}
                </select>
                {fromZone && (
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs text-slate-400">{fromZone.name}</span>
                    {statusBadge(fromZone.status)}
                  </div>
                )}
              </div>

              {/* TO */}
              <div className="arena-card space-y-3">
                <p className="section-heading flex items-center gap-1.5">
                  <Navigation className="h-3 w-3" /> 🎯 Destination
                </p>
                <select
                  id="end-zone-select"
                  value={endZone}
                  onChange={(e) => setEndZone(e.target.value)}
                  required
                  className="block w-full rounded-xl border border-navy-border bg-navy-deep py-3 px-4 text-xl font-bold text-white focus:border-gold focus:outline-hidden focus:ring-1 focus:ring-gold"
                  aria-label="Select destination zone"
                >
                  <option value="">Select zone…</option>
                  {zones.map((z) => (
                    <option key={z.id} value={z.id} disabled={z.status === 'closed'} className="text-base font-normal">
                      {z.name}{z.status === 'closed' ? ' (Closed)' : ''}
                    </option>
                  ))}
                </select>
                {toZone && (
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs text-slate-400">{toZone.name}</span>
                    {statusBadge(toZone.status)}
                  </div>
                )}
              </div>
            </div>

            {/* Options row: wheelchair + language */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Wheelchair toggle */}
              <div className="arena-card-sm flex items-center justify-between">
                <label htmlFor="wheelchair-mode-toggle" className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer select-none">
                  <Accessibility className="h-4 w-4 text-teal-400" />
                  ♿ Step-free / Wheelchair route
                </label>
                <label className="toggle-switch" aria-label="Enable wheelchair accessible route">
                  <input
                    type="checkbox"
                    id="wheelchair-mode-toggle"
                    checked={wheelchairMode}
                    onChange={e => setWheelchairMode(e.target.checked)}
                    aria-label="Enable wheelchair accessible route"
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              {/* Language selector */}
              <div className="arena-card-sm">
                <label htmlFor="lang-select" className="section-heading block">AI Guide Language</label>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{selectedLang.flag}</span>
                  <select
                    id="lang-select"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="flex-1 rounded-xl border border-navy-border bg-navy-deep py-2 px-3 text-sm text-white focus:border-gold focus:outline-hidden focus:ring-1 focus:ring-gold"
                  >
                    {LANGUAGES.map((l) => (
                      <option key={l.code} value={l.code}>{l.flag} {l.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* CALCULATE button */}
            <button
              type="submit"
              disabled={calculating || !startZone || !endZone}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gold hover:bg-yellow-400 text-navy-deep font-black text-base tracking-wide transition focus:outline-hidden focus:ring-2 focus:ring-gold disabled:opacity-50 shadow-[0_0_24px_rgba(245,197,24,0.2)]"
              aria-label="Calculate optimal route"
            >
              {calculating ? (
                <><Loader2 className="h-5 w-5 animate-spin" /> Optimizing Path…</>
              ) : (
                <><Zap className="h-5 w-5" /> ⚡ CALCULATE OPTIMAL ROUTE</>
              )}
            </button>

          </form>
        )}

        {/* ── RESULT AREA ─────────────────────────────────── */}
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
          <div className="mt-8 space-y-5">

            {/* OPTIMAL ROUTE FOUND header */}
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

            {/* AI Explanation section */}
            {parsedExplanation ? (
              <div className="space-y-4">

                {/* Congestion warning */}
                {parsedExplanation.congestion_warning && (
                  <div className="border border-red-500/40 bg-red-500/10 p-4 rounded-xl text-red-400 flex items-start gap-3" role="alert">
                    <span className="text-xl shrink-0">⚠️</span>
                    <div>
                      <p className="font-black text-white text-sm">CONGESTION WARNING</p>
                      <p className="text-sm mt-0.5">{parsedExplanation.congestion_warning}</p>
                    </div>
                  </div>
                )}

                {/* Accessibility note */}
                {parsedExplanation.accessibility_note && (
                  <div className="border border-teal-500/30 bg-teal-500/10 p-4 rounded-xl text-teal-400 flex items-start gap-3">
                    <Accessibility className="h-5 w-5 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-white text-sm">Accessibility Info</p>
                      <p className="text-sm mt-0.5">{parsedExplanation.accessibility_note}</p>
                    </div>
                  </div>
                )}

                {/* Step-by-step directions */}
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

                  {/* Why this route collapsible */}
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

            {/* Path breakdown */}
            <div className="arena-card">
              <h3 className="text-sm font-black text-white mb-4">Spatial Path Breakdown</h3>
              <ol className="relative border-l border-navy-border ml-3 space-y-4">
                {routeResult.pathNames?.map((name, index) => {
                  const zoneId = routeResult.path?.[index] || ''
                  const isCrowded = routeResult.congestedZones?.includes(zoneId)
                  const isStart = index === 0
                  const isEnd = index === (routeResult.pathNames?.length || 0) - 1
                  return (
                    <li key={index} className="ml-6">
                      <span className={`absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full text-xs font-black ${
                        isStart ? 'bg-gold text-navy-deep' : isEnd ? 'bg-emerald-500 text-navy-deep' : isCrowded ? 'bg-orange-500 text-white' : 'bg-navy-card text-slate-300 border border-navy-border'
                      }`}>
                        {index + 1}
                      </span>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                        <p className="font-semibold text-white text-sm">{name}</p>
                        {isCrowded && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/20">
                            Congested
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {isStart ? 'Route Start' : isEnd ? 'Destination' : 'Transition Zone'}
                      </p>
                    </li>
                  )
                })}
              </ol>
            </div>

          </div>
        )}

      </div>
    </AppShell>
  )
}
