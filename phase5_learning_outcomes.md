# Phase 5 — Learning Outcomes: Sharing & Capability URLs

## Concepts covered

### Share tokens as capability URLs
A share token is a random UUID that acts as a **capability URL** (also called
a "magic link"). Whoever possesses the URL can access the shared resource,
regardless of whether they have an account.

```
https://example.com/share/550e8400-e29b-41d4-a716-446655440000
```

Key properties:
- **No authentication required** — the token *is* the authorisation.
- **Practically unguessable** — `crypto.randomUUID()` generates 122 bits of
  randomness (UUID v4), making brute-force infeasible.
- **Revocable** — deleting the token from the database immediately invalidates
  the link (no cache to worry about).
- **Self-contained** — no need to look up who the user is; just verify the
  token exists in the `share_tokens` table.

This is the same model used by Google Docs, Notion, and GitHub Gists for
"Anyone with the link" sharing.

### Surrogate key vs token value
The `share_tokens` table has two UUID columns:

| Column | Purpose | Exposed to users? |
|---|---|---|
| `id` | Surrogate primary key (FK target) | No — used only in DB joins and management |
| `token` | Bearer secret (the actual share link) | Yes — appears in URLs |

Keeping them separate means:
- The token value can be regenerated without cascading FK references.
- Management operations (list, revoke) use the stable `id`, not the secret.
- The `token` column has a UNIQUE constraint to catch accidental collisions.

### Role-based access: viewer vs editor
Share tokens carry a `role` field with two levels:

| Role | Can view? | Can edit? |
|---|---|---|
| `viewer` | Yes | No |
| `editor` | Yes | Yes |

The role is stored in the `share_tokens` table and returned by the public API
endpoint (`GET /api/share/:token`) alongside the list data. The frontend uses
it to conditionally render edit controls.

Currently the editor role is not enforced server-side — the [share/[token].vue]
page is read-only regardless. Full permission enforcement (checking the token
role in mutation endpoints) is a future enhancement (see Next Steps).

### Public API endpoint
`GET /api/share/:token` is a **public endpoint** — it does not call
`requireUserSession()`. Instead it looks up the token and returns the
associated list:

```ts
const [token] = await db.select()
  .from(shareTokens)
  .where(eq(shareTokens.token, tokenParam!))
if (!token) throw createError({ statusCode: 404, statusMessage: 'Share link not found or expired' })
```

Because this endpoint is public, it must not leak information. Returning 404
for an invalid token tells the attacker nothing beyond "this token doesn't
work" — not whether it was ever valid, whose list it was, etc.

### Ownership checks on management endpoints
The token management endpoints (`GET`, `POST`, `DELETE` under
`/api/lists/:listId/share`) require authentication and ownership. The ownership
check follows the same pattern as Phase 4:

```ts
const [list] = await db.select()
  .from(lists)
  .where(and(eq(lists.id, listId!), eq(lists.userId, user.id)))
if (!list) throw createError({ statusCode: 404, statusMessage: 'List not found' })
```

The revoke endpoint also verifies the token belongs to the expected list:

```ts
const [token] = await db.select()
  .from(shareTokens)
  .where(and(eq(shareTokens.id, tokenId!), eq(shareTokens.listId, listId!)))
if (!token) throw createError({ statusCode: 404, statusMessage: 'Share token not found' })
```

### `defineExpose` for imperative child control
`ShareModal.vue` uses `defineExpose({ open })` to expose an `open()` method
to the parent component. The parent gets a typed ref:

```vue
<script setup lang="ts">
const shareModal = ref<InstanceType<typeof ShareModal>>()
</script>
<template>
  <ShareModal ref="shareModal" :list-id="list.id" />
  <button @click="shareModal?.open()">Share</button>
</template>
```

This pattern is useful when:
- The child manages its own internal state (visibility, loading, error).
- The parent only needs a trigger, not a boolean toggle.
- Multiple triggers might call the same method (e.g. a button in the header
  and a keyboard shortcut).

### `Teleport` for modals
The modal overlay uses `<Teleport to="body">` to render outside the parent's
DOM tree:

```vue
<Teleport to="body">
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center">
    <!-- modal content -->
  </div>
</Teleport>
```

This prevents CSS stacking context issues (e.g. `overflow: hidden`,
`transform`, `z-index` on parent elements) from clipping or misplacing the
modal overlay.

### The model: tokens as bearer secrets
Share tokens are **bearer tokens** — possession is sufficient for access.
This means:
- Anyone with the link can view the list (no login required).
- Links should be shared only over trusted channels (email, Slack, etc.).
- There is no rate limiting, IP checking, or expiry on tokens (yet).
- Revocation is permanent — deleted tokens cannot be restored.

### `useFetch` for data fetching on public pages
The shared list page uses `useFetch` at the top level of `<script setup>`:

```ts
const { data, error } = await useFetch(`/api/share/${token}`)
const list = computed<ShoppingList | null>(() => data.value?.list ?? null)
```

Benefits:
- **SSR support** — Nuxt fetches the data on the server and includes it in
  the initial HTML payload.
- **Loading state** — `data` is `null` while the request is in flight; the
  template shows a loading message.
- **Error state** — `error` is populated on failure; the template shows a
  friendly error message.
- **No deduplication needed** — `useFetch` is scoped to the page and runs
  once per navigation.

### `crypto.randomUUID()`
Available in both Node.js and modern browsers. Returns a version 4 (random)
UUID. Used to generate:
- Share token values (bearer secrets)
- Share token row IDs (surrogate keys)

For production with very high traffic, consider `nanoid` or a dedicated ID
service for smaller, URL-safe identifiers.

## Files created/modified

| File | What it does |
|---|---|
| `server/api/lists/[listId]/share.get.ts` | List all share tokens for a list (owner only) |
| `server/api/lists/[listId]/share.post.ts` | Generate a new share token (owner only) |
| `server/api/lists/[listId]/share/[tokenId].delete.ts` | Revoke a share token (owner only) |
| `server/api/share/[token].get.ts` | Public endpoint — view a shared list by token |
| `app/components/ShareModal.vue` | Modal UI for managing share tokens |
| `app/pages/share/[token].vue` | Public page — view a shared list |
| `server/db/schema.ts` | Added `share_tokens` table |
| `shared/types/index.ts` | Added `ShareToken` interface |

## Next Steps

- **Permission enforcement in API routes** — check the token's role in item
  mutation endpoints (add/remove/toggle) so `editor` access actually works.
- **Email notifications** (Phase 6) — send an email when a token is created,
  with the share link and the list name.
- **Real-time updates** (Phase 7) — use SSE to push changes to shared viewers
  so multiple people see updates without refreshing.
- **Optional expiry** — add an `expiresAt` column to `share_tokens` for
  time-limited sharing.
