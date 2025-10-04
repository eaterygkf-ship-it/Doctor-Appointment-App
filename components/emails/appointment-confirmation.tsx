import type * as React from "react"

interface AppointmentConfirmationEmailProps {
  repName: string
  doctorName: string
  datetime: string
  phone: string
}

export const AppointmentConfirmationEmail: React.FC<Readonly<AppointmentConfirmationEmailProps>> = ({
  repName,
  doctorName,
  datetime,
  phone,
}) => (
  <div style={{ fontFamily: "sans-serif", maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
    <h1 style={{ color: "#0070f3", fontSize: "24px", marginBottom: "20px" }}>Appointment Confirmation</h1>
    <p style={{ fontSize: "16px", lineHeight: "1.5", marginBottom: "10px" }}>
      Dear <strong>{repName}</strong>,
    </p>
    <p style={{ fontSize: "16px", lineHeight: "1.5", marginBottom: "20px" }}>
      Your appointment request has been successfully received. Here are the details:
    </p>
    <div
      style={{
        backgroundColor: "#f5f5f5",
        padding: "15px",
        borderRadius: "8px",
        marginBottom: "20px",
      }}
    >
      <p style={{ margin: "5px 0" }}>
        <strong>Doctor:</strong> {doctorName}
      </p>
      <p style={{ margin: "5px 0" }}>
        <strong>Date & Time:</strong> {new Date(datetime).toLocaleString()}
      </p>
      <p style={{ margin: "5px 0" }}>
        <strong>Contact Phone:</strong> {phone}
      </p>
    </div>
    <p style={{ fontSize: "16px", lineHeight: "1.5", marginBottom: "10px" }}>
      We will review your request and send you a confirmation shortly.
    </p>
    <p style={{ fontSize: "14px", color: "#666", marginTop: "30px" }}>
      Thank you for using our Doctor Appointment System.
    </p>
  </div>
)
