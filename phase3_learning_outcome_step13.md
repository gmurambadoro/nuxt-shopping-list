# Phase 3 — Learning Outcome Step 13: Building API Routes with Nitro

## Concepts covered

### Nitro file-based routing
In Nuxt 4, server API routes live in `server/api/`. The file path determines
the URL path, and the file suffix determines the HTTP method.

| File | Route |
|---|---|
| `server/api/lists.get.ts` | `GET /api/lists` |
| `server/api/lists.post.ts` | `POST /api/lists` |
| `server/api/lists/[listId].delete.ts` | `DELETE /api/lists/:listId` |
| `server/api/lists/[listId]/items.get.ts` | `GET /api/lists/:listId/items` |
| `server/api/lists/[listId]/items.post.ts` | `POST /api/lists/:listId/items` |
| `server/api/lists/[listId]/items/[itemId].patch.ts` | `PATCH /api/lists/:listId/items/:itemId` |

The `.get.ts`, `.post.ts`, `.delete.ts`, `.patch.ts` suffixes map directly
to HTTP verbs. Files without a method suffix (e.g. `items.ts`) handle all
methods and switch on `event.method` manually.

### `defineEventHandler`
Every Nitro route exports a default function wrapped in `defineEventHandler`.
The handler receives an `event` object (H3) with helpers for reading params,
body, query, headers, and cookies.

```ts
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const id = getRouterParam(event, 'listId')
})
```

### `getRouterParam` for dynamic segments
Dynamic route segments (`[listId]`, `[itemId]`) are extracted with
`getRouterParam(event, 'paramName')`. The return type is `string | null`,
so using the non-null assertion `!` is common when you know the param exists.

### `readBody` for request payloads
`readBody<T>(event)` reads and parses the request body as JSON. The type
parameter is purely for TypeScript — no runtime validation happens. Always
validate input manually before using it.

```ts
const body = await readBody<{ name: string }>(event)
if (!body.name?.trim()) throw createError({ statusCode: 400 })
```

### `createError` for structured error responses
`createError` returns a proper HTTP error response with status code and
message. Without it, throwing a plain `Error` results in a generic 500.

```ts
throw createError({ statusCode: 404, statusMessage: 'List not found' })
```

### Relative imports in server code
In Nitro, `~/` in the `server/` directory resolves to the project root
in Nuxt 3, but to `app/` in Nuxt 4. Use relative imports instead:

```
server/api/
├── lists.get.ts                       → '../db'
├── lists.post.ts                      → '../db'
├── lists/[listId].delete.ts           → '../../db'
├── lists/[listId]/items.get.ts        → '../../../db'
├── lists/[listId]/items.post.ts       → '../../../db'
├── lists/[listId]/items/[itemId].patch.ts  → '../../../../db'
```

The pattern is: count the directory levels from `server/` to the file,
then use that many `../` followed by `db`.

### Drizzle queries in API routes
```ts
await db.select().from(lists).where(eq(lists.id, id))
await db.insert(lists).values({ id, name, createdAt: now, updatedAt: now })
await db.update(items).set({ purchased: true }).where(eq(items.id, itemId))
await db.delete(items).where(eq(items.id, itemId!))
```

Each method returns a promise. `select()` returns an array (always —
empty array if no match). `insert()`, `update()`, `delete()` return
metadata about affected rows.

### UUID generation with `crypto.randomUUID()`
Node 18+ and Bun provide `crypto.randomUUID()` natively — no dependency
needed. Generates v4 UUIDs in the format
`xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`.

### Cascade deletes at the database level
The foreign key in `items.listId` was defined with `{ onDelete: 'cascade' }`.
When a list is deleted, SQLite automatically deletes all its items. The
DELETE handler for lists only needs to delete the list itself:

```ts
await db.delete(lists).where(eq(lists.id, listId!))
// items are removed automatically by the database
```

This is more reliable than manually querying and deleting child rows in
application code.
