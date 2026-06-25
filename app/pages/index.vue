<script setup lang="ts">
useHead({
  title: 'My Shopping Lists — ShopList'
})

const { lists, toggleItem, removeItem, addItem } = useShoppingLists()
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
