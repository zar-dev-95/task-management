import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import session from 'express-session'
import connectPgSimple from 'connect-pg-simple'
import passport from 'passport'
import { pool } from './config/db.js'
import { configurePassport } from './config/passport.js'
import authRoutes from './routes/auth.js'
import teamRoutes from './routes/teams.js'
import taskRoutes from './routes/tasks.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000
const isProduction = process.env.NODE_ENV === 'production'

// Trust reverse proxy (required for Azure App Service / Vercel cross-origin cookies)
app.set('trust proxy', 1)

const clientOrigin = process.env.CLIENT_URL || 'http://localhost:5173'
app.use(
  cors({
    origin: clientOrigin,
    credentials: true,
  })
)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const PgSession = connectPgSimple(session)
const sessionStore = process.env.DATABASE_URL
  ? new PgSession({
      pool,
      tableName: 'session',
      createTableIfMissing: true,
    })
  : undefined

if (sessionStore) {
  sessionStore.on('error', (err) => {
    console.error('PostgreSQL Session Store Error:', err.message)
  })
}

app.use(
  session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET || 'dev_secret_key_123',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
)

configurePassport(passport)
app.use(passport.initialize())
app.use(passport.session())

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Server is running successfully',
    authenticated: req.isAuthenticated ? req.isAuthenticated() : false,
  })
})

app.use('/api/auth', authRoutes)
app.use('/api/teams', teamRoutes)
app.use('/api/tasks', taskRoutes)

app.use((err, req, res, next) => {
  console.error(err)
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
