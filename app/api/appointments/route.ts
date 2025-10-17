import { type NextRequest, NextResponse } from "next/server"
import type { Appointment } from "@/lib/types"
import { sendAppointmentBookedEmail } from "@/lib/mailer"
import { MongoClient } from "mongodb"

// MongoDB connection (configure with your MongoDB Atlas connection string)
const uri = process.env.MONGODB_URI || "your-mongodb-atlas-connection-string"
const client = new MongoClient(uri)
const dbName = "appointments_db"
const collectionName = "appointments"

// Connect to MongoDB
async function connectToDatabase() {
  await client.connect()
  return client.db(dbName).collection(collectionName)
}

export async function GET() {
  try {
    const collection = await connectToDatabase()
    const data = await collection
      .find({})
      .sort({ datetime: 1 })
      .toArray()
    
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching appointments:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  } finally {
    await client.close()
  }
}

export async function POST(req: NextRequest) {
  try {
    const collection = await connectToDatabase()
    const body = await req.json()
    const { repName, email, phone, doctorName, datetime } = body || {}

    if (!repName || !email || !phone || !doctorName || !datetime) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    // Get date part from datetime (YYYY-MM-DD)
    const appointmentDate = new Date(datetime).toISOString().split('T')[0]
    
    // Count appointments for the same date
    const dailyAppointments = await collection
      .find({ 
        datetime: { 
          $gte: `${appointmentDate}T00:00:00.000Z`,
          $lt: `${appointmentDate}T23:59:59.999Z`
        }
      })
      .toArray()
    
    // Check if appointment limit (20) is exceeded
    if (dailyAppointments.length >= 20) {
      await sendAppointmentBookedEmail({
        to: email,
        subject: "Appointment Unavailable",
        body: `Appointments are closed for ${appointmentDate}. Please try booking on another date.`,
      })
      return NextResponse.json(
        { error: "Appointments are closed for this date" },
        { status: 400 }
      )
    }

    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    const now = new Date().toISOString()
    const appt: Appointment = {
      id,
      repName,
      email,
      phone,
      doctorName,
      datetime,
      status: "pending",
      createdAt: now,
    }

    // Save to MongoDB
    await collection.insertOne(appt)

    // Send confirmation email
    await sendAppointmentBookedEmail({
      to: email,
      subject: "Appointment Confirmation",
      body: `Your appointment with Dr. ${doctorName} has been successfully booked on ${appointmentDate}.`,
    })

    return NextResponse.json(appt, { status: 201 })
  } catch (error) {
    console.error("Error creating appointment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  } finally {
    await client.close()
  }
}
