<script setup lang="ts">
const { loggedIn, user, clear } = useUserSession()

async function handleLogout() {
  await clear()
  navigateTo('/auth/login')
}
</script>

<template>
  <nav class="bg-white border-b border-gray-200">
    <div class="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
      <NuxtLink to="/" class="font-semibold text-gray-900 text-lg tracking-tight">
        ShopList
      </NuxtLink>

      <div class="flex items-center gap-6 text-sm font-medium text-gray-600">
        <NuxtLink
          to="/"
          class="hover:text-gray-900 transition-colors"
          active-class="text-gray-900"
        >
          My Lists
        </NuxtLink>
        <NuxtLink
          to="/about"
          class="hover:text-gray-900 transition-colors"
          active-class="text-gray-900"
        >
          About
        </NuxtLink>

        <!-- Authenticated: show name + logout -->
        <template v-if="loggedIn">
          <span class="text-gray-400 text-xs">{{ user?.name }}</span>
          <button
            class="text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
            @click="handleLogout"
          >
            Sign out
          </button>
        </template>

        <!-- Unauthenticated: show sign in link -->
        <NuxtLink
          v-else
          to="/auth/login"
          class="bg-gray-900 text-white px-3 py-1.5 rounded-md hover:bg-gray-700 transition-colors"
        >
          Sign in
        </NuxtLink>
      </div>
    </div>
  </nav>
</template>
