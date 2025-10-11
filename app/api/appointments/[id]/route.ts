import { type NextRequest, NextResponse } from "next/server"
import type { Appointment } from "@/lib/types"
import { sendAppointmentConfirmedEmail } from "@/lib/mailer"

const store: { items: Appointment[] } = globalThis as any

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const { status } = body || {}
  const idx = store.items.findIndex((a) => a.id === params.id)
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 })

  store.items[idx].status = status
  if (status === "confirmed") {
    const a = store.items[idx]
    await sendAppointmentConfirmedEmail({
      to: a.email,
      repName: a.repName,
      doctorName: a.doctorName,
      datetime: a.datetime,
    })
  }
  return NextResponse.json(store.items[idx])
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const idx = store.items.findIndex((a) => a.id === params.id)
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 })
  const [deleted] = store.items.splice(idx, 1)
  return NextResponse.json(deleted)
}
