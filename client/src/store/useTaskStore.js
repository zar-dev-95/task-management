import { create } from './zustand.js'
import { api } from '../api/apiClient.js'

export const useTaskStore = create((set, get) => ({
  tasks: [],
  reminders: [],
  loading: false,
  error: null,
  filters: {
    search: '',
    assignedTo: '',
    status: '',
    priority: '',
  },

  setFilter: (key, value) => {
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    }))
  },

  resetFilters: () => {
    set({
      filters: { search: '', assignedTo: '', status: '', priority: '' },
    })
  },

  fetchTasks: async (teamId) => {
    if (!teamId) return
    try {
      set({ loading: true, error: null })
      const { search, assignedTo, status, priority } = get().filters

      const params = new URLSearchParams({ teamId })
      if (search) params.append('search', search)
      if (assignedTo) params.append('assignedTo', assignedTo)
      if (status) params.append('status', status)
      if (priority) params.append('priority', priority)

      const res = await api.get(`/tasks?${params.toString()}`)
      set({ tasks: res.tasks || [], loading: false })
    } catch (err) {
      set({ loading: false, error: err.message })
    }
  },

  fetchReminders: async () => {
    try {
      const res = await api.get('/tasks/reminders/due-soon')
      set({ reminders: res.reminders || [] })
    } catch (err) {
      console.error('Failed to fetch due reminders:', err)
    }
  },

  createTask: async (taskData) => {
    try {
      const res = await api.post('/tasks', taskData)
      set((state) => ({
        tasks: [res.task, ...state.tasks],
      }))
      get().fetchReminders()
      return res.task
    } catch (err) {
      throw err
    }
  },

  updateTask: async (taskId, updates) => {
    try {
      const res = await api.put(`/tasks/${taskId}`, updates)
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === taskId ? res.task : t)),
      }))
      get().fetchReminders()
      return res.task
    } catch (err) {
      throw err
    }
  },

  deleteTask: async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`)
      set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== taskId),
      }))
      get().fetchReminders()
    } catch (err) {
      throw err
    }
  },
}))
