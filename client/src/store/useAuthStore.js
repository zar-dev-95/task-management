import { create } from './zustand.js'
import { api } from '../api/apiClient.js'

const hasSavedSession = typeof window !== 'undefined' && Boolean(localStorage.getItem('taskdesk_has_session'))

export const useAuthStore = create((set) => ({
  user: null,
  loading: hasSavedSession,
  error: null,

  checkAuth: async () => {
    try {
      const res = await api.get('/auth/me')
      localStorage.setItem('taskdesk_has_session', 'true')
      set({ user: res.user, loading: false })
    } catch {
      localStorage.removeItem('taskdesk_has_session')
      set({ user: null, loading: false })
    }
  },

  login: async (email, password) => {
    try {
      set({ loading: true, error: null })
      const res = await api.post('/auth/login', { email, password })
      localStorage.setItem('taskdesk_has_session', 'true')
      set({ user: res.user, loading: false, error: null })
      return res.user
    } catch (err) {
      set({ loading: false, error: err.message })
      throw err
    }
  },

  register: async (name, email, password) => {
    try {
      set({ loading: true, error: null })
      const res = await api.post('/auth/register', { name, email, password })
      localStorage.setItem('taskdesk_has_session', 'true')
      set({ user: res.user, loading: false, error: null })
      return res.user
    } catch (err) {
      set({ loading: false, error: err.message })
      throw err
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout')
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      localStorage.removeItem('taskdesk_has_session')
      set({ user: null, error: null })
    }
  },

  clearError: () => set({ error: null }),
}))
