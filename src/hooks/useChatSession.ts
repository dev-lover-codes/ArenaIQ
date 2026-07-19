import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Message, VolunteerCopilotPayload } from '@/types';

function getTimestamp(): string {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function tryParseCopilot(text: string): VolunteerCopilotPayload | null {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    const parsed = JSON.parse(jsonMatch[0]) as VolunteerCopilotPayload;
    if (parsed.response && parsed.urgency) return parsed;
    return null;
  } catch {
    return null;
  }
}

/**
 * Custom React hook for managing the multilingual AI Assistant session.
 * Connects active chat messages list, message input state, user settings, preferred translation language,
 * and handles dispatching messages to the Gemini chat API.
 * 
 * @returns State properties, message sender triggers, and session controllers.
 */
// eslint-disable-next-line max-lines-per-function -- State management hook that handles message lists, session states, translation settings, and Supabase interaction.
export function useChatSession() {
  const router = useRouter();
  // Stabilize the client so useCallback / useEffect deps don't cycle
  // on every render due to a new createClient() reference.
  const supabaseRef = useRef<SupabaseClient | null>(null);
  if (!supabaseRef.current) supabaseRef.current = createClient();
  const supabase = supabaseRef.current;

  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMsg, setInputMsg] = useState('');
  const [language, setLanguage] = useState('en');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [liveChatAnnouncement, setLiveChatAnnouncement] = useState('');
  const [volunteerMode, setVolunteerMode] = useState(false);
  const [lastAnnouncement, setLastAnnouncement] = useState<string | null>(null);

  const loadSessionHistory = useCallback(async (id: string) => {
    setLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('messages')
        .eq('id', id)
        .single();

      if (!error && data) {
        const dbMessages = (data.messages || []) as Array<{ role: 'user' | 'model'; parts?: Array<{ text: string }>; text?: string }>;
        setMessages(dbMessages.map((m) => ({
          role: m.role,
          text: m.parts?.[0]?.text || m.text || '',
          timestamp: getTimestamp(),
        })));
      }
    } catch {
      console.error('Error loading history');
    } finally {
      setLoadingHistory(false);
    }
  }, [supabase]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        router.push('/login');
      } else {
        setUser(user);
        const storedSession = localStorage.getItem(`arenaaiq_session_${user.id}`);
        if (storedSession) {
          setSessionId(storedSession);
          loadSessionHistory(storedSession);
        }
      }
    };
    checkAuth();
  }, [router, supabase, loadSessionHistory]);

  const handleSendMessage = async () => {
    if (!inputMsg.trim() || sending) return;

    const userMessageText = inputMsg.trim();
    setInputMsg('');
    const updatedMessages = [...messages, { role: 'user' as const, text: userMessageText, timestamp: getTimestamp() }];
    setMessages(updatedMessages);
    setSending(true);
    setLiveChatAnnouncement('Sending message to ArenaIQ assistant…');

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
      });
      const data = await res.json();
      if (data.success) {
        const responseMessages = data.messages as Array<{ role: 'user' | 'model'; text: string; timestamp?: string }>;
        const mapped: Message[] = responseMessages.map((m) => {
          const msg: Message = { ...m, timestamp: m.timestamp || getTimestamp() };
          if (volunteerMode && m.role === 'model') {
            const copilot = tryParseCopilot(m.text);
            if (copilot) {
              msg.copilot = copilot;
              msg.text = copilot.response;
              if (copilot.announcement) setLastAnnouncement(copilot.announcement);
            }
          }
          return msg;
        });
        setMessages(mapped);
        if (!sessionId && data.sessionId) {
          setSessionId(data.sessionId);
          if (user) localStorage.setItem(`arenaaiq_session_${user.id}`, data.sessionId);
        }
        setLiveChatAnnouncement('Reply received from assistant.');
      } else {
        setMessages(prev => [...prev, { role: 'model', text: `System Error: ${data.error}`, timestamp: getTimestamp() }]);
        setLiveChatAnnouncement('Error sending message.');
      }
    } catch {
      setMessages(prev => [...prev, { role: 'model', text: 'Network connection error. Please try again.', timestamp: getTimestamp() }]);
      setLiveChatAnnouncement('Error sending message.');
    } finally {
      setSending(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setSessionId(null);
    setLastAnnouncement(null);
    if (user) localStorage.removeItem(`arenaaiq_session_${user.id}`);
    setLiveChatAnnouncement('Chat session cleared.');
  };

  return {
    user,
    messages,
    inputMsg,
    setInputMsg,
    language,
    setLanguage,
    sessionId,
    sending,
    loadingHistory,
    liveChatAnnouncement,
    volunteerMode,
    setVolunteerMode,
    lastAnnouncement,
    setLastAnnouncement,
    handleSendMessage,
    clearChat
  };
}
