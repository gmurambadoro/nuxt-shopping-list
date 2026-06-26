// DELETE /api/lists/:listId/items/:itemId
// Removes an item from a list. Only the list owner can delete items.
//
// Response: { success: true }
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

  // Verify list ownership before operating on items
  const [list] = await db.select()
    .from(lists)
    .where(and(eq(lists.id, listId!), eq(lists.userId, user.id)))
  if (!list) {
    throw createError({ statusCode: 404, statusMessage: 'List not found' })
  }

  // Verify the item exists and belongs to the expected list
  const [item] = await db.select()
    .from(items)
    .where(eq(items.id, itemId!))
  if (!item || item.listId !== listId) {
    throw createError({ statusCode: 404, statusMessage: 'Item not found' })
  }

  await db.delete(items).where(eq(items.id, itemId!))

  broadcastToList(listId!, 'item-removed', { itemId: itemId!, removedBy: user.name })

  return { success: true }
})
