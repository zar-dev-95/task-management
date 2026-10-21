import { create } from './zustand.js'
import { api } from '../api/apiClient.js'

export const useTeamStore = create((set, get) => ({
  teams: [],
  selectedTeam: null,
  members: [],
  userRole: null,
  loading: false,
  error: null,

  fetchTeams: async () => {
    try {
      set({ loading: true, error: null })
      const res = await api.get('/teams')
      const teams = res.teams || []
      set({ teams, loading: false })

      if (teams.length > 0 && !get().selectedTeam) {
        get().selectTeam(teams[0].id)
      }
    } catch (err) {
      set({ loading: false, error: err.message })
    }
  },

  selectTeam: async (teamId) => {
    try {
      set({ loading: true, error: null })
      const res = await api.get(`/teams/${teamId}`)
      set({
        selectedTeam: res.team,
        userRole: res.role,
        members: res.members || [],
        loading: false,
      })
    } catch (err) {
      set({ loading: false, error: err.message })
    }
  },

  createTeam: async (name, description) => {
    try {
      set({ loading: true, error: null })
      const res = await api.post('/teams', { name, description })
      const newTeam = res.team
      set((state) => ({
        teams: [newTeam, ...state.teams],
        loading: false,
      }))
      await get().selectTeam(newTeam.id)
      return newTeam
    } catch (err) {
      set({ loading: false, error: err.message })
      throw err
    }
  },

  addMember: async (teamId, email, role = 'member') => {
    try {
      const res = await api.post(`/teams/${teamId}/members`, { email, role })
      set((state) => ({
        members: [...state.members, res.member],
      }))
      return res.member
    } catch (err) {
      throw err
    }
  },

  inviteMember: async (teamId, email) => {
    try {
      const res = await api.post(`/teams/${teamId}/invite`, { email })
      return res
    } catch (err) {
      throw err
    }
  },

  deleteTeam: async (teamId) => {
    try {
      await api.delete(`/teams/${teamId}`)
      set((state) => {
        const remaining = state.teams.filter((t) => t.id !== teamId)
        return {
          teams: remaining,
          selectedTeam: remaining.length > 0 ? remaining[0] : null,
        }
      })
      if (get().selectedTeam) {
        get().selectTeam(get().selectedTeam.id)
      }
    } catch (err) {
      throw err
    }
  },

  clearError: () => set({ error: null }),
}))
