import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Agendamiento de Citas - Ambacar",
  description: "Agenda tu cita de servicio automotriz con Ambacar",
}

export default function AgendamientoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
