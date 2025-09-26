import { NextResponse } from "next/server";
import { Resend } from "resend";

// Define the expected shape of the request body with more specific types
interface RequestBody {
  repName?: string;
  companyName?: string;
  phoneNumber?: string;
  mailId: string; // Required
  doctorName?: string;
  date?: string;
  time?: string; // Added time field for better appointment details
}

// Email template function for better maintainability
const createEmailContent = (body: RequestBody) => {
  const { doctorName, date, time, repName, companyName } = body;
  
  return {
    from: "Appointments <onboarding@resend.dev>",
    to: [body.mailId],
    subject: "Appointment Confirmed",
    text: `
Your appointment has been booked successfully.
${doctorName ? `Doctor: ${doctorName}` : ''}
${date ? `Date: ${date}` : ''}
${time ? `Time: ${time}` : ''}
${repName ? `Representative: ${repName}` : ''}
${companyName ? `Company: ${companyName}` : ''}

Thank you for choosing our service.
    `.trim(),
    html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #2563eb;">Appointment Confirmed</h2>
  <p>Your appointment has been booked successfully.</p>
  
  <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin: 16px 0;">
    ${doctorName ? `<p><strong>Doctor:</strong> ${doctorName}</p>` : ''}
    ${date ? `<p><strong>Date:</strong> ${date}</p>` : ''}
    ${time ? `<p><strong>Time:</strong> ${time}</p>` : ''}
    ${repName ? `<p><strong>Representative:</strong> ${repName}</p>` : ''}
    ${companyName ? `<p><strong>Company:</strong> ${companyName}</p>` : ''}
  </div>
  
  <p style="color: #64748b; font-size: 14px;">
    Thank you for choosing our service. If you need to reschedule, please contact us in advance.
  </p>
</div>
    `.trim(),
  };
};

// Enhanced email validation function
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

export async function POST(req: Request) {
  try {
    // Check if request has body
    if (!req.body) {
      return NextResponse.json(
        { ok: false, error: "Request body is required" },
        { status: 400 }
      );
    }

    // Parse the request body with better error handling
    let body: RequestBody;
    try {
      body = await req.json();
    } catch (parseError) {
      return NextResponse.json(
        { ok: false, error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    console.log("[v0] Submission received:", body);

    // Validate required fields
    const { mailId } = body;

    if (!mailId) {
      return NextResponse.json(
        { ok: false, error: "Email (mailId) is required." },
        { status: 400 }
      );
    }

    if (typeof mailId !== "string") {
      return NextResponse.json(
        { ok: false, error: "Email must be a string." },
        { status: 400 }
      );
    }

    if (!isValidEmail(mailId)) {
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
          error: "Email service not configured. Please contact support.",
        },
        { status: 500 }
      );
    }

    // Initialize Resend client
    const resend = new Resend(resendApiKey);

    // Create email content
    const emailContent = createEmailContent(body);

    // Send email with error handling
    const { data, error } = await resend.emails.send(emailContent);

    if (error) {
      console.error("[v0] Resend API error:", error);
      return NextResponse.json(
        {
          ok: false,
          error: `Failed to send email: ${error.message}`,
        },
        { status: 500 }
      );
    }

    console.log("[v0] Email sent successfully to:", mailId);
    console.log("[v0] Email ID:", data?.id);

    // Return success response
    return NextResponse.json({ 
      ok: true, 
      message: "Appointment confirmed and email sent successfully",
      emailId: data?.id 
    });

  } catch (err) {
    console.error("[v0] Unexpected error processing request:", err);
    
    // More specific error handling
    if (err instanceof SyntaxError) {
      return NextResponse.json(
        { ok: false, error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        ok: false,
        error: "An unexpected error occurred while processing your request.",
      },
      { status: 500 }
    );
  }
}

// Optional: Add OPTIONS handler for CORS if needed
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
