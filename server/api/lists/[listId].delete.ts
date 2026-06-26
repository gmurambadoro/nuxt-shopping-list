// DELETE /api/lists/:listId
// Deletes a list and all its items (cascade delete via FK constraint).
// Only the list owner can delete it.
//
// Response: { success: true }
// Auth: required — throws 401 if no valid session
// Errors:
//   404 — list not found or does not belong to the user

import { useDb } from '#server/db'
import { lists } from '#server/db/schema'
import { eq, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)

  const listId = getRouterParam(event, 'listId')
  const db = useDb()

  // Verify both that the list exists AND that it belongs to the user.
  // This is done in a single query using and().
  const [list] = await db.select()
    .from(lists)
    .where(and(eq(lists.id, listId!), eq(lists.userId, user.id)))

  if (!list) {
    // Deliberately return 404 rather than 403 to avoid leaking whether
    // the list exists but belongs to someone else.
    throw createError({ statusCode: 404, statusMessage: 'List not found' })
  }

  // Items are cascade-deleted by the FK constraint in the schema
  await db.delete(lists).where(eq(lists.id, listId!))
  return { success: true }
})
