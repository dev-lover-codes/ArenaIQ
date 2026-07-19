import React from 'react';
import { Accessibility } from 'lucide-react';

interface RouteAlertsProps {
  congestionWarning: string | null;
  accessibilityNote: string | null;
}

export default function RouteAlerts({ congestionWarning, accessibilityNote }: RouteAlertsProps) {
  return (
    <>
      {congestionWarning && (
        <div className="border border-red-500/40 bg-red-500/10 p-4 rounded-xl text-red-400 flex items-start gap-3" role="alert">
          <span className="text-xl shrink-0">⚠️</span>
          <div>
            <p className="font-black text-white text-sm">CONGESTION WARNING</p>
            <p className="text-sm mt-0.5">{congestionWarning}</p>
          </div>
        </div>
      )}

      {accessibilityNote && (
        <div className="border border-teal-500/30 bg-teal-500/10 p-4 rounded-xl text-teal-400 flex items-start gap-3">
          <Accessibility className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-white text-sm">Accessibility Info</p>
            <p className="text-sm mt-0.5">{accessibilityNote}</p>
          </div>
        </div>
      )}
    </>
  );
}
