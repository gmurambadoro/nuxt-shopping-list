<script setup lang="ts">
useHead({
  title: 'Page not found — ShopList'
})
</script>

<template>
  <div class="text-center py-20">
    <p class="text-5xl font-bold text-gray-200 mb-4">404</p>
    <h1 class="text-xl font-semibold text-gray-900 mb-2">Page not found</h1>
    <p class="text-gray-500 mb-8">The page you're looking for doesn't exist.</p>
    <NuxtLink
      to="/"
      class="text-sm font-medium text-gray-900 underline underline-offset-4 hover:text-gray-600 transition-colors"
    >
      Back to my lists
    </NuxtLink>
  </div>
</template>
