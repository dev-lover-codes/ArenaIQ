import type { Zone, Task } from '@/types'

export const ZONE_STATUS_STYLES: Record<Zone['status'], { 
  text: string; bg: string; border: string; label: string; className: string 
}> = {
  open: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500', label: 'OPEN', className: 'status-open border' },
  crowded: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500', label: 'CROWDED', className: 'status-crowded border' },
  closed: { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500', label: 'CLOSED', className: 'status-closed border' },
}

export const PRIORITY_STYLES: Record<Task['priority'], { 
  text: string; bg: string; border: string; label: string; className: string 
}> = {
  low: { text: 'text-slate-300', bg: 'bg-zinc-800', border: 'border-zinc-700', label: 'LOW', className: 'bg-zinc-800 text-slate-300 border-zinc-700' },
  medium: { text: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/30', label: 'MEDIUM', className: 'bg-blue-500/20 text-blue-400 border border-blue-500/30' },
  high: { text: 'text-white', bg: 'bg-orange-500', border: 'border-orange-400', label: 'HIGH', className: 'bg-orange-500 text-white border border-orange-400' },
  urgent: { text: 'text-white', bg: 'bg-red-500', border: 'border-red-400', label: 'URGENT', className: 'bg-red-500 text-white border border-red-400' },
}

export const TASK_STATUS_STYLES: Record<Task['status'], { 
  className: string; label: string 
}> = {
  completed: { className: 'text-emerald-400 border border-emerald-500/30 bg-emerald-500/10', label: 'COMPLETED' },
  in_progress: { className: 'text-amber-400 border border-amber-500/30 bg-amber-500/10', label: 'IN PROGRESS' },
  pending: { className: 'text-slate-400 border border-zinc-800 bg-zinc-900/60', label: 'PENDING' },
}
