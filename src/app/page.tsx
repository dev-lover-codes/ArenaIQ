import React from 'react'
import Link from 'next/link'
import { Shield, ArrowRight, Map, Users, Languages, Accessibility } from 'lucide-react'

export default function Home() {
  return (
    <main role="main" className="flex min-h-screen flex-col bg-navy-deep text-slate-100 font-sans stadium-grid">
      
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
          
          {/* FIFA 2026 Stylized Badge */}
          <div className="flex justify-center mb-6">
            <svg className="w-24 h-24 text-gold drop-shadow-[0_0_15px_rgba(255,215,0,0.4)] animate-pulse" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M50 5L85 25V75L50 95L15 75V25L50 5Z" stroke="currentColor" strokeWidth="4" fill="#0c1329" />
              <path d="M50 15L75 30V70L50 85L25 70V30L50 15Z" stroke="#00A8E8" strokeWidth="2" fill="none" />
              <text x="50" y="52" fill="currentColor" fontSize="22" fontWeight="900" textAnchor="middle" letterSpacing="-0.05em">26</text>
              <text x="50" y="68" fill="#f8fafc" fontSize="8" fontWeight="bold" textAnchor="middle" letterSpacing="0.1em">FIFA OPS</text>
            </svg>
          </div>

          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-gold/10 text-gold border border-gold/20 mb-4">
            <span className="h-2 w-2 rounded-full bg-gold animate-ping"></span>
            <span>FIFA World Cup 2026™ Stadium Operations</span>
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-none" style={{ fontWeight: 900, letterSpacing: '-0.04em' }}>
            Intelligent Operations, <br className="hidden sm:inline" />
            <span className="text-gold">
              Elevated Tournament Experience
            </span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-slate-400 leading-relaxed">
            ArenaIQ leverages Generative AI and real-time spatial graph routing to streamline navigation, manage crowd densities, and provide instant multilingual support.
          </p>

          <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-gold text-navy-deep font-bold hover:bg-yellow-400 transition-all shadow-[0_0_20px_rgba(255,215,0,0.2)] focus:outline-hidden focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-navy-deep"
            >
              Sign In to Command Center
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-navy-border bg-navy-card text-base font-semibold text-slate-300 hover:text-white hover:border-gold transition focus:outline-hidden focus:ring-2 focus:ring-slate-500"
            >
              Register Operations Profile
            </Link>
          </div>
        </div>
      </section>

      {/* Live Stats Horizontal Scrolling Ticker */}
      <div className="w-full overflow-hidden bg-navy-card/80 border-y border-navy-border py-4 shrink-0 shadow-inner">
        <div className="w-full overflow-hidden relative">
          <div className="animate-ticker flex items-center space-x-16 text-xs sm:text-sm font-bold tracking-widest text-slate-300 uppercase">
            <span>48 Venues</span>
            <span className="text-gold">•</span>
            <span>3 Host Nations</span>
            <span className="text-gold">•</span>
            <span>104 Matches</span>
            <span className="text-gold">•</span>
            <span>5M+ Fans Live</span>
            <span className="text-gold">•</span>
            <span>Estadio Azteca</span>
            <span className="text-gold">•</span>
            <span>SoFi Stadium</span>
            <span className="text-gold">•</span>
            <span>MetLife Stadium</span>
            <span className="text-gold">•</span>
            <span>48 Venues</span>
            <span className="text-gold">•</span>
            <span>3 Host Nations</span>
            <span className="text-gold">•</span>
            <span>104 Matches</span>
            <span className="text-gold">•</span>
            <span>5M+ Fans Live</span>
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
            
            <div className="bg-navy-card/40 border border-navy-border p-8 rounded-2xl flex flex-col items-start space-y-4 transition-all duration-300 hover:border-t-gold hover:-translate-y-1 hover:shadow-[0_4px_20px_rgba(255,215,0,0.1)]">
              <span className="p-3 rounded-xl bg-gold/10 text-gold border border-gold/20">
                <Map className="h-6 w-6" />
              </span>
              <h3 className="text-xl font-bold text-white">Smart Navigation</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Algorithm-driven, crowd-aware route suggestions over verified spatial graphs. Uses Gemini AI to compile direct, human-like guide explanations.
              </p>
            </div>

            <div className="bg-navy-card/40 border border-navy-border p-8 rounded-2xl flex flex-col items-start space-y-4 transition-all duration-300 hover:border-t-gold hover:-translate-y-1 hover:shadow-[0_4px_20px_rgba(255,215,0,0.1)]">
              <span className="p-3 rounded-xl bg-electric-blue/10 text-electric-blue border border-electric-blue/20">
                <Users className="h-6 w-6" />
              </span>
              <h3 className="text-xl font-bold text-white">Crowd Management</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Visualizing active zone capacities using Supabase Realtime subscriptions. Prevent bottlenecks and secure ingress/egress safety zones.
              </p>
            </div>

            <div className="bg-navy-card/40 border border-navy-border p-8 rounded-2xl flex flex-col items-start space-y-4 transition-all duration-300 hover:border-t-gold hover:-translate-y-1 hover:shadow-[0_4px_20px_rgba(255,215,0,0.1)]">
              <span className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Languages className="h-6 w-6" />
              </span>
              <h3 className="text-xl font-bold text-white">Multilingual AI</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Real-time translations and prompt-controlled assistance to help international fans and venue volunteers interact without boundaries.
              </p>
            </div>

          </div>
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
