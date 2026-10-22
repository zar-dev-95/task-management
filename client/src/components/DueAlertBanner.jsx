import { useState } from 'react'
import { AlertCircle, ChevronDown, ChevronUp, X } from './Icons.jsx'
import { useTaskStore } from '../store/useTaskStore.js'

export default function DueAlertBanner() {
  const { reminders } = useTaskStore()
  const [dismissed, setDismissed] = useState(false)
  const [expanded, setExpanded] = useState(false)

  if (dismissed || !reminders || reminders.length === 0) {
    return null
  }

  return (
    <div className="bg-amber-50/70 border-b border-amber-200/80 px-3.5 sm:px-6 py-2 sm:py-2.5 text-xs text-amber-900 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2.5 sm:gap-4">
        <div className="flex items-center gap-2 font-medium">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="leading-snug">
            You have <strong className="font-semibold text-amber-950">{reminders.length}</strong> {reminders.length === 1 ? 'task' : 'tasks'} due within 48h.
          </span>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-amber-700 underline hover:text-amber-950 ml-1 inline-flex items-center gap-0.5 cursor-pointer font-normal shrink-0"
          >
            {expanded ? 'Hide' : 'View'}
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        <button
          onClick={() => setDismissed(true)}
          className="text-amber-600 hover:text-amber-900 p-1 rounded hover:bg-amber-100/50 cursor-pointer shrink-0"
          title="Dismiss banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {expanded && (
        <div className="max-w-7xl mx-auto mt-2 pt-2 border-t border-amber-200/60 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {reminders.map((task) => (
            <div
              key={task.id}
              className="bg-white/80 border border-amber-200/60 rounded px-2.5 py-1.5 flex items-center justify-between text-xs"
            >
              <div className="truncate mr-2">
                <p className="font-medium text-slate-800 truncate">{task.title}</p>
                <p className="text-[11px] text-slate-400">{task.team_name || 'Team'}</p>
              </div>
              <span className="shrink-0 text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                {task.due_date ? new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Soon'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
