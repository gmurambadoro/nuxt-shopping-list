// PATCH /api/lists/:listId/items/:itemId
// Toggles the purchased state of an item (false → true, true → false).
// Only the list owner can toggle items.
//
// Response: Item (with updated purchased field)
// Auth: required — throws 401 if no valid session
// Errors:
//   404 — list not found, or item not found, or item does not belong to the list

import { useDb } from '#server/db'
import { items, lists } from '#server/db/schema'
import { eq, and } from 'drizzle-orm'
import { broadcastToList } from '#server/utils/sse'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)

  const listId = getRouterParam(event, 'listId')
  const itemId = getRouterParam(event, 'itemId')
  const db = useDb()

  // Verify list ownership
  const [list] = await db.select()
    .from(lists)
    .where(and(eq(lists.id, listId!), eq(lists.userId, user.id)))
  if (!list) {
    throw createError({ statusCode: 404, statusMessage: 'List not found' })
  }

  // Verify item exists and belongs to this list
  const [item] = await db.select()
    .from(items)
    .where(eq(items.id, itemId!))
  if (!item || item.listId !== listId) {
    throw createError({ statusCode: 404, statusMessage: 'Item not found' })
  }

  // Toggle the purchased boolean — Drizzle maps 0/1 in SQLite to false/true
  await db.update(items)
    .set({ purchased: !item.purchased })
    .where(eq(items.id, itemId!))

  // Return the updated row so the client can update its local state
  const [updated] = await db.select().from(items).where(eq(items.id, itemId!))

  broadcastToList(listId!, 'item-updated', { item: updated, updatedBy: user.name })

  return updated
})
