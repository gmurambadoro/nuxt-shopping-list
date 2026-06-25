<script setup lang="ts">
import type { ShoppingList } from '~/shared/types'

useHead({
  title: 'My Shopping Lists — ShopList'
})

const lists = ref<ShoppingList[]>([
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
])

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
</script>

<template>
  <div>
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">My Shopping Lists</h1>
      <p class="text-gray-500 mt-1">{{ lists.length }} lists</p>
    </div>

    <div class="space-y-6">
      <ShoppingList
        v-for="list in lists"
        :key="list.id"
        :list="list"
        @toggle-item="toggleItem(list.id, $event)"
        @remove-item="removeItem(list.id, $event)"
        @add-item="addItem(list.id, $event)"
      />
    </div>
  </div>
</template>
