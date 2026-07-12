'use client'

export const dynamic = 'force-dynamic'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, Globe, MapPin, ChevronRight, Check } from 'lucide-react'

const ROLES = [
  { id: 'fan', label: 'Fan', emoji: '🏟️', desc: 'Attending matches and exploring the stadium' },
  { id: 'volunteer', label: 'Volunteer', emoji: '🙋', desc: 'Helping fans and supporting stadium operations' },
  { id: 'staff', label: 'Staff', emoji: '🦺', desc: 'Managing zones, tasks, and security' },
]

const LANGUAGES = [
  { id: 'en', label: 'English', flag: '🇬🇧' },
  { id: 'es', label: 'Español', flag: '🇪🇸' },
  { id: 'fr', label: 'Français', flag: '🇫🇷' },
  { id: 'ar', label: 'العربية', flag: '🇸🇦' },
  { id: 'pt', label: 'Português', flag: '🇧🇷' },
  { id: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
]

const GATES = [
  { id: 'gate-a', label: 'Gate A', desc: 'North Entrance' },
  { id: 'gate-b', label: 'Gate B', desc: 'South Entrance' },
  { id: 'gate-c', label: 'Gate C', desc: 'East Entrance' },
  { id: 'gate-d', label: 'Gate D', desc: 'West Entrance' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [role, setRole] = useState('')
  const [language, setLanguage] = useState('')
  const [gate, setGate] = useState('')

  const steps = [
    { title: 'Your Role', subtitle: 'How will you use ArenaIQ today?', icon: User },
    { title: 'Language', subtitle: 'Choose your preferred language', icon: Globe },
    { title: 'Home Gate', subtitle: 'Select your entry gate', icon: MapPin },
  ]

  const canProceed = [
    () => !!role,
    () => !!language,
    () => !!gate,
  ]

  const handleFinish = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('arenaiq_role', role)
      localStorage.setItem('arenaiq_lang', language)
      localStorage.setItem('arenaiq_gate', gate)
    }
    router.push('/dashboard')
  }

  const StepIcon = steps[step].icon

  return (
    <main role="main" className="min-h-screen bg-[#0a0f1e] flex flex-col items-center justify-center px-4 py-12">
      {/* Progress dots */}
      <div className="flex gap-2 mb-10">
        {steps.map((s, i) => (
          <div
            key={i}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === step ? 'w-8 bg-[#f5c518]' : i < step ? 'w-2 bg-[#f5c518]/60' : 'w-2 bg-white/20'
            }`}
          />
        ))}
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-8 shadow-xl">
        <div className="flex flex-col items-center text-center mb-8">
          <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#f5c518]/10 border border-[#f5c518]/30 mb-4">
            <StepIcon className="h-7 w-7 text-[#f5c518]" />
          </span>
          <h1 className="text-2xl font-black text-white">
            {steps[step].title}
          </h1>
          <p className="text-slate-400 text-sm mt-1">{steps[step].subtitle}</p>
        </div>

        {/* Step 0: Role */}
        {step === 0 && (
          <div className="flex flex-col gap-3">
            {ROLES.map(r => (
              <button
                key={r.id}
                onClick={() => setRole(r.id)}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                  role === r.id
                    ? 'border-[#f5c518] bg-[#f5c518]/10 text-white'
                    : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/30'
                }`}
              >
                <span className="text-2xl">{r.emoji}</span>
                <div className="flex-1">
                  <div className="font-bold text-sm">{r.label}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{r.desc}</div>
                </div>
                {role === r.id && <Check className="h-4 w-4 text-[#f5c518] shrink-0" />}
              </button>
            ))}
          </div>
        )}

        {/* Step 1: Language */}
        {step === 1 && (
          <div className="grid grid-cols-2 gap-3">
            {LANGUAGES.map(l => (
              <button
                key={l.id}
                onClick={() => setLanguage(l.id)}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                  language === l.id
                    ? 'border-[#f5c518] bg-[#f5c518]/10 text-white'
                    : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/30'
                }`}
              >
                <span className="text-xl">{l.flag}</span>
                <span className="text-sm font-semibold">{l.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Step 2: Gate */}
        {step === 2 && (
          <div className="flex flex-col gap-3">
            {GATES.map(g => (
              <button
                key={g.id}
                onClick={() => setGate(g.id)}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                  gate === g.id
                    ? 'border-[#f5c518] bg-[#f5c518]/10 text-white'
                    : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/30'
                }`}
              >
                <MapPin className={`h-5 w-5 shrink-0 ${gate === g.id ? 'text-[#f5c518]' : 'text-slate-500'}`} />
                <div className="flex-1">
                  <div className="font-bold text-sm">{g.label}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{g.desc}</div>
                </div>
                {gate === g.id && <Check className="h-4 w-4 text-[#f5c518] shrink-0" />}
              </button>
            ))}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          {step > 0 ? (
            <button
              onClick={() => setStep(s => s - 1)}
              className="text-sm text-slate-400 hover:text-white transition-colors px-3 py-2"
            >
              ← Back
            </button>
          ) : (
            <div />
          )}

          {step < steps.length - 1 ? (
            <button
              onClick={() => canProceed[step]() && setStep(s => s + 1)}
              disabled={!canProceed[step]()}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#f5c518] text-black font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#f5c518]/90 transition-colors"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={() => canProceed[step]() && handleFinish()}
              disabled={!canProceed[step]()}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#f5c518] text-black font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#f5c518]/90 transition-colors"
            >
              Enter Arena 🏟️
            </button>
          )}
        </div>
      </div>

      {/* Step label */}
      <p className="mt-6 text-xs text-slate-500">
        Step {step + 1} of {steps.length} — {steps[step].title}
      </p>
    </main>
  )
}
