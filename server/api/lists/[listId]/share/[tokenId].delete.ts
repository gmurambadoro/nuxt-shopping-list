// DELETE /api/lists/:listId/share/:tokenId
// Revokes a share token. Only the list owner can revoke.
//
// Response: { success: true }
// Auth: required (must own the list)
//
// Revocation deletes the share_tokens row. After deletion, any existing link
// will return 404 from the public GET /api/share/:token endpoint. There is
// no "reactivate" — the owner must generate a new token.
//
// The route receives the token's id (surrogate key), not the token value
// (bearer secret). This is intentional: the token value should never appear
// in a URL path where it could be logged by proxies or analytics.

import { useDb } from '#server/db'
import { shareTokens, lists } from '#server/db/schema'
import { eq, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)

  const listId = getRouterParam(event, 'listId')
  const tokenId = getRouterParam(event, 'tokenId')
  const db = useDb()

  const [list] = await db.select()
    .from(lists)
    .where(and(eq(lists.id, listId!), eq(lists.userId, user.id)))
  if (!list) {
    throw createError({ statusCode: 404, statusMessage: 'List not found' })
  }

  const [token] = await db.select()
    .from(shareTokens)
    .where(and(eq(shareTokens.id, tokenId!), eq(shareTokens.listId, listId!)))
  if (!token) {
    throw createError({ statusCode: 404, statusMessage: 'Share token not found' })
  }

  await db.delete(shareTokens).where(eq(shareTokens.id, tokenId!))
  return { success: true }
})
