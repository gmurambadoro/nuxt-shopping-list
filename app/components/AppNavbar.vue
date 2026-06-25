<template>
  <nav class="bg-white border-b border-gray-200">
    <div class="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
      <!-- Brand -->
      <NuxtLink to="/" class="font-semibold text-gray-900 text-lg tracking-tight">
        ShopList
      </NuxtLink>

      <!-- Navigation links -->
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
        <NuxtLink
          to="/auth/login"
          class="bg-gray-900 text-white px-3 py-1.5 rounded-md hover:bg-gray-700 transition-colors"
        >
          Sign in
        </NuxtLink>
      </div>
    </div>
  </nav>
</template>
