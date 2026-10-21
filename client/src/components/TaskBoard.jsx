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
} from './Icons.jsx'
import { useTaskStore } from '../store/useTaskStore.js'
import { useTeamStore } from '../store/useTeamStore.js'
import { useAuthStore } from '../store/useAuthStore.js'

export default function TaskBoard({ onOpenCreateTask, onOpenEditTask }) {
  const { user } = useAuthStore()
  const { selectedTeam, members } = useTeamStore()
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
    if (task.created_by !== user?.id) {
      alert('Forbidden: Only the task creator can delete this task.')
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
    <main className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden bg-white">
      {/* Team Top Header */}
      <div className="px-8 py-5 border-b border-slate-200 flex items-center justify-between shrink-0 bg-white">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              {selectedTeam ? selectedTeam.name : 'Select or Create a Team'}
            </h1>
            {selectedTeam && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 font-medium">
                {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-xl truncate">
            {selectedTeam?.description || 'Collaborative task board for managing team assignments.'}
          </p>
        </div>

        {selectedTeam && (
          <button
            onClick={onOpenCreateTask}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>
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
      <div className="flex-1 overflow-x-auto overflow-y-auto p-8">
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
                className="mt-3 px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Create Task
              </button>
            )}
          </div>
        ) : (
          /* Kanban 3-Column Grid */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {columns.map((col) => {
              const columnTasks = tasks.filter((t) => t.status === col.key)
              const Icon = col.icon

              return (
                <div key={col.key} className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4 flex flex-col">
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/60">
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

                  {/* Column Tasks */}
                  <div className="space-y-3 min-h-[180px]">
                    {columnTasks.length === 0 ? (
                      <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-lg">
                        No {col.label.toLowerCase()} tasks
                      </div>
                    ) : (
                      columnTasks.map((task) => {
                        const isCreator = task.created_by === user?.id

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

                              {/* Task Action Buttons */}
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => onOpenEditTask(task)}
                                  title="Edit task"
                                  className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>

                                {/* Creator-only Delete */}
                                {isCreator && (
                                  <button
                                    onClick={() => handleDeleteTask(task)}
                                    disabled={deletingId === task.id}
                                    title="Delete task (Only creator can delete)"
                                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
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

                            {/* Quick Status Dropdown */}
                            <div className="pt-1">
                              <select
                                value={task.status}
                                onChange={(e) => handleStatusChange(task.id, e.target.value)}
                                className="w-full h-7 px-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-[11px] font-medium text-slate-700 focus:outline-none focus:border-slate-900 cursor-pointer"
                              >
                                <option value="todo">Status: To Do</option>
                                <option value="in_progress">Status: In Progress</option>
                                <option value="completed">Status: Completed</option>
                              </select>
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
