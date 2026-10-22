import db from '../config/db.js'

export const createTask = async (req, res, next) => {
  try {
    const {
      title,
      description,
      status = 'todo',
      priority = 'medium',
      due_date,
      team_id,
      assigned_to,
    } = req.body
    const userId = req.user.id

    const membership = await db.query(
      'SELECT role FROM team_members WHERE team_id = $1 AND user_id = $2',
      [team_id, userId]
    )

    if (membership.rows.length === 0) {
      return res.status(403).json({ error: 'Forbidden: You must be a member of this team to create tasks' })
    }

    if (assigned_to) {
      const assigneeMembership = await db.query(
        'SELECT id FROM team_members WHERE team_id = $1 AND user_id = $2',
        [team_id, assigned_to]
      )
      if (assigneeMembership.rows.length === 0) {
        return res.status(400).json({ error: 'Assignee must be a member of this team' })
      }
    }

    const result = await db.query(
      `INSERT INTO tasks (title, description, status, priority, due_date, team_id, assigned_to, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        title.trim(),
        description ? description.trim() : null,
        status,
        priority,
        due_date || null,
        team_id,
        assigned_to || null,
        userId,
      ]
    )

    const createdTask = result.rows[0]

    const fullTask = await db.query(
      `SELECT t.*,
              creator.name AS creator_name,
              assignee.name AS assignee_name,
              assignee.email AS assignee_email
       FROM tasks t
       JOIN users creator ON t.created_by = creator.id
       LEFT JOIN users assignee ON t.assigned_to = assignee.id
       WHERE t.id = $1`,
      [createdTask.id]
    )

    return res.status(201).json({
      message: 'Task created successfully',
      task: fullTask.rows[0],
    })
  } catch (error) {
    next(error)
  }
}

export const getTasks = async (req, res, next) => {
  try {
    const userId = req.user.id
    const { teamId, assignedTo, status, priority, search } = req.query

    const conditions = [
      't.team_id IN (SELECT team_id FROM team_members WHERE user_id = $1)',
    ]
    const params = [userId]
    let paramIndex = 2

    if (teamId) {
      conditions.push(`t.team_id = $${paramIndex++}`)
      params.push(teamId)
    }

    if (assignedTo) {
      conditions.push(`t.assigned_to = $${paramIndex++}`)
      params.push(assignedTo)
    }

    if (status) {
      conditions.push(`t.status = $${paramIndex++}`)
      params.push(status)
    }

    if (priority) {
      conditions.push(`t.priority = $${paramIndex++}`)
      params.push(priority)
    }

    if (search) {
      conditions.push(`(t.title ILIKE $${paramIndex} OR t.description ILIKE $${paramIndex})`)
      params.push(`%${search.trim()}%`)
      paramIndex++
    }

    const whereClause = conditions.join(' AND ')

    const queryText = `
      SELECT t.*,
             team.name AS team_name,
             creator.name AS creator_name,
             assignee.name AS assignee_name,
             assignee.email AS assignee_email
      FROM tasks t
      JOIN teams team ON t.team_id = team.id
      JOIN users creator ON t.created_by = creator.id
      LEFT JOIN users assignee ON t.assigned_to = assignee.id
      WHERE ${whereClause}
      ORDER BY 
        CASE 
          WHEN t.due_date IS NULL THEN 1 
          ELSE 0 
        END,
        t.due_date ASC,
        t.created_at DESC
    `

    const result = await db.query(queryText, params)
    return res.json({ tasks: result.rows })
  } catch (error) {
    next(error)
  }
}

export const getTaskById = async (req, res, next) => {
  try {
    const taskId = req.params.id
    const userId = req.user.id

    const result = await db.query(
      `SELECT t.*,
              team.name AS team_name,
              creator.name AS creator_name,
              assignee.name AS assignee_name,
              assignee.email AS assignee_email
       FROM tasks t
       JOIN teams team ON t.team_id = team.id
       JOIN users creator ON t.created_by = creator.id
       LEFT JOIN users assignee ON t.assigned_to = assignee.id
       WHERE t.id = $1
         AND t.team_id IN (SELECT team_id FROM team_members WHERE user_id = $2)`,
      [taskId, userId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found or access denied' })
    }

    return res.json({ task: result.rows[0] })
  } catch (error) {
    next(error)
  }
}

export const updateTask = async (req, res, next) => {
  try {
    const taskId = req.params.id
    const userId = req.user.id
    const { title, description, status, priority, due_date, assigned_to } = req.body

    const existingResult = await db.query(
      `SELECT t.*, tm.role AS user_role, teams.created_by AS team_creator_id
       FROM tasks t
       JOIN team_members tm ON t.team_id = tm.team_id AND tm.user_id = $2
       JOIN teams ON t.team_id = teams.id
       WHERE t.id = $1`,
      [taskId, userId]
    )

    if (existingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found or access denied' })
    }

    const currentTask = existingResult.rows[0]
    const isCreator = Number(currentTask.created_by) === Number(userId)
    const isAssignee = Number(currentTask.assigned_to) === Number(userId)
    const isTeamOwner = Number(currentTask.team_creator_id) === Number(userId) || ['owner', 'admin'].includes(currentTask.user_role)

    // Only related members (assignee, creator, or team owner/admin) can update/change status of the task
    if (!isCreator && !isAssignee && !isTeamOwner) {
      return res.status(403).json({
        error: 'Forbidden: Only related members (the assigned member, task creator, or team owner) can change or edit this task.',
      })
    }

    if (assigned_to !== undefined && assigned_to !== null) {
      const assigneeMembership = await db.query(
        'SELECT id FROM team_members WHERE team_id = $1 AND user_id = $2',
        [currentTask.team_id, assigned_to]
      )
      if (assigneeMembership.rows.length === 0) {
        return res.status(400).json({ error: 'Assignee must be a member of this team' })
      }
    }

    const updatedTitle = title !== undefined ? title.trim() : currentTask.title
    const updatedDesc = description !== undefined ? (description ? description.trim() : null) : currentTask.description
    const updatedStatus = status !== undefined ? status : currentTask.status
    const updatedPriority = priority !== undefined ? priority : currentTask.priority
    const updatedDueDate = due_date !== undefined ? (due_date || null) : currentTask.due_date
    const updatedAssignedTo = assigned_to !== undefined ? (assigned_to || null) : currentTask.assigned_to

    await db.query(
      `UPDATE tasks
       SET title = $1, description = $2, status = $3, priority = $4,
           due_date = $5, assigned_to = $6, updated_at = CURRENT_TIMESTAMP
       WHERE id = $7`,
      [
        updatedTitle,
        updatedDesc,
        updatedStatus,
        updatedPriority,
        updatedDueDate,
        updatedAssignedTo,
        taskId,
      ]
    )

    const updatedResult = await db.query(
      `SELECT t.*,
              team.name AS team_name,
              creator.name AS creator_name,
              assignee.name AS assignee_name,
              assignee.email AS assignee_email
       FROM tasks t
       JOIN teams team ON t.team_id = team.id
       JOIN users creator ON t.created_by = creator.id
       LEFT JOIN users assignee ON t.assigned_to = assignee.id
       WHERE t.id = $1`,
      [taskId]
    )

    return res.json({
      message: 'Task updated successfully',
      task: updatedResult.rows[0],
    })
  } catch (error) {
    next(error)
  }
}

export const deleteTask = async (req, res, next) => {
  try {
    const taskId = req.params.id
    const userId = req.user.id

    const taskResult = await db.query(
      `SELECT t.id, t.created_by, t.title, t.team_id, tm.role AS user_role, teams.created_by AS team_creator_id
       FROM tasks t
       JOIN team_members tm ON t.team_id = tm.team_id AND tm.user_id = $2
       JOIN teams ON t.team_id = teams.id
       WHERE t.id = $1`,
      [taskId, userId]
    )

    if (taskResult.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found or access denied' })
    }

    const task = taskResult.rows[0]
    const isCreator = Number(task.created_by) === Number(userId)
    const isTeamOwner = Number(task.team_creator_id) === Number(userId) || ['owner', 'admin'].includes(task.user_role)

    // Rule: ONLY the Task Creator or Team Owner/Admin can delete the task
    if (!isCreator && !isTeamOwner) {
      return res.status(403).json({
        error: 'Forbidden: Only the task creator or team owner can delete this task.',
      })
    }

    await db.query('DELETE FROM tasks WHERE id = $1', [taskId])

    return res.json({ message: 'Task deleted successfully' })
  } catch (error) {
    next(error)
  }
}

export const getDueReminders = async (req, res, next) => {
  try {
    const userId = req.user.id

    const result = await db.query(
      `SELECT t.*, team.name AS team_name
       FROM tasks t
       JOIN teams team ON t.team_id = team.id
       WHERE t.assigned_to = $1
         AND t.status != 'completed'
         AND t.due_date IS NOT NULL
         AND t.due_date <= (CURRENT_TIMESTAMP + INTERVAL '48 hours')
       ORDER BY t.due_date ASC`,
      [userId]
    )

    return res.json({
      count: result.rows.length,
      reminders: result.rows,
    })
  } catch (error) {
    next(error)
  }
}
