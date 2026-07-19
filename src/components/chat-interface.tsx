import React, { useState, useRef, useEffect } from 'react'
import { Button } from './ui/button'
import { Send, Trash2, Languages, User } from 'lucide-react'

interface Message {
  role: 'user' | 'model'
  text: string
}

interface ChatInterfaceProps {
  messages: Message[]
  sending: boolean
  onSendMessage: (message: string) => void
  language: string
  onLanguageChange: (lang: string) => void
  onClearChat: () => void
}

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español (Spanish)' },
  { code: 'fr', name: 'Français (French)' },
  { code: 'ar', name: 'العربية (Arabic)' },
  { code: 'pt', name: 'Português (Portuguese)' },
  { code: 'hi', name: 'हिन्दी (Hindi)' },
]

export function ChatInterface({
  messages,
  sending,
  onSendMessage,
  language,
  onLanguageChange,
  onClearChat
}: ChatInterfaceProps) {
  const [inputMsg, setInputMsg] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMsg.trim() || sending) return
    onSendMessage(inputMsg.trim())
    setInputMsg('')
  }

  return (
    <div className="flex flex-col h-full min-h-[400px] border border-zinc-800 rounded-2xl bg-zinc-950/60 overflow-hidden">
      
      {/* Chat header/controls */}
      <div className="flex justify-between items-center px-4 py-3 bg-zinc-900/60 border-b border-zinc-850">
        <div className="flex items-center space-x-2 text-slate-300">
          <Languages className="h-4 w-4" aria-hidden="true" />
          <label htmlFor="chat-lang-selector" className="text-xs font-semibold">
            Language
          </label>
          <select
            id="chat-lang-selector"
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="rounded-md border border-zinc-800 bg-zinc-950 py-1 px-2 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-gold"
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>{l.name}</option>
            ))}
          </select>
        </div>

        {messages.length > 0 && (
          <button
            onClick={onClearChat}
            className="p-1.5 rounded-lg border border-zinc-800 hover:bg-zinc-900 text-slate-400 hover:text-white transition"
            aria-label="Clear chat messages"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Messages viewport */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4" role="log" aria-label="Conversation Log">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 max-w-xs mx-auto py-12">
            <p className="text-sm">Choose your language and ask your stadium assistant questions.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, index) => {
              const isUser = msg.role === 'user'
              return (
                <div key={index} className={`flex items-start gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
                  {!isUser && (
                    <span className="h-7 w-7 rounded-full bg-emerald-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                      IQ
                    </span>
                  )}
                  <div className={`max-w-[75%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                    isUser ? 'bg-emerald-600 text-white rounded-tr-none' : 'bg-zinc-900 text-slate-200 border border-zinc-850 rounded-tl-none'
                  }`}>
                    <p className="whitespace-pre-line">{msg.text}</p>
                  </div>
                  {isUser && (
                    <span className="h-7 w-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
                      <User className="h-3.5 w-3.5 text-slate-300" />
                    </span>
                  )}
                </div>
              )
            })}
            
            {sending && (
              <div className="flex items-center gap-2.5">
                <span className="h-7 w-7 rounded-full bg-emerald-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                  IQ
                </span>
                <div className="bg-zinc-900 border border-zinc-850 rounded-xl rounded-tl-none px-3 py-2 flex items-center space-x-1.5">
                  <span className="h-1 w-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="h-1 w-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="h-1 w-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-zinc-850 bg-zinc-900/40 flex items-center gap-2 shrink-0" aria-label="Send message form">
        <input
          type="text"
          value={inputMsg}
          onChange={(e) => setInputMsg(e.target.value)}
          placeholder="Type message here..."
          disabled={sending}
          required
          aria-label="Message Input"
          className="flex-1 rounded-lg border border-zinc-850 bg-zinc-950 py-2 px-3 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-hidden"
        />
        <Button
          type="submit"
          disabled={sending || !inputMsg.trim()}
          className="p-2.5 rounded-lg text-xs"
          aria-label="Send message"
        >
          <Send className="h-3.5 w-3.5" />
        </Button>
      </form>

    </div>
  )
}
