"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

const DOCTORS = ["Dr. Anna Thompson", "Dr. Vivek Desai", "Dr. Maria Torres", "Dr. James Lee", "Dr. A. Rahman"]

export function BookingForm() {
  const { toast } = useToast()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [repName, setRepName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [doctorName, setDoctorName] = useState<string>("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!repName || !email || !phone || !doctorName || !date || !time) {
      toast({ title: "Missing info", description: "Please complete all fields." })
      return
    }
    setIsSubmitting(true)
    const datetime = new Date(`${date}T${time}:00`).toISOString()
    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ repName, email, phone, doctorName, datetime }),
    })
    setIsSubmitting(false)
    if (!res.ok) {
      toast({ title: "Error", description: "Could not book appointment. Try again." })
      return
    }
    toast({ title: "Booked!", description: "Your request was received. We will confirm shortly." })
    router.push("/")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appointment Request</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={onSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="repName">Rep Name</Label>
            <Input id="repName" value={repName} onChange={(e) => setRepName(e.target.value)} />
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Doctor</Label>
            <Select value={doctorName} onValueChange={setDoctorName}>
              <SelectTrigger>
                <SelectValue placeholder="Select a doctor" />
              </SelectTrigger>
              <SelectContent>
                {DOCTORS.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="date">Preferred Date</Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="time">Preferred Time</Label>
              <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
          </div>
          <div className="pt-2">
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Booking..." : "Book Appointment"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
