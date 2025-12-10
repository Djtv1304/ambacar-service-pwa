"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import {
  Calendar,
  ClipboardList,
  Package,
  Wrench,
  CreditCard,
  Users,
  BarChart3,
  Settings,
  ChevronLeft,
  LayoutDashboard,
  Stethoscope,
  CalendarCheck,
  ClipboardCheck,
  Images,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import type { UserRole } from "@/lib/types"

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  roles?: UserRole[]
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Citas",
    href: "/dashboard/citas",
    icon: Calendar,
    roles: [],
  },
  {
    title: "Recepción",
    href: "/dashboard/recepcion",
    icon: CalendarCheck,
    roles: ["admin", "operator", "manager"],
  },
  {
    title: "Diagnóstico",
    href: "/dashboard/diagnostico",
    icon: Stethoscope,
    roles: [],
  },
  {
    title: "Inspecciones",
    href: "/dashboard/inspecciones",
    icon: ClipboardCheck,
    roles: ["admin", "technician", "manager"],
  },
  {
    title: "Registro Multimedia",
    href: "/dashboard/multimedia",
    icon: Images,
    roles: ["admin", "technician", "manager", "operator"],
  },
  {
    title: "Órdenes de Trabajo",
    href: "/dashboard/ot",
    icon: ClipboardList,
    roles: ["admin", "operator", "technician", "manager"],
  },
  {
    title: "Inventario",
    href: "/dashboard/inventario",
    icon: Package,
    roles: ["admin", "manager"],
  },
  {
    title: "Taller",
    href: "/dashboard/taller",
    icon: Wrench,
    roles: ["admin", "manager"],
  },
  {
    title: "Facturación",
    href: "/dashboard/facturacion",
    icon: CreditCard,
    roles: [],
  },
  {
    title: "Clientes",
    href: "/dashboard/clientes",
    icon: Users,
    roles: ["admin", "operator", "manager"],
  },
  {
    title: "Reportes",
    href: "/dashboard/reportes",
    icon: BarChart3,
    roles: [],
  },
  {
    title: "Configuración",
    href: "/dashboard/configuracion",
    icon: Settings,
    roles: ["admin"],
  },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const { user } = useAuth()

  const filteredNavItems = navItems.filter((item) => !item.roles || (user && item.roles.includes(user.role)))

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 256 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed left-0 top-0 z-40 h-screen border-r border-border bg-card"
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          {!collapsed && (
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="text-sm font-bold text-primary-foreground">A</span>
              </div>
              <span className="text-lg font-bold">Ambacar</span>
            </Link>
          )}
          {collapsed && (
            <Link href="/dashboard" className="flex items-center justify-center w-full">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="text-sm font-bold text-primary-foreground">A</span>
              </div>
            </Link>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {filteredNavItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  isActive ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-white" : "bg-white text-muted-foreground"
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.title}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Collapse Toggle */}
        <div className="border-t border-border p-3">
          <Button variant="ghost" size="sm" onClick={() => setCollapsed(!collapsed)} className="w-full justify-center">
            <ChevronLeft className={cn("h-5 w-5 transition-transform", collapsed && "rotate-180")} />
          </Button>
        </div>
      </div>
    </motion.aside>
  )
}
