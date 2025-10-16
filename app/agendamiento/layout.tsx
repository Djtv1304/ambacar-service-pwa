import type React from "react"
import { Geist, Geist_Mono } from "next/font/google"
import "../globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata = {
  title: "Agendamiento de Citas - Ambacar",
  description: "Agenda tu cita de servicio automotriz con Ambacar",
}

export default function AgendamientoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-white text-[#202020] font-sans antialiased">{children}</body>
    </html>
  )
}
