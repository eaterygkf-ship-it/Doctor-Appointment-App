"use client"

import useSWR from "swr"
import { useMemo, useState } from "react"
import type { Appointment, AppointmentStatus } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function DashboardClient() {
  const { data, isLoading } = useSWR<Appointment[]>("/api/appointments", fetcher, {
    refreshInterval: 2000,
    revalidateOnFocus: true,
  })

  const [date, setDate] = useState("")
  const [doctor, setDoctor] = useState<string>("all")

  const doctors = useMemo(() => {
    const set = new Set<string>()
    data?.forEach((a) => set.add(a.doctorName))
    return Array.from(set).sort()
  }, [data])

  const filtered = useMemo(() => {
    if (!data) return []
    return data.filter((a) => {
      const okDate = date ? a.datetime.startsWith(date) : true
      const okDoctor = doctor === "all" ? true : a.doctorName === doctor
      return okDate && okDoctor
    })
  }, [data, date, doctor])

  const onPrint = () => {
    window.print()
  }

  return (
    <Card className="border">
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-4">
          <span>Appointments</span>
          <div className="flex items-center gap-2 print:hidden">
            <Button variant="secondary" onClick={onPrint}>
              Print
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3 print:hidden">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-muted-foreground">Date</label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} aria-label="Filter by date" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-muted-foreground">Doctor</label>
            <Select value={doctor} onValueChange={setDoctor}>
              <SelectTrigger aria-label="Filter by doctor">
                <SelectValue placeholder="All doctors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {doctors.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-md border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-secondary-foreground">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Rep</th>
                <th className="px-3 py-2 text-left font-medium">Doctor</th>
                <th className="px-3 py-2 text-left font-medium">Date & Time</th>
                <th className="px-3 py-2 text-left font-medium">Contact</th>
                <th className="px-3 py-2 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td className="px-3 py-3" colSpan={5}>
                    Loading...
                  </td>
                </tr>
              )}
              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td className="px-3 py-3" colSpan={5}>
                    No appointments.
                  </td>
                </tr>
              )}
              {filtered.map((a) => (
                <tr key={a.id} className="border-t">
                  <td className="px-3 py-3">
                    <div className="font-medium">{a.repName}</div>
                    <div className="text-muted-foreground">{a.email}</div>
                  </td>
                  <td className="px-3 py-3">{a.doctorName}</td>
                  <td className="px-3 py-3">
                    <div>{new Date(a.datetime).toLocaleString()}</div>
                    <div className="text-muted-foreground text-xs">{a.datetime}</div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-pretty">{a.phone}</div>
                  </td>
                  <td className="px-3 py-3">
                    <StatusBadge status={a.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Separator className="print:hidden" />
        <div className="print:hidden text-sm text-muted-foreground">
          Tip: Use the Book page to create new appointments. The dashboard auto-updates.
        </div>
      </CardContent>
    </Card>
  )
}

function StatusBadge({ status }: { status: AppointmentStatus }) {
  if (status === "confirmed") {
    return <Badge className="bg-accent text-accent-foreground">Confirmed</Badge>
  }
  if (status === "completed") {
    return <Badge className="bg-primary text-primary-foreground">Completed</Badge>
  }
  return <Badge variant="secondary">Pending</Badge>
}
