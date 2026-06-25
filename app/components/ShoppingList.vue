<script setup lang="ts">
import type { ShoppingList } from '~/shared/types'

const props = defineProps<{
  list: ShoppingList
}>()

const done = computed(() => props.list.items.filter(i => i.purchased).length)
const pct  = computed(() => Math.round((done.value / props.list.items.length) * 100))
</script>

<template>
  <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
    <!-- Header -->
    <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
      <div>
        <h2 class="font-semibold text-gray-900">{{ list.name }}</h2>
        <p class="text-xs text-gray-400 mt-0.5">Created {{ list.createdAt }}</p>
      </div>
      <span class="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
        {{ done }}/{{ list.items.length }} done
      </span>
    </div>

    <!-- Progress bar -->
    <div class="h-1 bg-gray-100">
      <div
        class="h-1 bg-green-500 transition-all duration-300"
        :style="{ width: pct + '%' }"
      />
    </div>

    <!-- Items -->
    <ul class="divide-y divide-gray-100">
      <ShoppingItem
        v-for="item in list.items"
        :key="item.id"
        :item="item"
      />
    </ul>

    <!-- Footer -->
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
</template>
