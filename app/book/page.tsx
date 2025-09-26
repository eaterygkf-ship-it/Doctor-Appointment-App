import { NextResponse } from "next/server"
import { Resend } from "resend"

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}) as any)
  console.log("[v0] Submission received:", body)

  // Basic validation
  const {
    repName,
    companyName,
    phoneNumber,
    mailId, // recipient email
    doctorName,
    date,
  } = body || {}

  if (!mailId || typeof mailId !== "string") {
    return NextResponse.json({ ok: false, error: "Email (Mail ID) is required." }, { status: 400 })
  }

  // Optional: quick email format check
  const emailLike = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mailId)
  if (!emailLike) {
    return NextResponse.json({ ok: false, error: "Please provide a valid email address." }, { status: 400 })
  }

  // Ensure API key is available
  if (!process.env.RESEND_API_KEY) {
    console.warn("[v0] Missing RESEND_API_KEY env var. Skipping email send.")
    return NextResponse.json(
      {
        ok: false,
        error: "Email service not configured. Add RESEND_API_KEY in Project Settings.",
      },
      { status: 500 },
    )
  }

  // Send email via Resend
  const resend = new Resend(process.env.RESEND_API_KEY)

  try {
    await resend.emails.send({
      // You can customize the sender; onboarding@resend.dev works without a custom domain
      from: "Appointments <onboarding@resend.dev>",
      to: [mailId],
      subject: "Appointment Confirmed",
      text: "Your Appointment has been booked successfully.",
      html: `<p>Your Appointment has been booked successfully.</p>`,
    })

    // In a real app you could also persist the submission here.

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[v0] Email send failed:", (err as Error).message)
    return NextResponse.json({ ok: false, error: "Failed to send confirmation email." }, { status: 500 })
  }
}
