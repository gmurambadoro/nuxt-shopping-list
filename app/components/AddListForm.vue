<script setup lang="ts">
const emit = defineEmits<{
  submit: [name: string]
  cancel: []
}>()

const listName = ref('')

function handleSubmit() {
  const name = listName.value.trim()
  if (!name) return
  emit('submit', name)
  listName.value = ''
}
</script>

<template>
  <form class="flex gap-2" @submit.prevent="handleSubmit">
    <input
      v-model="listName"
      type="text"
      placeholder="List name…"
      autofocus
      class="flex-1 text-sm bg-white border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-gray-500 transition-colors placeholder:text-gray-400"
    />
    <button
      type="submit"
      class="text-sm font-medium bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-40 cursor-pointer"
      :disabled="!listName.trim()"
    >
      Create
    </button>
    <button
      type="button"
      class="text-sm font-medium text-gray-500 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
      @click="emit('cancel')"
    >
      Cancel
    </button>
  </form>
</template>
