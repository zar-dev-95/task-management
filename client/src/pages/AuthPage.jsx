import { useState } from 'react'
import { CheckSquare, ArrowRight, ShieldCheck, Users, Clock } from '../components/Icons.jsx'
import { useAuthStore } from '../store/useAuthStore.js'

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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-6 sm:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Icon */}
        <div className="flex justify-center">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-sm">
            <CheckSquare className="w-5 h-5" />
          </div>
        </div>

        {/* Editorial Heading */}
        <h1 className="mt-4 text-center text-2xl font-bold tracking-tight text-slate-900">
          TaskDesk
        </h1>
        <p className="mt-1 text-center text-xs text-slate-500">
          {isRegister
            ? 'Create an account to start managing team projects.'
            : 'Sign in to access your team tasks and workspace.'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-xl sm:px-10">
          {/* Mode Switcher */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-lg mb-6 text-xs font-semibold">
            <button
              type="button"
              onClick={() => { if (isRegister) toggleMode(); }}
              className={`py-1.5 rounded-md transition-all cursor-pointer ${
                !isRegister
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { if (!isRegister) toggleMode(); }}
              className={`py-1.5 rounded-md transition-all cursor-pointer ${
                isRegister
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Register
            </button>
          </div>

          {displayError && (
            <div className="mb-5 p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {displayError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Morgan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 transition-colors"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Work Email
              </label>
              <input
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 transition-colors"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Must be at least 6 characters.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 h-10 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              <span>{loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Feature Highlights */}
          <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-3 gap-2 text-center">
            <div className="space-y-1">
              <Users className="w-4 h-4 text-slate-400 mx-auto" />
              <p className="text-[11px] font-medium text-slate-600">Team Scoped</p>
            </div>
            <div className="space-y-1">
              <Clock className="w-4 h-4 text-slate-400 mx-auto" />
              <p className="text-[11px] font-medium text-slate-600">Due Reminders</p>
            </div>
            <div className="space-y-1">
              <ShieldCheck className="w-4 h-4 text-slate-400 mx-auto" />
              <p className="text-[11px] font-medium text-slate-600">Role Secure</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
