// GET /api/lists/:listId/share
// Returns all share tokens for a list. Only the list owner can view them.
//
// Response: ShareToken[]
// Auth: required (must own the list)
//
// The ownership check uses a compound WHERE clause (listId + userId) so that
// returning 404 does not leak whether the list exists — it only tells the
// caller they cannot see it. This is a security practice known as "return
// 404 on forbidden" to avoid information disclosure.
//
// The share token itself is a random UUID. UUIDs are used because they are
// easy to generate (crypto.randomUUID()), require no sequential counter, and
// are practically unguessable when random. They serve as bearer tokens —
// possession of the URL is sufficient to access the list.

import { useDb } from '#server/db'
import { shareTokens, lists } from '#server/db/schema'
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

  const tokens = await db.select()
    .from(shareTokens)
    .where(eq(shareTokens.listId, listId!))

  return tokens
})
