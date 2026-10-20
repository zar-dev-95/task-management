import { Router } from 'express'
import {
  register,
  login,
  logout,
  getCurrentUser,
} from '../controllers/authController.js'
import {
  validateRegister,
  validateLogin,
} from '../middleware/validators.js'

const router = Router()

router.post('/register', validateRegister, register)
router.post('/login', validateLogin, login)
router.post('/logout', logout)
router.get('/me', getCurrentUser)

export default router
