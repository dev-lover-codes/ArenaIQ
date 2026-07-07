import React from 'react'
import Link from 'next/link'
import { Shield, ArrowRight, Map, Users, Languages, Accessibility } from 'lucide-react'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-radial from-slate-900 via-zinc-950 to-black text-slate-100 font-sans">
      
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-500">
              <Shield className="h-5 w-5 text-white" />
            </span>
            <span className="text-xl font-bold tracking-tight text-white">
              Arena<span className="text-emerald-400">IQ</span>
            </span>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          >
            Access Portal
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 lg:py-32">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-4">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>FIFA World Cup 2026™ Stadium Operations</span>
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-none">
            Intelligent Operations, <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Elevated Tournament Experience
            </span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-slate-400 leading-relaxed">
            ArenaIQ leverages Generative AI and real-time spatial graph routing to streamline navigation, manage crowd densities, and provide instant multilingual support.
          </p>

          <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-base font-semibold text-white hover:from-emerald-400 hover:to-teal-400 transition shadow-[0_0_20px_rgba(16,185,129,0.2)] focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
            >
              Sign In to Command Center
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-slate-700 bg-slate-900/50 text-base font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition focus:outline-hidden focus:ring-2 focus:ring-slate-500"
            >
              Register Operations Profile
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Pillar Highlights */}
      <section className="bg-zinc-900/40 border-t border-zinc-800 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-white mb-12">
            The Three Pillars of ArenaIQ
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="bg-zinc-950/50 border border-zinc-800 p-8 rounded-2xl flex flex-col items-start space-y-4">
              <span className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Map className="h-6 w-6" />
              </span>
              <h3 className="text-xl font-bold text-white">Smart Navigation</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Algorithm-driven, crowd-aware route suggestions over verified spatial graphs. Uses Gemini AI to compile direct, human-like guide explanations.
              </p>
            </div>

            <div className="bg-zinc-950/50 border border-zinc-800 p-8 rounded-2xl flex flex-col items-start space-y-4">
              <span className="p-3 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
                <Users className="h-6 w-6" />
              </span>
              <h3 className="text-xl font-bold text-white">Crowd Management</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Visualizing active zone capacities using Supabase Realtime subscriptions. Prevent bottlenecks and secure ingress/egress safety zones.
              </p>
            </div>

            <div className="bg-zinc-950/50 border border-zinc-800 p-8 rounded-2xl flex flex-col items-start space-y-4">
              <span className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
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
      <section className="py-8 bg-zinc-950 border-t border-zinc-900 text-center text-xs text-slate-500 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2 text-emerald-400">
            <Accessibility className="h-4 w-4" />
            <span>WCAG 2.1 AA Compliant Dashboard</span>
          </div>
          <div>
            <span>Authorized operations team access portal.</span>
          </div>
        </div>
      </section>

    </main>
  )
}
