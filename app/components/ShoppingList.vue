<script setup lang="ts">
import type { ShoppingList } from '~/shared/types'

defineProps<{
  list: ShoppingList
}>()

const emit = defineEmits<{
  toggleItem: [itemId: string]
  removeItem: [itemId: string]
  addItem:    [name: string]
}>()

const newItemName = ref('')

function submitNewItem() {
  const name = newItemName.value.trim()
  if (!name) return
  emit('addItem', name)
  newItemName.value = ''
}
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
        {{ list.items.filter(item => item.purchased).length }}/{{ list.items.length }} done
      </span>
    </div>

    <!-- Progress bar -->
    <div class="h-1 bg-gray-100">
      <div
        class="h-1 bg-green-500 transition-all duration-300"
        :style="{ width: (list.items.length
          ? Math.round((list.items.filter(item => item.purchased).length / list.items.length) * 100)
          : 0) + '%' }"
      />
    </div>

    <!-- Items -->
    <ul class="divide-y divide-gray-100">
      <ShoppingItem
        v-for="item in list.items"
        :key="item.id"
        :item="item"
        @toggle="emit('toggleItem', item.id)"
        @remove="emit('removeItem', item.id)"
      />
    </ul>

    <!-- Add item form -->
    <div class="px-5 py-3 border-t border-gray-100">
      <form class="flex gap-2" @submit.prevent="submitNewItem">
        <input
          v-model="newItemName"
          type="text"
          placeholder="Add an item…"
          class="flex-1 text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-gray-400 transition-colors placeholder:text-gray-400"
        />
        <button
          type="submit"
          class="text-sm font-medium bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-40 cursor-pointer"
          :disabled="!newItemName.trim()"
        >
          Add
        </button>
      </form>
    </div>
  </div>
</template>
