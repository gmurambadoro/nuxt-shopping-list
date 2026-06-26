<script setup lang="ts">
// /share/[token] — Public page for viewing a shared shopping list.
// This page uses the share token in the URL as authorisation — no auth
// middleware, no login required. The token essentially acts as a capability
// URL (also called a "magic link").
//
// Data fetching uses useFetch (which becomes useAsyncData under the hood)
// at the top level of <script setup>. This lets Nuxt deduplicate the request
// on SSR and deliver the list as part of the initial HTML payload, improving
// perceived load time.
//
// The page handles three states:
//   1. error  — token expired, revoked, or invalid (404 from API)
//   2. loading — useFetch is still in flight
//   3. ready  — list and role are available
//
// Role is included in the API response so the UI can communicate whether
// the shared user can edit or just view.

import type { ShoppingList } from '#shared/types'

useSeoMeta({
  title: 'Shared List — ShopList',
  description: 'View a shared shopping list.',
})

const route = useRoute()
const token = route.params.token as string

const { data, error } = await useFetch(`/api/share/${token}`)

// computed() extracts nested values with a fallback so the template never
// accesses undefined properties during the loading window.
const list = computed<ShoppingList | null>(() => data.value?.list ?? null)
const role = computed<string>(() => data.value?.role ?? 'viewer')
</script>

<template>
  <div class="max-w-2xl mx-auto mt-12">
    <!-- Error state -->
    <div v-if="error" class="text-center py-20">
      <p class="text-lg font-medium text-gray-500 mb-1">Link not found</p>
      <p class="text-sm text-gray-400">This share link may have expired or been revoked.</p>
    </div>

    <!-- Loading -->
    <div v-else-if="!list" class="text-center py-20 text-gray-400">
      <p class="text-sm">Loading shared list…</p>
    </div>

    <!-- Shared list -->
    <template v-else>
      <div class="mb-6">
        <p class="text-xs text-gray-400 uppercase tracking-wider mb-1">Shared list</p>
        <h1 class="text-2xl font-bold text-gray-900">{{ list.name }}</h1>
        <p class="text-xs text-gray-400 mt-1">
          {{ role === 'editor' ? 'You can edit this list' : 'You can view this list' }}
        </p>
      </div>

      <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <ul class="divide-y divide-gray-100">
          <li
            v-for="item in list.items"
            :key="item.id"
            class="flex items-center gap-3 px-5 py-3"
          >
            <div
              class="w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors"
              :class="item.purchased ? 'bg-green-500 border-green-500' : 'border-gray-300'"
            >
              <svg
                v-if="item.purchased"
                class="w-3 h-3 text-white"
                viewBox="0 0 12 12"
                fill="none"
              >
                <path d="M2 6l3 3 5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <span
              class="text-sm transition-colors"
              :class="item.purchased ? 'line-through text-gray-400' : 'text-gray-700'"
            >
              {{ item.name }}
            </span>
          </li>
        </ul>

        <p
          v-if="!list.items.length"
          class="px-5 py-6 text-sm text-gray-400 text-center"
        >
          This list is empty.
        </p>
      </div>
    </template>
  </div>
</template>
