import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Recepción Digital | Ambacar",
    description: "Gestiona la recepción digital de vehículos en Ambacar",
}

export default function RecepcionLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
}