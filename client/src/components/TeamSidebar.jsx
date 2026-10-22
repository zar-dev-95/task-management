import { useState } from 'react'
import { Plus, Users, Trash2, UserPlus, Shield, X, LogOut } from './Icons.jsx'
import { useTeamStore } from '../store/useTeamStore.js'
import { useTaskStore } from '../store/useTaskStore.js'
import { useAuthStore } from '../store/useAuthStore.js'

export default function TeamSidebar({ onOpenCreateTeam, onOpenInvite }) {
  const { user } = useAuthStore()
  const { teams, selectedTeam, members, userRole, selectTeam, deleteTeam, removeMember, fetchTeams } = useTeamStore()
  const [deleting, setDeleting] = useState(false)
  const [removingMemberId, setRemovingMemberId] = useState(null)

  const isOwner = Boolean(
    selectedTeam && (
      userRole === 'owner' ||
      userRole === 'admin' ||
      Number(selectedTeam.created_by) === Number(user?.id)
    )
  )

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

  const handleRemoveMember = async (member) => {
    if (!selectedTeam) return
    const isSelf = Number(member.id) === Number(user?.id)
    const promptMsg = isSelf
      ? `Are you sure you want to leave the team "${selectedTeam.name}"?`
      : `Are you sure you want to remove ${member.name || member.email} from "${selectedTeam.name}"?`
    const confirmed = window.confirm(promptMsg)
    if (!confirmed) return

    try {
      setRemovingMemberId(member.id)
      await removeMember(selectedTeam.id, member.id)
      // Sync tasks so any unassigned tasks reflect immediately
      useTaskStore.getState().fetchTasks(selectedTeam.id)
      if (isSelf) {
        await fetchTeams()
      }
    } catch (err) {
      alert(err.message || 'Failed to remove member')
    } finally {
      setRemovingMemberId(null)
    }
  }

  return (
    <aside className="w-72 border-r border-slate-200 bg-white flex flex-col shrink-0 h-[calc(100vh-4.25rem)] select-none">
      {/* ── Section 1: Teams List (Fully Scrollable) ── */}
      <div className="flex flex-col max-h-[46%] border-b border-slate-200 shrink-0 min-h-0">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/60 shrink-0">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Your Teams
            </h2>
          </div>
          <button
            onClick={onOpenCreateTeam}
            title="Create new team"
            className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 px-2 py-1 rounded border border-blue-200 hover:bg-blue-50 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New</span>
          </button>
        </div>

        {/* Teams List (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar min-h-0">
          {teams.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-xs text-slate-400">No teams yet</p>
              <button
                onClick={onOpenCreateTeam}
                className="mt-2 text-xs font-medium text-blue-600 underline hover:text-blue-700 cursor-pointer"
              >
                Create your first team
              </button>
            </div>
          ) : (
            teams.map((team) => {
              const isSelected = selectedTeam?.id === team.id
              const isTeamOwner = Number(team.created_by) === Number(user?.id) || team.role === 'owner'
              return (
                <button
                  key={team.id}
                  onClick={() => selectTeam(team.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50 font-semibold text-blue-900 border border-blue-200 shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <span className="truncate mr-2 font-medium">{team.name}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded tracking-wider ${
                        isTeamOwner
                          ? 'bg-blue-100 text-blue-700 border border-blue-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {isTeamOwner ? 'Owner' : 'Member'}
                    </span>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* ── Section 2: Active Team Members (Generous, prominent space) ── */}
      {selectedTeam && (
        <div className="flex-1 flex flex-col min-h-0 bg-slate-50/30">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-900 truncate max-w-[150px]">
                  {selectedTeam.name}
                </span>
                <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {members.length} {members.length === 1 ? 'member' : 'members'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                <Shield className="w-3 h-3 text-blue-500" />
                <span>Your Role: <strong className="font-semibold text-slate-700 capitalize">{userRole || 'Member'}</strong></span>
              </p>
            </div>

            <button
              onClick={onOpenInvite}
              title="Add member"
              className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md border border-blue-200 transition-colors cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Members List - Now has plenty of comfortable vertical space */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5 custom-scrollbar min-h-0">
            {members.map((member) => {
              const memberInitials = member.name
                ? member.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
                : 'U'
              const isMemberCreator = Number(member.id) === Number(selectedTeam.created_by)
              const isMemberOwner = member.role === 'owner' || isMemberCreator
              const isSelf = Number(member.id) === Number(user?.id)

              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between text-xs py-1.5 px-2 rounded-lg bg-white border border-slate-200/80 hover:border-slate-300 transition-all shadow-2xs group"
                >
                  <div className="flex items-center gap-2 truncate mr-2">
                    <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                      {memberInitials}
                    </div>
                    <div className="truncate">
                      <p className="font-semibold text-slate-800 truncate leading-snug">
                        {member.name} {isSelf && <span className="text-[10px] font-normal text-slate-400">(You)</span>}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded font-medium ${
                        isMemberOwner
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-50 text-slate-500 border border-slate-200'
                      }`}
                    >
                      {isMemberOwner ? 'Owner' : 'Member'}
                    </span>

                    {/* Team Owner / Admin can delete/remove members */}
                    {isOwner && !isMemberCreator && !isSelf && (
                      <button
                        onClick={() => handleRemoveMember(member)}
                        disabled={removingMemberId === member.id}
                        title={`Remove ${member.name} from team`}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer border border-transparent hover:border-rose-200"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Regular member can voluntarily leave the team */}
                    {!isMemberCreator && isSelf && (
                      <button
                        onClick={() => handleRemoveMember(member)}
                        disabled={removingMemberId === member.id}
                        title="Leave this team"
                        className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-rose-600 hover:bg-rose-50 px-1.5 py-0.5 rounded transition-colors cursor-pointer border border-transparent hover:border-rose-200 font-medium"
                      >
                        <LogOut className="w-3 h-3" />
                        <span>Leave</span>
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Delete Team Footer */}
          <div className="p-3 border-t border-slate-200 bg-white shrink-0">
            {isOwner ? (
              <button
                onClick={handleDeleteTeam}
                disabled={deleting}
                className="w-full flex items-center justify-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 py-1.5 rounded-lg border border-rose-200 transition-colors cursor-pointer font-medium"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{deleting ? 'Deleting team...' : 'Delete Team'}</span>
              </button>
            ) : (
              <div
                title="Only the team creator can delete this team"
                className="w-full flex items-center justify-center gap-1.5 text-[11px] text-slate-400 py-1.5 rounded-lg border border-slate-200 bg-slate-50 cursor-not-allowed select-none"
              >
                <Trash2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Delete Team (Creator only)</span>
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  )
}
