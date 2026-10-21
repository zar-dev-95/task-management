import { Router } from 'express'
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getDueReminders,
} from '../controllers/taskController.js'
import { isAuthenticated } from '../middleware/auth.js'
import {
  validateCreateTask,
  validateUpdateTask,
} from '../middleware/validators.js'

const router = Router()

// Protect all task routes with auth middleware
router.use(isAuthenticated)

router.get('/reminders/due-soon', getDueReminders)
router.post('/', validateCreateTask, createTask)
router.get('/', getTasks)
router.get('/:id', getTaskById)
router.put('/:id', validateUpdateTask, updateTask)
router.delete('/:id', deleteTask)

export default router
