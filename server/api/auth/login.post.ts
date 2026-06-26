// POST /api/auth/login
// Authenticates an existing user and starts a session.
//
// Body: { email: string, password: string }
// Response: { id: string, email: string, name: string }
// Status codes:
//   200 — authenticated, session cookie set
//   400 — missing email or password
//   401 — invalid credentials (same message for both wrong email and wrong
//         password to prevent email enumeration attacks)

import { useDb } from '#server/db'
import { users } from '#server/db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ email: string; password: string }>(event)

  if (!body.email?.trim() || !body.password?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Email and password are required' })
  }

  const db = useDb()

  const [user] = await db.select().from(users).where(eq(users.email, body.email.trim()))
  // Return 401 for both missing email and wrong password — never reveal
  // which field was incorrect. This prevents attackers from probing for
  // registered email addresses.
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid email or password' })
  }

  // verifyPassword() is provided by nuxt-auth-utils. It compares the
  // plaintext password against the stored bcrypt hash.
  const verified = await verifyPassword(user.passwordHash, body.password)
  if (!verified) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid email or password' })
  }

  await setUserSession(event, {
    user: { id: user.id, email: user.email, name: user.name },
  })

  return { id: user.id, email: user.email, name: user.name }
})
