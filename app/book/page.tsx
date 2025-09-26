import Image from "next/image"
import { BookingForm } from "@/components/booking-form"
import Link from "next/link"

export default function Page() {
  return (
    <main className="min-h-dvh">
      <header className="border-b bg-card">
        <div className="mx-auto max-w-6xl px-6 py-8 grid gap-6 md:grid-cols-2 md:items-center">
          <div>
            <h1 className="text-2xl font-semibold text-pretty">Book an Appointment</h1>
            <p className="text-muted-foreground">
              Medical representatives can request a meeting time with doctors. You will receive a confirmation email
              once approved.
            </p>
            <p className="text-sm mt-2">
              Need assistance?{" "}
              <Link href="/contact" className="text-primary underline underline-offset-2">
                Contact us here
              </Link>
              .
            </p>
          </div>
          <div className="justify-self-end rounded-lg overflow-hidden border">
            <Image
              src="/doctor-appointment-booking-illustration.jpg"
              alt="Booking illustration"
              width={400}
              height={240}
            />
          </div>
        </div>
      </header>
      <section className="mx-auto max-w-3xl px-6 py-8">
        <BookingForm />
      </section>
    </main>
  )
}
