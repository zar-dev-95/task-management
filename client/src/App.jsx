import { useEffect, lazy, Suspense } from 'react'
import { useAuthStore } from './store/useAuthStore.js'

const AuthPage = lazy(() => import('./pages/AuthPage.jsx'))
const DashboardPage = lazy(() => import('./pages/DashboardPage.jsx'))

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
      <div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      <p className="mt-3 text-xs font-semibold text-slate-500">Loading TaskDesk...</p>
    </div>
  )
}

export default function App() {
  const { user, loading, checkAuth } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [])

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <Suspense fallback={<LoadingScreen />}>
      {user ? <DashboardPage /> : <AuthPage />}
    </Suspense>
  )
}

