import { useEffect } from 'react'
import { useAuthStore } from './store/useAuthStore.js'
import AuthPage from './pages/AuthPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'

export default function App() {
  const { user, loading, checkAuth } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
        <p className="mt-3 text-xs font-medium text-slate-500">Loading TaskDesk...</p>
      </div>
    )
  }

  return user ? <DashboardPage /> : <AuthPage />
}
