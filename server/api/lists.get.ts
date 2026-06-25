import { useDb } from '../db'
import { lists, items } from '../db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async () => {
  const db = useDb()

  // Fetch all lists ordered by creation date (newest first)
  const listRows = await db.select().from(lists).orderBy(lists.createdAt)

  // Fetch all items and group them by listId
  const itemRows = await db.select().from(items)
  const itemsByListId: Record<string, typeof itemRows> = {}
  for (const item of itemRows) {
    if (!itemsByListId[item.listId]) itemsByListId[item.listId] = []
    itemsByListId[item.listId].push(item)
  }

  // Merge items into their parent lists
  return listRows.map(list => ({
    ...list,
    items: itemsByListId[list.id] ?? [],
  }))
})
