import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { pool } from '../config/db.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const initDb = async () => {
  try {
    const schemaPath = path.join(__dirname, 'schema.sql')
    const schemaSql = fs.readFileSync(schemaPath, 'utf8')
    await pool.query(schemaSql)
    console.log('Database tables initialized successfully.')
  } catch (error) {
    console.error('Failed to initialize database tables:', error.message)
    throw error
  }
}

if (process.argv[1] === __filename) {
  initDb()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}
