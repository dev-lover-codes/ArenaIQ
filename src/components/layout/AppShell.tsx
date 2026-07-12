'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Activity,
  LayoutDashboard,
  Map,
  MessageSquare,
  ClipboardList,
  Trophy,
  LogOut,
  Menu,
  X,
  Clock,
} from 'lucide-react'

interface AppShellProps {
  children: React.ReactNode
  title: string
}

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, emoji: '🏠' },
  { href: '/navigate',  label: 'Navigate',  icon: Map,             emoji: '🗺️' },
  { href: '/assistant', label: 'Assistant', icon: MessageSquare,   emoji: '💬' },
  { href: '/staff',     label: 'Staff Ops', icon: ClipboardList,   emoji: '📋' },
  { href: '/matches',   label: 'Matches',   icon: Trophy,          emoji: '🏆' },
]

function getRolePillStyles(role?: string) {
  switch (role) {
    case 'organizer': return 'bg-gold/20 text-gold border border-gold/30'
    case 'staff':     return 'bg-electric-blue/20 text-electric-blue border border-electric-blue/30'
    default:          return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
  }
}

function LiveClock() {
  const [time, setTime] = useState('')

  useEffect(() => {
    const update = () => {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <span className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
      <Clock className="h-3.5 w-3.5 text-electric-blue" />
      {time}
    </span>
  )
}

export default function AppShell({ children, title }: AppShellProps) {
  const pathname = usePathname()
  const router   = useRouter()
  const supabase = createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user,    setUser]    = useState<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [profile, setProfile] = useState<any>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) {
        router.push('/login')
        return
      }
      setUser(user)
      const { data } = await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('id', user.id)
        .single()
      setProfile(data)
    }
    load()
  }, [router, supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.refresh()
    router.push('/login')
  }

  return (
    <div className="flex min-h-screen bg-navy-deep text-slate-100 font-sans stadium-grid">

      {/* ── DESKTOP SIDEBAR ─────────────────────────────── */}
      <aside
        className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-60 border-r border-navy-border bg-navy-card/70 backdrop-blur-xl z-40"
        aria-label="Primary navigation sidebar"
      >
        {/* Logo */}
        <div className="flex flex-col items-start px-5 pt-6 pb-4 border-b border-navy-border">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-gold to-yellow-500 shadow-[0_0_14px_rgba(245,197,24,0.35)]">
              <Activity className="h-5 w-5 text-navy-deep" />
            </span>
            <span className="text-xl font-black tracking-tight text-white">
              Arena<span className="text-gold">IQ</span>
            </span>
          </div>
          {/* LIVE badge */}
          <span className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black tracking-widest uppercase bg-red-500/15 text-red-400 border border-red-500/25">
            <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-ping" />
            LIVE
          </span>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-5 space-y-1" aria-label="Main navigation">
          {NAV_ITEMS.map(({ href, label, icon: Icon, emoji }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={[
                  'group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150',
                  active
                    ? 'border-l-4 border-gold text-gold bg-navy-deep/80 pl-2'
                    : 'border-l-4 border-transparent text-slate-400 hover:text-gold hover:bg-navy-deep/50 pl-2',
                ].join(' ')}
              >
                <span className="text-base select-none" aria-hidden="true">{emoji}</span>
                <Icon className={['h-4 w-4 shrink-0', active ? 'text-gold' : 'text-slate-500 group-hover:text-gold'].join(' ')} />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* User Info + Logout */}
        <div className="px-4 py-5 border-t border-navy-border space-y-3">
          {user && (
            <div className="space-y-1.5">
              <p className="text-xs text-slate-500 truncate leading-tight">{user.email}</p>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize ${getRolePillStyles(profile?.role)}`}>
                {profile?.role || 'fan'}
              </span>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-red-400 border border-red-500/25 hover:bg-red-500/10 transition focus:outline-hidden focus:ring-2 focus:ring-red-500"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── MAIN AREA ────────────────────────────────────── */}
      <div className="flex flex-col flex-1 md:ml-60 min-h-screen">

        {/* ── TOP BAR ──────────────────────────────────── */}
        <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-4 sm:px-6 border-b border-navy-border bg-navy-card/80 backdrop-blur-md shrink-0">

          {/* Mobile: Logo + hamburger */}
          <div className="flex items-center gap-3 md:hidden">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-gold to-yellow-500 shadow-[0_0_10px_rgba(245,197,24,0.3)]">
              <Activity className="h-4 w-4 text-navy-deep" />
            </span>
            <span className="text-lg font-black text-white">
              Arena<span className="text-gold">IQ</span>
            </span>
            <button
              onClick={() => setMobileMenuOpen(v => !v)}
              className="ml-1 p-1.5 rounded-lg border border-navy-border text-slate-400 hover:text-white transition"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open user menu'}
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>

          {/* Desktop: page title */}
          <h1 className="hidden md:block text-base font-black tracking-tight text-white">
            {title}
          </h1>

          {/* Right: FIFA badge + clock */}
          <div className="flex items-center gap-3">
            <LiveClock />
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black tracking-widest uppercase bg-gold/10 text-gold border border-gold/25">
              🏆 FIFA WC 2026
            </span>
          </div>
        </header>

        {/* Mobile user drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-14 left-0 right-0 z-50 bg-navy-card border-b border-navy-border px-4 py-4 space-y-3 shadow-xl">
            {user && (
              <div className="space-y-1">
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize ${getRolePillStyles(profile?.role)}`}>
                  {profile?.role || 'fan'}
                </span>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-red-400 border border-red-500/25 hover:bg-red-500/10 transition"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        )}

        {/* Page content */}
        <main role="main" className="flex-1">
          {children}
        </main>

        {/* ── MOBILE BOTTOM TAB BAR ────────────────────── */}
        <nav
          className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-navy-border bg-navy-card/95 backdrop-blur-xl h-16 px-1"
          aria-label="Mobile navigation"
        >
          {NAV_ITEMS.map(({ href, label, emoji }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={[
                  'flex flex-col items-center justify-center gap-0.5 flex-1 py-2 rounded-lg transition-all text-center',
                  active ? 'text-gold' : 'text-slate-500 hover:text-slate-300',
                ].join(' ')}
              >
                <span className="text-xl leading-none" aria-hidden="true">{emoji}</span>
                <span className={['text-[10px] font-bold tracking-wide', active ? 'text-gold' : 'text-slate-500'].join(' ')}>
                  {label}
                </span>
                {active && (
                  <span className="absolute bottom-1 w-5 h-0.5 rounded-full bg-gold" aria-hidden="true" />
                )}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
