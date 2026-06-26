import type { ShoppingList, ShoppingItem } from '#shared/types'

export function useShoppingLists() {
  // useAsyncData fetches data on the server during SSR and on the client during
  // navigation. The key 'shopping-lists' deduplicates concurrent calls within the
  // same request — calling useShoppingLists() twice won't send two HTTP requests.
  //
  // server: false — During SSR, internal $fetch calls don't forward the session
  // cookie, so the /api/lists handler's requireUserSession() would return 401.
  // By disabling server-side fetching, the data is always fetched on the client
  // where the browser's native fetch includes the cookie correctly.
  // pending starts as true on the client, avoiding a flash of empty content.
  const { data, refresh, pending } = useAsyncData<ShoppingList[]>('shopping-lists', () =>
    $fetch('/api/lists'),
    { server: false }
  )

  // Provide a non-null array for the template even while data is loading
  const lists = computed<ShoppingList[]>(() => data.value ?? [])

  // loading is active while the client fetch is in flight or hasn't started yet
  const loading = computed(() => pending.value || data.value === null)

  // ── Mutations ────────────────────────────────────────────────────────
  // Every mutation calls the API with $fetch (for writes), then patches the
  // local data so the UI responds immediately without a full re-fetch.

  async function toggleItem(listId: string, itemId: string) {
    const updated = await $fetch<Pick<ShoppingItem, 'purchased'>>(
      `/api/lists/${listId}/items/${itemId}`,
      { method: 'PATCH' }
    )
    if (data.value) {
      const item = data.value
        .flatMap(l => l.items)
        .find(i => i.id === itemId)
      if (item) item.purchased = updated.purchased
    }
  }

  async function removeItem(listId: string, itemId: string) {
    await $fetch(`/api/lists/${listId}/items/${itemId}`, { method: 'DELETE' })
    if (data.value) {
      const list = data.value.find(l => l.id === listId)
      if (list) list.items = list.items.filter(i => i.id !== itemId)
    }
  }

  async function addItem(listId: string, name: string) {
    const created = await $fetch<ShoppingItem>(`/api/lists/${listId}/items`, {
      method: 'POST',
      body: { name },
    })
    if (data.value) {
      const list = data.value.find(l => l.id === listId)
      if (list) list.items.push(created)
    }
  }

  async function addList(name: string) {
    const created = await $fetch<ShoppingList>('/api/lists', {
      method: 'POST',
      body: { name },
    })
    if (data.value) data.value.push(created)
  }

  async function removeList(listId: string) {
    await $fetch(`/api/lists/${listId}`, { method: 'DELETE' })
    if (data.value) data.value = data.value.filter(l => l.id !== listId)
  }

  async function clearPurchased(listId: string) {
    if (!data.value) return
    const list = data.value.find(l => l.id === listId)
    if (!list) return

    const purchased = list.items.filter(i => i.purchased)
    await Promise.all(purchased.map(item =>
      $fetch(`/api/lists/${listId}/items/${item.id}`, { method: 'DELETE' })
    ))
    list.items = list.items.filter(i => !i.purchased)
  }

  return {
    lists,
    loading,
    pending,
    refresh,
    toggleItem,
    removeItem,
    addItem,
    addList,
    removeList,
    clearPurchased,
  }
}
