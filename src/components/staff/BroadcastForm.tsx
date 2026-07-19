import React, { useState } from 'react';
import { Megaphone, Loader2, Check } from 'lucide-react';
import { Zone } from '@/types';
import { PRIORITY_STYLES } from '@/lib/constants';

interface BroadcastFormProps {
  zones: Zone[];
  broadcastAlert: (alertMsg: string, alertSeverity: string, alertZone: string) => Promise<void>;
}

// eslint-disable-next-line max-lines-per-function -- Form handling logic for creating and broadcasting incident reports with priority levels.
export default function BroadcastForm({ zones, broadcastAlert }: BroadcastFormProps) {
  const [alertMsg, setAlertMsg] = useState('');
  const [alertSeverity, setAlertSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [alertZone, setAlertZone] = useState('');
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertMsg.trim() || broadcasting) return;

    setBroadcasting(true);
    setBroadcastSuccess(false);

    try {
      await broadcastAlert(alertMsg, alertSeverity, alertZone);
      setAlertMsg('');
      setBroadcastSuccess(true);
      setTimeout(() => setBroadcastSuccess(false), 3000);
    } catch (err) {
      alert(`Error broadcasting alert: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setBroadcasting(false);
    }
  };

  return (
    <section aria-label="Alert Broadcast Form" className="border border-zinc-800 bg-zinc-900/30 p-6 rounded-2xl shadow-xl">
      <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
        <Megaphone className="h-5 w-5 text-emerald-400" />
        Broadcast Staff Alert
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4" aria-label="Broadcast alert form">
        <div>
          <label htmlFor="alert-text" className="block text-sm font-semibold text-slate-300">
            Message Description
          </label>
          <textarea
            id="alert-text"
            value={alertMsg}
            onChange={(e) => setAlertMsg(e.target.value)}
            required
            placeholder="Enter details of incident or instruction..."
            rows={3}
            className="mt-1 block w-full rounded-lg border border-zinc-800 bg-zinc-950 py-2 px-3 text-white focus:border-emerald-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="alert-severity" className="block text-sm font-semibold text-slate-300">
            Severity Level
          </label>
          <select
            id="alert-severity"
            value={alertSeverity}
            onChange={(e) => setAlertSeverity(e.target.value as 'low' | 'medium' | 'high' | 'critical')}
            className={`mt-1 block w-full rounded-lg border py-2 px-3 focus:outline-hidden transition-colors duration-150 sm:text-sm ${
              PRIORITY_STYLES[alertSeverity === 'critical' ? 'urgent' : alertSeverity].bg
            } ${
              PRIORITY_STYLES[alertSeverity === 'critical' ? 'urgent' : alertSeverity].text
            } ${
              PRIORITY_STYLES[alertSeverity === 'critical' ? 'urgent' : alertSeverity].border
            }`}
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
            <option value="critical">Critical (Urgent)</option>
          </select>
        </div>

        <div>
          <label htmlFor="alert-zone" className="block text-sm font-semibold text-slate-300">
            Target Zone (Optional)
          </label>
          <select
            id="alert-zone"
            value={alertZone}
            onChange={(e) => setAlertZone(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-zinc-800 bg-zinc-950 py-2 px-3 text-white focus:border-emerald-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 sm:text-sm"
          >
            <option value="">All Zones</option>
            {zones.map((z) => (
              <option key={z.id} value={z.id}>{z.name}</option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={broadcasting || !alertMsg.trim()}
          className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition focus:outline-hidden focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
          aria-label="Broadcast alert message to all staff"
        >
          {broadcasting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Broadcasting...
            </>
          ) : (
            'Send Real-time Broadcast'
          )}
        </button>

        {broadcastSuccess && (
          <div className="flex items-center text-xs text-emerald-400 bg-emerald-950/20 border border-emerald-900/30 px-3 py-2 rounded-lg" role="alert">
            <Check className="h-4 w-4 mr-2" />
            <span>Broadcast alert sent successfully.</span>
          </div>
        )}
      </form>
    </section>
  );
}
