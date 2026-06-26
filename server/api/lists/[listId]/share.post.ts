// POST /api/lists/:listId/share
// Generates a new share token for a list. Only the list owner can share.
//
// Body: { role?: 'viewer' | 'editor', email?: string }
// Response: ShareToken
// Auth: required (must own the list)
//
// Both the token value and the row id are random UUIDs. Using a separate id
// (surrogate key) for the primary key keeps the token free to be re-generated
// without cascading FK changes. The token field has a UNIQUE constraint so
// accidental collisions are rejected at the DB level.
//
// The email field is optional and reserved for future use (Phase 6 email
// invitations). When present it allows associating a share link with a
// specific recipient, but the link is still usable by anyone who has it.

import { useDb } from '#server/db'
import { shareTokens, lists } from '#server/db/schema'
import { eq, and } from 'drizzle-orm'
import { sendShareInviteEmail } from '#server/utils/email'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)

  const listId = getRouterParam(event, 'listId')
  const body = await readBody<{ role?: 'viewer' | 'editor'; email?: string }>(event)

  const db = useDb()

  const [list] = await db.select()
    .from(lists)
    .where(and(eq(lists.id, listId!), eq(lists.userId, user.id)))
  if (!list) {
    throw createError({ statusCode: 404, statusMessage: 'List not found' })
  }

  const id = crypto.randomUUID()
  const token = crypto.randomUUID()
  const now = new Date().toISOString()

  await db.insert(shareTokens).values({
    id,
    listId: listId!,
    token,
    role: body.role ?? 'viewer',
    email: body.email ?? null,
    createdBy: user.id,
    createdAt: now,
  })

  // Re-select the created row so we return the full object (including any
  // defaults the DB applied) rather than reconstructing it from memory.
  const [created] = await db.select().from(shareTokens).where(eq(shareTokens.id, id))

  // Fire-and-forget share invite email when an email address is provided.
  if (body.email) {
    const origin = getRequestProtocol(event) + '://' + getRequestHost(event)
    const shareUrl = `${origin}/share/${token}`
    sendShareInviteEmail({
      email: body.email,
      inviterName: user.name,
      listName: list.name,
      shareUrl,
    })
  }

  return created
})
