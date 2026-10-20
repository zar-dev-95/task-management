import { Strategy as LocalStrategy } from 'passport-local'
import bcrypt from 'bcrypt'
import db from './db.js'

export const configurePassport = (passport) => {
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
      },
      async (email, password, done) => {
        try {
          const result = await db.query(
            'SELECT * FROM users WHERE email = $1',
            [email.toLowerCase().trim()]
          )

          if (result.rows.length === 0) {
            return done(null, false, { message: 'Invalid email or password' })
          }

          const user = result.rows[0]
          const isMatch = await bcrypt.compare(password, user.password_hash)

          if (!isMatch) {
            return done(null, false, { message: 'Invalid email or password' })
          }

          delete user.password_hash
          return done(null, user)
        } catch (error) {
          return done(error)
        }
      }
    )
  )

  passport.serializeUser((user, done) => {
    done(null, user.id)
  })

  passport.deserializeUser(async (id, done) => {
    try {
      const result = await db.query(
        'SELECT id, name, email, created_at FROM users WHERE id = $1',
        [id]
      )

      if (result.rows.length === 0) {
        return done(null, false)
      }

      done(null, result.rows[0])
    } catch (error) {
      done(error)
    }
  })
}

export default configurePassport
