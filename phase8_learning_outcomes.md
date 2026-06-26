# Phase 8 — Learning Outcomes: Polish & Validation

## Concepts covered

### Client-side form validation with Zod

Zod schemas defined in `shared/validation.ts` are reused on both the client
and server (though in this project we only use them client-side for now).

**Why shared validation?**
- Single source of truth for field rules.
- TypeScript types are derived from schemas via `z.infer` (Zod v3/v4 compat),
  or equivalently via `z.output<typeof schema>`.
- The same schemas can be used server-side for API validation, keeping client
  and server in sync.

**Pattern used in login/register forms:**

```ts
import { loginSchema } from '#shared/validation'
import type { LoginInput } from '#shared/validation'

const form = reactive<LoginInput>({ email: '', password: '' })
const fieldErrors = reactive<Partial<Record<keyof LoginInput, string>>>({})

function validate(): boolean {
  const result = loginSchema.safeParse(form)
  if (result.success) return true
  const issues = result.error?.issues ?? []
  for (const key of ['email', 'password'] as const) {
    const issue = issues.find(i => i.path[0] === key)
    fieldErrors[key] = issue ? issue.message : ''
  }
  return false
}
```

**Visual feedback:**
- Invalid fields get a red border (`border-red-400`).
- Inline error messages appear below the field.
- Server errors (wrong password, duplicate email) show in a styled banner
  (`bg-red-50 border border-red-200`) above the submit button.

### The `#shared` alias

In Nuxt 4, the `#shared` alias resolves to the root `shared/` directory.
Unlike `~/` (which resolves to `app/`), `#shared/` is the correct way to
import from `shared/` in client-side code.

| Alias | Resolves to | Use for |
|---|---|---|
| `~` | `app/` | Importing components, pages, composables |
| `#shared` | `shared/` | Importing shared types and validations |
| `@@` | root | Importing from root-level files |

### SEO with `useSeoMeta`

`useSeoMeta` is the Nuxt 4 way to set meta tags. It replaces the older
`useHead({ title })` for pages that need Open Graph / SEO tags:

```ts
useSeoMeta({
  title: 'Sign in — ShopList',
  description: 'Sign in to your ShopList account to manage shared shopping lists.',
})
```

Benefits over `useHead({ title })`:
- Type-safe meta property names.
- Automatically sets `og:title`, `twitter:title`, etc. when possible.
- Reactive — changes propagate without navigation.

### Error state presentation

Server errors are now displayed in a styled container:

```html
<p v-if="error" class="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
  {{ error }}
</p>
```

This separates visual error feedback from the inline field-level validation,
making the distinction between "field is invalid" (client-side) and "request
failed" (server-side) clear to the user.

## Files changed/added

| File | Change |
|---|---|
| `shared/validation.ts` | **New** — Zod schemas for login and register |
| `app/pages/auth/login.vue` | Zod validation, `useSeoMeta`, styled error display |
| `app/pages/auth/register.vue` | Zod validation, `useSeoMeta`, styled error display |
| `app/pages/index.vue` | `useSeoMeta` |
| `app/pages/about.vue` | `useSeoMeta` |
| `app/pages/share/[token].vue` | `useSeoMeta` |
| `package.json` | `zod` dependency added |
