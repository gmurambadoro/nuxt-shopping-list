# Phase 3 — Learning Outcome Step 14: Connecting the Frontend to the API

## Concepts covered

### `useAsyncData` for fetching data
`useAsyncData` is Nuxt's composable for fetching data that needs to be available
during SSR. It has three key behaviours:

1. **SSR rendering** — the fetch runs on the server during the initial request,
   and the result is serialised into the HTML payload. The client hydrates from
   this data without making an extra API call.
2. **Deduplication** — the string key (`'shopping-lists'`) prevents duplicate
   requests. If two components call `useAsyncData('shopping-lists', ...)` during
   the same render, only one HTTP request is sent.
3. **Caching** — during client-side navigation, the result is cached by key
   and reused until the page is hard-refreshed or `refresh()` is called.

```ts
const { data, refresh, pending } = useAsyncData<ShoppingList[]>('shopping-lists', () =>
  $fetch('/api/lists')
)
```

### `$fetch` for mutations
`$fetch` (which wraps `ofetch`) is a plain HTTP client with no SSR awareness
or caching. Use it for all mutations (POST, PATCH, DELETE):

```ts
await $fetch(`/api/lists/${listId}/items/${itemId}`, { method: 'PATCH' })
await $fetch('/api/lists', { method: 'POST', body: { name } })
await $fetch(`/api/lists/${listId}`, { method: 'DELETE' })
```

### `useFetch` vs `$fetch` — when to use each

| | `useAsyncData` + `$fetch` | `$fetch` alone |
|---|---|---|
| SSR | ✅ Data available during server render | ❌ Runs only on client |
| Caching | ✅ Deduplicates, caches by key | ❌ No caching |
| Best for | **Reading** data (GET requests) | **Writing** data (POST/PATCH/DELETE) |

`useFetch` is syntactic sugar for `useAsyncData` + `$fetch`. The two are
interchangeable:

```ts
// These are equivalent:
const { data } = useFetch('/api/lists')
const { data } = useAsyncData(() => $fetch('/api/lists'))
```

### Optimistic local updates
After a mutation, the composable updates the local `data` ref directly rather
than re-fetching the entire list:

```ts
async function toggleItem(listId: string, itemId: string) {
  const updated = await $fetch(`/api/lists/${listId}/items/${itemId}`, { method: 'PATCH' })
  // Patch the cached data so the UI responds instantly
  if (data.value) {
    const item = data.value.flatMap(l => l.items).find(i => i.id === itemId)
    if (item) item.purchased = updated.purchased
  }
}
```

This avoids a full re-fetch after every small action, making the UI feel
snappy. The server response is the source of truth — the local update mirrors
what the server confirmed.

### Flat array iteration with `flatMap`
When items are nested inside lists, `flatMap` is a clean way to search across
all lists without a nested loop:

```ts
const item = data.value.flatMap(l => l.items).find(i => i.id === itemId)
```

This flattens all lists' items into one array, then finds the matching one.

### Loading state with `pending`
`useAsyncData` returns a `pending` ref that is `true` while the fetch is
in flight. The page uses this to show a loading indicator:

```html
<div v-if="pending" class="...">Loading lists…</div>
<div v-else class="..."> <!-- lists --> </div>
```

### Async composables
Mutation functions are now `async`. The composable returns async functions
that the page calls without `await` (the operation completes in the
background and the UI updates optimistically). If error handling is needed,
each mutation should be wrapped in try/catch.

### Removing localStorage
Since the server is now the source of truth, localStorage persistence has
been removed. The composable no longer needs `import.meta.client` guards
or `watch` for persistence.
