import React from 'react';
import { Bell, ShieldAlert } from 'lucide-react';
import { AlertBroadcast } from '@/hooks/useStaffTasks';

interface LiveAlertsFeedProps {
  activeAlerts: AlertBroadcast[];
}

export default function LiveAlertsFeed({ activeAlerts }: LiveAlertsFeedProps) {
  if (activeAlerts.length === 0) return null;

  return (
    <section aria-label="Incoming Staff Alerts" className="space-y-3">
      <h2 className="text-md font-bold text-red-400 flex items-center gap-2">
        <Bell className="h-5 w-5 animate-bounce" />
        Incoming Live Operational Broadcasts
      </h2>
      <div className="grid grid-cols-1 gap-2">
        {activeAlerts.slice(0, 3).map((alert) => (
          <div
            key={alert.id}
            className={`flex items-center justify-between p-4 border rounded-xl shadow-md ${
              alert.severity === 'critical'
                ? 'bg-red-950/40 border-red-500/50 text-red-200'
                : alert.severity === 'high'
                  ? 'bg-orange-950/20 border-orange-500/40 text-orange-200'
                  : 'bg-zinc-900 border-zinc-800 text-slate-200'
            }`}
            role="alert"
          >
            <div className="flex items-center space-x-3">
              <ShieldAlert className="h-5 w-5 shrink-0" />
              <span className="text-sm font-medium">{alert.description}</span>
            </div>
            <span className="text-xs text-slate-500">
              {new Date(alert.created_at).toLocaleTimeString()}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
