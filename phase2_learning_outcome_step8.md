# Learning Outcomes — Step 8: Persisting State to localStorage

## Concepts covered

### `watch(source, callback, options)`
Watches a reactive value and runs a callback whenever it changes.

```ts
watch(lists, (updatedLists) => saveToStorage(updatedLists), { deep: true })
```

Without `{ deep: true }`, Vue only watches the reference itself — replacing the
array triggers it, but mutating a nested property like `item.purchased` would not.
`deep: true` makes Vue traverse the full object tree and react to any nested change.

### `import.meta.client`
Nuxt's SSR-safe guard for browser-only code. `localStorage` does not exist on the
server — calling it during SSR would throw a `ReferenceError` at runtime.

```ts
if (!import.meta.client) return seedLists
```

`import.meta.client` is `true` only in the browser and `false` during server-side
rendering. Use `import.meta.server` for the reverse case. Always guard any Web API
that is not available in a Node/Bun environment (localStorage, window, document,
navigator, etc.) behind one of these checks.

### Composables as a colocation pattern
A composable is a plain function that uses Vue's reactivity primitives (`ref`,
`computed`, `watch`, etc.) and returns state and actions together.

Moving all shopping list logic into `useShoppingLists` gave us:
- A single place to read, mutate, and persist list state
- A `index.vue` script block that shrank from 57 lines to 3
- Reusability — any page or component can call `useShoppingLists()` and get the
  same reactive state and actions without duplicating logic

### Auto-import of composables
Files in `app/composables/` are auto-imported by Nuxt. `useShoppingLists()` is
available in any component or page without an explicit `import` statement, just
like `ref`, `computed`, and `watch` themselves.

### Defensive JSON parsing
When reading from storage, always wrap `JSON.parse` in a try/catch. Stored data
can be corrupted, truncated, or written by an older version of the app that used
a different schema. Falling back to seed data keeps the app functional rather than
crashing on a parse error.
