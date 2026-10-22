import { create } from './zustand.js'
import { api } from '../api/apiClient.js'

export const useAuthStore = create((set) => ({
  user: null,
  loading: true,
  error: null,

  checkAuth: async () => {
    try {
      set({ loading: true, error: null })
      const res = await api.get('/auth/me')
      set({ user: res.user, loading: false })
    } catch {
      set({ user: null, loading: false })
    }
  },

  login: async (email, password) => {
    try {
      set({ loading: true, error: null })
      const res = await api.post('/auth/login', { email, password })
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
      set({ user: null, error: null })
    }
  },

  clearError: () => set({ error: null }),
}))
