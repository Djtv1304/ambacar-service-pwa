"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"
import { Fragment } from "react"

const pathLabels: Record<string, string> = {
  dashboard: "Dashboard",
  citas: "Citas",
  recepcion: "Recepción",
  diagnostico: "Diagnóstico",
  ot: "Órdenes de Trabajo",
  inventario: "Inventario",
  taller: "Taller",
  facturacion: "Facturación",
  clientes: "Clientes",
  reportes: "Reportes",
  configuracion: "Configuración",
  nueva: "Nueva",
  nuevo: "Nuevo",
  editar: "Editar",
}

export function Breadcrumbs() {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)

  if (segments.length <= 1) return null

  return (
    <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
      <Link href="/dashboard" className="flex items-center gap-1 hover:text-foreground transition-colors">
        <Home className="h-4 w-4" />
      </Link>

      {segments.slice(1).map((segment, index) => {
        const href = `/${segments.slice(0, index + 2).join("/")}`
        const label = pathLabels[segment] || segment
        const isLast = index === segments.length - 2

        return (
          <Fragment key={segment}>
            <ChevronRight className="h-4 w-4" />
            {isLast ? (
              <span className="font-medium text-foreground">{label}</span>
            ) : (
              <Link href={href} className="hover:text-foreground transition-colors">
                {label}
              </Link>
            )}
          </Fragment>
        )
      })}
    </nav>
  )
}
