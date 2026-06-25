import { useDb } from '../../db'
import { lists } from '../../db/schema'
import { eq, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)

  const listId = getRouterParam(event, 'listId')
  const db = useDb()

  const [list] = await db.select()
    .from(lists)
    .where(and(eq(lists.id, listId!), eq(lists.userId, user.id)))

  if (!list) {
    throw createError({ statusCode: 404, statusMessage: 'List not found' })
  }

  await db.delete(lists).where(eq(lists.id, listId!))
  return { success: true }
})
