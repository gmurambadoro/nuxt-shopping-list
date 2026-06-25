// POST /api/lists
// Creates a new shopping list for the authenticated user.
//
// Body: { name: string }
// Response: { id, userId, name, createdAt, updatedAt, items: [] }
// Auth: required — throws 401 if no valid session

import { useDb } from '../db'
import { lists } from '../db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)

  const body = await readBody<{ name: string }>(event)
  if (!body.name?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Name is required' })
  }

  const db = useDb()
  const now = new Date().toISOString()
  const id = crypto.randomUUID()

  await db.insert(lists).values({
    id,
    userId: user.id,
    name: body.name.trim(),
    createdAt: now,
    updatedAt: now,
  })

  // Re-fetch the created list to return the exact DB row
  const [list] = await db.select().from(lists).where(eq(lists.id, id))
  return { ...list, items: [] }
})
