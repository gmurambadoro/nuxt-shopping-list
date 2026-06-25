# Phase 4 — Learning Outcomes: Authentication

## Concepts covered

### `nuxt-auth-utils` module
Provides server-side session management and password hashing for Nuxt.
Installed as a Nuxt module — add `'nuxt-auth-utils'` to the `modules` array
in `nuxt.config.ts`.

Key exports for server routes:

| Function | Purpose |
|---|---|
| `hashPassword(plaintext)` | Returns a bcrypt hash (`$2b$10$...`) |
| `verifyPassword(hash, plaintext)` | Compares plaintext against stored hash |
| `setUserSession(event, { user })` | Creates an encrypted session cookie |
| `getUserSession(event)` | Returns the session object or null |
| `requireUserSession(event)` | Same as above but throws 401 if not authenticated |
| `clearUserSession(event)` | Destroys the session (logout) |

Client-side composable `useUserSession()`:

```ts
const { user, loggedIn, login, register, clear, fetch } = useUserSession()
```

### Session cookies vs JWT
`nuxt-auth-utils` uses **encrypted session cookies** stored server-side (in
memory by default, or in a database for production). The cookie contains a
session ID, not the user data itself. This is different from JWTs, which
store the user data in a signed token on the client.

Session cookies are:
- **Safer** — the user data lives server-side; the cookie is just a reference
- **Revocable** — clearing the session on the server immediately invalidates it
- **Easier** — no token refresh logic, no expiry management in the client

### bcrypt password hashing
Passwords are never stored in plaintext. `hashPassword()` uses bcrypt with
a work factor of 10, which:
- Adds a random salt to each hash (so identical passwords produce different hashes)
- Is intentionally slow (computationally expensive) to make brute-force attacks
  impractical
- Returns a self-contained string: `$2b$10$[salt][hash]`

### Preventing email enumeration
When a login fails, always return the same error message regardless of
whether the email doesn't exist or the password is wrong:

```ts
// Both branches return the same 401 message
if (!user) throw createError({ statusCode: 401, statusMessage: 'Invalid email or password' })
if (!verified) throw createError({ statusCode: 401, statusMessage: 'Invalid email or password' })
```

This prevents attackers from probing the endpoint to discover registered
email addresses. A different response ("email not found" vs "wrong password")
would leak information.

### Ownership checks in every route
Every list and item route verifies that the authenticated user owns the
resource before operating on it:

```ts
const [list] = await db.select()
  .from(lists)
  .where(and(eq(lists.id, listId!), eq(lists.userId, user.id)))
if (!list) throw createError({ statusCode: 404, statusMessage: 'List not found' })
```

Key design decisions:
- Return **404** (not 403) when the resource is not found — this avoids
  leaking whether the resource exists but belongs to someone else.
- Combine the existence check and ownership check into a single query using
  `and()` from Drizzle.
- Never trust the client to send the correct `userId` — always derive it
  from the session.

### `requireUserSession` vs `getUserSession`

| Function | Auth required? | Returns |
|---|---|---|
| `getUserSession(event)` | No | `session` or `null` |
| `requireUserSession(event)` | Yes — throws 401 | `session` (never null) |

Use `getUserSession` for public endpoints that behave differently based on
auth state (e.g. `/api/auth/me`). Use `requireUserSession` for all routes
that need authentication.

### Auth middleware
File-based middleware in `app/middleware/auth.ts` protects pages from
client-side navigation:

```ts
export default defineNuxtRouteMiddleware(() => {
  const { loggedIn } = useUserSession()
  if (!loggedIn.value) return navigateTo('/auth/login')
})
```

Apply it to a page by adding `definePageMeta({ middleware: 'auth' })`.
Nuxt auto-imports middleware files — no manual registration needed.

### Session encryption with `NUXT_SESSION_PASSWORD`
The `NUXT_SESSION_PASSWORD` environment variable is used to encrypt session
cookies. It must be at least 32 characters. Loaded from `.env` (which is
gitignored). Never commit the production password to git.
