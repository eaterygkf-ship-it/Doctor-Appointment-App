import { type NextRequest, NextResponse } from "next/server"
import type { Appointment } from "@/lib/types"
import { sendAppointmentBookedEmail } from "@/lib/mailer"

// Module-scoped in-memory store (MVP only)
const store: { items: Appointment[] } = globalThis as any
if (!store.items) {
  ;(store as any).items = []
}

export async function GET() {
  const data = [...store.items].sort((a, b) => a.datetime.localeCompare(b.datetime))
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { repName, email, phone, doctorName, datetime } = body || {}

  if (!repName || !email || !phone || !doctorName || !datetime) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  }

  const id = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  const now = new Date().toISOString()
  const appt: Appointment = {
    id,
    repName,
    email,
    phone,
    doctorName,
    datetime,
    status: "pending",
    createdAt: now,
  }
  store.items.push(appt)

  // Send actual email to the rep; do not fail booking if email fails
  await sendAppointmentBookedEmail({
    to: email,
    repName,
    doctorName,
    datetime,
  })

  return NextResponse.json(appt, { status: 201 })
}
