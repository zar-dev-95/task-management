import { useState } from 'react'
import { Plus, Users, Trash2, UserPlus, Shield } from './Icons.jsx'
import { useTeamStore } from '../store/useTeamStore.js'
import { useAuthStore } from '../store/useAuthStore.js'

export default function TeamSidebar({ onOpenCreateTeam, onOpenInvite }) {
  const { user } = useAuthStore()
  const { teams, selectedTeam, members, userRole, selectTeam, deleteTeam } = useTeamStore()
  const [deleting, setDeleting] = useState(false)

  const isOwner = selectedTeam && (userRole === 'owner' || selectedTeam.created_by === user?.id)

  const handleDeleteTeam = async () => {
    if (!selectedTeam) return
    const confirmed = window.confirm(`Are you sure you want to delete the team "${selectedTeam.name}"? All associated tasks will be removed.`)
    if (!confirmed) return

    try {
      setDeleting(true)
      await deleteTeam(selectedTeam.id)
    } catch (err) {
      alert(err.message || 'Failed to delete team')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <aside className="w-64 border-r border-slate-200 bg-white flex flex-col shrink-0 h-[calc(100vh-3.5rem)] select-none">
      {/* Teams Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-slate-500" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Teams
          </h2>
        </div>
        <button
          onClick={onOpenCreateTeam}
          title="Create new team"
          className="flex items-center gap-1 text-xs font-medium text-slate-700 hover:text-slate-950 px-2 py-1 rounded border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New</span>
        </button>
      </div>

      {/* Teams List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {teams.length === 0 ? (
          <div className="p-4 text-center">
            <p className="text-xs text-slate-400">No teams yet</p>
            <button
              onClick={onOpenCreateTeam}
              className="mt-2 text-xs font-medium text-slate-900 underline hover:text-slate-700 cursor-pointer"
            >
              Create your first team
            </button>
          </div>
        ) : (
          teams.map((team) => {
            const isSelected = selectedTeam?.id === team.id
            return (
              <button
                key={team.id}
                onClick={() => selectTeam(team.id)}
                className={`w-full text-left px-3 py-2 rounded-md text-xs transition-colors flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-slate-100 font-semibold text-slate-900'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                }`}
              >
                <span className="truncate">{team.name}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                    isSelected
                      ? 'bg-white text-slate-800 border border-slate-200'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {team.member_count || 1}
                </span>
              </button>
            )
          })
        )}
      </div>

      {/* Active Team Info & Members Panel */}
      {selectedTeam && (
        <div className="border-t border-slate-200 p-4 bg-slate-50/50 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-900 truncate">
                {selectedTeam.name}
              </p>
              <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                <Shield className="w-3 h-3 text-slate-400" />
                <span>Role: <strong className="font-medium capitalize text-slate-700">{userRole || 'Member'}</strong></span>
              </p>
            </div>

            <button
              onClick={onOpenInvite}
              title="Add or invite team member"
              className="p-1 text-slate-500 hover:text-slate-900 hover:bg-white rounded border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
            </button>
          </div>

          {/* Members List */}
          <div className="space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Members ({members.length})
            </p>
            <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between text-xs py-1 px-1.5 rounded hover:bg-white/80"
                >
                  <div className="truncate mr-2">
                    <p className="text-slate-800 font-medium truncate">{member.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{member.email}</p>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">
                    {member.role === 'owner' ? 'Owner' : 'Member'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Role-based Delete Team (Only creator can delete) */}
          {isOwner && (
            <div className="pt-2 border-t border-slate-200/80">
              <button
                onClick={handleDeleteTeam}
                disabled={deleting}
                className="w-full flex items-center justify-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50/80 py-1.5 rounded border border-rose-200/60 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{deleting ? 'Deleting team...' : 'Delete Team'}</span>
              </button>
            </div>
          )}
        </div>
      )}
    </aside>
  )
}
