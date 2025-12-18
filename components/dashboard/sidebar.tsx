"use client"

import type React from "react"
import { useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
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
  CarFront,
  Menu,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth/auth-provider"
import { useSidebar } from "@/components/dashboard/sidebar-context"
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
    title: "Mis Servicios",
    href: "/dashboard/mis-servicios",
    icon: CarFront,
    roles: ["customer", "admin", "manager", "operator"],
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
    roles: ["admin", "manager", "technician"],
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

// Mobile FAB Toggle Button (visible only on mobile, bottom-left position)
export function MobileMenuToggle() {
  const { mobileOpen, toggleMobile, isMobile } = useSidebar()

  if (!isMobile) return null

  return (
    <AnimatePresence>
      {!mobileOpen && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          onClick={toggleMobile}
          className="fixed bottom-6 left-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg md:hidden"
          aria-label="Abrir menú"
          whileTap={{ scale: 0.9 }}
        >
          <Menu className="h-6 w-6" />
        </motion.button>
      )}
    </AnimatePresence>
  )
}

// Desktop Sidebar Content
function DesktopSidebar() {
  const { collapsed, toggle } = useSidebar()
  const pathname = usePathname()
  const { user } = useAuth()

  const filteredNavItems = navItems.filter(
    (item) => !item.roles || (user && item.roles.includes(user.role))
  )

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 256 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed left-0 top-0 z-40 h-screen border-r border-border bg-card hidden md:block"
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
                  isActive
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-white"
                    : "bg-white text-muted-foreground"
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.title}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Collapse Toggle - Full clickable area */}
        <button
          onClick={toggle}
          className="flex items-center justify-center h-14 border-t border-border hover:bg-accent transition-colors cursor-pointer"
          aria-label={collapsed ? "Expandir sidebar" : "Colapsar sidebar"}
        >
          <ChevronLeft
            className={cn(
              "h-5 w-5 text-muted-foreground transition-transform duration-300",
              collapsed && "rotate-180"
            )}
          />
        </button>
      </div>
    </motion.aside>
  )
}

// Mobile Drawer Sidebar
function MobileSidebar() {
  const { mobileOpen, setMobileOpen } = useSidebar()
  const pathname = usePathname()
  const { user } = useAuth()

  const filteredNavItems = navItems.filter(
    (item) => !item.roles || (user && item.roles.includes(user.role))
  )

  // Close sidebar on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname, setMobileOpen])

  return (
    <AnimatePresence>
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed left-0 top-0 z-50 h-screen w-72 border-r border-border bg-card shadow-xl md:hidden"
          >
            <div className="flex h-full flex-col">
              {/* Header - Clean, just logo */}
              <div className="flex h-16 items-center border-b border-border px-4">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2"
                  onClick={() => setMobileOpen(false)}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                    <span className="text-sm font-bold text-primary-foreground">A</span>
                  </div>
                  <span className="text-lg font-bold">Ambacar</span>
                </Link>
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
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                        "hover:bg-accent hover:text-accent-foreground",
                        isActive
                          ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-white"
                          : "bg-white text-muted-foreground"
                      )}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      <span>{item.title}</span>
                    </Link>
                  )
                })}
              </nav>

              {/* Footer - Copyright + Close Button (Thumb Zone) */}
              <div className="flex flex-col">
                {/* Copyright */}
                <div className="px-4 py-3">
                  <p className="text-xs text-muted-foreground text-center">
                    Ambacar Service © 2025
                  </p>
                </div>

                {/* Close Button - Full width touch target */}
                <button
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 h-14 bg-muted/50 hover:bg-muted transition-colors border-t border-border"
                  aria-label="Cerrar menú"
                >
                  <ChevronLeft className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Cerrar menú</span>
                </button>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

// Main Sidebar Component
export function Sidebar() {
  const { isMobile } = useSidebar()

  return (
    <>
      {/* Desktop Sidebar - Push layout */}
      {!isMobile && <DesktopSidebar />}

      {/* Mobile Sidebar - Overlay Drawer */}
      {isMobile && <MobileSidebar />}
    </>
  )
}

