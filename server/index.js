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
const isProduction =
  process.env.NODE_ENV === 'production' ||
  Boolean(process.env.VERCEL) ||
  Boolean(process.env.RAILWAY_ENVIRONMENT) ||
  Boolean(process.env.RAILWAY_PROJECT_ID)

// Trust reverse proxy (required for Railway / Vercel cross-origin HTTPS cookies)
app.set('trust proxy', 1)

const rawClientUrl = process.env.CLIENT_URL || 'http://localhost:5173'
const cleanClientUrl = rawClientUrl
  .trim()
  .replace(/[\r\n\t]/g, '')
  .replace(/^["']|["']$/g, '')
  .replace(/\/+$/, '')

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true)
      const normalizedOrigin = origin.trim().replace(/\/+$/, '')
      if (
        normalizedOrigin === cleanClientUrl ||
        normalizedOrigin.endsWith('.vercel.app') ||
        normalizedOrigin.endsWith('.railway.app') ||
        normalizedOrigin.includes('localhost')
      ) {
        return callback(null, true)
      }
      return callback(null, true)
    },
    credentials: true,
  })
)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Session Store Configuration
// Requirement: "Store session in PostgreSQL, fallback to memory in dev"
const usePgSession = isProduction || process.env.USE_PG_SESSION === 'true'
let sessionStore = undefined

if (usePgSession && process.env.DATABASE_URL) {
  const PgSession = connectPgSimple(session)
  sessionStore = new PgSession({
    pool,
    tableName: 'session',
    createTableIfMissing: true,
  })
  sessionStore.on('error', (err) => {
    console.error('PostgreSQL Session Store Error:', err.message)
  })
  console.log('[Session Store] PostgreSQL (connect-pg-simple active)')
} else {
  // Built-in MemoryStore fallback for local development
  console.log('[Session Store] In-Memory fallback active (Local Development)')
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

app.get('/', (req, res) => {
  res.json({
    message: 'TaskDesk API Server is running successfully',
    status: 'online',
    healthCheck: '/api/health',
  })
})

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    environment: isProduction ? 'production' : 'development',
    sessionStore: sessionStore ? 'postgresql' : 'in-memory (fallback)',
    hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
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

// In serverless environments (Vercel), Vercel manages the HTTP server lifecycle.
// In traditional Node environments, listen on PORT.
if (process.env.VERCEL !== '1') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT} (0.0.0.0)`)
  })
}

export default app
