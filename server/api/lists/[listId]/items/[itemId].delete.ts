import { useDb } from '../../../../db'
import { items, lists } from '../../../../db/schema'
import { eq, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)

  const listId = getRouterParam(event, 'listId')
  const itemId = getRouterParam(event, 'itemId')
  const db = useDb()

  // Verify the list belongs to the user
  const [list] = await db.select()
    .from(lists)
    .where(and(eq(lists.id, listId!), eq(lists.userId, user.id)))
  if (!list) {
    throw createError({ statusCode: 404, statusMessage: 'List not found' })
  }

  const [item] = await db.select()
    .from(items)
    .where(eq(items.id, itemId!))
  if (!item || item.listId !== listId) {
    throw createError({ statusCode: 404, statusMessage: 'Item not found' })
  }

  await db.delete(items).where(eq(items.id, itemId!))
  return { success: true }
})
