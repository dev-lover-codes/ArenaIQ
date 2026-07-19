"use client"

export const dynamic = 'force-dynamic'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Shield, Lock, Mail, AlertCircle, Loader2 } from 'lucide-react'

// eslint-disable-next-line max-lines-per-function -- Form container and input structures for login and sign-up with dynamic status state messages.
export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
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

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    setError(null)
    const { error: oauthErr } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })
    if (oauthErr) {
      setError(oauthErr.message)
      setGoogleLoading(false)
    }
    // On success Supabase redirects automatically, no need to reset loading
  }

  return (
    <main role="main" className="flex min-h-screen flex-col items-center justify-center bg-radial from-[#12192c] via-[#0a0f1e] to-black px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Decorative Outer Layout Accents */}
      <div className="absolute top-10 left-10 w-24 h-24 border-t-2 border-l-2 border-navy-border/50 pointer-events-none hidden md:block"></div>
      <div className="absolute bottom-10 right-10 w-24 h-24 border-b-2 border-r-2 border-navy-border/50 pointer-events-none hidden md:block"></div>

      <div className="w-full max-w-md space-y-8 rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl relative">
        
        {/* FIFA-inspired Decorative Bracket Corners on Login Card */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-gold/40 rounded-tl-xl pointer-events-none" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-gold/40 rounded-tr-xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-gold/40 rounded-bl-xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-gold/40 rounded-br-xl pointer-events-none" />

        {/* Header */}
        <div className="flex flex-col items-center space-y-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-tr from-gold to-yellow-500 shadow-[0_0_24px_rgba(255,215,0,0.3)]">
            <Shield className="h-7 w-7 text-navy-deep" aria-hidden="true" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white" style={{ fontWeight: 900, letterSpacing: '-0.04em' }}>
            Arena<span className="text-gold">AI</span>
          </h1>
          <p className="text-center text-sm text-slate-400">
            FIFA World Cup 2026™ Operations Command Center
          </p>
        </div>

        {/* Error / Success Alerts */}
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

        {/* Google Sign In */}
        <button
          id="google-signin-btn"
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading || loading}
          className="group flex w-full items-center justify-center gap-3 rounded-xl border border-navy-border bg-navy-card/65 py-3 px-4 text-sm font-semibold text-white transition-all duration-200 hover:border-gold hover:bg-navy-card hover:shadow-[0_0_20px_rgba(255,215,0,0.1)] focus:outline-none focus:ring-2 focus:ring-gold disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Sign in with Google"
        >
          {googleLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-gold" />
          ) : (
            /* Google SVG logo */
            <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
          )}
          <span>{googleLoading ? 'Redirecting to Google…' : 'Continue with Google'}</span>
        </button>

        {/* Divider */}
        <div className="relative flex items-center" role="separator">
          <div className="flex-grow border-t border-navy-border" />
          <span className="mx-3 shrink-0 text-xs font-semibold uppercase tracking-wider text-slate-500">
            or sign in with email
          </span>
          <div className="flex-grow border-t border-navy-border" />
        </div>

        {/* Email / Password Form */}
        <form className="space-y-5" onSubmit={handleAuth} aria-label="Email Authentication Form">
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
                  className="block w-full rounded-lg border border-navy-border bg-navy-deep/50 py-2.5 pl-10 pr-3 text-white placeholder-slate-500 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold sm:text-sm transition-colors"
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
                  className="block w-full rounded-lg border border-navy-border bg-navy-deep/50 py-2.5 pl-10 pr-3 text-white placeholder-slate-500 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold sm:text-sm transition-colors"
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
              className="text-xs font-semibold text-slate-400 hover:text-gold focus:outline-none transition-colors"
            >
              {isSignUp ? 'Already registered? Sign In' : 'Need credentials? Request Access'}
            </button>
          </div>

          <button
            id="email-auth-submit-btn"
            type="submit"
            disabled={loading || googleLoading}
            className="group relative flex w-full justify-center rounded-xl bg-gold py-3 px-4 text-sm font-bold text-navy-deep shadow-[0_0_20px_rgba(255,215,0,0.25)] hover:bg-yellow-400 hover:shadow-[0_0_30px_rgba(255,215,0,0.4)] focus:outline-none focus:ring-2 focus:ring-gold disabled:opacity-50 transition-all duration-200"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : isSignUp ? (
              'Register Security Profile'
            ) : (
              'Authenticate and Enter Portal'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="border-t border-navy-border pt-5 text-center text-xs text-slate-500">
          <p>Authorized personnel only · Activities audited · WCAG 2.1 AA</p>
        </div>
      </div>
    </main>
  )
}
