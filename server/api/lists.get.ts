// GET /api/lists
// Returns all shopping lists belonging to the authenticated user,
// with each list's items embedded.
//
// Response: Array<{ id, userId, name, createdAt, updatedAt, items: Item[] }>
// Auth: required — throws 401 if no valid session

import { useDb } from '../db'
import { lists, items } from '../db/schema'
import { eq, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)

  const db = useDb()

  // Fetch only the authenticated user's lists
  const listRows = await db.select()
    .from(lists)
    .where(eq(lists.userId, user.id))
    .orderBy(lists.createdAt)

  // Fetch ALL items in one query, then group by listId in memory.
  // This is more efficient than N+1 queries (one per list).
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
