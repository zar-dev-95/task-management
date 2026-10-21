import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar.jsx'
import DueAlertBanner from '../components/DueAlertBanner.jsx'
import TeamSidebar from '../components/TeamSidebar.jsx'
import TaskBoard from '../components/TaskBoard.jsx'
import TaskModal from '../components/TaskModal.jsx'
import CreateTeamModal from '../components/CreateTeamModal.jsx'
import InviteMemberModal from '../components/InviteMemberModal.jsx'
import { useTeamStore } from '../store/useTeamStore.js'
import { useTaskStore } from '../store/useTaskStore.js'

export default function DashboardPage() {
  const { selectedTeam, fetchTeams } = useTeamStore()
  const { fetchTasks, fetchReminders, filters } = useTaskStore()

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [taskToEdit, setTaskToEdit] = useState(null)
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false)
  const [isInviteOpen, setIsInviteOpen] = useState(false)

  // Initial load: fetch user teams and due reminders
  useEffect(() => {
    fetchTeams()
    fetchReminders()
  }, [])

  // When selected team or filters change, reload tasks
  useEffect(() => {
    if (selectedTeam?.id) {
      fetchTasks(selectedTeam.id)
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
      <Navbar />
      <DueAlertBanner />

      <div className="flex-1 flex overflow-hidden">
        <TeamSidebar
          onOpenCreateTeam={() => setIsCreateTeamOpen(true)}
          onOpenInvite={() => setIsInviteOpen(true)}
        />

        <TaskBoard
          onOpenCreateTask={handleOpenCreateTask}
          onOpenEditTask={handleOpenEditTask}
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
