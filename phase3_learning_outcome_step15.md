# Phase 3 — Learning Outcome Step 15: useAsyncData vs useFetch vs $fetch

## The three tools

Nuxt provides three ways to make HTTP requests. Each serves a different purpose.

| Tool | SSR | Caching | Best for |
|---|---|---|---|
| `$fetch` | ❌ Client only | ❌ None | Mutations (POST, PATCH, DELETE) |
| `useFetch` | ✅ Server + client | ✅ Deduplicates + caches | Simple data fetching |
| `useAsyncData` | ✅ Server + client | ✅ Deduplicates + caches | Data fetching with custom logic |

---

## `$fetch` — the raw HTTP client

`$fetch` is a thin wrapper around `ofetch` (a fetch-like API with JSON parsing,
error handling, and base URL support). It has no Nuxt integration — no SSR
serialisation, no caching, no deduplication.

```ts
const data = await $fetch('/api/lists')               // GET (default)
const created = await $fetch('/api/lists', {            // POST
  method: 'POST',
  body: { name: 'Groceries' },
})
await $fetch(`/api/lists/${id}`, { method: 'DELETE' })  // DELETE
```

Use `$fetch` for **writes** — anything that creates, updates, or deletes
resources. These happen on the client after the page has already rendered,
so SSR doesn't matter.

## `useFetch` — fetch with Nuxt integration

`useFetch` is syntactic sugar for `useAsyncData` + `$fetch`:

```ts
// These are identical
const { data, pending, error, refresh } = useFetch('/api/lists')
const { data, pending, error, refresh } = useAsyncData(() => $fetch('/api/lists'))
```

Key behaviours:
- **SSR** — the fetch runs on the server, and the result ships as part of the
  HTML payload. The client reuses this data. No extra client-side request.
- **Deduplication** — if two components call `useFetch('/api/lists')` during
  the same render, only one HTTP request is sent. Both receive the same data.
- **Caching** — the result is cached in Nuxt's payload cache by URL + params.
  Client-side navigation reuses the cache unless `refresh()` is called.
- **Auto-keying** — the URL is used as the cache key automatically.

```ts
const { data: lists, pending, refresh } = useFetch('/api/lists')
```

Use `useFetch` for **reads** — data you need during SSR and want cached.

## `useAsyncData` — the general-purpose SSR data composable

`useAsyncData` is the lower-level composable that powers `useFetch`. It accepts
any async function, not just an HTTP call. Use it when you need to:
- Combine multiple API calls into one response
- Transform data before storing it
- Use a custom fetcher (e.g. a database query)

```ts
const { data, pending, error, refresh } = useAsyncData('lists', async () => {
  const [lists, items] = await Promise.all([
    $fetch('/api/lists'),
    $fetch('/api/items'),
  ])
  return mergeListsWithItems(lists, items)
})
```

The string key (`'lists'`) is required for deduplication. Without it, every
call creates a separate cache entry.

## When to use each — decision flow

```
Is this a mutation? (POST / PATCH / DELETE)
  └── Yes →  $fetch
  └── No  →  Does the fetch need custom logic?
                └── Yes →  useAsyncData
                └── No  →  useFetch
```

## What they share in common

All three return data that needs to be accessed within a `<script setup>`
context. They cannot be used in lifecycle hooks like `onMounted` directly
unless wrapped in another composable called from setup.

Both `useFetch` and `useAsyncData` return:

| Property | Type | Description |
|---|---|---|
| `data` | `Ref<T \| null>` | The resolved data, `null` before first fetch |
| `pending` | `Ref<boolean>` | `true` while the fetch is in flight |
| `error` | `Ref<Error \| null>` | Populated if the fetch throws |
| `refresh` | `Function` | Re-executes the fetch |

## The pattern used in this project

```ts
// useShoppingLists.ts — reads via useAsyncData, writes via $fetch
const { data, refresh, pending } = useAsyncData('shopping-lists', () =>
  $fetch('/api/lists')
)

async function addList(name: string) {
  const created = await $fetch('/api/lists', { method: 'POST', body: { name } })
  // Optimistic local update — no re-fetch needed
  if (data.value) data.value.push(created)
}
```

This keeps the initial page load SSR-friendly while mutations are lightweight
client-side operations.
