import { LogOut, Bell, CheckSquare } from './Icons.jsx'
import { useAuthStore } from '../store/useAuthStore.js'
import { useTaskStore } from '../store/useTaskStore.js'

export default function Navbar() {
  const { user, logout } = useAuthStore()
  const { reminders } = useTaskStore()

  const urgentCount = reminders.length
  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  return (
    <header style={{
      height: '68px',
      borderBottom: '1px solid #e2e8f0',
      background: 'white',
      padding: '0 28px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 30,
      fontFamily: "'Inter', system-ui, sans-serif",
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
    }}>

      {/* ─── Left: Brand Logo & Word ─── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Browser Tab Logo */}
        <img
          src="/favicon.svg"
          alt="TaskDesk Logo"
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            flexShrink: 0,
            boxShadow: '0 3px 12px rgba(37, 99, 235, 0.28)',
            display: 'block',
          }}
        />

        {/* Word: Much Bigger & Vibrant Blue */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            fontWeight: '800',
            color: '#2563eb',
            fontSize: '24px',
            letterSpacing: '-0.035em',
            lineHeight: 1,
          }}>
            TaskDesk
          </span>
          <span style={{
            fontSize: '11px',
            fontWeight: '700',
            color: '#2563eb',
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.25)',
            borderRadius: '6px',
            padding: '3px 8px',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}>
            Workspace
          </span>
        </div>
      </div>

      {/* ─── Right: Actions ─── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>

        {/* Due soon pill */}
        {urgentCount > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '6px 14px', borderRadius: '20px',
            background: '#fffbeb', border: '1px solid #fde68a',
            color: '#92400e', fontSize: '12px', fontWeight: '600',
          }}>
            <Bell className="w-3.5 h-3.5" style={{ color: '#d97706' }} />
            <span>{urgentCount} due soon</span>
          </div>
        )}

        {/* Divider */}
        <div style={{ width: '1px', height: '24px', background: '#e2e8f0' }} />

        {/* User info + avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ textAlign: 'right' }}>
            <p style={{
              fontSize: '13.5px', fontWeight: '700', color: '#1e293b',
              margin: 0, lineHeight: '1.3', letterSpacing: '-0.01em',
            }}>
              {user?.name || 'User'}
            </p>
            <p style={{
              fontSize: '11.5px', color: '#64748b', margin: 0, lineHeight: '1.3',
            }}>
              {user?.email}
            </p>
          </div>

          {/* Avatar circle (Blue instead of black) */}
          <div style={{
            width: '38px', height: '38px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '13px', fontWeight: '700', flexShrink: 0,
            letterSpacing: '0.02em',
            boxShadow: '0 2px 8px rgba(59, 130, 246, 0.28)',
          }}>
            {initials}
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            title="Log out"
            style={{
              width: '34px', height: '34px', borderRadius: '8px',
              border: '1px solid #e2e8f0', background: 'white',
              color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#fef2f2'
              e.currentTarget.style.borderColor = '#fecaca'
              e.currentTarget.style.color = '#dc2626'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'white'
              e.currentTarget.style.borderColor = '#e2e8f0'
              e.currentTarget.style.color = '#64748b'
            }}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  )
}
