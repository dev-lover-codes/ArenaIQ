"use client"

export const dynamic = 'force-dynamic'

import React, { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { 
  Activity, 
  ArrowRight,
  Sparkles, 
  Trash2, 
  Accessibility, 
  Languages, 
  User,
  Loader2 
} from 'lucide-react'

interface Message {
  role: 'user' | 'model'
  text: string
  timestamp?: string
}

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español (Spanish)', flag: '🇪🇸' },
  { code: 'fr', name: 'Français (French)', flag: '🇫🇷' },
  { code: 'ar', name: 'العربية (Arabic)', flag: '🇸🇦' },
  { code: 'pt', name: 'Português (Portuguese)', flag: '🇧🇷' },
  { code: 'hi', name: 'हिन्दी (Hindi)', flag: '🇮🇳' },
]

function getTimestamp(): string {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function AssistantPage() {
  const router = useRouter()
  const supabase = createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMsg, setInputMsg] = useState('')
  const [language, setLanguage] = useState('en')
  
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [liveChatAnnouncement, setLiveChatAnnouncement] = useState('')

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load session history from DB
  const loadSessionHistory = useCallback(async (id: string) => {
    setLoadingHistory(true)
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('messages')
        .eq('id', id)
        .single()

      if (!error && data) {
        const dbMessages = data.messages || []
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setMessages(dbMessages.map((m: any) => ({
          role: m.role,
          text: m.parts?.[0]?.text || m.text || '',
          timestamp: getTimestamp()
        })))
      }
    } catch {
      console.error('Error loading history')
    } finally {
      setLoadingHistory(false)
    }
  }, [supabase])

  // Verify auth session
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) {
        router.push('/login')
      } else {
        setUser(user)
        // Look for existing session in localStorage
        const storedSession = localStorage.getItem(`arenaaiq_session_${user.id}`)
        if (storedSession) {
          setSessionId(storedSession)
          loadSessionHistory(storedSession)
        }
      }
    }
    checkAuth()
  }, [router, supabase, loadSessionHistory])

  // Scroll to bottom when messages load/change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMsg.trim() || sending) return

    const userMessageText = inputMsg.trim()
    setInputMsg('')
    
    // Optimistic local state update
    const updatedMessages = [...messages, { role: 'user' as const, text: userMessageText, timestamp: getTimestamp() }]
    setMessages(updatedMessages)
    setSending(true)
    setLiveChatAnnouncement('Sending message to ArenaIQ assistant...')

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: userMessageText,
          sessionId,
          language
        })
      })

      const data = await res.json()
      if (data.success) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setMessages(data.messages.map((m: any) => ({ ...m, timestamp: m.timestamp || getTimestamp() })))
        if (!sessionId && data.sessionId) {
          setSessionId(data.sessionId)
          if (user) {
            localStorage.setItem(`arenaaiq_session_${user.id}`, data.sessionId)
          }
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
    }
  }

  const clearChat = () => {
    setMessages([])
    setSessionId(null)
    if (user) {
      localStorage.removeItem(`arenaaiq_session_${user.id}`)
    }
    setLiveChatAnnouncement('Chat session cleared.')
  }

  const selectedLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0]

  return (
    <div className="min-h-screen bg-navy-deep text-slate-100 font-sans flex flex-col stadium-grid">
      
      {/* Screen Reader Live Announcements */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {liveChatAnnouncement}
      </div>

      {/* ── HEADER ─────────────────────────────────────── */}
      <header className="border-b border-navy-border bg-navy-card/80 backdrop-blur-md sticky top-0 z-50 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            
            {/* Logo */}
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-gold to-yellow-500 shadow-[0_0_10px_rgba(255,215,0,0.3)]">
                <Activity className="h-5 w-5 text-navy-deep" />
              </span>
              <div>
                <span className="text-xl font-bold tracking-tight text-white">
                  Arena<span className="text-gold">IQ</span>
                </span>
                <span className="hidden sm:block text-[10px] font-black tracking-[0.18em] text-electric-blue uppercase">
                  Command Center
                </span>
              </div>
            </div>

            {/* Navigation links */}
            <nav className="hidden md:flex space-x-1" aria-label="Main Navigation">
              <Link 
                href="/dashboard" 
                className="px-3 py-2 rounded-lg text-sm font-semibold text-slate-300 hover:text-white hover:bg-navy-card"
              >
                Heatmap Dashboard
              </Link>
              <Link 
                href="/navigate" 
                className="px-3 py-2 rounded-lg text-sm font-semibold text-slate-300 hover:text-white hover:bg-navy-card"
              >
                Smart Route Planner
              </Link>
              <Link 
                href="/assistant" 
                className="px-3 py-2 rounded-lg text-sm font-semibold bg-navy-deep text-gold border border-navy-border"
                aria-current="page"
              >
                Multilingual AI Assistant
              </Link>
            </nav>

            {/* Language Controls — flag + selector inline */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center gap-2 border border-navy-border bg-navy-deep rounded-lg px-2 py-1.5">
                <span className="text-lg">{selectedLang.flag}</span>
                <label htmlFor="chat-lang" className="sr-only">Select Chat Language</label>
                <div className="pointer-events-none text-slate-400">
                  <Languages className="h-3.5 w-3.5" />
                </div>
                <select
                  id="chat-lang"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-white focus:outline-hidden"
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code} className="bg-navy-deep">{l.flag} {l.name}</option>
                  ))}
                </select>
              </div>

              {messages.length > 0 && (
                <button
                  onClick={clearChat}
                  className="p-2 rounded-lg border border-navy-border hover:bg-navy-card text-slate-400 hover:text-white transition"
                  aria-label="Clear chat session history"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* Main Chat Area */}
      <main role="main" className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 flex flex-col min-h-0">
        
        {/* ── ASSISTANT HEADER BANNER ──────────────────── */}
        <section aria-label="Assistant Info" className="bg-navy-card/40 border border-navy-border p-4 rounded-xl mb-4 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="p-2.5 rounded-xl bg-gold/10 border border-gold/20 text-gold">
                <Sparkles className="h-5 w-5" />
              </span>
              <div>
                <h1 className="text-sm font-black text-white tracking-wide">
                  ArenaIQ <span className="text-gold">ASSISTANT</span>
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">Ask about facilities, match schedules, seating maps, concessions, and transport guidelines.</p>
              </div>
            </div>
            <div className="hidden sm:flex flex-col items-end gap-1">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-gold/10 text-gold border border-gold/20 uppercase tracking-wider">
                Gemini Powered
              </span>
              <span className="text-[10px] text-slate-500">{selectedLang.flag} {selectedLang.name}</span>
            </div>
          </div>
        </section>

        {/* ── CHAT MESSAGES ────────────────────────────── */}
        <section 
          aria-label="Chat messages history"
          className="flex-1 bg-navy-deep/60 border border-navy-border rounded-2xl p-4 sm:p-6 overflow-y-auto space-y-4 shadow-inner"
        >
          {loadingHistory ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
              <Loader2 className="h-8 w-8 animate-spin text-gold mb-2" />
              <span className="text-sm">Retrieving conversation history...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 max-w-sm mx-auto">
              <span className="text-5xl mb-4">🏟️</span>
              <h2 className="text-md font-black text-slate-300">Welcome to ArenaIQ Support</h2>
              <p className="text-xs mt-2 leading-relaxed text-slate-500">
                Choose your language above and ask operational or facility questions. 
                (Example: &quot;Where is concession plaza?&quot; or &quot;What is Gate A status?&quot;)
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, index) => {
                const isUser = msg.role === 'user'
                return (
                  <div 
                    key={index} 
                    className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isUser && (
                      <span className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-tr from-gold to-yellow-500 flex items-center justify-center text-xs font-black text-navy-deep mb-5">
                        IQ
                      </span>
                    )}

                    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[80%]`}>
                      <div 
                        className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                          isUser 
                            ? 'bg-amber-500/20 border border-amber-500/30 text-white rounded-tr-sm' 
                            : 'bg-navy-card border-l-4 border-electric-blue text-slate-200 rounded-tl-sm'
                        }`}
                      >
                        <p className="whitespace-pre-line">{msg.text}</p>
                      </div>
                      {msg.timestamp && (
                        <span className="text-xs text-slate-500 mt-1 px-1">{msg.timestamp}</span>
                      )}
                    </div>

                    {isUser && (
                      <span className="h-8 w-8 shrink-0 rounded-full bg-navy-card border border-navy-border flex items-center justify-center mb-5">
                        <User className="h-4 w-4 text-slate-300" />
                      </span>
                    )}
                  </div>
                )
              })}
              
              {sending && (
                <div className="flex items-end gap-2">
                  <span className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-tr from-gold to-yellow-500 flex items-center justify-center text-xs font-black text-navy-deep">
                    IQ
                  </span>
                  <div className="bg-navy-card border-l-4 border-electric-blue rounded-2xl rounded-tl-sm px-4 py-3 flex items-center space-x-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </section>

        {/* ── INPUT AREA ───────────────────────────────── */}
        <div className="mt-4 shrink-0 space-y-2">
          <form 
            onSubmit={handleSendMessage} 
            className="flex items-center gap-2"
            aria-label="Send message form"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                placeholder="Ask anything about the stadium, matches, facilities..."
                disabled={sending}
                required
                aria-label="Type your message"
                className="w-full rounded-xl border border-navy-border bg-navy-card/60 py-3 pl-4 pr-12 text-sm text-white placeholder-slate-500 focus:border-gold focus:outline-hidden focus:ring-1 focus:ring-gold"
              />
            </div>
            <button
              type="submit"
              disabled={sending || !inputMsg.trim()}
              className="p-3.5 rounded-xl bg-gold hover:bg-yellow-400 text-navy-deep transition disabled:opacity-50 focus:outline-hidden focus:ring-2 focus:ring-gold"
              aria-label="Send message"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          </form>
          <p className="text-xs text-slate-500 text-center">
            Powered by Gemini AI • Responds in your language
          </p>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-navy-border bg-navy-deep py-4 shrink-0 text-center text-[10px] text-slate-600">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <p>© 2026 ArenaIQ AI Assistant.</p>
          <div className="flex items-center space-x-1.5 text-emerald-500">
            <Accessibility className="h-3.5 w-3.5" />
            <span>WCAG 2.1 AA compliant keyboard layout</span>
          </div>
        </div>
      </footer>

    </div>
  )
}
