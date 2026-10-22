import pkg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pkg

const cleanConnectionString = (url) => {
  if (!url) return url
  return url.replace(/([?&])sslmode=[^&]+(&|$)/, (m, p, s) => (s === '&' ? p : '')).replace(/\?$/, '')
}

const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: cleanConnectionString(process.env.DATABASE_URL),
      ssl: process.env.DATABASE_URL.includes('localhost')
        ? false
        : { rejectUnauthorized: false },
      max: process.env.VERCEL ? 3 : 10,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
    }
  : {
      host: process.env.PGHOST || 'localhost',
      port: Number(process.env.PGPORT) || 5432,
      database: process.env.PGDATABASE || 'task_manager',
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD || 'postgres',
    }

export const pool = new Pool(poolConfig)

export const query = (text, params) => pool.query(text, params)

export default {
  pool,
  query,
}
