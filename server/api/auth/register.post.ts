// POST /api/auth/register
// Creates a new user account and starts an authenticated session.
//
// Body: { email: string, password: string, name: string }
// Response: { id: string, email: string, name: string }
// Status codes:
//   201 — account created, session cookie set in response
//   400 — missing or invalid fields (email, password, name)
//   409 — email already registered

import { useDb } from '#server/db'
import { users } from '#server/db/schema'
import { eq } from 'drizzle-orm'
import { sendWelcomeEmail } from '#server/utils/email'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ email: string; password: string; name: string }>(event)

  if (!body.email?.trim() || !body.password?.trim() || !body.name?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Email, password, and name are required' })
  }
  if (body.password.length < 6) {
    throw createError({ statusCode: 400, statusMessage: 'Password must be at least 6 characters' })
  }

  const db = useDb()

  // Check for duplicate email — the DB has a UNIQUE constraint on email,
  // but checking here gives us a friendlier error message than a raw DB error.
  const [existing] = await db.select().from(users).where(eq(users.email, body.email.trim()))
  if (existing) {
    throw createError({ statusCode: 409, statusMessage: 'Email already registered' })
  }

  const id = crypto.randomUUID()
  const now = new Date().toISOString()
  const email = body.email.trim()
  const name = body.name.trim()

  // hashPassword() is provided by nuxt-auth-utils. It uses bcrypt with
  // a salt round of 10 and returns a string in the format $2b$10$...
  await db.insert(users).values({
    id,
    email,
    passwordHash: await hashPassword(body.password),
    name,
    createdAt: now,
  })

  // setUserSession() from nuxt-auth-utils creates an encrypted session cookie.
  // The user object stored in the session is returned by /api/auth/me and
  // is available in protected routes via requireUserSession(event).
  await setUserSession(event, {
    user: { id, email, name },
  })

  sendWelcomeEmail(email, name)

  return { id, email, name }
})
