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

export interface Doctor {
  id: string
  name: string
  specialty?: string
  location?: string
  email?: string
  phone?: string
  createdAt: string // ISO
}
