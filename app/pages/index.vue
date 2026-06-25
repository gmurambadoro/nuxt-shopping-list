<script setup lang="ts">
useHead({
  title: 'My Shopping Lists — ShopList'
})

const { lists, toggleItem, removeItem, addItem, addList, removeList, clearPurchased } = useShoppingLists()

// showAddForm is purely UI state — only this page needs to know whether
// the form is visible, so it stays local rather than going in the composable.
const showAddForm = ref(false)

function handleAddList(name: string) {
  addList(name)
  showAddForm.value = false
}
</script>

<template>
  <div>
    <!-- Page header -->
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">My Shopping Lists</h1>
        <p class="text-gray-500 mt-1">{{ lists.length }} {{ lists.length === 1 ? 'list' : 'lists' }}</p>
      </div>

      <button
        v-if="!showAddForm"
        class="text-sm font-medium bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
        @click="showAddForm = true"
      >
        + New list
      </button>
    </div>

    <!--
      AddListForm owns the input, validation, and emits two events:
        - 'submit' (with the list name) — handled by handleAddList, which calls
          addList() then closes the form. A named function is used because there
          are two statements; an inline expression would be too cramped.
        - 'cancel' — handled inline as a single expression. Setting showAddForm
          to false is all that's needed, so no named function is required.
    -->
    <AddListForm
      v-if="showAddForm"
      class="mb-6"
      @submit="handleAddList"
      @cancel="showAddForm = false"
    />

    <!-- List cards -->
    <div class="space-y-6">
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

    <!-- Empty state when no lists exist -->
    <div
      v-if="!lists.length"
      class="text-center py-20"
    >
      <p class="text-lg font-medium text-gray-500 mb-1">No lists yet</p>
      <p class="text-sm text-gray-400">Create your first list to get started.</p>
    </div>
  </div>
</template>
