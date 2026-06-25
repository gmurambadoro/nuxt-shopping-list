import { useDb } from '../db'
import { lists, items } from '../db/schema'
import { eq, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)

  const db = useDb()

  const listRows = await db.select()
    .from(lists)
    .where(eq(lists.userId, user.id))
    .orderBy(lists.createdAt)

  const itemRows = await db.select().from(items)
  const itemsByListId: Record<string, typeof itemRows> = {}
  for (const item of itemRows) {
    if (!itemsByListId[item.listId]) itemsByListId[item.listId] = []
    itemsByListId[item.listId].push(item)
  }

  return listRows.map(list => ({
    ...list,
    items: itemsByListId[list.id] ?? [],
  }))
})
