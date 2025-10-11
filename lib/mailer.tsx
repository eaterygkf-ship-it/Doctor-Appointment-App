import nodemailer from "nodemailer"

function getTransporter() {
  const host = process.env.SMTP_HOST || process.env.EMAIL_HOST
  const port = Number(process.env.SMTP_PORT || process.env.EMAIL_PORT || 587)
  const user = process.env.SMTP_USER || process.env.EMAIL_USER
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS

  if (!host || !user || !pass) {
    throw new Error("Missing SMTP configuration (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS)")
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for other ports
    auth: { user, pass },
  })
}

function escapeHtml(input: string) {
  return (input || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

type MailArgs = {
  to: string
  repName: string
  doctorName: string
  datetime: string // ISO-like "YYYY-MM-DDTHH:mm"
}

export async function sendAppointmentBookedEmail({ to, repName, doctorName, datetime }: MailArgs) {
  try {
    const transporter = getTransporter()
    const [date, time] = (datetime || "").split("T")
    const from = process.env.SMTP_FROM || process.env.SMTP_USER || "no-reply@example.com"

    await transporter.sendMail({
      from,
      to,
      subject: "Your Appointment has been Booked Successfully",
      html: `
        <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.6;color:#111827;">
          <p>Hi ${escapeHtml(repName)},</p>
          <p>Your appointment with Dr. ${escapeHtml(doctorName)} has been successfully booked on <strong>${escapeHtml(
            date || "",
          )}</strong> at <strong>${escapeHtml(time || "")}</strong>.</p>
          <p>Thank you,<br/>GKF Medical Team</p>
        </div>
      `,
    })

    return { success: true, message: "Email sent successfully" }
  } catch (_err) {
    return { success: false, message: "Failed to send email" }
  }
}

export async function sendAppointmentConfirmedEmail({ to, repName, doctorName, datetime }: MailArgs) {
  try {
    const transporter = getTransporter()
    const [date, time] = (datetime || "").split("T")
    const from = process.env.SMTP_FROM || process.env.SMTP_USER || "no-reply@example.com"

    await transporter.sendMail({
      from,
      to,
      subject: "Your Appointment has been Confirmed",
      html: `
        <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.6;color:#111827;">
          <p>Hi ${escapeHtml(repName)},</p>
          <p>Your appointment with Dr. ${escapeHtml(doctorName)} is confirmed for <strong>${escapeHtml(
            date || "",
          )}</strong> at <strong>${escapeHtml(time || "")}</strong>.</p>
          <p>Thank you,<br/>GKF Medical Team</p>
        </div>
      `,
    })

    return { success: true, message: "Email sent successfully" }
  } catch (_err) {
    return { success: false, message: "Failed to send email" }
  }
}
