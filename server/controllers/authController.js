import bcrypt from 'bcrypt'
import passport from 'passport'
import db from '../config/db.js'

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body
    const normalizedEmail = email.toLowerCase().trim()

    const existingUser = await db.query(
      'SELECT id FROM users WHERE email = $1',
      [normalizedEmail]
    )

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email is already registered' })
    }

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    const result = await db.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, created_at',
      [name.trim(), normalizedEmail, passwordHash]
    )

    const newUser = result.rows[0]

    req.login(newUser, (err) => {
      if (err) return next(err)
      req.session.save((saveErr) => {
        if (saveErr) return next(saveErr)
        return res.status(201).json({
          message: 'Registration successful',
          user: newUser,
          sessionId: req.sessionID,
        })
      })
    })
  } catch (error) {
    next(error)
  }
}

export const login = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err)

    if (!user) {
      return res.status(401).json({ error: info?.message || 'Authentication failed' })
    }

    req.login(user, (err) => {
      if (err) return next(err)
      req.session.save((saveErr) => {
        if (saveErr) return next(saveErr)
        return res.json({
          message: 'Login successful',
          user,
          sessionId: req.sessionID,
        })
      })
    })
  })(req, res, next)
}

export const logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err)

    req.session.destroy((sessionErr) => {
      if (sessionErr) return next(sessionErr)

      const isProduction =
        process.env.NODE_ENV === 'production' ||
        Boolean(process.env.VERCEL) ||
        Boolean(process.env.RAILWAY_ENVIRONMENT) ||
        Boolean(process.env.RAILWAY_PROJECT_ID)
      res.clearCookie('connect.sid', {
        path: '/',
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
      })
      return res.json({ message: 'Logged out successfully' })
    })
  })
}

export const getCurrentUser = (req, res) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return res.json({ user: req.user, sessionId: req.sessionID })
  }
  return res.status(401).json({ error: 'Not authenticated' })
}
