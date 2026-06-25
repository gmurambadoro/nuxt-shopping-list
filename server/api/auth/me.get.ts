// GET /api/auth/me
// Returns the currently authenticated user, or null if not logged in.
// This is called by useUserSession() on the client to check auth state.
//
// Response: { id: string, email: string, name: string } | null
// Status codes:
//   200 — returns user object or null (no auth required)

export default defineEventHandler(async (event) => {
  // getUserSession returns the session or null — unlike requireUserSession,
  // it does NOT throw when the user is not authenticated. This endpoint is
  // publicly accessible so the client can determine auth state.
  const session = await getUserSession(event)
  return session.user ?? null
})
