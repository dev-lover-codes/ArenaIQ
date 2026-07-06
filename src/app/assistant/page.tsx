"use client"

import React, { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { 
  Activity, 
  Send, 
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
}

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español (Spanish)' },
  { code: 'fr', name: 'Français (French)' },
  { code: 'ar', name: 'العربية (Arabic)' },
  { code: 'pt', name: 'Português (Portuguese)' },
  { code: 'hi', name: 'हिन्दी (Hindi)' },
]

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
          text: m.parts?.[0]?.text || m.text || ''
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
    const updatedMessages = [...messages, { role: 'user' as const, text: userMessageText }]
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
        setMessages(data.messages)
        if (!sessionId && data.sessionId) {
          setSessionId(data.sessionId)
          if (user) {
            localStorage.setItem(`arenaaiq_session_${user.id}`, data.sessionId)
          }
        }
        setLiveChatAnnouncement('Reply received from assistant.')
      } else {
        setMessages(prev => [...prev, { role: 'model', text: `System Error: ${data.error}` }])
        setLiveChatAnnouncement('Error sending message.')
      }
    } catch {
      setMessages(prev => [...prev, { role: 'model', text: 'Network connection error. Please try again.' }])
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

  return (
    <div className="min-h-screen bg-zinc-950 text-slate-100 font-sans flex flex-col">
      
      {/* Screen Reader Live Announcements */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {liveChatAnnouncement}
      </div>

      {/* Navigation Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/60 backdrop-blur-md sticky top-0 z-50 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-500">
                <Activity className="h-5 w-5 text-white" />
              </span>
              <span className="text-xl font-bold tracking-tight text-white">
                Stadium<span className="text-emerald-400">IQ</span>
              </span>
            </div>

            {/* Navigation links */}
            <nav className="hidden md:flex space-x-1" aria-label="Main Navigation">
              <Link 
                href="/dashboard" 
                className="px-3 py-2 rounded-lg text-sm font-semibold text-slate-300 hover:text-white hover:bg-zinc-800"
              >
                Heatmap Dashboard
              </Link>
              <Link 
                href="/navigate" 
                className="px-3 py-2 rounded-lg text-sm font-semibold text-slate-300 hover:text-white hover:bg-zinc-800"
              >
                Smart Route Planner
              </Link>
              <Link 
                href="/assistant" 
                className="px-3 py-2 rounded-lg text-sm font-semibold bg-zinc-800 text-emerald-400 border border-zinc-700"
                aria-current="page"
              >
                Multilingual AI Assistant
              </Link>
            </nav>

            {/* Language Controls */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <label htmlFor="chat-lang" className="sr-only">Select Chat Language</label>
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2 text-slate-400">
                  <Languages className="h-4 w-4" />
                </div>
                <select
                  id="chat-lang"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="rounded-lg border border-zinc-800 bg-zinc-900 py-1.5 pl-8 pr-2 text-xs font-semibold text-white focus:border-emerald-500 focus:outline-hidden"
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>{l.name}</option>
                  ))}
                </select>
              </div>

              {messages.length > 0 && (
                <button
                  onClick={clearChat}
                  className="p-2 rounded-lg border border-zinc-800 hover:bg-zinc-900 text-slate-400 hover:text-white transition"
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
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 flex flex-col min-h-0">
        
        {/* Top Info Banner */}
        <section aria-label="Assistant Info" className="bg-zinc-900/30 border border-zinc-850 p-4 rounded-xl mb-4 shrink-0 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-sm font-bold text-white">ArenaIQ Smart Helper</h1>
              <p className="text-xs text-slate-400">Ask about facilities, match schedules, seating maps, concessions, and transport guidelines.</p>
            </div>
          </div>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-850 text-slate-400 uppercase tracking-wider">
            Gemini Assisted
          </span>
        </section>

        {/* Chat Messages Panel */}
        <section 
          aria-label="Chat messages history"
          className="flex-1 bg-zinc-950 border border-zinc-800 rounded-2xl p-4 sm:p-6 overflow-y-auto space-y-4 shadow-inner"
        >
          {loadingHistory ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-500 mb-2" />
              <span className="text-sm">Retrieving conversation history...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 max-w-sm mx-auto">
              <Sparkles className="h-10 w-10 text-zinc-700 mb-3" />
              <h2 className="text-md font-bold text-slate-400">Welcome to ArenaIQ Support</h2>
              <p className="text-xs mt-1 leading-relaxed">
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
                    className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isUser && (
                      <span className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-xs font-bold text-white">
                        IQ
                      </span>
                    )}

                    <div 
                      className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                        isUser 
                          ? 'bg-emerald-600 text-white rounded-tr-none' 
                          : 'bg-zinc-900 border border-zinc-800 text-slate-200 rounded-tl-none'
                      }`}
                    >
                      <p className="whitespace-pre-line">{msg.text}</p>
                    </div>

                    {isUser && (
                      <span className="h-8 w-8 shrink-0 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                        <User className="h-4 w-4 text-slate-300" />
                      </span>
                    )}
                  </div>
                )
              })}
              
              {sending && (
                <div className="flex items-center gap-3">
                  <span className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-xs font-bold text-white">
                    IQ
                  </span>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl rounded-tl-none px-4 py-3 flex items-center space-x-1.5">
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

        {/* Input Form Area */}
        <form 
          onSubmit={handleSendMessage} 
          className="mt-4 shrink-0 flex items-center gap-2"
          aria-label="Send message form"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder="Ask ArenaIQ Helper..."
              disabled={sending}
              required
              aria-label="Type your message"
              className="w-full rounded-xl border border-zinc-850 bg-zinc-900/60 py-3 pl-4 pr-12 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <button
            type="submit"
            disabled={sending || !inputMsg.trim()}
            className="p-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition disabled:opacity-50 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            aria-label="Send message"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>

      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-850 bg-zinc-950 py-4 shrink-0 text-center text-[10px] text-slate-600">
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
