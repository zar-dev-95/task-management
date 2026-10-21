import { LogOut, Bell, CheckSquare } from './Icons.jsx'
import { useAuthStore } from '../store/useAuthStore.js'
import { useTaskStore } from '../store/useTaskStore.js'

export default function Navbar() {
  const { user, logout } = useAuthStore()
  const { reminders } = useTaskStore()

  const urgentCount = reminders.length

  return (
    <header className="h-14 border-b border-slate-200 bg-white px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-sm">
          <CheckSquare className="w-4 h-4" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="font-semibold text-slate-900 tracking-tight text-base">
            TaskDesk
          </span>
          <span className="text-xs text-slate-400 font-medium hidden sm:inline">
            Workspace
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {urgentCount > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200/80 text-amber-800 text-xs font-medium">
            <Bell className="w-3.5 h-3.5 text-amber-600" />
            <span>{urgentCount} {urgentCount === 1 ? 'task' : 'tasks'} due soon</span>
          </div>
        )}

        <div className="h-4 w-px bg-slate-200 hidden sm:block" />

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-slate-900 leading-tight">
              {user?.name || 'User'}
            </p>
            <p className="text-xs text-slate-400 leading-tight">
              {user?.email}
            </p>
          </div>

          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center text-xs font-semibold">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>

          <button
            onClick={logout}
            title="Log out"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  )
}
