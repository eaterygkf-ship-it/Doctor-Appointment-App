export type AppointmentStatus = "pending" | "confirmed" | "completed"

export interface Appointment {
  id: string
  repName: string
  email: string
  phone: string
  doctorName: string
  datetime: string // ISO
  status: AppointmentStatus
  createdAt: string // ISO
}
