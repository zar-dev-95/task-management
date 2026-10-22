import { useState } from 'react'
import {
  Search,
  Plus,
  Calendar,
  User,
  Trash2,
  Edit2,
  X,
  Clock,
  CheckCircle2,
  ListTodo,
  UserPlus,
} from './Icons.jsx'
import { useTaskStore } from '../store/useTaskStore.js'
import { useTeamStore } from '../store/useTeamStore.js'
import { useAuthStore } from '../store/useAuthStore.js'

export default function TaskBoard({ onOpenCreateTask, onOpenEditTask, onOpenInvite }) {
  const { user } = useAuthStore()
  const { selectedTeam, members, userRole } = useTeamStore()
  const { tasks, loading, filters, setFilter, resetFilters, updateTask, deleteTask } = useTaskStore()
  const [deletingId, setDeletingId] = useState(null)

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await updateTask(taskId, { status: newStatus })
    } catch (err) {
      alert(err.message || 'Failed to update status')
    }
  }

  const handleDeleteTask = async (task) => {
    const isCreator = Number(task.created_by) === Number(user?.id)
    const isTeamOwner = Number(selectedTeam?.created_by) === Number(user?.id) || ['owner', 'admin'].includes(userRole)

    if (!isCreator && !isTeamOwner) {
      alert('Forbidden: Only the task creator or team owner can delete this task.')
      return
    }

    const confirmed = window.confirm(`Delete task "${task.title}"?`)
    if (!confirmed) return

    try {
      setDeletingId(task.id)
      await deleteTask(task.id)
    } catch (err) {
      alert(err.message || 'Failed to delete task')
    } finally {
      setDeletingId(null)
    }
  }

  const isFiltered = Boolean(filters.search || filters.assignedTo || filters.status || filters.priority)

  // Status Columns for Kanban Layout
  const columns = [
    { key: 'todo', label: 'To Do', icon: ListTodo, color: 'text-slate-600', countBg: 'bg-slate-100 text-slate-700' },
    { key: 'in_progress', label: 'In Progress', icon: Clock, color: 'text-blue-600', countBg: 'bg-blue-50 text-blue-700' },
    { key: 'completed', label: 'Completed', icon: CheckCircle2, color: 'text-emerald-600', countBg: 'bg-emerald-50 text-emerald-700' },
  ]

  return (
    <main className="flex-1 flex flex-col h-[calc(100vh-4.25rem)] overflow-hidden bg-white">
      {/* Team Top Header */}
      <div className="px-8 py-5 border-b border-slate-200 flex items-center justify-between shrink-0 bg-white">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              {selectedTeam ? selectedTeam.name : 'Select or Create a Team'}
            </h1>
            {selectedTeam && (
              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 font-medium">
                  {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-medium">
                  {members.length} {members.length === 1 ? 'member' : 'members'}
                </span>
              </div>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-xl truncate">
            {selectedTeam?.description || 'Collaborative task board for managing team assignments.'}
          </p>
        </div>

        {selectedTeam && (
          <div className="flex flex-col items-end gap-2 shrink-0">
            <button
              onClick={onOpenCreateTask}
              className="flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm shadow-blue-500/25 transition-colors cursor-pointer min-w-[125px]"
            >
              <Plus className="w-4 h-4" />
              <span>New Task</span>
            </button>

            <button
              onClick={onOpenInvite}
              className="flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm shadow-blue-500/25 transition-colors cursor-pointer min-w-[125px]"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Member</span>
            </button>
          </div>
        )}
      </div>

      {/* Filter & Search Toolbar */}
      {selectedTeam && (
        <div className="px-8 py-3 border-b border-slate-100 flex items-center justify-between gap-4 bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-3 flex-1 max-w-3xl">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search tasks by title or details..."
                value={filters.search}
                onChange={(e) => setFilter('search', e.target.value)}
                className="w-full h-9 pl-9 pr-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 transition-colors"
              />
            </div>

            {/* Assignee Filter */}
            <select
              value={filters.assignedTo}
              onChange={(e) => setFilter('assignedTo', e.target.value)}
              className="h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-slate-900 transition-colors cursor-pointer shrink-0"
            >
              <option value="">All Assignees</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={filters.status}
              onChange={(e) => setFilter('status', e.target.value)}
              className="h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-slate-900 transition-colors cursor-pointer shrink-0"
            >
              <option value="">All Statuses</option>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>

            {/* Priority Filter */}
            <select
              value={filters.priority}
              onChange={(e) => setFilter('priority', e.target.value)}
              className="h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-slate-900 transition-colors cursor-pointer shrink-0"
            >
              <option value="">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>

            {/* Reset Filters */}
            {isFiltered && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 px-2 py-1.5 rounded hover:bg-slate-200/60 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Task Content Board */}
      <div className="flex-1 overflow-x-auto p-6 min-h-0 bg-slate-50/40">
        {!selectedTeam ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
              <ListTodo className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">No Team Selected</h3>
            <p className="text-xs text-slate-400 max-w-sm mt-1">
              Select a team from the left sidebar or create a new team to manage tasks.
            </p>
          </div>
        ) : tasks.length === 0 && !loading ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">
              {isFiltered ? 'No matching tasks' : 'No tasks created yet'}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mt-1">
              {isFiltered
                ? 'Try adjusting or clearing your filters to see more tasks.'
                : 'Click "+ New Task" to assign your first task in this team.'}
            </p>
            {isFiltered ? (
              <button
                onClick={resetFilters}
                className="mt-3 text-xs font-medium text-slate-900 underline hover:text-slate-700 cursor-pointer"
              >
                Clear all filters
              </button>
            ) : (
              <button
                onClick={onOpenCreateTask}
                className="mt-3 px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 shadow-sm shadow-blue-500/25 transition-colors cursor-pointer"
              >
                Create Task
              </button>
            )}
          </div>
        ) : (
          /* Kanban 3-Column Grid */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full min-h-0">
            {columns.map((col) => {
              // High priority tasks remain on top (high: 1, medium: 2, low: 3)
              const PRIORITY_ORDER = { high: 1, medium: 2, low: 3 }
              const columnTasks = tasks
                .filter((t) => t.status === col.key)
                .sort((a, b) => {
                  const pA = PRIORITY_ORDER[a.priority?.toLowerCase()] || 2
                  const pB = PRIORITY_ORDER[b.priority?.toLowerCase()] || 2
                  if (pA !== pB) return pA - pB
                  return new Date(a.due_date || '9999-12-31') - new Date(b.due_date || '9999-12-31')
                })
              const Icon = col.icon

              return (
                <div
                  key={col.key}
                  className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-4 flex flex-col h-full min-h-0 shadow-sm"
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/70 shrink-0">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${col.color}`} />
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                        {col.label}
                      </h3>
                    </div>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold ${col.countBg}`}>
                      {columnTasks.length}
                    </span>
                  </div>

                  {/* Column Tasks (Independently scrollable with sleek scrollbar) */}
                  <div className="flex-1 overflow-y-auto pr-1.5 space-y-3 min-h-0 custom-scrollbar">
                    {columnTasks.length === 0 ? (
                      <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-lg">
                        No {col.label.toLowerCase()} tasks
                      </div>
                    ) : (
                      columnTasks.map((task) => {
                        const isCreator = Number(task.created_by) === Number(user?.id)
                        const isAssignee = Number(task.assigned_to) === Number(user?.id)
                        const isTeamOwner = Number(selectedTeam?.created_by) === Number(user?.id) || ['owner', 'admin'].includes(userRole)
                        const canModify = isCreator || isAssignee || isTeamOwner
                        const canDelete = isCreator || isTeamOwner

                        // Priority chip styling
                        const priorityBadges = {
                          high: 'bg-rose-50 text-rose-700 border-rose-200',
                          medium: 'bg-amber-50 text-amber-700 border-amber-200',
                          low: 'bg-slate-100 text-slate-600 border-slate-200',
                        }

                        return (
                          <div
                            key={task.id}
                            className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-sm hover:border-slate-300 transition-all space-y-2.5 group"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span
                                className={`text-[10px] font-mono px-1.5 py-0.5 rounded border uppercase tracking-wider font-semibold ${
                                  priorityBadges[task.priority] || priorityBadges.medium
                                }`}
                              >
                                {task.priority}
                              </span>

                              {/* Task Action Buttons - Only related members */}
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {canModify && (
                                  <button
                                    onClick={() => onOpenEditTask(task)}
                                    title="Edit task"
                                    className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                )}

                                {canDelete && (
                                  <button
                                    onClick={() => handleDeleteTask(task)}
                                    disabled={deletingId === task.id}
                                    title="Delete task"
                                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}

                                {!canModify && (
                                  <span
                                    title="Read-only: Only assigned member, creator, or team owner can edit this task"
                                    className="text-[10px] text-slate-400 italic px-1 select-none"
                                  >
                                    View only
                                  </span>
                                )}
                              </div>
                            </div>

                            <div>
                              <h4 className="text-sm font-semibold text-slate-900 leading-snug">
                                {task.title}
                              </h4>
                              {task.description && (
                                <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                                  {task.description}
                                </p>
                              )}
                            </div>

                            {/* Meta: Due Date & Assignee */}
                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                              <div className="flex items-center gap-1">
                                <User className="w-3 h-3 text-slate-400" />
                                <span className="truncate max-w-[110px]">
                                  {task.assignee_name || 'Unassigned'}
                                </span>
                              </div>

                              {task.due_date && (
                                <div className="flex items-center gap-1 text-slate-500 font-mono text-[10px]">
                                  <Calendar className="w-3 h-3 text-slate-400" />
                                  <span>
                                    {new Date(task.due_date).toLocaleDateString(undefined, {
                                      month: 'short',
                                      day: 'numeric',
                                    })}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Quick Status Dropdown (interactive only for related members) */}
                            <div className="pt-1">
                              {canModify ? (
                                <select
                                  value={task.status}
                                  onChange={(e) => handleStatusChange(task.id, e.target.value)}
                                  className="w-full h-7 px-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-[11px] font-medium text-slate-700 focus:outline-none focus:border-slate-900 cursor-pointer"
                                >
                                  <option value="todo">Status: To Do</option>
                                  <option value="in_progress">Status: In Progress</option>
                                  <option value="completed">Status: Completed</option>
                                </select>
                              ) : (
                                <div
                                  title="Read-only: Only the assigned member, creator, or team owner can change status"
                                  className="w-full h-7 px-2 bg-slate-50/70 border border-slate-200/80 rounded text-[11px] text-slate-500 flex items-center justify-between select-none cursor-not-allowed"
                                >
                                  <span className="capitalize">
                                    Status: {task.status.replace('_', ' ')}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-mono">(Locked)</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
