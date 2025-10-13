"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"
import useSWR, { mutate } from "swr"
import type { Appointment } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

const fetcher = (url: string) => fetch(url).then((r) => r.json())
const ADMIN_PASS = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "admin123"

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [pw, setPw] = useState("")

  useEffect(() => {
    const saved = localStorage.getItem("admin_ok") === "1"
    if (saved) setAuthed(true)
  }, [])

  function onLogin(e: React.FormEvent) {
    e.preventDefault()
    if (pw === ADMIN_PASS) {
      setAuthed(true)
      localStorage.setItem("admin_ok", "1")
    } else {
      alert("Incorrect password")
    }
  }

  if (!authed) {
    return (
      <main className="min-h-dvh grid place-items-center px-6">
        <Card className="max-w-sm w-full">
          <CardHeader>
            <CardTitle>Admin Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid gap-3" onSubmit={onLogin}>
              <Input
                type="password"
                placeholder="Enter admin password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                aria-label="Admin password"
              />
              <Button type="submit">Enter</Button>
            </form>
          </CardContent>
        </Card>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="text-2xl font-semibold mb-4">Admin Panel</h1>
      <AdminControls />
    </main>
  )
}

function AdminControls() {
  const { data } = useSWR<Appointment[]>("/api/appointments", fetcher, {
    refreshInterval: 2000,
    revalidateOnFocus: true,
  })
  const [date, setDate] = useState("")

  const todays = useMemo(() => {
    if (!data || !date) return []
    // Filter by date only, ignoring time
    return data.filter((a) => a.datetime.split("T")[0] === date)
  }, [data, date])

  async function confirmFirstTen() {
    if (!date) {
      alert("Pick a date")
      return
    }
    const res = await fetch("/api/appointments/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date }),
    })
    if (!res.ok) {
      alert("Failed to confirm")
      return
    }
    mutate("/api/appointments")
  }

  async function updateStatus(id: string, status: "confirmed" | "completed") {
    const res = await fetch(`/api/appointments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    if (!res.ok) {
      alert("Failed to update status")
      return
    }
    mutate("/api/appointments")
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Daily Confirmation</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-[1fr_auto]">
          <div className="grid gap-1">
            <label className="text-sm text-muted-foreground">Pick a date</label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="flex items-end">
            <Button className="w-full md:w-auto" onClick={confirmFirstTen}>
              Confirm first 10
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appointments {date ? `on ${date}` : ""}</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-secondary-foreground">
              <tr>
                <th className="px-3 py-2 text-left">Rep</th>
                <th className="px-3 py-2 text-left">Doctor</th>
                <th className="px-3 py-2 text-left">Date</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {todays.map((a) => (
                <tr key={a.id} className="border-t">
                  <td className="px-3 py-2">
                    <div className="font-medium">{a.repName}</div>
                    <div className="text-muted-foreground">{a.email}</div>
                  </td>
                  <td className="px-3 py-2">{a.doctorName}</td>
                  <td className="px-3 py-2">{new Date(a.datetime).toLocaleDateString()}</td>
                  <td className="px-3 py-2">
                    <Badge variant={a.status === "pending" ? "secondary" : "default"}>{a.status}</Badge>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-2">
                      {a.status === "pending" && (
                        <Button size="sm" variant="secondary" onClick={() => updateStatus(a.id, "confirmed")}>
                          Confirm
                        </Button>
                      )}
                      {a.status === "confirmed" && (
                        <Button size="sm" onClick={() => updateStatus(a.id, "completed")}>
                          Mark Completed
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {date && todays.length === 0 && (
                <tr>
                  <td className="px-3 py-4" colSpan={5}>
                    No appointments for {date}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
