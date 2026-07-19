import React from 'react';
import { Task, Zone } from '@/hooks/useStaffTasks';

interface TaskCardProps {
  task: Task;
  zones: Zone[];
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'urgent': return 'bg-red-500 text-white border-red-400';
    case 'high': return 'bg-orange-500 text-white border-orange-400';
    case 'medium': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    default: return 'bg-zinc-800 text-slate-300 border-zinc-700';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'text-emerald-400 border border-emerald-500/30 bg-emerald-500/10';
    case 'in_progress': return 'text-amber-400 border border-amber-500/30 bg-amber-500/10';
    default: return 'text-slate-400 border border-zinc-800 bg-zinc-900/60';
  }
};

export default function TaskCard({ task, zones }: TaskCardProps) {
  return (
    <article className="border border-zinc-850 bg-zinc-950/60 p-4 rounded-xl flex items-start justify-between gap-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider ${getStatusColor(task.status)}`}>
            {task.status.replace('_', ' ')}
          </span>
        </div>
        <h3 className="font-bold text-white text-md mt-1.5">{task.title}</h3>
        {task.description && (
          <p className="text-xs text-slate-400 leading-relaxed">{task.description}</p>
        )}
        <span className="text-[10px] text-slate-500 block">
          Location Ref: {zones.find((z) => z.id === task.zone_id)?.name || 'Unknown Zone'}
        </span>
      </div>
    </article>
  );
}
