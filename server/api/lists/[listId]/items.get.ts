import { useDb } from '../../../db'
import { items } from '../../../db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const listId = getRouterParam(event, 'listId')

  const db = useDb()
  const rows = await db.select()
    .from(items)
    .where(eq(items.listId, listId!))
    .orderBy(items.createdAt)

  return rows
})
