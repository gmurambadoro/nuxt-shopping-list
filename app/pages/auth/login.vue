<script setup lang="ts">
useHead({ title: 'Sign in — ShopList' })

const { login } = useUserSession()
const router = useRouter()

const email = ref('')
const password = ref('')
const error = ref('')
const submitting = ref(false)

async function handleSubmit() {
  error.value = ''
  submitting.value = true
  try {
    await login({ email: email.value.trim(), password: password.value })
    router.push('/')
  } catch (e: any) {
    error.value = e.data?.statusMessage ?? 'Sign in failed'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="max-w-sm mx-auto mt-16">
    <h1 class="text-xl font-bold text-gray-900 mb-6">Sign in</h1>

    <form class="space-y-4" @submit.prevent="handleSubmit">
      <div>
        <label class="text-sm font-medium text-gray-700 block mb-1">Email</label>
        <input
          v-model="email"
          type="email"
          required
          autocomplete="email"
          class="w-full text-sm bg-white border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-gray-500 transition-colors"
        />
      </div>

      <div>
        <label class="text-sm font-medium text-gray-700 block mb-1">Password</label>
        <input
          v-model="password"
          type="password"
          required
          autocomplete="current-password"
          class="w-full text-sm bg-white border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-gray-500 transition-colors"
        />
      </div>

      <p v-if="error" class="text-sm text-red-500">{{ error }}</p>

      <button
        type="submit"
        :disabled="submitting"
        class="w-full text-sm font-medium bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-40 cursor-pointer"
      >
        {{ submitting ? 'Signing in…' : 'Sign in' }}
      </button>
    </form>

    <p class="text-sm text-gray-500 mt-6 text-center">
      Don't have an account?
      <NuxtLink to="/auth/register" class="text-gray-900 underline underline-offset-4 hover:text-gray-600 transition-colors">
        Register
      </NuxtLink>
    </p>
  </div>
</template>
