import bcrypt from 'bcrypt'
import { pool } from '../config/db.js'
import { initDb } from './initDb.js'

export const SEED_USERS = [
  { name: 'Usman Khan', email: 'usman@task.com' },
  { name: 'Ali Ahmed', email: 'ali@task.com' },
  { name: 'Sara Malik', email: 'sara@task.com' },
  { name: 'Hamza Tariq', email: 'hamza@task.com' },
  { name: 'Zainab Noor', email: 'zainab@task.com' },
  { name: 'Bilal Hassan', email: 'bilal@task.com' },
  { name: 'Ayesha Siddiqui', email: 'ayesha@task.com' },
  { name: 'Omar Farooq', email: 'omar@task.com' },
  { name: 'Fatima Zahra', email: 'fatima@task.com' },
  { name: 'Hassan Raza', email: 'hassan@task.com' },
  { name: 'Mariam Qureshi', email: 'mariam@task.com' },
  { name: 'Ahmed Zafar', email: 'ahmed@task.com' },
  { name: 'Noor Fatima', email: 'noor@task.com' },
  { name: 'Tariq Mehmood', email: 'tariq@task.com' },
  { name: 'Zayd Ibrahim', email: 'zayd@task.com' },
]

export const DEFAULT_PASSWORD = '123456'

export const seedDatabase = async () => {
  try {
    console.log('--- Starting Database Seed ---')

    // 1. Ensure tables exist
    await initDb()

    // 2. Hash password '123456'
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, saltRounds)

    console.log(`\nAdding ${SEED_USERS.length} members with password: "${DEFAULT_PASSWORD}"...\n`)

    const insertedUsers = []

    for (const u of SEED_USERS) {
      const res = await pool.query(
        `INSERT INTO users (name, email, password_hash)
         VALUES ($1, $2, $3)
         ON CONFLICT (email)
         DO UPDATE SET name = EXCLUDED.name, password_hash = EXCLUDED.password_hash
         RETURNING id, name, email;`,
        [u.name, u.email.toLowerCase().trim(), passwordHash]
      )
      const user = res.rows[0]
      insertedUsers.push(user)
      console.log(`  ✓ ${user.name.padEnd(18)} | Email: ${user.email.padEnd(20)} | Password: ${DEFAULT_PASSWORD}`)
    }

    // 3. If any teams exist, automatically link these members so they appear in dropdowns/member lists
    const teamsRes = await pool.query('SELECT id, name FROM teams ORDER BY id ASC')
    if (teamsRes.rows.length > 0) {
      console.log(`\nLinking members to ${teamsRes.rows.length} existing team(s)...`)
      for (const team of teamsRes.rows) {
        for (const user of insertedUsers) {
          await pool.query(
            `INSERT INTO team_members (team_id, user_id, role)
             VALUES ($1, $2, 'member')
             ON CONFLICT (team_id, user_id) DO NOTHING;`,
            [team.id, user.id]
          )
        }
        console.log(`  ✓ Added 15 members to Team: "${team.name}" (ID: ${team.id})`)
      }
    }

    console.log('\n======================================================')
    console.log(`[Success] Seeding complete! Added/Updated ${insertedUsers.length} members.`)
    console.log(`   All accounts can log in with password: "${DEFAULT_PASSWORD}"`)
    console.log('======================================================\n')
    return insertedUsers
  } catch (error) {
    console.error('Error during database seed:', error)
    throw error
  }
}

// Execute when run directly via `node db/seed.js` or `npm run seed`
seedDatabase()
  .then(() => pool.end())
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Fatal seed error:', err)
    process.exit(1)
  })
