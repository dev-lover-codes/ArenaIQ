import React from 'react';
import { Zone } from '@/hooks/useZones';

interface ZoneCardProps {
  zone: Zone;
  onClick: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

function getDensityDetails(occupancy: number, capacity: number) {
  const ratio = occupancy / capacity;
  if (ratio >= 0.9) return {
    barColor: 'bg-red-500',
    indicatorColor: 'bg-red-500',
    pctColor: 'text-red-400',
    badge: 'status-critical border',
    statusLabel: 'CRITICAL',
  };
  if (ratio >= 0.7) return {
    barColor: 'bg-orange-500',
    indicatorColor: 'bg-orange-500',
    pctColor: 'text-orange-400',
    badge: 'status-crowded border',
    statusLabel: 'CROWDED',
  };
  if (ratio >= 0.4) return {
    barColor: 'bg-amber-500',
    indicatorColor: 'bg-amber-500',
    pctColor: 'text-amber-400',
    badge: 'bg-amber-500/10 text-amber-400 border border-amber-500/30',
    statusLabel: 'FILLING',
  };
  return {
    barColor: 'bg-emerald-500',
    indicatorColor: 'bg-emerald-500',
    pctColor: 'text-emerald-400',
    badge: 'status-open border',
    statusLabel: 'OPEN',
  };
}

export default function ZoneCard({ zone, onClick, onKeyDown }: ZoneCardProps) {
  const details = getDensityDetails(zone.current_occupancy, zone.capacity);
  const ratio = zone.current_occupancy / zone.capacity;
  const percent = Math.round(ratio * 100);

  return (
    <article
      onClick={onClick}
      className="arena-card-sm flex overflow-hidden cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all duration-200"
      role="button"
      tabIndex={0}
      aria-label={`${zone.name}: ${percent}% capacity. Click to navigate.`}
      onKeyDown={onKeyDown}
      style={{ padding: 0 }}
    >
      <div className={`w-2 shrink-0 ${details.indicatorColor}`} aria-hidden="true" />
      <div className="flex-1 p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="text-sm font-bold text-white leading-tight">{zone.name}</p>
            <p className="text-xs text-slate-500 mt-0.5">{zone.section}</p>
          </div>
          <span className={`text-2xl font-black ml-2 shrink-0 ${details.pctColor}`}>
            {percent}%
          </span>
        </div>

        <p className="text-xs text-slate-400 mb-2">
          <span className="font-semibold text-slate-200">{zone.current_occupancy.toLocaleString()}</span>
          <span className="text-slate-600"> / </span>
          {zone.capacity.toLocaleString()}
        </p>

        <div className="h-1 w-full rounded-full bg-navy-deep overflow-hidden mb-3">
          <div
            className={`h-full rounded-full transition-all duration-700 ${details.barColor}`}
            style={{ width: `${percent}%` }}
          />
        </div>

        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black tracking-widest uppercase ${details.badge}`}>
          {details.statusLabel}
        </span>
      </div>
    </article>
  );
}
