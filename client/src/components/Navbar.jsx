import { LogOut, Bell, CheckSquare, Menu } from './Icons.jsx'
import { useAuthStore } from '../store/useAuthStore.js'
import { useTaskStore } from '../store/useTaskStore.js'

export default function Navbar({ onToggleMobileSidebar, onToggleDueAlert, isDueAlertOpen }) {
  const { user, logout } = useAuthStore()
  const { reminders } = useTaskStore()

  const urgentCount = reminders.length
  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  return (
    <header className="h-16 md:h-[68px] border-b border-slate-200 bg-white px-3.5 sm:px-6 md:px-7 flex items-center justify-between sticky top-0 z-30 shadow-xs select-none">

      {/* ─── Left: Mobile Menu Toggle + Brand Logo & Word ─── */}
      <div className="flex items-center gap-2 sm:gap-3">
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden p-1.5 -ml-1 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
            title="Open teams & members"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Browser Tab Logo */}
        <img
          src="/favicon.svg"
          alt="TaskDesk Logo"
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg shrink-0 shadow-sm shadow-blue-500/25 block"
        />

        {/* Word: Bigger & Vibrant Blue */}
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-blue-600 text-xl sm:text-2xl tracking-tight leading-none">
            TaskDesk
          </span>
          <span className="hidden sm:inline-flex text-[11px] font-bold text-blue-600 bg-blue-500/10 border border-blue-500/25 rounded-md px-2 py-0.5 tracking-wider uppercase">
            Workspace
          </span>
        </div>
      </div>

      {/* ─── Right: Actions ─── */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">

        {/* Due soon / Notification button (Clickable to reopen or view tasks near deadline) */}
        <button
          type="button"
          onClick={onToggleDueAlert}
          title={
            urgentCount > 0
              ? `${urgentCount} task${urgentCount > 1 ? 's' : ''} due within 48 hours. Click to ${isDueAlertOpen ? 'hide/view' : 'reopen'} list.`
              : 'Notifications: All caught up, no tasks due soon.'
          }
          className={`flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full border text-xs font-semibold cursor-pointer transition-all ${
            urgentCount > 0
              ? isDueAlertOpen
                ? 'bg-amber-100 border-amber-300 text-amber-950 shadow-2xs'
                : 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-800'
              : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
          }`}
        >
          {urgentCount > 0 && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
          )}
          <Bell className={`w-3.5 h-3.5 ${urgentCount > 0 ? 'text-amber-600' : 'text-slate-500'} shrink-0`} />
          {urgentCount > 0 ? (
            <>
              <span className="hidden xs:inline sm:inline">
                {urgentCount} due soon
              </span>
              <span className="inline xs:hidden sm:hidden font-bold">
                {urgentCount}
              </span>
            </>
          ) : (
            <span className="hidden sm:inline text-slate-500 font-normal">
              0 due
            </span>
          )}
        </button>

        {/* Divider */}
        <div className="w-[1px] h-6 bg-slate-200 hidden xs:block" />

        {/* User info + avatar */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="text-right hidden md:block">
            <p className="text-[13px] font-bold text-slate-800 m-0 leading-tight tracking-tight">
              {user?.name || 'User'}
            </p>
            <p className="text-[11px] text-slate-500 m-0 leading-tight truncate max-w-[150px]">
              {user?.email}
            </p>
          </div>

          {/* Avatar circle (Blue gradient) */}
          <div
            title={`${user?.name || 'User'} (${user?.email || ''})`}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center text-xs sm:text-[13px] font-bold shrink-0 tracking-wide shadow-sm shadow-blue-500/30"
          >
            {initials}
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            title="Log out"
            className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 flex items-center justify-center cursor-pointer transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  )
}
