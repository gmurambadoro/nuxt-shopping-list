## Runtime

- **Bun** (not npm/pnpm). Use `bun install`, `bun run dev`, etc.
- Nitro preset: `bun` in `nuxt.config.ts`.
- No lint, typecheck, or test scripts exist.

## Commands

| Command | Action |
|---|---|
| `bun run dev` | Start dev server at `http://localhost:3000` |
| `bun run build` | Production build |
| `bun run preview` | Preview production build |
| `bun run generate` | Static generation |
| `bun run db:generate` | Create migration SQL from schema diff |
| `bun run db:migrate` | Apply pending migrations |
| `bun run db:push` | Push schema directly (prototyping only) |

## Project structure

```
app/       — Vue frontend (pages, components, composables, layouts)
server/    — Nitro backend (API routes, DB, middleware)
shared/    — TypeScript types shared between app/ and server/
data/      — SQLite database file (gitignored)
```

## DB & Drizzle

- SQLite via `better-sqlite3` + Drizzle ORM.
- Schema: `server/db/schema.ts`. DB path hardcoded to `./data/shopping-list.db`.
- Migrations in `server/db/migrations/`.

## Auth

- `nuxt-auth-utils` with session cookies. Set `NUXT_SESSION_PASSWORD` in `.env` (32+ chars).
- Server: `requireUserSession(event)` to protect routes. Frontend: `definePageMeta({ middleware: 'auth' })`.
- Public share pages use token as capability URL (`/share/:token`).

## `#shared` alias

Use `#shared/` (not `~/shared/`) to import from the root `shared/` directory in client code. Nuxt 4 maps `~` to `app/`.

| Alias | Resolves to |
|---|---|
| `~` | `app/` |
| `#shared` | `shared/` |
| `@@` | project root |

## Client-side fetch quirk

`useShoppingLists` composable uses `{ server: false }` because SSR `$fetch` does not forward cookies. New data-fetching composables likely need the same treatment.

## Patterns

- **Modal**: `ShareModal` uses `defineExpose({ open })` / template ref instead of boolean prop.
- **Optimistic updates**: Local `data.value` patched immediately after API calls.
- **Ownership**: Compound FK checks with 404 for both "not found" and "not owned" (info leakage prevention).
- **Email (fire-and-forget)**: `server/utils/email.ts` — send functions called without `await` so the API responds before the email sends. Gracefully skips when `RESEND_API_KEY` is unset.
- **SSE**: `server/utils/sse.ts` — in-process `EventEmitter` broadcast hub. SSE endpoint at `GET /api/lists/:listId/events` uses `createEventStream` from h3. Mutation routes (`items.post/patch/delete`) call `broadcastToList()`. Frontend composable: `useListEvents`.
- **Client-side validation**: Zod schemas in `shared/validation.ts`. Use `schema.safeParse()` for validation with inline field errors.

## Nix shell

`shell.nix` provides `python3` (`nix-shell` to enter). Not required for the app itself.
