<script setup lang="ts">
import type { ShoppingItem } from '~/shared/types'

defineProps<{
  item: ShoppingItem
}>()
</script>

<template>
  <li class="flex items-center gap-3 px-5 py-3">
    <!-- Checkbox (visual only for now) -->
    <div
      class="w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors"
      :class="item.purchased ? 'bg-green-500 border-green-500' : 'border-gray-300'"
    >
      <svg
        v-if="item.purchased"
        class="w-3 h-3 text-white"
        viewBox="0 0 12 12"
        fill="none"
      >
        <path
          d="M2 6l3 3 5-5"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
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
</template>
