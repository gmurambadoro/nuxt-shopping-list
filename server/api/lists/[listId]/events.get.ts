// GET /api/lists/:listId/events
// Server-Sent Events endpoint for real-time list updates.
// Keeps the connection open and pushes events when items change.
//
// Auth: required (must own the list)
// Response: SSE stream

import { createEventStream } from 'h3'
import { useDb } from '#server/db'
import { lists } from '#server/db/schema'
import { eq, and } from 'drizzle-orm'
import { subscribeToList } from '#server/utils/sse'

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

  const eventStream = createEventStream(event)

  const unsubscribe = subscribeToList(listId!, (msg) => {
    eventStream.push({ event: msg.event, data: JSON.stringify(msg.data) })
  })

  eventStream.onClosed(() => {
    unsubscribe()
  })

  return eventStream.send()
})
