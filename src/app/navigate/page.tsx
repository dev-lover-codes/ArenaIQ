"use client"

export const dynamic = 'force-dynamic'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { 
  Activity, 
  MapPin, 
  Clock, 
  ShieldAlert, 
  Accessibility, 
  Compass, 
  Sparkles,
  Loader2,
  ArrowRight
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
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
]

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

      if (!error && data) {
        setZones(data)
      }
      setLoadingZones(false)
    }
    fetchZones()
  }, [supabase])

  const handleGetRoute = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!startZone || !endZone) return

    setCalculating(true)
    setRouteResult(null)
    setLiveNavAnnouncement('Calculating optimal route and generating step-by-step instructions...')

    try {
      const res = await fetch('/api/navigate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          startZone,
          endZone,
          language,
          wheelchairMode
        })
      })

      const data: RouteResponse = await res.json()
      setRouteResult(data)
      
      if (data.success) {
        setLiveNavAnnouncement(`Route calculated successfully. Total travel time is estimated at ${Math.round((data.rawTime || 0) / 60)} minutes. Navigation instructions are ready to read.`)
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
  if (routeResult && routeResult.success && routeResult.explanation) {
    try {
      parsedExplanation = JSON.parse(routeResult.explanation)
    } catch (e) {
      console.error('Failed to parse explanation JSON', e)
    }
  }

  const selectedLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0]
  const fromZone = zones.find(z => z.id === startZone)
  const toZone = zones.find(z => z.id === endZone)

  return (
    <div className="min-h-screen bg-navy-deep text-slate-100 font-sans stadium-grid">
      
      {/* Screen Reader Live region */}
      <div className="sr-only" aria-live="assertive" aria-atomic="true">
        {liveNavAnnouncement}
      </div>

      {/* Navigation Header */}
      <header className="border-b border-navy-border bg-navy-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            
            {/* Logo */}
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

            {/* Navigation links */}
            <nav className="hidden md:flex space-x-1" aria-label="Main Navigation">
              <Link 
                href="/dashboard" 
                className="px-3 py-2 rounded-lg text-sm font-semibold text-slate-300 hover:text-white hover:bg-navy-card"
              >
                Heatmap Dashboard
              </Link>
              <Link 
                href="/navigate" 
                className="px-3 py-2 rounded-lg text-sm font-semibold bg-navy-deep text-gold border border-navy-border"
                aria-current="page"
              >
                Smart Route Planner
              </Link>
              <Link 
                href="/assistant" 
                className="px-3 py-2 rounded-lg text-sm font-semibold text-slate-300 hover:text-white hover:bg-navy-card"
              >
                Multilingual AI Assistant
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-xs font-black bg-gold/10 text-gold border border-gold/20 tracking-wider">
                WAYFINDING TERMINAL
              </span>
            </div>

          </div>
        </div>
      </header>

      {/* Main Content */}
      <main role="main" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* ── PAGE TITLE ─────────────────────────────────── */}
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-black text-gold tracking-tight" style={{ letterSpacing: '-0.03em' }}>
            FIND YOUR ROUTE
          </h1>
          <p className="mt-2 text-slate-400">
            Dijkstra-calculated routes over stadium spatial graphs. Avoids closed paths and bypasses crowded sections dynamically.
          </p>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* ── FORM PLANNER ─────────────────────────────── */}
          <div className="lg:col-span-1 border border-navy-border bg-navy-card/40 p-6 rounded-2xl shadow-xl h-fit space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Compass className="h-5 w-5 text-gold" />
              Configure Route
            </h2>

            {loadingZones ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-gold" />
              </div>
            ) : (
              <form onSubmit={handleGetRoute} className="space-y-5" aria-label="Route Selection Form">
                
                {/* FROM selector card */}
                <div>
                  <div className="text-xs font-black tracking-widest text-electric-blue uppercase mb-2 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    📍 FROM
                  </div>
                  <select
                    id="start-zone-select"
                    value={startZone}
                    onChange={(e) => setStartZone(e.target.value)}
                    required
                    className="block w-full rounded-xl border border-navy-border bg-navy-deep py-3 px-4 text-sm text-white focus:border-gold focus:outline-hidden focus:ring-1 focus:ring-gold"
                  >
                    <option value="">Select departure zone...</option>
                    {zones.map((z) => (
                      <option key={z.id} value={z.id} disabled={z.status === 'closed'}>
                        {z.name} {z.status === 'closed' ? '(Closed)' : z.status === 'crowded' ? '(Crowded)' : ''}
                      </option>
                    ))}
                  </select>
                  {fromZone && (
                    <div className="mt-2 px-3 py-2 rounded-lg bg-navy-deep/60 border border-navy-border/60">
                      <span className="text-sm font-bold text-white">{fromZone.name}</span>
                    </div>
                  )}
                </div>

                {/* TO selector card */}
                <div>
                  <div className="text-xs font-black tracking-widest text-gold uppercase mb-2 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    🎯 TO
                  </div>
                  <select
                    id="end-zone-select"
                    value={endZone}
                    onChange={(e) => setEndZone(e.target.value)}
                    required
                    className="block w-full rounded-xl border border-navy-border bg-navy-deep py-3 px-4 text-sm text-white focus:border-gold focus:outline-hidden focus:ring-1 focus:ring-gold"
                  >
                    <option value="">Select destination...</option>
                    {zones.map((z) => (
                      <option key={z.id} value={z.id} disabled={z.status === 'closed'}>
                        {z.name} {z.status === 'closed' ? '(Closed)' : z.status === 'crowded' ? '(Crowded)' : ''}
                      </option>
                    ))}
                  </select>
                  {toZone && (
                    <div className="mt-2 px-3 py-2 rounded-lg bg-navy-deep/60 border border-navy-border/60">
                      <span className="text-sm font-bold text-white">{toZone.name}</span>
                    </div>
                  )}
                </div>

                {/* Language selector */}
                <div>
                  <label htmlFor="lang-select" className="block text-xs font-black tracking-widest text-slate-400 uppercase mb-2">
                    AI Guide Language
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{selectedLang.flag}</span>
                    <select
                      id="lang-select"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="flex-1 rounded-xl border border-navy-border bg-navy-deep py-2.5 px-3 text-sm text-white focus:border-gold focus:outline-hidden focus:ring-1 focus:ring-gold"
                    >
                      {LANGUAGES.map((l) => (
                        <option key={l.code} value={l.code}>{l.flag} {l.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Wheelchair toggle — proper toggle switch */}
                <div className="flex items-center justify-between p-3 rounded-xl border border-navy-border bg-navy-deep/50">
                  <label htmlFor="wheelchair-mode-toggle" className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer select-none">
                    <Accessibility className="h-4 w-4 text-teal-400" />
                    <span>♿ Wheelchair / Step-free route</span>
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

                {/* Calculate Route button */}
                <button
                  type="submit"
                  disabled={calculating || !startZone || !endZone}
                  className="w-full inline-flex items-center justify-center px-6 py-4 rounded-xl bg-gold hover:bg-yellow-400 text-navy-deep font-black text-sm tracking-wide transition focus:outline-hidden focus:ring-2 focus:ring-gold disabled:opacity-50 shadow-[0_0_20px_rgba(245,197,24,0.15)]"
                  aria-label="Calculate optimal route and generate directions"
                >
                  {calculating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Optimizing Path...
                    </>
                  ) : (
                    <>
                      Calculate Route
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </button>

              </form>
            )}
          </div>

          {/* ── DIRECTIONS OUTPUT ─────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">
            
            {!routeResult && !calculating && (
              <div className="border border-dashed border-navy-border rounded-2xl p-12 text-center text-slate-500">
                <MapPin className="mx-auto h-12 w-12 text-navy-border mb-4" />
                <h3 className="text-lg font-bold text-slate-400">No route calculated yet</h3>
                <p className="text-sm mt-1">Select your starting position and destination to generate smart routing.</p>
              </div>
            )}

            {calculating && (
              <div className="border border-navy-border bg-navy-card/10 rounded-2xl p-12 text-center text-slate-400 flex flex-col items-center">
                <Loader2 className="h-10 w-10 animate-spin text-gold mb-4" />
                <h3 className="text-lg font-bold text-white">Calculating Graph Traversal</h3>
                <p className="text-sm mt-1">Running Dijkstra over zone vertices and consulting Gemini for language localization...</p>
              </div>
            )}

            {routeResult && !routeResult.success && (
              <div className="border border-red-500/30 bg-red-500/5 p-6 rounded-2xl text-center text-red-400" role="alert">
                <ShieldAlert className="mx-auto h-10 w-10 text-red-400 mb-3" />
                <h3 className="font-bold text-white">Route Planning Alert</h3>
                <p className="text-sm mt-1">{routeResult.error || 'A problem occurred calculating the route.'}</p>
              </div>
            )}

            {routeResult && routeResult.success && (
              <div className="space-y-6">
                
                {/* ── ROUTE METRICS ──────────────────────── */}
                <section aria-label="Route Metrics Summary" className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-navy-border bg-navy-card/30 p-6 rounded-2xl">
                  
                  <div className="flex items-center space-x-3">
                    <div className="p-3 rounded-lg bg-gold/10 text-gold">
                      <Clock className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Walk Time</p>
                      <h3 className="text-3xl font-black text-gold tracking-tight">
                        ~{Math.round((routeResult.rawTime || 0) / 60)} MIN WALK
                      </h3>
                      <span className="text-xs text-slate-500">({routeResult.rawTime}s estimated)</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="p-3 rounded-lg bg-electric-blue/10 text-electric-blue">
                      <Compass className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Nodes Traversed</p>
                      <h3 className="text-3xl font-black text-electric-blue tracking-tight">
                        {routeResult.path?.length} Zones
                      </h3>
                    </div>
                  </div>

                </section>

                {/* ── AI EXPLANATION ─────────────────────── */}
                <section aria-label="GenAI Route Walkthrough" className="border border-navy-border bg-navy-card/10 p-6 rounded-2xl shadow-lg relative overflow-hidden">
                  
                  <div className="absolute top-0 right-0 p-4 opacity-5 text-white pointer-events-none">
                    <Sparkles className="h-32 w-32" />
                  </div>

                  <div className="flex items-center space-x-2 mb-4">
                    <Sparkles className="h-5 w-5 text-gold" />
                    <h3 className="text-md font-bold text-white">GenAI Direction Explanation</h3>
                  </div>

                  {parsedExplanation ? (
                    <div className="space-y-4">
                      {/* Congestion warning — red alert banner */}
                      {parsedExplanation.congestion_warning && (
                        <div className="border border-red-500/40 bg-red-500/10 p-4 rounded-xl text-red-400 flex items-start gap-2.5" role="alert">
                          <span className="text-lg">⚠️</span>
                          <div>
                            <h4 className="font-black text-white text-sm">CONGESTION WARNING</h4>
                            <p className="text-sm mt-0.5">{parsedExplanation.congestion_warning}</p>
                          </div>
                        </div>
                      )}

                      {/* Accessibility note */}
                      {parsedExplanation.accessibility_note && (
                        <div className="border border-teal-500/30 bg-teal-500/10 p-4 rounded-xl text-teal-400 flex items-start gap-2.5">
                          <Accessibility className="h-5 w-5 shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-bold text-white text-sm">Accessibility Info</h4>
                            <p className="text-sm mt-0.5">{parsedExplanation.accessibility_note}</p>
                          </div>
                        </div>
                      )}

                      {/* Steps as numbered list */}
                      <div>
                        <h4 className="font-bold text-white text-sm mb-3">Step-by-Step Directions</h4>
                        <ol className="space-y-3">
                          {parsedExplanation.steps?.map((step: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-3">
                              <span className="flex-shrink-0 h-7 w-7 rounded-full bg-gold text-navy-deep text-xs font-black flex items-center justify-center">
                                {idx + 1}
                              </span>
                              <span className="text-sm text-slate-300 leading-relaxed pt-0.5">{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>

                      {/* AI reasoning — collapsible */}
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
                  ) : (
                    <p className="text-slate-300 leading-relaxed text-md whitespace-pre-line">
                      {routeResult.explanation}
                    </p>
                  )}

                  <div className="mt-4 pt-4 border-t border-navy-border text-xs text-slate-500">
                    Explanation compiled server-side via Gemini API. Paths computed algorithmically to prevent hallucinations.
                  </div>
                </section>

                {/* ── PATH BREAKDOWN ─────────────────────── */}
                <section aria-label="Calculated Path Steps" className="border border-navy-border bg-navy-card/30 p-6 rounded-2xl">
                  <h3 className="text-md font-bold text-white mb-4">Spatial Path Breakdown</h3>
                  
                  <ol className="relative border-l border-navy-border ml-4 space-y-6">
                    {routeResult.pathNames?.map((name, index) => {
                      const zoneId = routeResult.path?.[index] || ''
                      const isCrowded = routeResult.congestedZones?.includes(zoneId)
                      const isStart = index === 0
                      const isEnd = index === (routeResult.pathNames?.length || 0) - 1

                      return (
                        <li key={index} className="mb-2 ml-6">
                          <span className={`absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full text-xs font-black ${
                            isStart ? 'bg-gold text-navy-deep' : isEnd ? 'bg-emerald-500 text-navy-deep' : isCrowded ? 'bg-orange-500 text-white' : 'bg-navy-card text-slate-300 border border-navy-border'
                          }`}>
                            {index + 1}
                          </span>
                          
                          <div className="flex flex-col sm:flex-row sm:justify-between items-start gap-1">
                            <h4 className="font-semibold text-white">{name}</h4>
                            {isCrowded && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/20">
                                Congested Area
                              </span>
                            )}
                          </div>
                          
                          <p className="text-xs text-slate-400 mt-1">
                            {isStart ? 'Route Start Node' : isEnd ? 'Route Destination Node' : 'Transition Concourse Section'}
                          </p>
                        </li>
                      )
                    })}
                  </ol>
                </section>

              </div>
            )}

          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-navy-border bg-navy-deep py-6 mt-16 text-center text-xs text-slate-500">
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
