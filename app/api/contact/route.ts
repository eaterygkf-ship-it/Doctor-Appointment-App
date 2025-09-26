import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    // In future, integrate email provider (e.g., Resend) or store in DB.
    if (!payload?.name || !payload?.email || !payload?.message) {
      return NextResponse.json({ ok: false, error: "Missing fields" }, { status: 400 })
    }
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
