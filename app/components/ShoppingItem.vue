<script setup lang="ts">
import type { ShoppingItem } from '#shared/types'

defineProps<{
  item: ShoppingItem
}>()

const emit = defineEmits<{
  toggle: []
  remove: []
}>()
</script>

<template>
  <li class="flex items-center gap-3 px-5 py-3 group">
    <!-- Checkbox -->
    <button
      class="w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors cursor-pointer"
      :class="item.purchased ? 'bg-green-500 border-green-500' : 'border-gray-300 hover:border-gray-400'"
      @click="emit('toggle')"
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
    </button>

    <!-- Item name -->
    <span
      class="text-sm flex-1 transition-colors"
      :class="item.purchased ? 'line-through text-gray-400' : 'text-gray-700'"
    >
      {{ item.name }}
    </span>

    <!-- Remove button (visible on hover) -->
    <button
      class="opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 hover:text-red-400 cursor-pointer"
      title="Remove item"
      @click="emit('remove')"
    >
      <svg class="w-4 h-4" viewBox="0 0 16 16" fill="none">
        <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    </button>
  </li>
</template>
