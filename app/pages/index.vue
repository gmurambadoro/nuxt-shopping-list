<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
useHead({
  title: 'My Shopping Lists — ShopList'
})

const { lists, loading, pending, toggleItem, removeItem, addItem, addList, removeList, clearPurchased } = useShoppingLists()

const showAddForm = ref(false)

function handleAddList(name: string) {
  addList(name)
  showAddForm.value = false
}
</script>

<template>
  <div>
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">My Shopping Lists</h1>
        <p v-if="!pending" class="text-gray-500 mt-1">
          {{ lists.length }} {{ lists.length === 1 ? 'list' : 'lists' }}
        </p>
      </div>

      <button
        v-if="!showAddForm"
        class="text-sm font-medium bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
        @click="showAddForm = true"
      >
        + New list
      </button>
    </div>

    <AddListForm
      v-if="showAddForm"
      class="mb-6"
      @submit="handleAddList"
      @cancel="showAddForm = false"
    />

    <!-- Loading state — active until the client fetch completes -->
    <div
      v-if="loading"
      class="text-center py-20 text-gray-400"
    >
      <p class="text-sm">Loading lists…</p>
    </div>

    <!-- List cards -->
    <div v-else class="space-y-6">
      <ShoppingList
        v-for="list in lists"
        :key="list.id"
        :list="list"
        @toggle-item="toggleItem(list.id, $event)"
        @remove-item="removeItem(list.id, $event)"
        @add-item="addItem(list.id, $event)"
        @clear-purchased="clearPurchased(list.id)"
        @remove-list="removeList(list.id)"
      />
    </div>

    <!-- Empty state -->
    <div
      v-if="!pending && !lists.length"
      class="text-center py-20"
    >
      <p class="text-lg font-medium text-gray-500 mb-1">No lists yet</p>
      <p class="text-sm text-gray-400">Create your first list to get started.</p>
    </div>
  </div>
</template>
