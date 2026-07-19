import React from 'react';
import { MapPin, Navigation, Loader2, Zap } from 'lucide-react';
import { Zone } from '@/types';
import { ZONE_STATUS_STYLES } from '@/lib/constants';

interface RouteFormProps {
  zones: Zone[];
  startZone: string;
  setStartZone: (val: string) => void;
  endZone: string;
  setEndZone: (val: string) => void;
  language: string;
  setLanguage: (val: string) => void;
  wheelchairMode: boolean;
  setWheelchairMode: (val: boolean) => void;
  calculating: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

const LANGUAGES = [
  { code: 'en', name: 'English',    flag: '🇬🇧' },
  { code: 'es', name: 'Español',    flag: '🇪🇸' },
  { code: 'fr', name: 'Français',   flag: '🇫🇷' },
  { code: 'ar', name: 'العربية',    flag: '🇸🇦' },
  { code: 'pt', name: 'Português',  flag: '🇧🇷' },
  { code: 'hi', name: 'हिन्दी',     flag: '🇮🇳' },
];

function statusBadge(status: Zone['status']) {
  const style = ZONE_STATUS_STYLES[status];
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-black tracking-widest ${style.className}`}>
      {style.label}
    </span>
  );
}

// eslint-disable-next-line max-lines-per-function -- Form layout component wrapping selectors, custom wheelchair toggles and localized trigger buttons.
export default function RouteForm({
  zones,
  startZone,
  setStartZone,
  endZone,
  setEndZone,
  language,
  setLanguage,
  wheelchairMode,
  setWheelchairMode,
  calculating,
  onSubmit,
}: RouteFormProps) {
  const selectedLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];
  const fromZone = zones.find(z => z.id === startZone);
  const toZone   = zones.find(z => z.id === endZone);

  return (
    <form onSubmit={onSubmit} className="space-y-5" aria-label="Route Selection Form">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="arena-card space-y-3">
          <p className="section-heading flex items-center gap-1.5">
            <MapPin className="h-3 w-3" /> 📍 Departing From
          </p>
          <select
            id="start-zone-select"
            value={startZone}
            onChange={(e) => setStartZone(e.target.value)}
            required
            className="block w-full rounded-xl border border-navy-border bg-navy-deep py-3 px-4 text-xl font-bold text-white focus:border-gold focus:outline-hidden focus:ring-1 focus:ring-gold"
            aria-label="Select departure zone"
          >
            <option value="">Select zone…</option>
            {zones.map((z) => (
              <option key={z.id} value={z.id} disabled={z.status === 'closed'} className="text-base font-normal">
                {z.name}{z.status === 'closed' ? ' (Closed)' : ''}
              </option>
            ))}
          </select>
          {fromZone && (
            <div className="flex items-center justify-between px-1">
              <span className="text-xs text-slate-400">{fromZone.name}</span>
              {statusBadge(fromZone.status)}
            </div>
          )}
        </div>

        <div className="arena-card space-y-3">
          <p className="section-heading flex items-center gap-1.5">
            <Navigation className="h-3 w-3" /> 🎯 Destination
          </p>
          <select
            id="end-zone-select"
            value={endZone}
            onChange={(e) => setEndZone(e.target.value)}
            required
            className="block w-full rounded-xl border border-navy-border bg-navy-deep py-3 px-4 text-xl font-bold text-white focus:border-gold focus:outline-hidden focus:ring-1 focus:ring-gold"
            aria-label="Select destination zone"
          >
            <option value="">Select zone…</option>
            {zones.map((z) => (
              <option key={z.id} value={z.id} disabled={z.status === 'closed'} className="text-base font-normal">
                {z.name}{z.status === 'closed' ? ' (Closed)' : ''}
              </option>
            ))}
          </select>
          {toZone && (
            <div className="flex items-center justify-between px-1">
              <span className="text-xs text-slate-400">{toZone.name}</span>
              {statusBadge(toZone.status)}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="arena-card-sm flex items-center justify-between">
          <label htmlFor="wheelchair-mode-toggle" className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer select-none">
            ♿ Step-free / Wheelchair route
          </label>
          <label className="toggle-switch" aria-label="Enable wheelchair accessible route">
            <input
              type="checkbox"
              id="wheelchair-mode-toggle"
              checked={wheelchairMode}
              onChange={e => setWheelchairMode(e.target.checked)}
              aria-label="Enable wheelchair accessible route"
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className="arena-card-sm">
          <label htmlFor="lang-select" className="section-heading block">AI Guide Language</label>
          <div className="flex items-center gap-2">
            <span className="text-xl">{selectedLang.flag}</span>
            <select
              id="lang-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="flex-1 rounded-xl border border-navy-border bg-navy-deep py-2 px-3 text-sm text-white focus:border-gold focus:outline-hidden focus:ring-1 focus:ring-gold"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>{l.flag} {l.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={calculating || !startZone || !endZone}
        className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gold hover:bg-yellow-400 text-navy-deep font-black text-base tracking-wide transition focus:outline-hidden focus:ring-2 focus:ring-gold disabled:opacity-50 shadow-[0_0_24px_rgba(245,197,24,0.2)]"
        aria-label="Calculate optimal route"
      >
        {calculating ? (
          <><Loader2 className="h-5 w-5 animate-spin" /> Optimizing Path…</>
        ) : (
          <><Zap className="h-5 w-5" /> ⚡ CALCULATE OPTIMAL ROUTE</>
        )}
      </button>
    </form>
  );
}
