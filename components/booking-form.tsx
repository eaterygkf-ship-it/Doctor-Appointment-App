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
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function BookingForm() {
  const { toast } = useToast()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [repName, setRepName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [doctorName, setDoctorName] = useState<string>("")
  const [date, setDate] = useState("")

  const { data: doctors, isLoading: isLoadingDoctors } = useSWR<{ id: string; name: string }[]>("/api/doctors", fetcher)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!repName || !email || !phone || !doctorName || !date) {
      toast({ title: "Missing info", description: "Please complete all fields." })
      return
    }
    setIsSubmitting(true)
    // We'll use Noon (12:00) as the default time since time is now removed
    const datetime = new Date(`${date}T12:00:00`).toISOString()
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
                <SelectValue placeholder={isLoadingDoctors ? "Loading doctors..." : "Select a doctor"} />
              </SelectTrigger>
              <SelectContent>
                {Array.isArray(doctors) && doctors.length > 0 ? (
                  doctors.map((d) => (
                    <SelectItem key={d.id} value={d.name}>
                      {d.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="__none" disabled>
                    No doctors available (add in Doctors page)
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="date">Preferred Date</Label>
            <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
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
