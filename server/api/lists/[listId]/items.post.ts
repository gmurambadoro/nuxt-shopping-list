import { useDb } from '../../../db'
import { items, lists } from '../../../db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const listId = getRouterParam(event, 'listId')
  const body = await readBody<{ name: string }>(event)

  if (!body.name?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Item name is required' })
  }

  const db = useDb()

  // Verify the list exists
  const [list] = await db.select().from(lists).where(eq(lists.id, listId!))
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
  return item
})
