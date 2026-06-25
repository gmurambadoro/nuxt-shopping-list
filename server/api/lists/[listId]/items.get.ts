// GET /api/lists/:listId/items
// Returns all items for a specific list.
// Only the list owner can view its items.
//
// Response: Item[]
// Auth: required — throws 401 if no valid session
// Errors:
//   404 — list not found or does not belong to the user

import { useDb } from '../../../db'
import { items, lists } from '../../../db/schema'
import { eq, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)

  const listId = getRouterParam(event, 'listId')
  const db = useDb()

  // Verify ownership before returning items
  const [list] = await db.select()
    .from(lists)
    .where(and(eq(lists.id, listId!), eq(lists.userId, user.id)))
  if (!list) {
    throw createError({ statusCode: 404, statusMessage: 'List not found' })
  }

  const rows = await db.select()
    .from(items)
    .where(eq(items.listId, listId!))
    .orderBy(items.createdAt)

  return rows
})
