import { type NextRequest, NextResponse } from "next/server"
import type { Appointment } from "@/lib/types"
import nodemailer from "nodemailer";

const store: { items: Appointment[] } = globalThis as any

// Fake mail sender (stub)
async function sendEmail(to: string, subject: string, message: string) {
  console.log("[v0] Email stub:",{to,subject, message})
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { date } = body || {}
  if (!date) return NextResponse.json({ error: "Missing date" }, { status: 400 })

  const todays = store.items
    .filter((a) => a.datetime.startsWith(date) && a.status === "pending")
    .sort((a, b) => a.datetime.localeCompare(b.datetime))

  const toConfirm = todays.slice(0, 10)
  toConfirm.forEach((a) => {
    a.status = "confirmed"
    sendEmail(a.email, "Appointment confirmed", "Your Appointment has been confirmed.")
  })

  return NextResponse.json({ confirmed: toConfirm.length })
}
