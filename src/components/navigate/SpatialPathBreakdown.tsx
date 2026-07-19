import React from 'react';

interface SpatialPathBreakdownProps {
  pathNames?: string[];
  path?: string[];
  congestedZones?: string[];
}

export default function SpatialPathBreakdown({ pathNames, path, congestedZones }: SpatialPathBreakdownProps) {
  if (!pathNames || pathNames.length === 0) return null;

  return (
    <div className="arena-card">
      <h3 className="text-sm font-black text-white mb-4">Spatial Path Breakdown</h3>
      <ol className="relative border-l border-navy-border ml-3 space-y-4">
        {pathNames.map((name, index) => {
          const zoneId = path?.[index] || '';
          const isCrowded = congestedZones?.includes(zoneId);
          const isStart = index === 0;
          const isEnd = index === pathNames.length - 1;
          return (
            <li key={index} className="ml-6">
              <span className={`absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full text-xs font-black ${
                isStart ? 'bg-gold text-navy-deep' : isEnd ? 'bg-emerald-500 text-navy-deep' : isCrowded ? 'bg-orange-500 text-white' : 'bg-navy-card text-slate-300 border border-navy-border'
              }`}>
                {index + 1}
              </span>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <p className="font-semibold text-white text-sm">{name}</p>
                {isCrowded && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/20">
                    Congested
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {isStart ? 'Route Start' : isEnd ? 'Destination' : 'Transition Zone'}
              </p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
