// GET /api/share/:token
// Returns a shared list by its share token. No authentication required —
// the token itself is the authorisation. The list is read-only unless the
// token grants 'editor' access.
//
// Response: { list: ShoppingList, role: 'viewer' | 'editor' }
// Auth: none (token-based)
// Errors:
//   404 — token not found or revoked
//
// This is a "public" endpoint — it does not call requireUserSession().
// Instead, the share token acts as a capability URL: whoever has the link
// can view the list. This is the same model Google Docs and Notion use for
// "Anyone with the link can view" sharing.
//
// The role is returned alongside the list so the frontend can decide whether
// to show edit controls (editors) or just display the data (viewers).

import { useDb } from '#server/db'
import { shareTokens, lists, items } from '#server/db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const tokenParam = getRouterParam(event, 'token')
  const db = useDb()

  const [token] = await db.select()
    .from(shareTokens)
    .where(eq(shareTokens.token, tokenParam!))
  if (!token) {
    throw createError({ statusCode: 404, statusMessage: 'Share link not found or expired' })
  }

  const [list] = await db.select()
    .from(lists)
    .where(eq(lists.id, token.listId))
  if (!list) {
    throw createError({ statusCode: 404, statusMessage: 'List not found' })
  }

  const itemRows = await db.select()
    .from(items)
    .where(eq(items.listId, token.listId))
    .orderBy(items.createdAt)

  return {
    list: { ...list, items: itemRows },
    role: token.role,
  }
})
