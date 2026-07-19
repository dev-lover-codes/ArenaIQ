import React from 'react';
import { Task, Zone } from '@/types';
import { PRIORITY_STYLES, TASK_STATUS_STYLES } from '@/lib/constants';

interface TaskCardProps {
  task: Task;
  zones: Zone[];
}

export default function TaskCard({ task, zones }: TaskCardProps) {
  const priorityInfo = PRIORITY_STYLES[task.priority];
  const statusInfo = TASK_STATUS_STYLES[task.status];

  return (
    <article className="border border-zinc-850 bg-zinc-950/60 p-4 rounded-xl flex items-start justify-between gap-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider border ${priorityInfo.bg} ${priorityInfo.text} ${priorityInfo.border}`}>
            {task.priority}
          </span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider ${statusInfo.className}`}>
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
