<script setup lang="ts">
import type { ShoppingItem } from '~/shared/types'

useHead({
  title: 'My Shopping Lists — ShopList'
})

const lists = [
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
    ] satisfies ShoppingItem[],
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
    ] satisfies ShoppingItem[],
  },
]

function progress(items: ShoppingItem[]) {
  const done = items.filter(i => i.purchased).length
  return { done, total: items.length, pct: Math.round((done / items.length) * 100) }
}
</script>

<template>
  <div>
    <!-- Page header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">My Shopping Lists</h1>
      <p class="text-gray-500 mt-1">{{ lists.length }} lists</p>
    </div>

    <!-- Lists -->
    <div class="space-y-6">
      <div
        v-for="list in lists"
        :key="list.id"
        class="bg-white rounded-xl border border-gray-200 overflow-hidden"
      >
        <!-- List header -->
        <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 class="font-semibold text-gray-900">{{ list.name }}</h2>
            <p class="text-xs text-gray-400 mt-0.5">Created {{ list.createdAt }}</p>
          </div>
          <!-- Progress badge -->
          <span class="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
            {{ progress(list.items).done }}/{{ progress(list.items).total }} done
          </span>
        </div>

        <!-- Progress bar -->
        <div class="h-1 bg-gray-100">
          <div
            class="h-1 bg-green-500 transition-all duration-300"
            :style="{ width: progress(list.items).pct + '%' }"
          />
        </div>

        <!-- Items -->
        <ul class="divide-y divide-gray-100">
          <li
            v-for="item in list.items"
            :key="item.id"
            class="flex items-center gap-3 px-5 py-3"
          >
            <!-- Checkbox (visual only for now) -->
            <div
              class="w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors"
              :class="item.purchased
                ? 'bg-green-500 border-green-500'
                : 'border-gray-300'"
            >
              <svg
                v-if="item.purchased"
                class="w-3 h-3 text-white"
                viewBox="0 0 12 12"
                fill="none"
              >
                <path d="M2 6l3 3 5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>

            <!-- Item name -->
            <span
              class="text-sm transition-colors"
              :class="item.purchased ? 'line-through text-gray-400' : 'text-gray-700'"
            >
              {{ item.name }}
            </span>
          </li>
        </ul>

        <!-- List footer -->
        <div class="px-5 py-3 bg-gray-50 border-t border-gray-100 flex gap-3">
          <button class="text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors">
            + Add item
          </button>
          <span class="text-gray-200">|</span>
          <button class="text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors">
            Share
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
