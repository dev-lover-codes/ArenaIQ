"use client"

export const dynamic = 'force-dynamic'

import React, { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import AppShell from '@/components/layout/AppShell'
import {
  ArrowUp,
  Sparkles,
  Trash2,
  Languages,
  User as UserIcon,
  Megaphone,
  ShieldAlert,
  Volume2,
} from 'lucide-react'

// ── Types ────────────────────────────────────────────────────────────────────

interface Message {
  role: 'user' | 'model'
  text: string
  timestamp?: string
  /** Volunteer Co-pilot structured payload (parsed from AI JSON) */
  copilot?: VolunteerCopilotPayload
}

/** Structured JSON returned by Gemini in Volunteer Co-pilot mode */
interface VolunteerCopilotPayload {
  response: string
  announcement?: string
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  escalate: boolean
  reason: string
}

// ── Constants ─────────────────────────────────────────────────────────────────

const LANGUAGES = [
  { code: 'en', name: 'English',              flag: '🇬🇧' },
  { code: 'es', name: 'Español (Spanish)',    flag: '🇪🇸' },
  { code: 'fr', name: 'Français (French)',    flag: '🇫🇷' },
  { code: 'ar', name: 'العربية (Arabic)',     flag: '🇸🇦' },
  { code: 'pt', name: 'Português (Portuguese)', flag: '🇧🇷' },
  { code: 'hi', name: 'हिन्दी (Hindi)',       flag: '🇮🇳' },
]

const URGENCY_STYLES: Record<VolunteerCopilotPayload['urgency'], string> = {
  LOW:      'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  MEDIUM:   'bg-amber-500/10  text-amber-400  border-amber-500/30',
  HIGH:     'bg-orange-500/10 text-orange-400 border-orange-500/30',
  CRITICAL: 'bg-red-500/15    text-red-400    border-red-500/40',
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getTimestamp(): string {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function tryParseCopilot(text: string): VolunteerCopilotPayload | null {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return null
    const parsed = JSON.parse(jsonMatch[0]) as VolunteerCopilotPayload
    if (parsed.response && parsed.urgency) return parsed
    return null
  } catch {
    return null
  }
}

// ── PA Announcement Panel ─────────────────────────────────────────────────────

function PAAnnouncementPanel({ announcement, language }: { announcement: string; language: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(announcement)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className="mt-2 border border-electric-blue/30 bg-navy-deep/60 rounded-xl p-4 space-y-2"
      aria-label="PA Announcement script"
    >
      <div className="flex items-center gap-2 text-[10px] font-black tracking-widest text-electric-blue uppercase">
        <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
        PA ANNOUNCEMENT · {language.toUpperCase()}
      </div>
      <p className="text-sm text-slate-200 leading-relaxed italic">&ldquo;{announcement}&rdquo;</p>
      <button
        onClick={handleCopy}
        className="text-[10px] font-bold text-electric-blue hover:text-white transition"
        aria-label="Copy PA announcement to clipboard"
      >
        {copied ? '✓ Copied!' : '📋 Copy to clipboard'}
      </button>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function AssistantPage() {
  const router = useRouter()
  const supabase = createClient()

  const [user, setUser]           = useState<User | null>(null)
  const [messages, setMessages]   = useState<Message[]>([])
  const [inputMsg, setInputMsg]   = useState('')
  const [language, setLanguage]   = useState('en')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [sending, setSending]     = useState(false)
  const [loadingHistory, setLoadingHistory]   = useState(false)
  const [liveChatAnnouncement, setLiveChatAnnouncement] = useState('')

  /** Volunteer Co-pilot mode — changes system prompt and response format */
  const [volunteerMode, setVolunteerMode] = useState(false)
  /** Last PA announcement text to display below the relevant message */
  const [lastAnnouncement, setLastAnnouncement] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef       = useRef<HTMLInputElement>(null)

  // ── Load session history ───────────────────────────────────────────────────
  const loadSessionHistory = useCallback(async (id: string) => {
    setLoadingHistory(true)
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('messages')
        .eq('id', id)
        .single()

      if (!error && data) {
        const dbMessages = (data.messages || []) as Array<{ role: 'user' | 'model'; parts?: Array<{ text: string }>; text?: string }>
        setMessages(dbMessages.map((m) => ({
          role: m.role,
          text: m.parts?.[0]?.text || m.text || '',
          timestamp: getTimestamp(),
        })))
      }
    } catch {
      console.error('Error loading history')
    } finally {
      setLoadingHistory(false)
    }
  }, [supabase])

  // ── Auth check ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) {
        router.push('/login')
      } else {
        setUser(user)
        const storedSession = localStorage.getItem(`arenaaiq_session_${user.id}`)
        if (storedSession) {
          setSessionId(storedSession)
          loadSessionHistory(storedSession)
        }
      }
    }
    checkAuth()
  }, [router, supabase, loadSessionHistory])

  // ── Scroll to bottom ───────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, sending])

  // ── Send message ───────────────────────────────────────────────────────────
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMsg.trim() || sending) return

    const userMessageText = inputMsg.trim()
    setInputMsg('')
    const updatedMessages = [...messages, { role: 'user' as const, text: userMessageText, timestamp: getTimestamp() }]
    setMessages(updatedMessages)
    setSending(true)
    setLiveChatAnnouncement('Sending message to ArenaIQ assistant…')

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessageText,
          sessionId,
          language,
          volunteerMode,
        }),
      })
      const data = await res.json()
      if (data.success) {
        const responseMessages = data.messages as Array<{ role: 'user' | 'model'; text: string; timestamp?: string }>
        const mapped: Message[] = responseMessages.map((m) => {
          const msg: Message = { ...m, timestamp: m.timestamp || getTimestamp() }
          // In volunteer mode, try to parse structured JSON from model responses
          if (volunteerMode && m.role === 'model') {
            const copilot = tryParseCopilot(m.text)
            if (copilot) {
              msg.copilot = copilot
              msg.text = copilot.response
              if (copilot.announcement) setLastAnnouncement(copilot.announcement)
            }
          }
          return msg
        })
        setMessages(mapped)
        if (!sessionId && data.sessionId) {
          setSessionId(data.sessionId)
          if (user) localStorage.setItem(`arenaaiq_session_${user.id}`, data.sessionId)
        }
        setLiveChatAnnouncement('Reply received from assistant.')
      } else {
        setMessages(prev => [...prev, { role: 'model', text: `System Error: ${data.error}`, timestamp: getTimestamp() }])
        setLiveChatAnnouncement('Error sending message.')
      }
    } catch {
      setMessages(prev => [...prev, { role: 'model', text: 'Network connection error. Please try again.', timestamp: getTimestamp() }])
      setLiveChatAnnouncement('Error sending message.')
    } finally {
      setSending(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  const clearChat = () => {
    setMessages([])
    setSessionId(null)
    setLastAnnouncement(null)
    if (user) localStorage.removeItem(`arenaaiq_session_${user.id}`)
    setLiveChatAnnouncement('Chat session cleared.')
  }

  const selectedLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0]

  return (
    <AppShell title="AI Assistant">

      {/* SR live region */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">{liveChatAnnouncement}</div>

      {/* Full-height chat layout */}
      <div className="flex flex-col" style={{ height: 'calc(100vh - 56px)' }}>

        {/* ── CHAT TOP BAR ──────────────────────────────── */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-navy-border bg-navy-card/60 backdrop-blur-md shrink-0">

          {/* Left: title + mode badge */}
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-gold to-yellow-500 shadow-[0_0_10px_rgba(245,197,24,0.3)]">
              <Sparkles className="h-4 w-4 text-navy-deep" />
            </span>
            <div>
              <h1 className="text-sm font-black text-white tracking-wide">
                ArenaIQ <span className="text-gold">ASSISTANT</span>
              </h1>
              <p className="text-[10px] text-slate-500 hidden sm:block">
                {volunteerMode ? '🟡 Volunteer Co-pilot mode' : 'Stadium ops · matches · facilities'}
              </p>
            </div>
          </div>

          {/* Right: volunteer toggle + language + Gemini badge + clear */}
          <div className="flex items-center gap-2">

            {/* Volunteer Co-pilot toggle */}
            <button
              onClick={() => setVolunteerMode(v => !v)}
              aria-pressed={volunteerMode}
              aria-label={volunteerMode ? 'Disable Volunteer Co-pilot mode' : 'Enable Volunteer Co-pilot mode'}
              className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black border tracking-wider transition ${
                volunteerMode
                  ? 'bg-gold/20 text-gold border-gold/40'
                  : 'bg-navy-deep text-slate-500 border-navy-border hover:border-gold/30 hover:text-gold/70'
              }`}
            >
              <Megaphone className="h-3 w-3" aria-hidden="true" />
              {volunteerMode ? 'VOLUNTEER ON' : 'VOLUNTEER'}
            </button>

            {/* Gemini badge */}
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-violet-500/10 text-violet-400 border border-violet-500/20 tracking-wider">
              ✨ Gemini
            </span>

            {/* Language selector */}
            <div className="flex items-center gap-1.5 border border-navy-border bg-navy-deep rounded-lg px-2 py-1">
              <span className="text-base">{selectedLang.flag}</span>
              <label htmlFor="chat-lang" className="sr-only">Select language</label>
              <Languages className="h-3 w-3 text-slate-500" />
              <select
                id="chat-lang"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-transparent text-xs font-semibold text-white focus:outline-hidden max-w-[80px] sm:max-w-none"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code} className="bg-navy-deep">{l.flag} {l.name}</option>
                ))}
              </select>
            </div>

            {/* Clear button */}
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className="p-1.5 rounded-lg border border-navy-border hover:bg-navy-card text-slate-400 hover:text-white transition"
                aria-label="Clear chat history"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Volunteer mode banner */}
        {volunteerMode && (
          <div
            className="bg-gold/5 border-b border-gold/20 px-4 py-2 flex items-start gap-2 text-xs text-gold/80 shrink-0"
            role="status"
            aria-live="polite"
          >
            <Megaphone className="h-3.5 w-3.5 shrink-0 mt-0.5" aria-hidden="true" />
            <span>
              <strong className="text-gold">Volunteer Co-pilot active</strong> — Responses include urgency levels, escalation flags, and PA announcement scripts for zone management.
            </span>
          </div>
        )}

        {/* ── MESSAGES AREA ─────────────────────────────── */}
        <section
          role="log"
          aria-live="polite"
          aria-label="Chat messages"
          className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-5"
        >
          {loadingHistory ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-3">
              <div className="flex gap-1.5">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
              <span className="text-sm">Retrieving conversation…</span>
            </div>

          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4 max-w-sm mx-auto">
              <span className="text-6xl">🏟️</span>
              <div>
                <h2 className="text-lg font-black text-slate-200">
                  {volunteerMode ? 'Volunteer Co-pilot Ready' : 'Ask me anything'}
                </h2>
                <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                  {volunteerMode
                    ? 'Describe a fan situation and I\'ll give you a response, urgency level, and PA script.'
                    : <>About the stadium, matches, or facilities.<br />Try: <span className="text-slate-300">&quot;Where is Gate A?&quot;</span> or <span className="text-slate-300">&quot;¿Dónde está la enfermería?&quot;</span></>
                  }
                </p>
              </div>
            </div>

          ) : (
            <>
              {messages.map((msg, index) => {
                const isUser = msg.role === 'user'
                return (
                  <div
                    key={index}
                    className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}
                    aria-label={isUser ? `You: ${msg.text}` : `ArenaIQ: ${msg.text}`}
                  >
                    {/* AI avatar */}
                    {!isUser && (
                      <span className="h-7 w-7 shrink-0 rounded-full bg-gradient-to-tr from-gold to-yellow-500 flex items-center justify-center text-[10px] font-black text-navy-deep mb-5">
                        IQ
                      </span>
                    )}

                    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[80%]`}>
                      {/* ArenaIQ label above assistant messages */}
                      {!isUser && (
                        <span className="text-[10px] text-electric-blue font-bold mb-1 ml-1">ArenaIQ</span>
                      )}

                      {/* Bubble */}
                      <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        isUser
                          ? 'bg-gold/15 border border-gold/30 text-white rounded-tr-sm'
                          : 'bg-navy-card border-l-4 border-electric-blue text-slate-100 rounded-tl-sm'
                      }`}>
                        <p className="whitespace-pre-line">{msg.text}</p>

                        {/* Volunteer Co-pilot metadata card */}
                        {!isUser && msg.copilot && (
                          <div className="mt-3 pt-3 border-t border-navy-border/40 space-y-2">
                            {/* Urgency badge */}
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-widest uppercase border ${URGENCY_STYLES[msg.copilot.urgency]}`}>
                                <ShieldAlert className="h-3 w-3" aria-hidden="true" />
                                {msg.copilot.urgency}
                              </span>
                              {msg.copilot.escalate && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-widest uppercase bg-red-500/15 text-red-400 border border-red-500/30">
                                  ⚠ ESCALATE
                                </span>
                              )}
                            </div>
                            {/* Reason */}
                            <p className="text-[11px] text-slate-500 italic">{msg.copilot.reason}</p>
                          </div>
                        )}
                      </div>

                      {/* PA Announcement panel (shown below AI message if available) */}
                      {!isUser && msg.copilot?.announcement && (
                        <PAAnnouncementPanel
                          announcement={msg.copilot.announcement}
                          language={language}
                        />
                      )}

                      {/* Timestamp */}
                      {msg.timestamp && (
                        <span className="text-[10px] text-slate-600 mt-1 px-1">{msg.timestamp}</span>
                      )}
                    </div>

                    {/* User avatar */}
                    {isUser && (
                      <span className="h-7 w-7 shrink-0 rounded-full bg-navy-card border border-navy-border flex items-center justify-center mb-5">
                        <UserIcon className="h-3.5 w-3.5 text-slate-400" />
                      </span>
                    )}
                  </div>
                )
              })}

              {/* Typing indicator */}
              {sending && (
                <div className="flex items-end gap-2">
                  <span className="h-7 w-7 shrink-0 rounded-full bg-gradient-to-tr from-gold to-yellow-500 flex items-center justify-center text-[10px] font-black text-navy-deep">
                    IQ
                  </span>
                  <div className="bg-navy-card border-l-4 border-electric-blue rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </section>

        {/* ── PA ANNOUNCEMENT SHORTCUT (if last message had one) ── */}
        {lastAnnouncement && !sending && (
          <div className="px-4 sm:px-6 pb-2 shrink-0">
            <PAAnnouncementPanel announcement={lastAnnouncement} language={language} />
          </div>
        )}

        {/* ── INPUT AREA ────────────────────────────────── */}
        <div className="px-4 sm:px-6 py-4 border-t border-navy-border bg-navy-card/60 backdrop-blur-md shrink-0 pb-20 md:pb-4">
          <form
            onSubmit={handleSendMessage}
            className="flex items-center gap-2"
            aria-label="Send message form"
          >
            {/* Pill input */}
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                placeholder={volunteerMode ? 'Describe the fan situation…' : 'Message ArenaIQ…'}
                disabled={sending}
                required
                aria-label="Message ArenaIQ"
                className="w-full rounded-full border border-navy-border bg-navy-deep py-3 pl-5 pr-4 text-sm text-white placeholder-slate-500 focus:border-gold focus:outline-hidden focus:ring-1 focus:ring-gold transition"
              />
            </div>

            {/* Send button — gold circle */}
            <button
              type="submit"
              disabled={sending || !inputMsg.trim()}
              className="h-11 w-11 rounded-full bg-gold hover:bg-yellow-400 text-navy-deep flex items-center justify-center transition disabled:opacity-40 focus:outline-hidden focus:ring-2 focus:ring-gold shadow-[0_0_12px_rgba(245,197,24,0.3)]"
              aria-label="Send message"
            >
              <ArrowUp className="h-5 w-5" />
            </button>
          </form>

          <p className="text-[10px] text-slate-600 text-center mt-2">
            {volunteerMode
              ? 'Co-pilot mode · Urgency detection · PA announcement scripts'
              : 'Responds in your language · Scoped to stadium ops'
            }
          </p>
        </div>

      </div>
    </AppShell>
  )
}
