<script setup lang="ts">
// ShareModal — teleported overlay for managing share tokens on a list.
// This component is used via a template ref — the parent calls
// `shareModalRef.open()` to show it (imperative open pattern via defineExpose).
// This avoids cluttering the parent's state with show/hide booleans and keeps
// the modal logic self-contained.
//
// Usage:
//   <ShareModal ref="shareModalRef" :list-id="list.id" />
//   shareModalRef?.open()
// The ref is typed with InstanceType<typeof ShareModal> so that .open() is
// type-safe.

import type { ShareToken } from '~/shared/types'

const props = defineProps<{
  listId: string
}>()

const { user } = useUserSession()
const show = ref(false)
const tokens = ref<ShareToken[]>([])
const newTokenRole = ref<'viewer' | 'editor'>('viewer')
const generating = ref(false)

// loadTokens fetches all existing share tokens for this list.
// Called once when the modal opens. Uses $fetch directly (client-side only)
// rather than useAsyncData because the modal is only shown interactively.
async function loadTokens() {
  tokens.value = await $fetch(`/api/lists/${props.listId}/share`)
}

// open is exposed to the parent via defineExpose. It resets the state
// and fetches the latest tokens each time the modal is opened.
function open() {
  show.value = true
  loadTokens()
}

// generateToken creates a new share token via POST and appends it to the
// local tokens array so the list updates without a refetch. The try/finally
// ensures the loading state is cleared even if the request fails.
async function generateToken() {
  generating.value = true
  try {
    const created = await $fetch(`/api/lists/${props.listId}/share`, {
      method: 'POST',
      body: { role: newTokenRole.value },
    })
    tokens.value.push(created)
  } finally {
    generating.value = false
  }
}

// revokeToken deletes a token on the server and removes it from the local
// array optimistically (we trust the 200 response).
async function revokeToken(tokenId: string) {
  await $fetch(`/api/lists/${props.listId}/share/${tokenId}`, { method: 'DELETE' })
  tokens.value = tokens.value.filter(t => t.id !== tokenId)
}

// shareLink constructs the full public URL from the token value.
// Using window.location.origin makes it portable across environments.
function shareLink(token: string) {
  return `${window.location.origin}/share/${token}`
}

defineExpose({ open })
</script>

<template>
  <div>
    <button
      class="text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
      @click="open"
    >
      Share
    </button>

    <!-- Modal overlay -->
    <Teleport to="body">
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center"
        @click.self="show = false"
      >
        <div class="absolute inset-0 bg-black/20" />
        <div class="relative bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-md mx-4 p-6">
          <h2 class="font-semibold text-gray-900 mb-4">Share list</h2>

          <!-- Generate new link -->
          <div class="flex gap-2 mb-4">
            <select
              v-model="newTokenRole"
              class="text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-gray-400"
            >
              <option value="viewer">Can view</option>
              <option value="editor">Can edit</option>
            </select>
            <button
              class="text-sm font-medium bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-40 cursor-pointer"
              :disabled="generating"
              @click="generateToken"
            >
              {{ generating ? 'Creating…' : 'Generate link' }}
            </button>
          </div>

          <!-- Existing tokens -->
          <div v-if="tokens.length" class="space-y-2">
            <div
              v-for="t in tokens"
              :key="t.id"
              class="flex items-center gap-2 text-sm"
            >
              <code class="flex-1 truncate bg-gray-50 px-2 py-1 rounded text-xs text-gray-600">
                {{ shareLink(t.token) }}
              </code>
              <span class="text-xs font-medium text-gray-400 uppercase min-w-14">{{ t.role }}</span>
              <button
                class="text-gray-300 hover:text-red-400 transition-colors cursor-pointer shrink-0"
                title="Revoke"
                @click="revokeToken(t.id)"
              >
                <svg class="w-4 h-4" viewBox="0 0 16 16" fill="none">
                  <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
              </button>
            </div>
          </div>

          <p v-else class="text-sm text-gray-400">No share links yet.</p>

          <button
            class="mt-4 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
            @click="show = false"
          >
            Close
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>
