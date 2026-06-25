# Nuxt 4 Shopping List — Learning Roadmap

## Overview

A step-by-step plan to learn Nuxt.js 4 by building a shopping list application. Each phase builds on the last and introduces new Nuxt/ecosystem concepts.

**Final feature set:**
- Create and manage shopping lists
- User registration and authentication
- Share lists with family and friends
- Email notifications for shared list invitations
- Real-time update notifications when items are purchased or crossed out

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Nuxt 4 |
| Database | SQLite + Drizzle ORM (local) / NuxtHub D1 (prod) |
| Auth | `nuxt-auth-utils` |
| Email | Resend |
| Real-time | Nitro SSE |
| Styling | Tailwind CSS v4 |
| Validation | Zod |
| Testing | Vitest + `@nuxt/test-utils` |

---

## Phase 1 — Project Foundations

**Nuxt concepts:** project scaffolding, file-based routing, layouts, pages, components, `useState`, `useHead`

1. Scaffold the project with `nuxi init`
2. Understand the Nuxt 4 directory structure (`app/`, `server/`, `shared/`)
3. Create a basic layout with a navbar
4. Build the first page: a static shopping list (hardcoded data)
5. Extract a `ShoppingItem.vue` component
6. Add a second route (`/about`) to understand file-based routing

---

## Phase 2 — Reactivity & State

**Nuxt concepts:** `useState` composable, `useLocalStorage` (VueUse), composables directory

7. Make the list interactive — add/remove items
8. Persist state to `localStorage` using a custom composable
9. Mark items as purchased (strike-through toggle)
10. Create a `useShoppingList` composable in `composables/`

---

## Phase 3 — Database & Server Layer

**Nuxt concepts:** server routes (`server/api/`), Nitro, `useDB` / Drizzle ORM, NuxtHub or local SQLite

11. Set up a database (SQLite via Drizzle ORM or NuxtHub)
12. Define the schema: `users`, `lists`, `items`, `list_members`
13. Build API routes: `GET/POST /api/lists`, `GET/POST/DELETE /api/lists/[id]/items`
14. Connect the frontend to the API using `useFetch` and `$fetch`
15. Learn `useAsyncData` vs `useFetch` — when to use each

---

## Phase 4 — Authentication

**Nuxt concepts:** `nuxt-auth-utils` or `@sidebase/nuxt-auth`, sessions, middleware, protected routes

16. Add user registration and login (email + password)
17. Hash passwords (bcrypt), store sessions
18. Create an `auth` middleware to protect routes
19. Show user-specific lists only
20. Add a user profile page

---

## Phase 5 — List Sharing

**Nuxt concepts:** server-side logic, route params, query params, `useRoute`

21. Generate a shareable link with a unique token per list
22. Build a `share` modal — invite by email or copy link
23. Handle `GET /api/lists/[token]` for public shared list view
24. Add permission levels: `viewer` vs `editor`
25. Store `list_members` records when a share is accepted

---

## Phase 6 — Email Notifications

**Nuxt concepts:** server-only code, Nitro hooks, environment variables, `useRuntimeConfig`

26. Integrate an email provider (Resend or Nodemailer)
27. Send a welcome email on registration
28. Send a share invitation email with the unique list link
29. Create reusable email templates (React Email or plain HTML)

---

## Phase 7 — Real-time Updates

**Nuxt concepts:** Server-Sent Events (SSE) via Nitro, or WebSockets with `nitropack`

30. Implement SSE endpoint: `GET /api/lists/[id]/events`
31. Subscribe to list updates from the frontend using `EventSource`
32. Broadcast when items are checked/unchecked or added/removed
33. Show live update indicators in the UI (e.g. "Jane just crossed off Milk")
34. Notify list subscribers via email digest (optional stretch goal)

---

## Phase 8 — Polish & Deployment

**Nuxt concepts:** `useSeoMeta`, error handling, loading states, NuxtHub or Vercel deployment

35. Add proper loading and error states throughout the app
36. SEO meta tags with `useSeoMeta`
37. Add form validation (VeeValidate or Zod + `@vuelidate`)
38. Write a few tests with Vitest + `@nuxt/test-utils`
39. Deploy to NuxtHub (Cloudflare) or Vercel
