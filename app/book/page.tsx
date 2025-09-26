import { NextResponse } from "next/server";
import { Resend } from "resend";

// Define the expected shape of the request body
interface RequestBody {
  repName?: string;
  companyName?: string;
  phoneNumber?: string;
  mailId: string; // Required
  doctorName?: string;
  date?: string;
}

export async function POST(req: Request) {
  try {
    // Parse the request body
    const body: RequestBody = await req.json().catch(() => {
      throw new Error("Invalid JSON in request body");
    });
    console.log("[v0] Submission received:", body);

    // Validate required fields
    const { mailId } = body;

    if (!mailId || typeof mailId !== "string") {
      return NextResponse.json(
        { ok: false, error: "Email (mailId) is required." },
        { status: 400 }
      );
    }

    // Enhanced email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(mailId)) {
      return NextResponse.json(
        { ok: false, error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    // Check for Resend API key
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.error("[v0] Missing RESEND_API_KEY environment variable");
      return NextResponse.json(
        {
          ok: false,
          error: "Email service not configured. Contact support.",
        },
        { status: 500 }
      );
    }

    // Initialize Resend client
    const resend = new Resend(resendApiKey);

    // Prepare email content
    const emailContent = {
      from: "Appointments <onboarding@resend.dev>",
      to: [mailId],
      subject: "Appointment Confirmed",
      text: `Your appointment has been booked successfully.${
        body.doctorName ? `\nDoctor: ${body.doctorName}` : ""
      }${body.date ? `\nDate: ${body.date}` : ""}`,
      html: `
        <p>Your appointment has been booked successfully.</p>
        ${
          body.doctorName
            ? `<p><strong>Doctor:</strong> ${body.doctorName}</p>`
            : ""
        }
        ${body.date ? `<p><strong>Date:</strong> ${body.date}</p>` : ""}
      `,
    };

    // Send email
    await resend.emails.send(emailContent);

    // Optionally persist submission to a database here
    console.log("[v0] Email sent successfully to:", mailId);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[v0] Error processing request:", err);
    return NextResponse.json(
      {
        ok: false,
        error:
          err instanceof Error
            ? `Failed to process request: ${err.message}`
            : "An unexpected error occurred.",
      },
      { status: 500 }
    );
  }
}
