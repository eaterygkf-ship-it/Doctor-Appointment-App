import Image from "next/image"
import { DashboardClient } from "@/components/dashboard-client"

export default function Page() {
  return (
    <main className="min-h-dvh">
      <header className="border-b bg-card">
        <div className="mx-auto max-w-6xl px-6 py-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-pretty">Doctor Rep Appointments</h1>
            <p className="text-muted-foreground">Live, date-wise schedule with filters and print view.</p>
          </div>
          <div className="rounded-lg overflow-hidden border">
            <Image
              src="/clinic-schedule-illustration.jpg"
              alt="Clinic schedule"
              width={320}
              height={160}
              className="block"
              priority
            />
          </div>
        </div>
      </header>
      <section className="mx-auto max-w-6xl px-6 py-8">
        <DashboardClient />
      </section>
    </main>
  )
}
