import crypto from 'crypto'
import db from '../config/db.js'

export const createTeam = async (req, res, next) => {
  try {
    const { name, description } = req.body
    const userId = req.user.id

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Team name is required' })
    }

    const trimmedName = name.trim()

    // Case-insensitive duplicate team check
    const existing = await db.query(
      'SELECT id, name FROM teams WHERE LOWER(TRIM(name)) = LOWER($1)',
      [trimmedName]
    )

    if (existing.rows.length > 0) {
      return res.status(400).json({
        error: `A team named "${existing.rows[0].name}" already exists. Team names must be unique.`,
      })
    }

    const teamResult = await db.query(
      'INSERT INTO teams (name, description, created_by) VALUES ($1, $2, $3) RETURNING *',
      [trimmedName, description ? description.trim() : null, userId]
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

export const removeTeamMember = async (req, res, next) => {
  try {
    const { id: teamId, memberId } = req.params
    const currentUserId = req.user.id
    const targetUserId = Number(memberId)

    const membership = await db.query(
      'SELECT role FROM team_members WHERE team_id = $1 AND user_id = $2',
      [teamId, currentUserId]
    )

    if (membership.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied: You are not a member of this team' })
    }

    const isSelf = targetUserId === currentUserId
    const isOwnerOrAdmin = ['owner', 'admin'].includes(membership.rows[0].role)

    // Only owners/admins can remove other members; members can only remove themselves (leave team)
    if (!isOwnerOrAdmin && !isSelf) {
      return res.status(403).json({ error: 'Only team owners or admins can remove members' })
    }

    const targetMember = await db.query(
      'SELECT role, user_id FROM team_members WHERE team_id = $1 AND user_id = $2',
      [teamId, targetUserId]
    )

    if (targetMember.rows.length === 0) {
      return res.status(404).json({ error: 'Member not found in this team' })
    }

    const teamRes = await db.query('SELECT created_by FROM teams WHERE id = $1', [teamId])
    const isCreator = teamRes.rows.length > 0 && Number(teamRes.rows[0].created_by) === targetUserId

    if (isCreator) {
      return res.status(403).json({
        error: isSelf
          ? 'As the team creator, you cannot leave the team. You can delete the team instead.'
          : 'The team creator cannot be removed from the team.',
      })
    }

    await db.query(
      'DELETE FROM team_members WHERE team_id = $1 AND user_id = $2',
      [teamId, targetUserId]
    )

    await db.query(
      'UPDATE tasks SET assigned_to = NULL WHERE team_id = $1 AND assigned_to = $2',
      [teamId, targetUserId]
    )

    return res.json({
      message: isSelf ? 'You have left the team' : 'Member removed from team successfully',
      memberId: targetUserId,
      teamId: Number(teamId),
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
    const normalizedEmail = email.toLowerCase().trim()

    const membership = await db.query(
      'SELECT role FROM team_members WHERE team_id = $1 AND user_id = $2',
      [teamId, currentUserId]
    )

    if (membership.rows.length === 0 || !['owner', 'admin'].includes(membership.rows[0].role)) {
      return res.status(403).json({ error: 'Only team owners or admins can send invitations' })
    }

    const targetUser = await db.query(
      'SELECT id, name, email FROM users WHERE email = $1',
      [normalizedEmail]
    )

    if (targetUser.rows.length === 0) {
      return res.status(404).json({ error: 'User not found. The person being invited must register first.' })
    }

    const alreadyMember = await db.query(
      'SELECT id FROM team_members WHERE team_id = $1 AND user_id = $2',
      [teamId, targetUser.rows[0].id]
    )

    if (alreadyMember.rows.length > 0) {
      return res.status(400).json({ error: 'User is already a member of this team' })
    }

    const token = crypto.randomBytes(24).toString('hex')
    const inviteLink = `${process.env.CLIENT_URL || 'http://localhost:5173'}/join?token=${token}&teamId=${teamId}`

    await db.query(
      `INSERT INTO team_invitations (team_id, email, token)
       VALUES ($1, $2, $3)`,
      [teamId, normalizedEmail, token]
    )

    console.log(`[STUBBED EMAIL INVITATION] Sent to: ${normalizedEmail} | Link: ${inviteLink}`)

    return res.json({
      message: `Invitation successfully sent to ${normalizedEmail}`,
      inviteToken: token,
      inviteLink,
    })
  } catch (error) {
    next(error)
  }
}

export const joinTeam = async (req, res, next) => {
  try {
    const teamId = req.params.id
    const { token } = req.body
    const userId = req.user.id
    const userEmail = req.user.email.toLowerCase().trim()

    if (!token) {
      return res.status(400).json({ error: 'Invitation token is required' })
    }

    const inviteResult = await db.query(
      `SELECT * FROM team_invitations
       WHERE team_id = $1 AND token = $2 AND status = 'pending' AND expires_at > CURRENT_TIMESTAMP`,
      [teamId, token]
    )

    if (inviteResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired invitation token' })
    }

    const invitation = inviteResult.rows[0]

    if (invitation.email.toLowerCase() !== userEmail) {
      return res.status(403).json({ error: 'This invitation was sent to a different email address' })
    }

    const alreadyMember = await db.query(
      'SELECT id FROM team_members WHERE team_id = $1 AND user_id = $2',
      [teamId, userId]
    )

    if (alreadyMember.rows.length > 0) {
      return res.status(400).json({ error: 'You are already a member of this team' })
    }

    await db.query(
      'INSERT INTO team_members (team_id, user_id, role) VALUES ($1, $2, $3)',
      [teamId, userId, 'member']
    )

    await db.query(
      `UPDATE team_invitations SET status = 'accepted' WHERE id = $1`,
      [invitation.id]
    )

    return res.json({
      message: 'Successfully joined team!',
      teamId: Number(teamId),
    })
  } catch (error) {
    next(error)
  }
}

export const getMyInvitations = async (req, res, next) => {
  try {
    const userEmail = req.user.email.toLowerCase().trim()

    const result = await db.query(
      `SELECT ti.id, ti.team_id, ti.email, ti.token, ti.created_at, ti.expires_at,
              t.name as team_name, t.description as team_description,
              u.name as inviter_name
       FROM team_invitations ti
       JOIN teams t ON ti.team_id = t.id
       LEFT JOIN users u ON t.created_by = u.id
       WHERE LOWER(ti.email) = $1
         AND ti.status = 'pending'
         AND ti.expires_at > CURRENT_TIMESTAMP
       ORDER BY ti.created_at DESC`,
      [userEmail]
    )

    return res.json({ invitations: result.rows })
  } catch (error) {
    next(error)
  }
}

export const declineInvitation = async (req, res, next) => {
  try {
    const invitationId = req.params.id
    const userEmail = req.user.email.toLowerCase().trim()

    await db.query(
      `UPDATE team_invitations
       SET status = 'declined'
       WHERE id = $1 AND LOWER(email) = $2 AND status = 'pending'`,
      [invitationId, userEmail]
    )

    return res.json({ message: 'Invitation declined' })
  } catch (error) {
    next(error)
  }
}

