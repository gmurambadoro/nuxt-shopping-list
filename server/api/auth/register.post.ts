import { useDb } from '../../db'
import { users } from '../../db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ email: string; password: string; name: string }>(event)

  if (!body.email?.trim() || !body.password?.trim() || !body.name?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Email, password, and name are required' })
  }
  if (body.password.length < 6) {
    throw createError({ statusCode: 400, statusMessage: 'Password must be at least 6 characters' })
  }

  const db = useDb()

  const [existing] = await db.select().from(users).where(eq(users.email, body.email.trim()))
  if (existing) {
    throw createError({ statusCode: 409, statusMessage: 'Email already registered' })
  }

  const id = crypto.randomUUID()
  const now = new Date().toISOString()

  await db.insert(users).values({
    id,
    email: body.email.trim(),
    passwordHash: await hashPassword(body.password),
    name: body.name.trim(),
    createdAt: now,
  })

  await setUserSession(event, {
    user: { id, email: body.email.trim(), name: body.name.trim() },
  })

  return { id, email: body.email.trim(), name: body.name.trim() }
})
