import { NextResponse, type NextRequest } from "next/server"
import type { Doctor } from "@/lib/types"

const g = globalThis as any
if (!g.doctors) {
  g.doctors = [] as Doctor[]
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const { name, specialty, location, email, phone } = body || {}
  const idx = (g.doctors as Doctor[]).findIndex((d) => d.id === params.id)
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 })
  const current = g.doctors[idx] as Doctor
  g.doctors[idx] = {
    ...current,
    name: name ?? current.name,
    specialty: specialty ?? current.specialty,
    location: location ?? current.location,
    email: email ?? current.email,
    phone: phone ?? current.phone,
  }
  return NextResponse.json(g.doctors[idx])
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const idx = (g.doctors as Doctor[]).findIndex((d) => d.id === params.id)
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 })
  const [removed] = (g.doctors as Doctor[]).splice(idx, 1)
  return NextResponse.json(removed)
}
