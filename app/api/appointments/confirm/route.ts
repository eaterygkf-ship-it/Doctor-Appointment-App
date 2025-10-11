import { type NextRequest, NextResponse } from "next/server"
import type { Appointment } from "@/lib/types"
import { sendAppointmentConfirmedEmail } from "@/lib/mailer"

const store: { items: Appointment[] } = globalThis as any

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { date } = body || {}
  if (!date) return NextResponse.json({ error: "Missing date" }, { status: 400 })

  const todays = store.items
    .filter((a) => a.datetime.startsWith(date) && a.status === "pending")
    .sort((a, b) => a.datetime.localeCompare(b.datetime))

  const toConfirm = todays.slice(0, 10)
  for (const a of toConfirm) {
    a.status = "confirmed"
  }

  await Promise.allSettled(
    toConfirm.map((a) =>
      sendAppointmentConfirmedEmail({
        to: a.email,
        repName: a.repName,
        doctorName: a.doctorName,
        datetime: a.datetime,
      }),
    ),
  )

  return NextResponse.json({ confirmed: toConfirm.length })
}
