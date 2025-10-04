import { Resend } from "resend"
import { AppointmentConfirmationEmail } from "@/components/emails/appointment-confirmation"

const resend = new Resend(process.env.RESEND_API_KEY)

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
      console.log("[v0] Email would be sent to:", to)
      console.log("[v0] Appointment details:", { repName, doctorName, datetime, phone })
      return { success: true, message: "Email logged (no API key configured)" }
    }

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
