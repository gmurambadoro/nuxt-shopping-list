// POST /api/auth/logout
// Ends the current session by clearing the session cookie.
//
// Response: { success: true }
// Status codes:
//   200 — session cleared

export default defineEventHandler(async (event) => {
  await clearUserSession(event)
  return { success: true }
})
