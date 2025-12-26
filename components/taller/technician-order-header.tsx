"use client"

import { useState, useEffect, useRef } from "react"
import {
  ArrowLeft,
  Phone,
  ChevronDown,
  Check,
  Pause,
  Play,
  AlertTriangle
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { TechnicianOrder } from "@/lib/fixtures/technical-progress"
import { getRelativeDeliveryDate } from "@/lib/fixtures/technical-progress"
import { cn } from "@/lib/utils"

interface TechnicianOrderHeaderProps {
  order: TechnicianOrder
  onStatusChange: (status: TechnicianOrder["estado"]) => void
}

const STATUS_CONFIG = {
  abierta: {
    label: "Abierta",
    color: "bg-blue-500",
    textColor: "text-blue-600",
    bgLight: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    icon: Play,
  },
  en_proceso: {
    label: "En Proceso",
    color: "bg-green-500",
    textColor: "text-green-600",
    bgLight: "bg-green-500/10",
    borderColor: "border-green-500/30",
    icon: Play,
  },
  pausada: {
    label: "Pausada",
    color: "bg-yellow-500",
    textColor: "text-yellow-600",
    bgLight: "bg-yellow-500/10",
    borderColor: "border-yellow-500/30",
    icon: Pause,
  },
  cerrada: {
    label: "Cerrada",
    color: "bg-gray-500",
    textColor: "text-gray-600",
    bgLight: "bg-gray-500/10",
    borderColor: "border-gray-500/30",
    icon: Check,
  },
}

export function TechnicianOrderHeader({ order, onStatusChange }: TechnicianOrderHeaderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSticky, setIsSticky] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const statusConfig = STATUS_CONFIG[order.estado]
  const deliveryInfo = getRelativeDeliveryDate(order.fechaEstimadaEntrega)

  useEffect(() => {
    const sentinel = sentinelRef.current
    const header = headerRef.current
    if (!sentinel || !header) return

    // Estrategia dual: IntersectionObserver + scroll listener con RAF para precisión
    let rafId: number | null = null
    let lastScrollY = window.scrollY

    // IntersectionObserver para la detección principal
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSticky(!entry.isIntersecting)
      },
      {
        threshold: [0, 1],
        // Margen negativo para anticipar el cambio durante scroll rápido
        rootMargin: '-1px 0px 0px 0px'
      }
    )

    // Scroll listener con RAF para scroll agresivo/rápido
    const handleScroll = () => {
      if (rafId) return

      rafId = requestAnimationFrame(() => {
        const currentScrollY = window.scrollY
        const sentinelRect = sentinel.getBoundingClientRect()

        // Detección anticipada: si el sentinel está a punto de salir del viewport
        const isAboutToStick = sentinelRect.bottom <= 0

        setIsSticky(isAboutToStick)

        lastScrollY = currentScrollY
        rafId = null
      })
    }

    observer.observe(sentinel)
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', handleScroll)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [])

  const handleCall = () => {
    window.location.href = `tel:${order.cliente.telefono}`
  }

  return (
    <>
      {/* Sentinel element to detect sticky state - positioned above header */}
      <div ref={sentinelRef} className="h-0 -mx-4 sm:-mx-6" aria-hidden="true" />

      <div
        ref={headerRef}
        className={cn(
          "sticky -top-14 z-40 bg-background/95 backdrop-blur-sm border-b -mx-4 sm:-mx-6 px-4 sm:px-6",
          "will-change-[padding]",
          isSticky ? "pt-10" : "pt-0"
        )}
      >
      {/* Main header row */}
      <div className="flex items-center justify-between gap-3 py-3">
        {/* Left side - Back + Order code */}
        <div className="flex items-center gap-2 min-w-0">
          <Button variant="ghost" size="icon" asChild className="shrink-0 -ml-2">
            <Link href="/dashboard/taller">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold truncate">{order.codigo}</h1>
            <p className="text-xs text-muted-foreground hidden sm:block">
              {order.tipoOrden === "mantenimiento" ? "Mantenimiento" :
               order.tipoOrden === "reparacion" ? "Reparación" : "Garantía"}
            </p>
          </div>
        </div>

        {/* Right side - Status selector (Prominent Badge with full text) */}
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "gap-2 h-10 px-3 sm:px-4 font-semibold transition-all",
                statusConfig.bgLight,
                statusConfig.borderColor,
                statusConfig.textColor,
                "hover:opacity-90"
              )}
            >
              <div className={cn("h-2.5 w-2.5 rounded-full shrink-0", statusConfig.color)} />
              <span className="text-sm">{statusConfig.label}</span>
              <ChevronDown className={cn(
                "h-4 w-4 transition-transform shrink-0",
                isOpen && "rotate-180"
              )} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {Object.entries(STATUS_CONFIG).map(([key, config]) => {
              const isActive = key === order.estado
              return (
                <DropdownMenuItem
                  key={key}
                  onClick={() => onStatusChange(key as TechnicianOrder["estado"])}
                  className={cn(
                    "gap-3 py-2.5 cursor-pointer",
                    isActive && "bg-muted"
                  )}
                >
                  <div className={cn("h-3 w-3 rounded-full", config.color)} />
                  <span className="flex-1">{config.label}</span>
                  {isActive && <Check className="h-4 w-4 text-primary" />}
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Info bar - Client, Vehicle, Delivery */}
      <div className="flex items-center gap-2 px-4 pb-3 overflow-x-auto">
        {/* Client with phone */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleCall}
          className="shrink-0 gap-1.5 h-8 text-xs"
        >
          <Phone className="h-3.5 w-3.5" />
          <span className="max-w-24 truncate">{order.cliente.nombre}</span>
        </Button>

        {/* Vehicle */}
        <Badge variant="secondary" className="shrink-0">
          {order.vehiculo.placa}
        </Badge>

        {/* Delivery estimate */}
        <Badge
          variant="outline"
          className={cn(
            "shrink-0 ml-auto",
            deliveryInfo.isLate && "border-red-500/50 bg-red-500/10 text-red-600"
          )}
        >
          {deliveryInfo.isLate && <AlertTriangle className="h-3 w-3 mr-1" />}
          {deliveryInfo.text}
        </Badge>
      </div>
      </div>
    </>
  )
}

