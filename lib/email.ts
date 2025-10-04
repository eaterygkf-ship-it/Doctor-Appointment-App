import { Resend } from "resend"
import { AppointmentConfirmationEmail } from "@/components/emails/appointment-confirmation"

interface SendAppointmentEmailParams {
  to: string
  repName: string
  doctorName: string
  datetime: string
  phone: string
}

export async function sendAppointmentConfirmationEmail({
  to,
  repName,
  doctorName,
  datetime,
  phone,
}: SendAppointmentEmailParams) {
  try {
    // If no API key is set, log to console instead
    if (!process.env.RESEND_API_KEY) {
      console.log("[v0] ⚠️  RESEND_API_KEY not configured - Email not sent")
      console.log("[v0] 📧 Would send to:", to)
      console.log("[v0] 📋 Appointment:", { repName, doctorName, datetime, phone })
      console.log("[v0] 💡 Add RESEND_API_KEY in Project Settings → Environment Variables")
      return { success: true, message: "Email logged (no API key configured)" }
    }

    const resend = new Resend(process.env.RESEND_API_KEY)

    const { data, error } = await resend.emails.send({
      from: "Doctor Appointments <onboarding@resend.dev>", // Change to your verified domain
      to: [to],
      subject: "Appointment Request Confirmed",
      react: AppointmentConfirmationEmail({ repName, doctorName, datetime, phone }),
    })

    if (error) {
      console.error("[v0] Email send error:", error)
      return { success: false, error }
    }

    console.log("[v0] Email sent successfully:", data)
    return { success: true, data }
  } catch (error) {
    console.error("[v0] Email send exception:", error)
    return { success: false, error }
  }
}
