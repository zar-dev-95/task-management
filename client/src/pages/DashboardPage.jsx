import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar.jsx'
import DueAlertBanner from '../components/DueAlertBanner.jsx'
import InvitationBanner from '../components/InvitationBanner.jsx'
import TeamSidebar from '../components/TeamSidebar.jsx'
import TaskBoard from '../components/TaskBoard.jsx'
import TaskModal from '../components/TaskModal.jsx'
import CreateTeamModal from '../components/CreateTeamModal.jsx'
import InviteMemberModal from '../components/InviteMemberModal.jsx'
import { useAuthStore } from '../store/useAuthStore.js'
import { useTeamStore } from '../store/useTeamStore.js'
import { useTaskStore } from '../store/useTaskStore.js'

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { selectedTeam, fetchTeams, fetchInvitations, joinTeamWithToken } = useTeamStore()
  const { fetchTasks, fetchReminders, filters } = useTaskStore()

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [taskToEdit, setTaskToEdit] = useState(null)
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false)
  const [isInviteOpen, setIsInviteOpen] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isDueAlertOpen, setIsDueAlertOpen] = useState(true)
  const [isDueAlertExpanded, setIsDueAlertExpanded] = useState(false)

  const handleToggleDueAlert = () => {
    if (!isDueAlertOpen) {
      setIsDueAlertOpen(true)
      setIsDueAlertExpanded(true)
    } else {
      setIsDueAlertExpanded((prev) => !prev)
    }
  }

  // Initial load / user switch: fetch user teams, due reminders, and pending team invitations
  useEffect(() => {
    if (user?.id) {
      fetchTeams()
      fetchReminders()
      fetchInvitations()
    }

    // Auto-detect invitation link params if user clicked an invite link (?token=...&teamId=...)
    const urlParams = new URLSearchParams(window.location.search)
    const token = urlParams.get('token')
    const teamId = urlParams.get('teamId')
    if (token && teamId) {
      joinTeamWithToken(teamId, token)
        .then(() => {
          alert('You have successfully joined the team!')
          window.history.replaceState({}, '', window.location.pathname)
        })
        .catch((err) => {
          alert(err.message || 'Failed to join team with invitation link')
        })
    }
  }, [user?.id])

  // When selected team or filters change, reload tasks
  useEffect(() => {
    if (selectedTeam?.id) {
      fetchTasks(selectedTeam.id)
    } else {
      fetchTasks(null)
    }
  }, [selectedTeam?.id, filters.search, filters.assignedTo, filters.status, filters.priority])

  const handleOpenCreateTask = () => {
    setTaskToEdit(null)
    setIsTaskModalOpen(true)
  }

  const handleOpenEditTask = (task) => {
    setTaskToEdit(task)
    setIsTaskModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased">
      <Navbar
        onToggleMobileSidebar={() => setIsMobileSidebarOpen((prev) => !prev)}
        onToggleDueAlert={handleToggleDueAlert}
        isDueAlertOpen={isDueAlertOpen}
      />
      <InvitationBanner />
      <DueAlertBanner
        isOpen={isDueAlertOpen}
        onClose={() => setIsDueAlertOpen(false)}
        isExpanded={isDueAlertExpanded}
        onToggleExpand={() => setIsDueAlertExpanded((prev) => !prev)}
      />

      <div className="flex-1 flex overflow-hidden relative">
        <TeamSidebar
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
          onOpenCreateTeam={() => setIsCreateTeamOpen(true)}
          onOpenInvite={() => setIsInviteOpen(true)}
        />

        <TaskBoard
          onOpenCreateTask={handleOpenCreateTask}
          onOpenEditTask={handleOpenEditTask}
          onOpenInvite={() => setIsInviteOpen(true)}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />
      </div>

      {/* Modals */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        taskToEdit={taskToEdit}
      />

      <CreateTeamModal
        isOpen={isCreateTeamOpen}
        onClose={() => setIsCreateTeamOpen(false)}
      />

      <InviteMemberModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
      />
    </div>
  )
}
