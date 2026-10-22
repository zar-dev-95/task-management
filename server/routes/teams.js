import { Router } from 'express'
import {
  createTeam,
  getMyTeams,
  getTeamById,
  addTeamMember,
  removeTeamMember,
  deleteTeam,
  inviteMember,
  joinTeam,
  getMyInvitations,
  declineInvitation,
} from '../controllers/teamController.js'
import { isAuthenticated } from '../middleware/auth.js'
import {
  validateCreateTeam,
  validateAddMember,
} from '../middleware/validators.js'

const router = Router()

// Protect all team routes with auth middleware
router.use(isAuthenticated)

// Pending invitations for logged-in user (must be before /:id)
router.get('/invitations/my-invitations', getMyInvitations)
router.post('/invitations/:id/decline', declineInvitation)

router.post('/', validateCreateTeam, createTeam)
router.get('/', getMyTeams)
router.get('/:id', getTeamById)
router.post('/:id/members', validateAddMember, addTeamMember)
router.delete('/:id/members/:memberId', removeTeamMember)
router.delete('/:id', deleteTeam)
router.post('/:id/invite', validateAddMember, inviteMember)
router.post('/:id/join', joinTeam)

export default router
