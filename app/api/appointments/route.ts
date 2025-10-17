import { type NextRequest, NextResponse } from "next/server";
import { MongoClient, Collection } from "mongodb";

// Define Appointment type (ensure it matches your lib/types)
interface Appointment {
  id: string;
  repName: string;
  email: string;
  phone: string;
  doctorName: string;
  datetime: string;
  status: "pending" | "confirmed" | "cancelled";
  createdAt: string;
}

// MongoDB connection configuration
const uri = process.env.MONGODB_URI;
const dbName = "appointments_db";
const collectionName = "appointments";
let client: MongoClient | null = null;

// Initialize MongoDB client
async function connectToDatabase(): Promise<Collection<Appointment>> {
  if (!uri) {
    throw new Error("MONGODB_URI environment variable is not set");
  }
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
  }
  return client.db(dbName).collection<Appointment>(collectionName);
}

// Optional: Mock sendAppointmentBookedEmail function (replace with your actual implementation)
async function sendAppointmentBookedEmail({
  to,
  subject,
  body,
}: {
  to: string;
  subject: string;
  body: string;
}): Promise<void> {
  console.log(`Sending email to ${to}: ${subject} - ${body}`);
  // Implement your email sending logic here
}

export async function GET() {
  try {
    const collection = await connectToDatabase();
    const data = await collection
      .find({})
      .sort({ datetime: 1 })
      .toArray();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json(
      { error: `Failed to fetch appointments: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const collection = await connectToDatabase();
    const body = await req.json();
    const { repName, email, phone, doctorName, datetime } = body || {};

    // Validate input fields
    if (!repName || !email || !phone || !doctorName || !datetime) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate datetime format
    if (isNaN(new Date(datetime).getTime())) {
      return NextResponse.json({ error: "Invalid datetime format" }, { status: 400 });
    }

    // Get date part from datetime (YYYY-MM-DD)
    const appointmentDate = new Date(datetime).toISOString().split("T")[0];

    // Count appointments for the same date
    const dailyAppointments = await collection
      .find({
        datetime: {
          $gte: `${appointmentDate}T00:00:00.000Z`,
          $lt: `${appointmentDate}T23:59:59.999Z`,
        },
      })
      .toArray();

    // Check if appointment limit (20) is exceeded
    if (dailyAppointments.length >= 20) {
      await sendAppointmentBookedEmail({
        to: email,
        subject: "Appointment Unavailable",
        body: `Appointments are closed for ${appointmentDate}. Please try booking on another date.`,
      });
      return NextResponse.json(
        { error: "Appointments are closed for this date" },
        { status: 400 }
      );
    }

    // Create new appointment
    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const now = new Date().toISOString();
    const appt: Appointment = {
      id,
      repName,
      email,
      phone,
      doctorName,
      datetime,
      status: "pending",
      createdAt: now,
    };

    // Save to MongoDB
    await collection.insertOne(appt);

    // Send confirmation email
    await sendAppointmentBookedEmail({
      to: email,
      subject: "Appointment Confirmation",
      body: `Your appointment with Dr. ${doctorName} has been successfully booked on ${appointmentDate}.`,
    });

    return NextResponse.json(appt, { status: 201 });
  } catch (error) {
    console.error("Error creating appointment:", error);
    return NextResponse.json(
      { error: `Failed to create appointment: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}

// Optional: Cleanup on server shutdown
process.on("SIGTERM", async () => {
  if (client) {
    await client.close();
    console.log("MongoDB connection closed");
  }
});
