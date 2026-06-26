# Phase 6 — Learning Outcomes: Email Notifications

## Concepts covered

### Transactional emails with Resend

Resend is an email API for developers. It provides a simple HTTP API to send
transactional emails (welcome emails, password resets, invitations, etc.).

**Setup:**
1. Install `resend` package via `bun add resend`
2. Get an API key from https://resend.com (the `onboarding@resend.dev` sandbox
   works for development — only sends to the account owner's email)
3. Set `RESEND_API_KEY` in `.env`

**Email utility pattern** (`server/utils/email.ts`):

```
server/utils/
  email.ts      — wraps Resend client, provides sendWelcomeEmail() and
                  sendShareInviteEmail()
```

Key design decisions:

- **Graceful skip without API key** — `getResend()` returns `null` when
  `RESEND_API_KEY` is missing or is the placeholder `re_...`, and the send
  functions log a message instead of throwing. This lets development continue
  without a real API key.

- **Fire-and-forget sending** — `sendWelcomeEmail()` and `sendShareInviteEmail()`
  are called without `await` in route handlers so the API responds immediately
  and the email sends asynchronously.

- **HTML templates as string literals** — Inline template functions return HTML
  strings. For a production app you might use a library like React Email, MJML,
  or a template engine. Plain strings keep the dependency footprint small for
  this project.

### Runtime config in Nuxt

`nuxt.config.ts` has a `runtimeConfig` block with server-only defaults:

```ts
runtimeConfig: {
  resendApiKey: ''
}
```

Runtime config values are available on the server via `useRuntimeConfig()`,
but in this project we read `process.env.RESEND_API_KEY` directly in the
utility. Runtime config works well for values needed across many routes;
a single utility file can read `process.env` directly for simplicity.

### URL construction from request

In `share.post.ts`, the share link URL is built from the request:

```ts
const origin = getRequestProtocol(event) + '://' + getRequestHost(event)
const shareUrl = `${origin}/share/${token}`
```

`getRequestProtocol()` returns `http` or `https`, and `getRequestHost()`
returns the `Host` header. This produces correct URLs regardless of
the deployment environment.

## Files changed/added

| File | Change |
|---|---|
| `server/utils/email.ts` | **New** — Email utility with templates |
| `server/api/auth/register.post.ts` | Fire welcome email after registration |
| `server/api/lists/[listId]/share.post.ts` | Fire share invite email when email is provided |
| `.env.example` | Added `RESEND_API_KEY` |
| `.env` | Added `RESEND_API_KEY` |
| `nuxt.config.ts` | Added `runtimeConfig` block |
| `package.json` | `resend` dependency added |
