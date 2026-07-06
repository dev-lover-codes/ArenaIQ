import React, { useState } from 'react'
import { Button } from './ui/button'

interface Zone {
  id: string
  name: string
  status: 'open' | 'crowded' | 'closed'
}

interface NavigationFormProps {
  zones: Zone[]
  onSubmit: (startZone: string, endZone: string, language: string) => void
  loading: boolean
}

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español (Spanish)' },
  { code: 'fr', name: 'Français (French)' },
  { code: 'ar', name: 'العربية (Arabic)' },
  { code: 'pt', name: 'Português (Portuguese)' },
  { code: 'hi', name: 'हिन्दी (Hindi)' },
]

export function NavigationForm({ zones, onSubmit, loading }: NavigationFormProps) {
  const [startZone, setStartZone] = useState('')
  const [endZone, setEndZone] = useState('')
  const [language, setLanguage] = useState('en')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!startZone || !endZone) return
    onSubmit(startZone, endZone, language)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" aria-label="Route Planning Form">
      <div>
        <label htmlFor="nav-start-select" className="block text-sm font-semibold text-slate-300">
          Departure Location
        </label>
        <select
          id="nav-start-select"
          value={startZone}
          onChange={(e) => setStartZone(e.target.value)}
          required
          className="mt-1 block w-full rounded-lg border border-zinc-800 bg-zinc-950 py-2 px-3 text-white focus:border-emerald-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 sm:text-sm"
        >
          <option value="">Select departure zone...</option>
          {zones.map((z) => (
            <option key={z.id} value={z.id} disabled={z.status === 'closed'}>
              {z.name} {z.status === 'closed' ? '(Closed)' : z.status === 'crowded' ? '(Crowded)' : ''}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="nav-end-select" className="block text-sm font-semibold text-slate-300">
          Destination Location
        </label>
        <select
          id="nav-end-select"
          value={endZone}
          onChange={(e) => setEndZone(e.target.value)}
          required
          className="mt-1 block w-full rounded-lg border border-zinc-800 bg-zinc-950 py-2 px-3 text-white focus:border-emerald-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 sm:text-sm"
        >
          <option value="">Select destination...</option>
          {zones.map((z) => (
            <option key={z.id} value={z.id} disabled={z.status === 'closed'}>
              {z.name} {z.status === 'closed' ? '(Closed)' : z.status === 'crowded' ? '(Crowded)' : ''}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="nav-lang-select" className="block text-sm font-semibold text-slate-300">
          AI Guide Language
        </label>
        <select
          id="nav-lang-select"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="mt-1 block w-full rounded-lg border border-zinc-800 bg-zinc-950 py-2 px-3 text-white focus:border-emerald-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 sm:text-sm"
        >
          {LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>{l.name}</option>
          ))}
        </select>
      </div>

      <Button
        type="submit"
        loading={loading}
        disabled={!startZone || !endZone}
        className="w-full"
        aria-label="Calculate optimal route"
      >
        Get AI Directions
      </Button>
    </form>
  )
}
