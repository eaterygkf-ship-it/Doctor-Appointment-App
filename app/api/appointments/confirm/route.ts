import { type NextRequest, NextResponse } from "next/server"
import type { Appointment } from "@/lib/types"
import nodemailer from "nodemailer";

const store: { items: Appointment[] } = globalThis as any

// Fake mail sender (stub)
async function sendEmail(to: string, subject: string, message: string) {
  // Create a transporter using your email service
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: "Your Website" <${process.env.SMTP_USER}>,
    to,
    subject,
    text: message,
  });


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
