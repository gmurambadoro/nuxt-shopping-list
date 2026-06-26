# Phase 7 — Learning Outcomes: Real-time Updates (SSE)

## Concepts covered

### Server-Sent Events (SSE)

SSE is a standard that allows a server to push events to a client over a
single HTTP connection. Unlike WebSockets (bidirectional), SSE is:

- **Unidirectional** — server → client only.
- **Text-based** — uses the `text/event-stream` content type.
- **Built on HTTP** — works with existing infrastructure (proxies, firewalls).
- **Auto-reconnecting** — the browser's `EventSource` API automatically
  reconnects if the connection drops.

### EventStream API in h3

Nuxt 4 uses h3 v1.15+, which includes `createEventStream`:

```ts
import { createEventStream } from 'h3'

const eventStream = createEventStream(event)
eventStream.push({ event: 'update', data: JSON.stringify(payload) })
eventStream.onClosed(() => { /* cleanup */ })
return eventStream.send()
```

- `createEventStream(event)` — creates an SSE stream from the H3 event.
- `eventStream.push(message)` — sends a named event with JSON data.
- `eventStream.onClosed(callback)` — registers a cleanup handler for when the
  client disconnects.
- `eventStream.send()` — returns the response (must be returned from the
  handler).

### In-process event broadcasting

Because SSE connections are long-lived HTTP requests within the same Nitro
process, an in-memory `EventEmitter` can broadcast between routes:

```
server/utils/sse.ts:
  subscribeToList(listId, callback)     → called by the SSE endpoint
  broadcastToList(listId, event, data)  → called by mutation routes
```

Flow:

```
User A (browser)          User B (browser)
       │                        │
       │ SSE /events            │ PATCH /items/:id
       ▼                        ▼
  events.get.ts           items/[id].patch.ts
       │                        │
       │ subscribeToList()      │ broadcastToList()
       │                        │
       ▼                        ▼
  ┌───────────────── EventEmitter ─────────────────┐
  │              (in-process, per-list)             │
  └────────────────────────────────────────────────┘
       │
       │ push({ event: 'item-updated', data: {...} })
       ▼
  User A's browser receives the event
```

### EventSource on the frontend

The browser's `EventSource` API connects to an SSE endpoint:

```ts
const source = new EventSource('/api/lists/my-list-id/events')

source.addEventListener('item-updated', (e) => {
  const data = JSON.parse(e.data)
  // data.item, data.updatedBy
})
```

Key points:
- The session cookie is sent automatically (same-origin).
- `EventSource` does **not** support custom headers or POST — only GET.
- Auto-reconnects on error; the browser tracks the last event ID and sends
  it in the `Last-Event-ID` header on reconnection.

### Live update indicators

The `ShoppingList` component shows a flash banner for 4 seconds when a
real-time event arrives:

```
┌─────────────────────────────────────────────┐
│   Alice crossed off "Milk"                  │  ← indigo flash banner
├─────────────────────────────────────────────┤
│ [ ] Bread                                   │
│ [✓] Milk                                    │
└─────────────────────────────────────────────┘
```

The composable `useListEvents` manages the `EventSource` lifecycle
(connect on mount, disconnect on unmount), and the component watches
its `latestEvent` ref to update the flash message.

## Files changed/added

| File | Change |
|---|---|
| `server/utils/sse.ts` | **New** — EventEmitter broadcast hub |
| `server/api/lists/[listId]/events.get.ts` | **New** — SSE endpoint |
| `server/api/lists/[listId]/items.post.ts` | Broadcasts `item-added` |
| `server/api/lists/[listId]/items/[itemId].patch.ts` | Broadcasts `item-updated` |
| `server/api/lists/[listId]/items/[itemId].delete.ts` | Broadcasts `item-removed` |
| `app/composables/useListEvents.ts` | **New** — Frontend SSE subscription |
| `app/components/ShoppingList.vue` | Flash message for real-time events |
