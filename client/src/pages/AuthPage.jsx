import { useState } from 'react'
import { CheckSquare, ArrowRight, ShieldCheck, Users, Clock } from '../components/Icons.jsx'
import { useAuthStore } from '../store/useAuthStore.js'

const BEIGE = '#f5f0e8'
const BEIGE_DARK = '#ede6d8'
const BEIGE_BORDER = '#ddd5c4'
const BLUE = '#3b82f6'
const BLUE_DARK = '#2563eb'
const BLUE_BG = 'rgba(59,130,246,0.12)'
const BLUE_BORDER = 'rgba(59,130,246,0.25)'
const DARK = '#0f172a'

export default function AuthPage() {
  const [isRegister, setIsRegister] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [localError, setLocalError] = useState(null)

  const { login, register, loading, error, clearError } = useAuthStore()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalError(null)
    if (isRegister && !name.trim()) {
      setLocalError('Please enter your full name')
      return
    }
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters')
      return
    }
    try {
      if (isRegister) {
        await register(name.trim(), email.trim(), password)
      } else {
        await login(email.trim(), password)
      }
    } catch {
      // Error handled by store
    }
  }

  const toggleMode = () => {
    setIsRegister(!isRegister)
    setLocalError(null)
    clearError()
  }

  const displayError = localError || error

  return (
    <div
      className="flex flex-col md:flex-row min-h-screen w-full"
      style={{ fontFamily: "'Inter', system-ui, sans-serif", background: BEIGE }}
    >

      {/* ─── LEFT PANEL (Hidden on mobile, 50% on desktop) ─── */}
      <div
        className="hidden md:flex md:w-1/2 flex-col justify-center relative overflow-hidden"
        style={{
          background: DARK,
          padding: '64px 72px',
        }}
      >

        {/* Background glow circles */}
        <div style={{
          position: 'absolute', top: '-100px', left: '-100px',
          width: '450px', height: '450px', borderRadius: '50%',
          background: `radial-gradient(circle, ${BLUE_BG} 0%, transparent 70%)`,
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-140px', right: '-80px',
          width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '72px', position: 'relative' }}>
          <img
            src="/favicon.svg"
            alt="TaskDesk Logo"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.35)',
              display: 'block',
            }}
          />
          <span style={{ color: 'white', fontWeight: '800', fontSize: '20px', letterSpacing: '-0.02em' }}>
            TaskDesk
          </span>
        </div>

        {/* Hero Text */}
        <div style={{ position: 'relative' }}>
          <p style={{
            fontSize: '12px', fontWeight: '700', letterSpacing: '0.12em',
            color: BLUE, textTransform: 'uppercase', marginBottom: '20px',
          }}>
            Team Collaboration Platform
          </p>
          <h1 style={{
            fontSize: '52px', fontWeight: '800', lineHeight: '1.1',
            letterSpacing: '-0.04em', color: 'white', margin: '0 0 28px 0',
          }}>
            Ship faster<br />
            <span style={{ color: BLUE }}>Together</span>
          </h1>
          <p style={{
            fontSize: '16px', lineHeight: '1.75', color: '#94a3b8',
            maxWidth: '360px', margin: '0 0 52px 0',
          }}>
            Assign tasks, track deadlines, and collaborate with your team in one clean workspace built for speed.
          </p>

          {/* Feature list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {[
              { icon: <Users className="w-4 h-4" />, label: 'Role-based team access', sub: 'Owner and member permissions' },
              { icon: <Clock className="w-4 h-4" />, label: 'Smart due date alerts', sub: 'Never miss a deadline again' },
              { icon: <ShieldCheck className="w-4 h-4" />, label: 'Secure by default', sub: 'HTTP-only session cookies' },
            ].map(({ icon, label, sub }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '38px', height: '38px', borderRadius: '9px',
                  background: BLUE_BG, border: `1px solid ${BLUE_BORDER}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: BLUE, flexShrink: 0,
                }}>
                  {icon}
                </div>
                <div>
                  <p style={{ color: '#e2e8f0', fontWeight: '600', fontSize: '14px', margin: 0 }}>{label}</p>
                  <p style={{ color: '#64748b', fontSize: '12px', margin: 0 }}>{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <div style={{
          marginTop: '72px', paddingTop: '32px',
          borderTop: '1px solid rgba(255,255,255,0.07)', position: 'relative',
        }}>
          <p style={{ color: '#475569', fontSize: '13px', fontStyle: 'italic', margin: 0 }}>
            "The best teams don't work harder — they work clearer."
          </p>
        </div>
      </div>

      {/* ─── RIGHT PANEL (100% on mobile, 50% on desktop) ─── */}
      <div
        className="flex-1 flex flex-col justify-center items-center w-full px-4 py-8 sm:px-8 md:border-l md:border-[#ddd5c4]"
        style={{
          background: BEIGE,
        }}
      >

        {/* Mobile-only TaskDesk Branding */}
        <div className="flex md:hidden items-center gap-2.5 mb-6">
          <img
            src="/favicon.svg"
            alt="TaskDesk Logo"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '9px',
              boxShadow: '0 3px 12px rgba(37, 99, 235, 0.28)',
              display: 'block',
            }}
          />
          <div className="flex items-center gap-2">
            <span style={{ color: '#2563eb', fontWeight: '800', fontSize: '22px', letterSpacing: '-0.03em' }}>
              TaskDesk
            </span>
            <span style={{
              fontSize: '10px',
              fontWeight: '700',
              color: '#2563eb',
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.25)',
              borderRadius: '5px',
              padding: '2px 6px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}>
              Workspace
            </span>
          </div>
        </div>

        {/* ── Elevated Auth Card Box ── */}
        <div
          className="w-full max-w-[430px] rounded-2xl relative"
          style={{
            background: '#ffffff',
            padding: 'clamp(24px, 5vw, 38px) clamp(20px, 5vw, 36px)',
            border: '1.5px solid #ded5c4',
            boxShadow: '0 24px 50px -12px rgba(28, 25, 23, 0.12), 0 8px 24px -4px rgba(59, 130, 246, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.8) inset',
          }}
        >

          {/* Top highlight glow line */}
          <div style={{
            position: 'absolute',
            top: '-1px',
            left: '12%',
            right: '12%',
            height: '2px',
            background: 'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.7), transparent)',
            borderRadius: '2px',
          }} />

          {/* Heading */}
          <div style={{ marginBottom: '28px' }}>
            <h2 style={{
              fontSize: 'clamp(21px, 4vw, 25px)', fontWeight: '800', color: DARK,
              letterSpacing: '-0.03em', margin: '0 0 8px 0',
            }}>
              {isRegister ? 'Create your account' : 'Welcome back'}
            </h2>
            <p style={{ fontSize: '13.5px', color: '#78716c', margin: 0, lineHeight: '1.5' }}>
              {isRegister
                ? 'Join your team and start collaborating today.'
                : 'Sign in to your workspace and pick up where you left off.'}
            </p>
          </div>


          {/* Mode Switcher */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            gap: '4px', padding: '4px',
            background: BEIGE_DARK, borderRadius: '10px',
            marginBottom: '24px',
          }}>
            {['Sign In', 'Register'].map((label, i) => {
              const active = i === 0 ? !isRegister : isRegister
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => { if (i === 0 ? isRegister : !isRegister) toggleMode() }}
                  style={{
                    padding: '8px 0', borderRadius: '7px', border: 'none',
                    fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                    transition: 'all 0.15s',
                    background: active ? BLUE : 'transparent',
                    color: active ? 'white' : '#78716c',
                    boxShadow: active ? '0 1px 4px rgba(59,130,246,0.3)' : 'none',
                  }}
                >
                  {label}
                </button>
              )
            })}
          </div>

          {displayError && (
            <div style={{
              marginBottom: '20px', padding: '12px 14px',
              borderRadius: '8px', background: '#fef2f2',
              border: '1px solid #fecaca', color: '#dc2626',
              fontSize: '13px', fontWeight: '500',
            }}>
              {displayError}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Full Name animated field wrapper */}
            <div style={{
              display: 'grid',
              gridTemplateRows: isRegister ? '1fr' : '0fr',
              opacity: isRegister ? 1 : 0,
              transform: isRegister ? 'translateY(0)' : 'translateY(-8px)',
              transition: 'grid-template-rows 0.32s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.22s ease, transform 0.32s cubic-bezier(0.16, 1, 0.3, 1), margin-bottom 0.32s cubic-bezier(0.16, 1, 0.3, 1)',
              marginBottom: isRegister ? '16px' : '0px',
              pointerEvents: isRegister ? 'auto' : 'none',
            }}>
              <div style={{ overflow: 'hidden' }}>
                <label style={{
                  display: 'block', fontSize: '11px', fontWeight: '700',
                  textTransform: 'uppercase', letterSpacing: '0.08em',
                  color: '#57534e', marginBottom: '6px',
                  transition: 'color 0.2s ease',
                }}>
                  Full Name
                </label>
                <input
                  type="text"
                  required={isRegister}
                  tabIndex={isRegister ? 0 : -1}
                  placeholder="e.g. Alex Morgan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: '100%', height: '44px', padding: '0 14px',
                    background: '#faf7f2', border: `1.5px solid ${BEIGE_BORDER}`,
                    borderRadius: '8px', fontSize: '14px', color: DARK,
                    outline: 'none', boxSizing: 'border-box',
                    transition: 'border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease',
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = BLUE
                    e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)'
                    e.target.style.background = '#ffffff'
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = BEIGE_BORDER
                    e.target.style.boxShadow = 'none'
                    e.target.style.background = '#faf7f2'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block', fontSize: '11px', fontWeight: '700',
                textTransform: 'uppercase', letterSpacing: '0.08em',
                color: '#57534e', marginBottom: '6px',
                transition: 'color 0.2s ease',
              }}>
                Work Email
              </label>
              <input
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%', height: '44px', padding: '0 14px',
                  background: '#faf7f2', border: `1.5px solid ${BEIGE_BORDER}`,
                  borderRadius: '8px', fontSize: '14px', color: DARK,
                  outline: 'none', boxSizing: 'border-box',
                  transition: 'border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease',
                }}
                onFocus={e => {
                  e.target.style.borderColor = BLUE
                  e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)'
                  e.target.style.background = '#ffffff'
                }}
                onBlur={e => {
                  e.target.style.borderColor = BEIGE_BORDER
                  e.target.style.boxShadow = 'none'
                  e.target.style.background = '#faf7f2'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block', fontSize: '11px', fontWeight: '700',
                textTransform: 'uppercase', letterSpacing: '0.08em',
                color: '#57534e', marginBottom: '6px',
                transition: 'color 0.2s ease',
              }}>
                Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%', height: '44px', padding: '0 14px',
                  background: '#faf7f2', border: `1.5px solid ${BEIGE_BORDER}`,
                  borderRadius: '8px', fontSize: '14px', color: DARK,
                  outline: 'none', boxSizing: 'border-box',
                  transition: 'border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease',
                }}
                onFocus={e => {
                  e.target.style.borderColor = BLUE
                  e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)'
                  e.target.style.background = '#ffffff'
                }}
                onBlur={e => {
                  e.target.style.borderColor = BEIGE_BORDER
                  e.target.style.boxShadow = 'none'
                  e.target.style.background = '#faf7f2'
                }}
              />
              <p style={{ fontSize: '11px', color: '#a8a29e', marginTop: '5px' }}>
                Must be at least 6 characters.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '4px', height: '46px', borderRadius: '8px',
                background: loading ? '#93c5fd' : BLUE,
                border: 'none', color: 'white', fontSize: '14px',
                fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                letterSpacing: '-0.01em',
                boxShadow: loading ? 'none' : '0 4px 14px rgba(59,130,246,0.38)',
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = BLUE_DARK }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = BLUE }}
            >
              <span style={{ transition: 'all 0.2s ease' }}>{loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}</span>
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

        </div>
      </div>
    </div>
  )
}
