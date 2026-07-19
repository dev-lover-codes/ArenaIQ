"use client"

export const dynamic = 'force-dynamic'

import React from 'react'
import AppShell from '@/components/layout/AppShell'
import {
  ListTodo,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { useStaffTasks } from '@/hooks/useStaffTasks'
import BroadcastForm from '@/components/staff/BroadcastForm'
import LiveAlertsFeed from '@/components/staff/LiveAlertsFeed'
import ZoneStatusTable from '@/components/staff/ZoneStatusTable'
import TaskCard from '@/components/staff/TaskCard'

export default function StaffPage() {
  const {
    zones,
    tasks,
    loading,
    activeAlerts,
    liveAnnouncement,
    updateZoneStatus,
    broadcastAlert
  } = useStaffTasks()

  if (loading) {
    return (
      <AppShell title="Staff Ops">
        <div className="flex min-h-full items-center justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell title="Staff Ops">
      <div className="sr-only" aria-live="assertive" aria-atomic="true">
        {liveAnnouncement}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-20 md:pb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Operations & Volunteer Coordination Panel
          </h1>
          <p className="mt-2 text-slate-400">
            Real-time zone management, volunteer task scheduling, and priority message broadcasting for the matchday crew.
          </p>
        </div>

        <LiveAlertsFeed activeAlerts={activeAlerts} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-8 lg:col-span-1">
            <BroadcastForm zones={zones} broadcastAlert={broadcastAlert} />
          </div>

          <div className="lg:col-span-2 space-y-8">
            <ZoneStatusTable zones={zones} updateZoneStatus={updateZoneStatus} />

            <section aria-label="Volunteer Task Log" className="border border-zinc-800 bg-zinc-900/30 p-6 rounded-2xl shadow-xl">
              <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <ListTodo className="h-5 w-5 text-blue-400" />
                Staff & Volunteer Tasks
              </h2>

              {tasks.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <AlertCircle className="mx-auto h-8 w-8 text-zinc-700 mb-2" />
                  <span>No operational tasks registered.</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <TaskCard key={task.id} task={task} zones={zones} />
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
