# Nuxt Shopping List

A shopping list application built with Nuxt 4, developed step by step as a learning project. Users can create and manage shopping lists, share them with family and friends, and receive email and real-time notifications when list items are updated.

## Features (planned)

- Create and manage multiple shopping lists
- Add, remove, and check off items
- User registration and authentication
- Share lists with others via a unique link or email invitation
- Email notifications for share invitations
- Real-time updates when items are purchased or crossed out

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Nuxt 4 |
| Runtime | Bun |
| Database | SQLite + Drizzle ORM (local) / NuxtHub D1 (prod) |
| Auth | `nuxt-auth-utils` |
| Email | Resend |
| Real-time | Nitro SSE |
| Styling | Tailwind CSS v4 |
| Validation | Zod |
| Testing | Vitest + `@nuxt/test-utils` |

## Setup

Install dependencies:

```bash
bun install
```

## Development

Start the development server on `http://localhost:3000`:

```bash
bun run dev
```

## Production

Build for production:

```bash
bun run build
```

Preview the production build locally:

```bash
bun run preview
```

Run the production server directly:

```bash
bun .output/server/index.mjs
```

## Project Structure

```
nuxt-shopping-list/
├── app/                  # Frontend source (pages, components, composables, layouts)
│   └── app.vue           # Root component
├── server/               # Backend source (API routes, middleware) — runs in Nitro
├── shared/               # Code shared between app/ and server/ (e.g. Zod schemas)
├── public/               # Static assets served as-is
├── nuxt.config.ts        # Nuxt configuration
└── shopping_list_plan.md # Step-by-step implementation plan
```

## Resources

- [Nuxt Documentation](https://nuxt.com/docs)
- [Nitro Documentation](https://nitro.build)
- [Bun Documentation](https://bun.sh/docs)
- [Implementation Plan](./shopping_list_plan.md)
