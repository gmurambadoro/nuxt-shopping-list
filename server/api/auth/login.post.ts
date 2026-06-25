import { useDb } from '../../db'
import { users } from '../../db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ email: string; password: string }>(event)

  if (!body.email?.trim() || !body.password?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Email and password are required' })
  }

  const db = useDb()

  const [user] = await db.select().from(users).where(eq(users.email, body.email.trim()))
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid email or password' })
  }

  const verified = await verifyPassword(user.passwordHash, body.password)
  if (!verified) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid email or password' })
  }

  await setUserSession(event, {
    user: { id: user.id, email: user.email, name: user.name },
  })

  return { id: user.id, email: user.email, name: user.name }
})
