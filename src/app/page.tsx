import React from 'react'
import Link from 'next/link'
import { Shield, ArrowRight, Map, Users, Languages, Accessibility, Target } from 'lucide-react'

// eslint-disable-next-line max-lines-per-function -- Landing page containing header, hero banner, stats, core feature blocks and landing layout grids.
export default function Home() {
  return (
    <main role="main" aria-label="ArenaIQ landing page" className="flex min-h-screen flex-col bg-navy-deep text-slate-100 font-sans stadium-grid">
      
      {/* Header */}
      <header className="border-b border-navy-border bg-navy-deep/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-gold to-yellow-500 shadow-[0_0_10px_rgba(255,215,0,0.3)]">
              <Shield className="h-5 w-5 text-navy-deep" />
            </span>
            <span className="text-xl font-bold tracking-tight text-white">
              Arena<span className="text-gold">IQ</span>
            </span>
            <span className="ml-2 text-xs font-bold text-red-400 bg-red-950/40 border border-red-500/30 rounded-full px-2 py-0.5 animate-pulse">LIVE</span>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-lg bg-navy-card border border-navy-border hover:border-gold hover:text-gold text-white transition-all focus:outline-hidden focus:ring-2 focus:ring-gold"
          >
            Access Portal
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-16 lg:py-24">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* MATCHDAY ACTIVE Strip */}
          <div className="flex justify-center items-center gap-2 mb-2">
            <span className="h-2.5 w-2.5 rounded-full bg-electric-blue animate-ping inline-block"></span>
            <span className="text-sm font-black tracking-[0.2em] text-electric-blue uppercase">Matchday Active</span>
          </div>

          {/* FIFA 2026 Stylized Badge */}
          <div className="flex justify-center mb-4">
            <svg className="w-20 h-20 text-gold drop-shadow-[0_0_15px_rgba(255,215,0,0.4)] animate-pulse" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M50 5L85 25V75L50 95L15 75V25L50 5Z" stroke="currentColor" strokeWidth="4" fill="#0c1329" />
              <path d="M50 15L75 30V70L50 85L25 70V30L50 15Z" stroke="#00A8E8" strokeWidth="2" fill="none" />
              <text x="50" y="52" fill="currentColor" fontSize="22" fontWeight="900" textAnchor="middle" letterSpacing="-0.05em">26</text>
              <text x="50" y="68" fill="#f8fafc" fontSize="8" fontWeight="bold" textAnchor="middle" letterSpacing="0.1em">FIFA OPS</text>
            </svg>
          </div>

          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-gold/10 text-gold border border-gold/20 mb-2">
            <span className="h-2 w-2 rounded-full bg-gold animate-ping"></span>
            <span>FIFA World Cup 2026™ Stadium Operations</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-none" style={{ fontWeight: 900, letterSpacing: '-0.04em' }}>
            Intelligent Operations
            <br />
            <span className="text-5xl sm:text-8xl" style={{ color: '#f5c518' }}>
              FIFA World Cup 2026
            </span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-slate-400 leading-relaxed">
            ArenaIQ is the AI co-pilot for FIFA World Cup 2026 volunteers — detecting fan urgency, generating multilingual PA announcements, and preventing crowd incidents before they happen.
          </p>

          {/* 4-column Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 pb-2 w-full max-w-3xl mx-auto">
            <div className="flex flex-col items-center p-4 rounded-xl bg-navy-card/60 border border-navy-border hover:border-gold/40 transition-all">
              <span className="text-3xl font-black text-gold">80K</span>
              <span className="text-xs text-slate-400 mt-1">Fans Per Match</span>
            </div>
            <div className="flex flex-col items-center p-4 rounded-xl bg-navy-card/60 border border-navy-border hover:border-electric-blue/40 transition-all">
              <span className="text-3xl font-black text-electric-blue">14</span>
              <span className="text-xs text-slate-400 mt-1">Stadium Zones</span>
            </div>
            <div className="flex flex-col items-center p-4 rounded-xl bg-navy-card/60 border border-navy-border hover:border-emerald-500/40 transition-all">
              <span className="text-3xl font-black text-emerald-400">6</span>
              <span className="text-xs text-slate-400 mt-1">Languages</span>
            </div>
            <div className="flex flex-col items-center p-4 rounded-xl bg-navy-card/60 border border-navy-border hover:border-gold/40 transition-all">
              <span className="text-3xl font-black text-gold">AI</span>
              <span className="text-xs text-slate-400 mt-1">Gemini Powered</span>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-gold text-navy-deep font-bold hover:bg-yellow-400 transition-all shadow-[0_0_20px_rgba(255,215,0,0.2)] focus:outline-hidden focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-navy-deep"
              aria-label="Sign in to ArenaIQ Command Center"
            >
              Sign In to Command Center
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-navy-border bg-navy-card text-base font-semibold text-slate-300 hover:text-white hover:border-gold transition focus:outline-hidden focus:ring-2 focus:ring-slate-500"
              aria-label="Register your operations profile with ArenaIQ"
            >
              Register Operations Profile
            </Link>
          </div>
        </div>
      </section>

      <div role="marquee" aria-label="Tournament statistics" className="w-full overflow-hidden bg-navy-card/80 border-y border-navy-border py-4 shrink-0 shadow-inner">
        <div className="w-full overflow-hidden relative">
          <div className="animate-ticker flex items-center space-x-16 text-xs sm:text-sm font-bold tracking-widest text-slate-300 uppercase">
            <span>🏟️ 16 Venues</span>
            <span className="text-gold">•</span>
            <span>🌍 3 Host Nations</span>
            <span className="text-gold">•</span>
            <span>⚽ 104 Matches</span>
            <span className="text-gold">•</span>
            <span>♟ 5M+ Expected Fans</span>
            <span className="text-gold">•</span>
            <span>Estadio Azteca</span>
            <span className="text-gold">•</span>
            <span>SoFi Stadium</span>
            <span className="text-gold">•</span>
            <span>MetLife Stadium</span>
            <span className="text-gold">•</span>
            {/* duplicate for seamless loop */}
            <span>🏟️ 16 Venues</span>
            <span className="text-gold">•</span>
            <span>🌍 3 Host Nations</span>
            <span className="text-gold">•</span>
            <span>⚽ 104 Matches</span>
            <span className="text-gold">•</span>
            <span>♟ 5M+ Expected Fans</span>
            <span className="text-gold">•</span>
            <span>Estadio Azteca</span>
            <span className="text-gold">•</span>
            <span>SoFi Stadium</span>
            <span className="text-gold">•</span>
            <span>MetLife Stadium</span>
          </div>
        </div>
      </div>

      {/* Feature Pillar Highlights */}
      <section className="bg-navy-card/20 border-t border-navy-border py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center text-white mb-12 tracking-tight" style={{ fontWeight: 900, letterSpacing: '-0.04em' }}>
            The Three Pillars of ArenaIQ
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div aria-label="Feature: Smart Navigation" className="relative bg-navy-card/40 border border-navy-border border-l-4 border-l-gold p-8 rounded-2xl flex flex-col items-start space-y-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(245,197,24,0.15)] overflow-hidden">
              <span className="absolute top-3 right-4 text-6xl font-black text-white opacity-10 select-none pointer-events-none leading-none">01</span>
              <span className="p-4 rounded-xl bg-gold/10 text-gold border border-gold/20">
                <Map className="h-6 w-6" />
              </span>
              <h3 className="text-xl font-bold text-white">Smart Navigation</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Algorithm-driven, crowd-aware route suggestions over verified spatial graphs. Uses Gemini AI to compile direct, human-like guide explanations.
              </p>
            </div>

            <div aria-label="Feature: Crowd Management" className="relative bg-navy-card/40 border border-navy-border border-l-4 border-l-gold p-8 rounded-2xl flex flex-col items-start space-y-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(245,197,24,0.15)] overflow-hidden">
              <span className="absolute top-3 right-4 text-6xl font-black text-white opacity-10 select-none pointer-events-none leading-none">02</span>
              <span className="p-4 rounded-xl bg-electric-blue/10 text-electric-blue border border-electric-blue/20">
                <Users className="h-6 w-6" />
              </span>
              <h3 className="text-xl font-bold text-white">Crowd Management</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Visualizing active zone capacities using Supabase Realtime subscriptions. Prevent bottlenecks and secure ingress/egress safety zones.
              </p>
            </div>

            <div aria-label="Feature: Multilingual AI" className="relative bg-navy-card/40 border border-navy-border border-l-4 border-l-gold p-8 rounded-2xl flex flex-col items-start space-y-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(245,197,24,0.15)] overflow-hidden">
              <span className="absolute top-3 right-4 text-6xl font-black text-white opacity-10 select-none pointer-events-none leading-none">03</span>
              <span className="p-4 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Languages className="h-6 w-6" />
              </span>
              <h3 className="text-xl font-bold text-white">Multilingual AI</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Real-time translations and prompt-controlled assistance to help international fans and venue volunteers interact without boundaries.
              </p>
            </div>

          </div>

          {/* Volunteer Co-pilot Spotlight */}
          <div aria-label="Feature: Volunteer Co-pilot" className="mt-10 relative bg-navy-card/40 border-2 border-gold/50 p-10 rounded-2xl flex flex-col items-start space-y-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_40px_rgba(245,197,24,0.2)] overflow-hidden">
            <span className="absolute top-3 right-4 text-7xl font-black text-gold opacity-5 select-none pointer-events-none leading-none">⭐</span>
            <span className="p-4 rounded-xl bg-gold/10 text-gold border border-gold/30">
              <Target className="h-7 w-7" />
            </span>
            <h3 className="text-2xl font-bold text-white">🎯 Volunteer Co-pilot</h3>
            <p className="text-slate-400 text-base">The AI brain behind every zone manager</p>
            <ul className="text-slate-300 text-sm space-y-2">
              <li className="flex items-center gap-2"><span className="text-gold">•</span> Detects urgency from fan tone automatically</li>
              <li className="flex items-center gap-2"><span className="text-gold">•</span> Generates PA announcements in 6 languages</li>
              <li className="flex items-center gap-2"><span className="text-gold">•</span> Flags when to escalate to security</li>
            </ul>
          </div>

          {/* How It Works Section */}
          <section aria-label="How ArenaIQ works" className="mt-16">
            <h2 className="text-xl sm:text-2xl font-extrabold text-center text-white mb-8 tracking-tight">
              Input → Reasoning → Action
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-navy-card/60 border border-electric-blue/30 rounded-xl p-6 text-center">
                <h3 className="text-lg font-black text-electric-blue mb-3">📥 INPUT</h3>
                <p className="text-slate-400 text-sm">Fan query + live zone density from Supabase Realtime</p>
              </div>
              <div className="bg-navy-card/60 border border-gold/30 rounded-xl p-6 text-center">
                <h3 className="text-lg font-black text-gold mb-3">🧠 REASONING</h3>
                <p className="text-slate-400 text-sm">Gemini detects urgency level, language, and context</p>
              </div>
              <div className="bg-navy-card/60 border border-emerald-500/30 rounded-xl p-6 text-center">
                <h3 className="text-lg font-black text-emerald-400 mb-3">📢 ACTION</h3>
                <p className="text-slate-400 text-sm">Multilingual response + PA announcement script for the volunteer to read aloud</p>
              </div>
            </div>
          </section>

        </div>
      </section>

      {/* Accessibility notice */}
      <footer className="py-8 bg-navy-deep border-t border-navy-border text-center text-xs text-slate-500 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2 text-emerald-400">
            <Accessibility className="h-4 w-4" />
            <span>WCAG 2.1 AA Compliant Dashboard</span>
          </div>
          <div>
            <span>Authorized operations team access portal.</span>
          </div>
        </div>
      </footer>

    </main>
  )
}
