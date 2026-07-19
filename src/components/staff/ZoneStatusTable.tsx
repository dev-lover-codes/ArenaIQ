import React from 'react';
import { LayoutGrid } from 'lucide-react';
import { Zone } from '@/hooks/useStaffTasks';

interface ZoneStatusTableProps {
  zones: Zone[];
  updateZoneStatus: (zoneId: string, status: 'open' | 'crowded' | 'closed') => Promise<void>;
}

export default function ZoneStatusTable({ zones, updateZoneStatus }: ZoneStatusTableProps) {
  return (
    <section aria-label="Zone Status Overview" className="border border-zinc-800 bg-zinc-900/30 p-6 rounded-2xl shadow-xl">
      <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
        <LayoutGrid className="h-5 w-5 text-teal-400" />
        Zone Status Overview
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="text-xs uppercase bg-zinc-950 text-slate-400 border-b border-zinc-800">
            <tr>
              <th scope="col" className="px-6 py-3">Zone Name</th>
              <th scope="col" className="px-6 py-3">Capacity</th>
              <th scope="col" className="px-6 py-3">Occupancy</th>
              <th scope="col" className="px-6 py-3">Operational Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-850">
            {zones.map((zone) => (
              <tr key={zone.id} className="hover:bg-zinc-900/40">
                <td className="px-6 py-4 font-bold text-white">{zone.name}</td>
                <td className="px-6 py-4">{zone.capacity.toLocaleString()}</td>
                <td className="px-6 py-4">
                  <span className={zone.current_occupancy / zone.capacity >= 0.85 ? 'text-red-400 font-semibold' : 'text-slate-300'}>
                    {zone.current_occupancy.toLocaleString()}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <label htmlFor={`zone-status-${zone.id}`} className="sr-only">Change status for {zone.name}</label>
                  <select
                    id={`zone-status-${zone.id}`}
                    value={zone.status}
                    onChange={(e) => updateZoneStatus(zone.id, e.target.value as 'open' | 'crowded' | 'closed')}
                    className="bg-zinc-950 border border-zinc-800 rounded-md py-1 px-2.5 text-xs text-white focus:border-emerald-500 focus:outline-hidden"
                  >
                    <option value="open">Open</option>
                    <option value="crowded">Crowded</option>
                    <option value="closed">Closed</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
