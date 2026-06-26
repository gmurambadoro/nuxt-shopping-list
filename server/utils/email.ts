import { Resend } from 'resend'

function getResend(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey || apiKey === 're_...') {
    return null
  }
  return new Resend(apiKey)
}

function welcomeTemplate(name: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: sans-serif; padding: 24px;">
  <h1>Welcome, ${name}!</h1>
  <p>Thanks for signing up for Shopping List. Start creating and sharing lists with family and friends.</p>
  <p style="color: #666;">— The Shopping List Team</p>
</body>
</html>`
}

function shareInviteTemplate(inviterName: string, listName: string, shareUrl: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: sans-serif; padding: 24px;">
  <h1>${inviterName} shared a list with you!</h1>
  <p>You've been invited to view <strong>${listName}</strong>.</p>
  <p><a href="${shareUrl}" style="display: inline-block; padding: 12px 24px; background: #6366f1; color: #fff; text-decoration: none; border-radius: 6px;">View List</a></p>
  <p style="color: #666;">Or copy this link: ${shareUrl}</p>
</body>
</html>`
}

export async function sendWelcomeEmail(email: string, name: string) {
  const resend = getResend()
  if (!resend) {
    console.log(`[email] Skipping welcome email to ${email} — no RESEND_API_KEY configured`)
    return
  }

  await resend.emails.send({
    from: 'Shopping List <onboarding@resend.dev>',
    to: email,
    subject: 'Welcome to Shopping List!',
    html: welcomeTemplate(name),
  })
  console.log(`[email] Welcome email sent to ${email}`)
}

export async function sendShareInviteEmail(params: {
  email: string
  inviterName: string
  listName: string
  shareUrl: string
}) {
  const resend = getResend()
  if (!resend) {
    console.log(`[email] Skipping share invite to ${params.email} — no RESEND_API_KEY configured`)
    return
  }

  await resend.emails.send({
    from: 'Shopping List <onboarding@resend.dev>',
    to: params.email,
    subject: `${params.inviterName} shared a shopping list with you`,
    html: shareInviteTemplate(params.inviterName, params.listName, params.shareUrl),
  })
  console.log(`[email] Share invite sent to ${params.email}`)
}
