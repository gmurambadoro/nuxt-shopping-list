// POST /api/lists/:listId/items
// Adds a new item to a specific list.
// Only the list owner can add items.
//
// Body: { name: string }
// Response: Item
// Auth: required — throws 401 if no valid session
// Errors:
//   400 — item name is required
//   404 — list not found or does not belong to the user

import { useDb } from '#server/db'
import { items, lists } from '#server/db/schema'
import { eq, and } from 'drizzle-orm'
import { broadcastToList } from '#server/utils/sse'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)

  const listId = getRouterParam(event, 'listId')
  const body = await readBody<{ name: string }>(event)

  if (!body.name?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Item name is required' })
  }

  const db = useDb()

  // Verify the list exists and belongs to the user
  const [list] = await db.select()
    .from(lists)
    .where(and(eq(lists.id, listId!), eq(lists.userId, user.id)))
  if (!list) {
    throw createError({ statusCode: 404, statusMessage: 'List not found' })
  }

  const id = crypto.randomUUID()
  const now = new Date().toISOString()

  await db.insert(items).values({
    id,
    listId: listId!,
    name: body.name.trim(),
    purchased: false,
    createdAt: now,
  })

  const [item] = await db.select().from(items).where(eq(items.id, id))

  broadcastToList(listId!, 'item-added', { item, addedBy: user.name })

  return item
})
