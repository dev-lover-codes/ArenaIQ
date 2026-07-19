"use client"

export const dynamic = 'force-dynamic'

import React, { useRef, useEffect } from 'react'
import AppShell from '@/components/layout/AppShell'
import {
  ArrowUp,
  Sparkles,
  Trash2,
  Languages,
  Megaphone,
} from 'lucide-react'
import { useChatSession } from '@/hooks/useChatSession'
import MessageBubble from '@/components/assistant/MessageBubble'
import PAAnnouncementPanel from '@/components/assistant/PAAnnouncementPanel'

const LANGUAGES = [
  { code: 'en', name: 'English',              flag: '🇬🇧' },
  { code: 'es', name: 'Español (Spanish)',    flag: '🇪🇸' },
  { code: 'fr', name: 'Français (French)',    flag: '🇫🇷' },
  { code: 'ar', name: 'العربية (Arabic)',     flag: '🇸🇦' },
  { code: 'pt', name: 'Português (Portuguese)', flag: '🇧🇷' },
  { code: 'hi', name: 'हिन्दी (Hindi)',       flag: '🇮🇳' },
]

export default function AssistantPage() {
  const {
    messages,
    inputMsg,
    setInputMsg,
    language,
    setLanguage,
    sending,
    loadingHistory,
    liveChatAnnouncement,
    volunteerMode,
    setVolunteerMode,
    lastAnnouncement,
    handleSendMessage,
    clearChat
  } = useChatSession()

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef       = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, sending])

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await handleSendMessage()
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const selectedLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0]

  return (
    <AppShell title="AI Assistant">
      <div className="sr-only" aria-live="polite" aria-atomic="true">{liveChatAnnouncement}</div>

      <div className="flex flex-col" style={{ height: 'calc(100vh - 56px)' }}>
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-navy-border bg-navy-card/60 backdrop-blur-md shrink-0">
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

          <div className="flex items-center gap-2">
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

            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-violet-500/10 text-violet-400 border border-violet-500/20 tracking-wider">
              ✨ Gemini
            </span>

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

        {volunteerMode && (
          <div className="bg-gold/5 border-b border-gold/20 px-4 py-2 flex items-start gap-2 text-xs text-gold/80 shrink-0" role="status" aria-live="polite">
            <Megaphone className="h-3.5 w-3.5 shrink-0 mt-0.5" aria-hidden="true" />
            <span>
              <strong className="text-gold">Volunteer Co-pilot active</strong> — Responses include urgency levels, escalation flags, and PA announcement scripts for zone management.
            </span>
          </div>
        )}

        <section role="log" aria-live="polite" aria-label="Chat messages" className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-5">
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
              {messages.map((msg, index) => (
                <MessageBubble key={index} msg={msg} language={language} />
              ))}

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

        {lastAnnouncement && !sending && (
          <div className="px-4 sm:px-6 pb-2 shrink-0">
            <PAAnnouncementPanel announcement={lastAnnouncement} language={language} />
          </div>
        )}

        <div className="px-4 sm:px-6 py-4 border-t border-navy-border bg-navy-card/60 backdrop-blur-md shrink-0 pb-20 md:pb-4">
          <form onSubmit={handleFormSubmit} className="flex items-center gap-2" aria-label="Send message form">
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
