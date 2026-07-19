import React, { useState } from 'react';
import { Volume2 } from 'lucide-react';

interface PAAnnouncementPanelProps {
  announcement: string;
  language: string;
}

export default function PAAnnouncementPanel({ announcement, language }: PAAnnouncementPanelProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(announcement);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
  );
}
