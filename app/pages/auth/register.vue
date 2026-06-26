<script setup lang="ts">
import { registerSchema } from '#shared/validation'
import type { RegisterInput } from '#shared/validation'

useSeoMeta({
  title: 'Register — ShopList',
  description: 'Create a ShopList account to start creating and sharing shopping lists.',
})

const { fetch } = useUserSession()
const router = useRouter()

const form = reactive<RegisterInput>({ name: '', email: '', password: '' })
const fieldErrors = reactive<Partial<Record<keyof RegisterInput, string>>>({})
const error = ref('')
const submitting = ref(false)

function validate(): boolean {
  const result = registerSchema.safeParse(form)
  if (result.success) {
    for (const key of Object.keys(fieldErrors)) fieldErrors[key as keyof RegisterInput] = ''
    return true
  }
  const issues = result.error?.issues ?? []
  for (const key of ['name', 'email', 'password'] as const) {
    const issue = issues.find(i => i.path[0] === key)
    fieldErrors[key] = issue ? issue.message : ''
  }
  return false
}

async function handleSubmit() {
  if (!validate()) return
  error.value = ''
  submitting.value = true
  try {
    await $fetch('/api/auth/register', {
      method: 'POST',
      body: form,
    })
    await fetch()
    router.push('/')
  } catch (e: any) {
    error.value = e.data?.statusMessage ?? 'Registration failed'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="max-w-sm mx-auto mt-16">
    <h1 class="text-xl font-bold text-gray-900 mb-6">Create an account</h1>

    <form class="space-y-4" @submit.prevent="handleSubmit">
      <div>
        <label class="text-sm font-medium text-gray-700 block mb-1">Name</label>
        <input
          v-model="form.name"
          type="text"
          autocomplete="name"
          class="w-full text-sm bg-white border rounded-lg px-3 py-2 outline-none transition-colors"
          :class="fieldErrors.name ? 'border-red-400 focus:border-red-500' : 'border-gray-300 focus:border-gray-500'"
        />
        <p v-if="fieldErrors.name" class="text-xs text-red-500 mt-1">{{ fieldErrors.name }}</p>
      </div>

      <div>
        <label class="text-sm font-medium text-gray-700 block mb-1">Email</label>
        <input
          v-model="form.email"
          type="email"
          autocomplete="email"
          class="w-full text-sm bg-white border rounded-lg px-3 py-2 outline-none transition-colors"
          :class="fieldErrors.email ? 'border-red-400 focus:border-red-500' : 'border-gray-300 focus:border-gray-500'"
        />
        <p v-if="fieldErrors.email" class="text-xs text-red-500 mt-1">{{ fieldErrors.email }}</p>
      </div>

      <div>
        <label class="text-sm font-medium text-gray-700 block mb-1">Password</label>
        <input
          v-model="form.password"
          type="password"
          autocomplete="new-password"
          class="w-full text-sm bg-white border rounded-lg px-3 py-2 outline-none transition-colors"
          :class="fieldErrors.password ? 'border-red-400 focus:border-red-500' : 'border-gray-300 focus:border-gray-500'"
        />
        <p v-if="fieldErrors.password" class="text-xs text-red-500 mt-1">{{ fieldErrors.password }}</p>
      </div>

      <p v-if="error" class="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{{ error }}</p>

      <button
        type="submit"
        :disabled="submitting"
        class="w-full text-sm font-medium bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-40 cursor-pointer"
      >
        {{ submitting ? 'Creating account…' : 'Create account' }}
      </button>
    </form>

    <p class="text-sm text-gray-500 mt-6 text-center">
      Already have an account?
      <NuxtLink to="/auth/login" class="text-gray-900 underline underline-offset-4 hover:text-gray-600 transition-colors">
        Sign in
      </NuxtLink>
    </p>
  </div>
</template>
