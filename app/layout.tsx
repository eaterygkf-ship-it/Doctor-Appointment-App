import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "v0 App",
  description: "Created with v0",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <header className="border-b bg-card">
          <nav className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded bg-primary text-primary-foreground font-medium">
                DR
              </span>
              <span className="font-semibold">Doctor Rep Appointments</span>
            </div>
            <ul className="flex items-center gap-4 text-sm">
              <li>
                <a href="/" className="hover:underline">
                  Home
                </a>
              </li>
              <li>
                <a href="/book" className="hover:underline">
                  Book
                </a>
              </li>
              <li>
                <a href="/doctors" className="hover:underline">
                  Doctors
                </a>
              </li>
              <li>
                <a href="/admin" className="hover:underline">
                  Admin
                </a>
              </li>
            </ul>
          </nav>
        </header>
        <main className="min-h-dvh">
          <Suspense>{children}</Suspense>
        </main>
        <Analytics />
      </body>
    </html>
  )
}
