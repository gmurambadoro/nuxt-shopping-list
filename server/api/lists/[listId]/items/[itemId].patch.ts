import { useDb } from '../../../../db'
import { items } from '../../../../db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const listId = getRouterParam(event, 'listId')
  const itemId = getRouterParam(event, 'itemId')

  const db = useDb()

  const [item] = await db.select()
    .from(items)
    .where(eq(items.id, itemId!))

  if (!item || item.listId !== listId) {
    throw createError({ statusCode: 404, statusMessage: 'Item not found' })
  }

  await db.update(items)
    .set({ purchased: !item.purchased })
    .where(eq(items.id, itemId!))

  const [updated] = await db.select().from(items).where(eq(items.id, itemId!))
  return updated
})
