import { NextResponse, type NextRequest } from "next/server"
import type { Doctor } from "@/lib/types"

const g = globalThis as any
if (!g.doctors) {
  g.doctors = [] as Doctor[]
}

export async function GET() {
  const list = [...g.doctors].sort((a: Doctor, b: Doctor) => a.name.localeCompare(b.name))
  // Only return minimal info for dropdowns; keep full on same endpoint for simplicity
  return NextResponse.json(list)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, specialty, location, email, phone } = body || {}
  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 })
  const id = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  const now = new Date().toISOString()
  const doc: Doctor = { id, name, specialty, location, email, phone, createdAt: now }
  g.doctors.push(doc)
  return NextResponse.json(doc, { status: 201 })
}
