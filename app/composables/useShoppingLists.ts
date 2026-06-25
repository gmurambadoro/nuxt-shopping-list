import type { ShoppingList } from '~/shared/types'

const STORAGE_KEY = 'shopping-lists'

// Seed data shown on first load before the user creates their own lists
const seedLists: ShoppingList[] = [
  {
    id: '1',
    name: 'Weekly Groceries',
    createdAt: '2026-06-20',
    items: [
      { id: '1', listId: '1', name: 'Whole milk (2L)',      purchased: true  },
      { id: '2', listId: '1', name: 'Sourdough bread',      purchased: true  },
      { id: '3', listId: '1', name: 'Free-range eggs (12)', purchased: false },
      { id: '4', listId: '1', name: 'Cheddar cheese',       purchased: false },
      { id: '5', listId: '1', name: 'Unsalted butter',      purchased: false },
    ],
  },
  {
    id: '2',
    name: 'BBQ Weekend',
    createdAt: '2026-06-22',
    items: [
      { id: '6',  listId: '2', name: 'Beef burgers (6 pack)', purchased: false },
      { id: '7',  listId: '2', name: 'Burger buns',           purchased: false },
      { id: '8',  listId: '2', name: 'Coleslaw',              purchased: false },
      { id: '9',  listId: '2', name: 'BBQ sauce',             purchased: true  },
      { id: '10', listId: '2', name: 'Charcoal',              purchased: false },
    ],
  },
]

function loadFromStorage(): ShoppingList[] {
  // localStorage is only available in the browser, not on the server.
  // import.meta.client is Nuxt's SSR-safe guard for browser-only code.
  if (!import.meta.client) return seedLists

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? (JSON.parse(stored) as ShoppingList[]) : seedLists
  }
  catch {
    return seedLists
  }
}

function saveToStorage(lists: ShoppingList[]): void {
  if (!import.meta.client) return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lists))
}

export function useShoppingLists() {
  const lists = ref<ShoppingList[]>(loadFromStorage())

  // Persist to localStorage whenever lists change (deep watches nested objects)
  watch(lists, (updatedLists) => saveToStorage(updatedLists), { deep: true })

  function toggleItem(listId: string, itemId: string) {
    const list = lists.value.find(list => list.id === listId)
    const item = list?.items.find(item => item.id === itemId)
    if (item) item.purchased = !item.purchased
  }

  function removeItem(listId: string, itemId: string) {
    const list = lists.value.find(list => list.id === listId)
    if (list) list.items = list.items.filter(item => item.id !== itemId)
  }

  function addItem(listId: string, name: string) {
    const list = lists.value.find(list => list.id === listId)
    if (list) {
      list.items.push({
        id: Date.now().toString(),
        listId,
        name,
        purchased: false,
      })
    }
  }

  function addList(name: string) {
    lists.value.push({
      id: Date.now().toString(),
      name,
      createdAt: new Date().toISOString().slice(0, 10),
      items: [],
    })
  }

  function removeList(listId: string) {
    lists.value = lists.value.filter(list => list.id !== listId)
  }

  return {
    lists,
    toggleItem,
    removeItem,
    addItem,
    addList,
    removeList,
  }
}
