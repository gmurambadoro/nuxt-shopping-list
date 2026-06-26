<script setup lang="ts">
useSeoMeta({
  title: 'About — ShopList',
  description: 'ShopList is a collaborative shopping list app built with Nuxt 4.',
})
</script>

<template>
  <div class="max-w-2xl">
    <h1 class="text-2xl font-bold text-gray-900 mb-4">About ShopList</h1>

    <div class="space-y-4 text-gray-600 leading-relaxed">
      <p>
        ShopList is a collaborative shopping list app built with Nuxt 4. Create lists,
        share them with family and friends, and get notified in real time when items
        are checked off.
      </p>
      <p>
        This project is being built step by step as a learning exercise to explore
        Nuxt 4 features including file-based routing, server API routes, authentication,
        email notifications, and real-time updates via Server-Sent Events.
      </p>
    </div>

    <div class="mt-8 flex gap-4">
      <NuxtLink
        to="/"
        class="text-sm font-medium text-gray-900 underline underline-offset-4 hover:text-gray-600 transition-colors"
      >
        View my lists
      </NuxtLink>
    </div>
  </div>
</template>
