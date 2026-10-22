import { useState } from 'react'
import { AlertCircle, ChevronDown, ChevronUp, X } from './Icons.jsx'
import { useTaskStore } from '../store/useTaskStore.js'

export default function DueAlertBanner({
  isOpen: controlledIsOpen,
  onClose,
  isExpanded: controlledIsExpanded,
  onToggleExpand,
}) {
  const { reminders } = useTaskStore()
  const [internalDismissed, setInternalDismissed] = useState(false)
  const [internalExpanded, setInternalExpanded] = useState(false)

  const isControlled = controlledIsOpen !== undefined
  const isOpen = isControlled ? controlledIsOpen : !internalDismissed
  const isExpanded = controlledIsExpanded !== undefined ? controlledIsExpanded : internalExpanded

  const handleClose = () => {
    if (onClose) {
      onClose()
    } else {
      setInternalDismissed(true)
    }
  }

  const handleToggle = () => {
    if (onToggleExpand) {
      onToggleExpand()
    } else {
      setInternalExpanded((prev) => !prev)
    }
  }

  if (!isOpen || !reminders || reminders.length === 0) {
    return null
  }

  return (
    <div className="bg-amber-50/80 border-b border-amber-200/90 px-3.5 sm:px-6 py-2.5 text-xs text-amber-900 transition-all animate-in fade-in duration-150">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2.5 sm:gap-4">
        <div className="flex items-center gap-2 font-medium">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="leading-snug">
            You have <strong className="font-semibold text-amber-950">{reminders.length}</strong> {reminders.length === 1 ? 'task' : 'tasks'} due within 48h.
          </span>
          <button
            type="button"
            onClick={handleToggle}
            className="text-amber-800 underline hover:text-amber-950 font-medium ml-1 inline-flex items-center gap-0.5 cursor-pointer shrink-0"
          >
            {isExpanded ? 'Hide tasks' : 'View tasks'}
            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        <button
          type="button"
          onClick={handleClose}
          className="text-amber-600 hover:text-amber-900 p-1 rounded hover:bg-amber-100/60 transition-colors cursor-pointer shrink-0"
          title="Dismiss banner (click bell icon in navbar to reopen)"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {isExpanded && (
        <div className="max-w-7xl mx-auto mt-2.5 pt-2 border-t border-amber-200/70 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {reminders.map((task) => (
            <div
              key={task.id}
              className="bg-white border border-amber-200/80 rounded-lg px-3 py-2 flex items-center justify-between text-xs shadow-2xs hover:border-amber-300 transition-colors"
            >
              <div className="truncate mr-2">
                <p className="font-semibold text-slate-800 truncate leading-snug">{task.title}</p>
                <p className="text-[11px] text-slate-400 truncate">{task.team_name || 'Team'}</p>
              </div>
              <span className="shrink-0 text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-1">
                <span>
                  {task.due_date ? new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Soon'}
                </span>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
