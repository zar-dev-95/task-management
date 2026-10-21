import { Router } from 'express'
import {
  createTeam,
  getMyTeams,
  getTeamById,
  addTeamMember,
  deleteTeam,
  inviteMember,
  joinTeam,
} from '../controllers/teamController.js'
import { isAuthenticated } from '../middleware/auth.js'
import {
  validateCreateTeam,
  validateAddMember,
} from '../middleware/validators.js'

const router = Router()

// Protect all team routes with auth middleware
router.use(isAuthenticated)

router.post('/', validateCreateTeam, createTeam)
router.get('/', getMyTeams)
router.get('/:id', getTeamById)
router.post('/:id/members', validateAddMember, addTeamMember)
router.delete('/:id', deleteTeam)
router.post('/:id/invite', validateAddMember, inviteMember)
router.post('/:id/join', joinTeam)

export default router
