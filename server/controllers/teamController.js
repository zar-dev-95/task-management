import crypto from 'crypto'
import db from '../config/db.js'

export const createTeam = async (req, res, next) => {
  try {
    const { name, description } = req.body
    const userId = req.user.id

    const teamResult = await db.query(
      'INSERT INTO teams (name, description, created_by) VALUES ($1, $2, $3) RETURNING *',
      [name.trim(), description ? description.trim() : null, userId]
    )
    const team = teamResult.rows[0]

    await db.query(
      'INSERT INTO team_members (team_id, user_id, role) VALUES ($1, $2, $3)',
      [team.id, userId, 'owner']
    )

    return res.status(201).json({
      message: 'Team created successfully',
      team: { ...team, role: 'owner', member_count: 1 },
    })
  } catch (error) {
    next(error)
  }
}

export const getMyTeams = async (req, res, next) => {
  try {
    const userId = req.user.id

    const result = await db.query(
      `SELECT t.id, t.name, t.description, t.created_by, t.created_at, tm.role,
              (SELECT COUNT(*)::int FROM team_members WHERE team_id = t.id) AS member_count
       FROM teams t
       JOIN team_members tm ON t.id = tm.team_id
       WHERE tm.user_id = $1
       ORDER BY t.created_at DESC`,
      [userId]
    )

    return res.json({ teams: result.rows })
  } catch (error) {
    next(error)
  }
}

export const getTeamById = async (req, res, next) => {
  try {
    const teamId = req.params.id
    const userId = req.user.id

    const membership = await db.query(
      'SELECT role FROM team_members WHERE team_id = $1 AND user_id = $2',
      [teamId, userId]
    )

    if (membership.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied: You are not a member of this team' })
    }

    const teamResult = await db.query(
      'SELECT id, name, description, created_by, created_at FROM teams WHERE id = $1',
      [teamId]
    )

    if (teamResult.rows.length === 0) {
      return res.status(404).json({ error: 'Team not found' })
    }

    const membersResult = await db.query(
      `SELECT u.id, u.name, u.email, tm.role, tm.joined_at
       FROM team_members tm
       JOIN users u ON tm.user_id = u.id
       WHERE tm.team_id = $1
       ORDER BY tm.joined_at ASC`,
      [teamId]
    )

    return res.json({
      team: teamResult.rows[0],
      role: membership.rows[0].role,
      members: membersResult.rows,
    })
  } catch (error) {
    next(error)
  }
}

export const addTeamMember = async (req, res, next) => {
  try {
    const teamId = req.params.id
    const currentUserId = req.user.id
    const { email, role = 'member' } = req.body

    const membership = await db.query(
      'SELECT role FROM team_members WHERE team_id = $1 AND user_id = $2',
      [teamId, currentUserId]
    )

    if (membership.rows.length === 0 || !['owner', 'admin'].includes(membership.rows[0].role)) {
      return res.status(403).json({ error: 'Only team owners or admins can add members' })
    }

    const targetUser = await db.query(
      'SELECT id, name, email FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    )

    if (targetUser.rows.length === 0) {
      return res.status(404).json({ error: 'User not found. They must register first.' })
    }

    const newMemberId = targetUser.rows[0].id

    const alreadyMember = await db.query(
      'SELECT id FROM team_members WHERE team_id = $1 AND user_id = $2',
      [teamId, newMemberId]
    )

    if (alreadyMember.rows.length > 0) {
      return res.status(400).json({ error: 'User is already a member of this team' })
    }

    await db.query(
      'INSERT INTO team_members (team_id, user_id, role) VALUES ($1, $2, $3)',
      [teamId, newMemberId, role]
    )

    return res.status(201).json({
      message: 'Member added successfully',
      member: {
        id: newMemberId,
        name: targetUser.rows[0].name,
        email: targetUser.rows[0].email,
        role,
      },
    })
  } catch (error) {
    next(error)
  }
}

export const deleteTeam = async (req, res, next) => {
  try {
    const teamId = req.params.id
    const userId = req.user.id

    const teamResult = await db.query('SELECT created_by FROM teams WHERE id = $1', [teamId])

    if (teamResult.rows.length === 0) {
      return res.status(404).json({ error: 'Team not found' })
    }

    if (teamResult.rows[0].created_by !== userId) {
      return res.status(403).json({ error: 'Forbidden: Only the team creator can delete this team' })
    }

    await db.query('DELETE FROM teams WHERE id = $1', [teamId])

    return res.json({ message: 'Team deleted successfully' })
  } catch (error) {
    next(error)
  }
}

export const inviteMember = async (req, res, next) => {
  try {
    const teamId = req.params.id
    const currentUserId = req.user.id
    const { email } = req.body

    const membership = await db.query(
      'SELECT role FROM team_members WHERE team_id = $1 AND user_id = $2',
      [teamId, currentUserId]
    )

    if (membership.rows.length === 0 || !['owner', 'admin'].includes(membership.rows[0].role)) {
      return res.status(403).json({ error: 'Only team owners or admins can send invitations' })
    }

    const token = crypto.randomBytes(24).toString('hex')
    const inviteLink = `${process.env.CLIENT_URL || 'http://localhost:5173'}/join?token=${token}&teamId=${teamId}`

    console.log(`[STUBBED EMAIL INVITATION] Sent to: ${email} | Link: ${inviteLink}`)

    return res.json({
      message: `Invitation successfully sent to ${email}`,
      inviteToken: token,
      inviteLink,
    })
  } catch (error) {
    next(error)
  }
}
