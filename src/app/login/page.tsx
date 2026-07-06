"use client"

export const dynamic = 'force-dynamic'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Shield, Lock, Mail, AlertCircle, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSignUp, setIsSignUp] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccessMsg(null)

    if (isSignUp) {
      const { error: signUpErr } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (signUpErr) {
        setError(signUpErr.message)
      } else {
        setSuccessMsg('Registration successful! Please check your email for confirmation.')
      }
    } else {
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (signInErr) {
        setError(signInErr.message)
      } else {
        router.refresh()
        router.push('/dashboard')
      }
    }
    setLoading(false)
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-radial from-slate-900 to-zinc-950 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-slate-800 bg-slate-950/50 p-8 shadow-2xl backdrop-blur-md">
        
        {/* Header */}
        <div className="flex flex-col items-center space-y-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            <Shield className="h-6 w-6 text-white" aria-hidden="true" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Stadium<span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">IQ</span>
          </h1>
          <p className="text-center text-sm text-slate-400">
            FIFA World Cup 2026™ Operations Command Center
          </p>
        </div>

        {/* Form Container */}
        <form className="mt-8 space-y-6" onSubmit={handleAuth} aria-label="Authentication Form">
          {error && (
            <div className="flex items-center space-x-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400" role="alert">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center space-x-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-400" role="alert">
              <Shield className="h-5 w-5 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="space-y-4 rounded-md">
            <div>
              <label htmlFor="email-address" className="block text-sm font-medium text-slate-300">
                Operational Email Address
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-5 w-5 text-slate-500" aria-hidden="true" />
                </div>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-lg border border-slate-800 bg-slate-900/50 py-2.5 pl-10 pr-3 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 sm:text-sm"
                  placeholder="name@arenaaiq.fifa.org"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password-input" className="block text-sm font-medium text-slate-300">
                Security Password
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-5 w-5 text-slate-500" aria-hidden="true" />
                </div>
                <input
                  id="password-input"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-lg border border-slate-800 bg-slate-900/50 py-2.5 pl-10 pr-3 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError(null)
                setSuccessMsg(null)
              }}
              className="text-xs font-semibold text-slate-400 hover:text-emerald-400 focus:outline-hidden"
            >
              {isSignUp ? 'Already registered? Sign In' : 'Need credentials? Request Access'}
            </button>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 py-3 px-4 text-sm font-semibold text-white hover:from-emerald-400 hover:to-teal-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : isSignUp ? (
                'Register Security Profile'
              ) : (
                'Authenticate and Enter Portal'
              )}
            </button>
          </div>
        </form>

        {/* Footer info */}
        <div className="mt-8 border-t border-slate-800 pt-6 text-center text-xs text-slate-500">
          <p>Authorized personnel only. Activities are audited under WCAG 2.1 AA protocols.</p>
        </div>
      </div>
    </main>
  )
}
