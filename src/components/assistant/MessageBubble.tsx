import React from 'react';
import { ShieldAlert, User as UserIcon } from 'lucide-react';
import { Message } from '@/hooks/useChatSession';
import PAAnnouncementPanel from './PAAnnouncementPanel';

interface MessageBubbleProps {
  msg: Message;
  language: string;
}

const URGENCY_STYLES = {
  LOW:      'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  MEDIUM:   'bg-amber-500/10  text-amber-400  border-amber-500/30',
  HIGH:     'bg-orange-500/10 text-orange-400 border-orange-500/30',
  CRITICAL: 'bg-red-500/15    text-red-400    border-red-500/40',
};

export default function MessageBubble({ msg, language }: MessageBubbleProps) {
  const isUser = msg.role === 'user';

  return (
    <div
      className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}
      aria-label={isUser ? `You: ${msg.text}` : `ArenaIQ: ${msg.text}`}
    >
      {!isUser && (
        <span className="h-7 w-7 shrink-0 rounded-full bg-gradient-to-tr from-gold to-yellow-500 flex items-center justify-center text-[10px] font-black text-navy-deep mb-5">
          IQ
        </span>
      )}

      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[80%]`}>
        {!isUser && (
          <span className="text-[10px] text-electric-blue font-bold mb-1 ml-1">ArenaIQ</span>
        )}

        <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? 'bg-gold/15 border border-gold/30 text-white rounded-tr-sm'
            : 'bg-navy-card border-l-4 border-electric-blue text-slate-100 rounded-tl-sm'
        }`}>
          <p className="whitespace-pre-line">{msg.text}</p>

          {!isUser && msg.copilot && (
            <div className="mt-3 pt-3 border-t border-navy-border/40 space-y-2">
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
              <p className="text-[11px] text-slate-500 italic">{msg.copilot.reason}</p>
            </div>
          )}
        </div>

        {!isUser && msg.copilot?.announcement && (
          <PAAnnouncementPanel
            announcement={msg.copilot.announcement}
            language={language}
          />
        )}

        {msg.timestamp && (
          <span className="text-[10px] text-slate-600 mt-1 px-1">{msg.timestamp}</span>
        )}
      </div>

      {isUser && (
        <span className="h-7 w-7 shrink-0 rounded-full bg-navy-card border border-navy-border flex items-center justify-center mb-5">
          <UserIcon className="h-3.5 w-3.5 text-slate-400" />
        </span>
      )}
    </div>
  );
}
