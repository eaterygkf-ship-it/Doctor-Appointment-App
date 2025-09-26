"use client"

import type React from "react"

import useSWR, { mutate } from "swr"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type Doc = { id: string; name: string; specialty?: string; location?: string; email?: string; phone?: string }

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function DoctorsPage() {
  const { data, isLoading } = useSWR<Doc[]>("/api/doctors", fetcher, { refreshInterval: 4000 })
  const [name, setName] = useState("")
  const [specialty, setSpecialty] = useState("")
  const [location, setLocation] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [busy, setBusy] = useState(false)

  async function addDoctor(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setBusy(true)
    const res = await fetch("/api/doctors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        specialty: specialty.trim() || undefined,
        location: location.trim() || undefined,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
      }),
    })
    setBusy(false)
    if (res.ok) {
      setName("")
      setSpecialty("")
      setLocation("")
      setEmail("")
      setPhone("")
      mutate("/api/doctors")
    } else {
      alert("Failed to add doctor")
    }
  }

  async function removeDoctor(id: string) {
    const res = await fetch(`/api/doctors/${id}`, { method: "DELETE" })
    if (res.ok) mutate("/api/doctors")
    else alert("Failed to remove doctor")
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 grid gap-6">
      <header>
        <h1 className="text-2xl font-semibold text-pretty">Doctors Setup</h1>
        <p className="text-muted-foreground">Add doctors here. These will appear in the booking form dropdown.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Add Doctor</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={addDoctor}>
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="name">Doctor Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Dr. Jane Doe" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="specialty">Specialty (optional)</Label>
              <Input
                id="specialty"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                placeholder="Cardiology"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">Location (optional)</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Main Clinic"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email (optional)</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="doctor@example.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555 123 4567"
              />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" disabled={busy} className="w-full md:w-auto">
                {busy ? "Adding..." : "Add Doctor"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Doctor List</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Specialty</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={6}>Loading...</TableCell>
                </TableRow>
              )}
              {!isLoading && (!data || data.length === 0) && (
                <TableRow>
                  <TableCell colSpan={6}>No doctors yet. Add one above.</TableCell>
                </TableRow>
              )}
              {Array.isArray(data) &&
                data.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium">{d.name}</TableCell>
                    <TableCell>{d.specialty || "-"}</TableCell>
                    <TableCell>{d.location || "-"}</TableCell>
                    <TableCell>{d.email || "-"}</TableCell>
                    <TableCell>{d.phone || "-"}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="secondary" size="sm" onClick={() => removeDoctor(d.id)}>
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
