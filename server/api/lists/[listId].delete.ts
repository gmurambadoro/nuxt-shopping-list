import { useDb } from '../../db'
import { lists } from '../../db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const listId = getRouterParam(event, 'listId')
  const db = useDb()

  const [list] = await db.select().from(lists).where(eq(lists.id, listId!))
  if (!list) {
    throw createError({ statusCode: 404, statusMessage: 'List not found' })
  }

  // Items cascade-delete automatically via the FK constraint in schema.ts
  await db.delete(lists).where(eq(lists.id, listId!))

  return { success: true }
})
