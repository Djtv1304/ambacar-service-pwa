"use client"

import { useState, useEffect, useRef } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { tallerOptions, marcaOptions, modeloOptions } from "@/lib/fixtures/predictive-data"
import { TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface CommandHeaderProps {
  taller: string
  marca: string
  modelo: string
  range: "weekly" | "monthly"
  isOverload: boolean
  onTallerChange: (value: string) => void
  onMarcaChange: (value: string) => void
  onModeloChange: (value: string) => void
  onRangeChange: (range: "weekly" | "monthly") => void
}

export function CommandHeader({
  taller,
  marca,
  modelo,
  range,
  isOverload,
  onTallerChange,
  onMarcaChange,
  onModeloChange,
  onRangeChange,
}: CommandHeaderProps) {
  const [isNotifying, setIsNotifying] = useState(false)
  const [isSticky, setIsSticky] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)

  // Sentinel-based sticky detection (same technique as technician-order-header)
  useEffect(() => {
    const sentinel = sentinelRef.current
    const header = headerRef.current
    if (!sentinel || !header) return

    let rafId: number | null = null

    // IntersectionObserver for main detection
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSticky(!entry.isIntersecting)
      },
      {
        threshold: [0, 1],
        rootMargin: "-1px 0px 0px 0px",
      }
    )

    // Scroll listener with RAF for aggressive/fast scrolling
    const handleScroll = () => {
      if (rafId) return

      rafId = requestAnimationFrame(() => {
        const sentinelRect = sentinel.getBoundingClientRect()
        const isAboutToStick = sentinelRect.bottom <= 0
        setIsSticky(isAboutToStick)
        rafId = null
      })
    }

    observer.observe(sentinel)
    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => {
      observer.disconnect()
      window.removeEventListener("scroll", handleScroll)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [])

  const handleTriggerAlert = async () => {
    setIsNotifying(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    toast.success("Alerta enviada", {
      description: "El equipo de gestión ha sido notificado sobre la sobrecarga proyectada.",
    })
    setIsNotifying(false)
  }

  return (
    <>
      {/* Sentinel element to detect sticky state - positioned above header */}
      <div ref={sentinelRef} className="h-0" aria-hidden="true" />

      <div
        ref={headerRef}
        className={cn(
          "sticky -top-10 z-20 bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 shadow-sm",
          "will-change-[padding] transition-[padding] duration-150",
          isSticky ? "pt-6" : "pt-0"
        )}
      >
        <div className="flex flex-col gap-2 p-2 sm:gap-3 sm:p-3 lg:gap-4 lg:p-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Top row: Title only (mobile) */}
          <div className="flex items-center gap-1.5 min-w-0 lg:hidden">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 shrink-0">
              <TrendingUp className="h-3 w-3 text-white" />
            </div>
            <h1 className="text-base font-bold text-gray-900 dark:text-gray-100 truncate">
              Predicción de Demanda
            </h1>
          </div>

          {/* Desktop: Left side with Title + Filters */}
          <div className="hidden lg:flex lg:flex-row lg:items-center lg:gap-6">
            {/* Title with Icon */}
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Predicción de Demanda
              </h1>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
              <Select value={taller} onValueChange={onTallerChange}>
                <SelectTrigger className="h-9 w-auto border-0 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400">
                  <SelectValue placeholder="Taller" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800">
                  {tallerOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-800"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <span className="text-gray-400 dark:text-gray-600">/</span>

              <Select value={marca} onValueChange={onMarcaChange}>
                <SelectTrigger className="h-9 w-auto border-0 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400">
                  <SelectValue placeholder="Marca" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800">
                  {marcaOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-800"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <span className="text-gray-400 dark:text-gray-600">/</span>

              <Select value={modelo} onValueChange={onModeloChange}>
                <SelectTrigger className="h-9 w-auto border-0 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400">
                  <SelectValue placeholder="Modelo" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800">
                  {modeloOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-800"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Mobile: Filters row with horizontal scroll */}
          <div className="lg:hidden -mx-2 px-2 overflow-x-auto">
            <div className="flex items-center gap-1.5 min-w-max">
              <Select value={taller} onValueChange={onTallerChange}>
                <SelectTrigger className="h-7 w-auto border-0 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 text-xs">
                  <SelectValue placeholder="Taller" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800">
                  {tallerOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-800"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <span className="text-gray-400 dark:text-gray-600 text-xs">/</span>

              <Select value={marca} onValueChange={onMarcaChange}>
                <SelectTrigger className="h-7 w-auto border-0 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 text-xs">
                  <SelectValue placeholder="Marca" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800">
                  {marcaOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-800"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <span className="text-gray-400 dark:text-gray-600 text-xs">/</span>

              <Select value={modelo} onValueChange={onModeloChange}>
                <SelectTrigger className="h-7 w-auto border-0 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 text-xs">
                  <SelectValue placeholder="Modelo" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800">
                  {modeloOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-800"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Mobile/Tablet: Range Control + Status (50% each) */}
          <div className="flex items-center gap-2 lg:hidden">
            {/* Time Range Control - Mobile (50%) */}
            <div className="flex-1 flex items-center justify-center gap-0.5 rounded-lg bg-gray-100 dark:bg-gray-900 p-0.5">
              <Button
                variant={range === "weekly" ? "default" : "ghost"}
                size="sm"
                onClick={() => onRangeChange("weekly")}
                className={
                  range === "weekly"
                    ? "flex-1 h-7 text-[10px] px-2 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 shadow-sm hover:bg-white dark:hover:bg-gray-950"
                    : "flex-1 h-7 text-[10px] px-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-transparent"
                }
              >
                Sem
              </Button>
              <Button
                variant={range === "monthly" ? "default" : "ghost"}
                size="sm"
                onClick={() => onRangeChange("monthly")}
                className={
                  range === "monthly"
                    ? "flex-1 h-7 text-[10px] px-2 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 shadow-sm hover:bg-white dark:hover:bg-gray-950"
                    : "flex-1 h-7 text-[10px] px-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-transparent"
                }
              >
                Men
              </Button>
            </div>

            {/* Status Badge - Mobile (50%) */}
            <div className="flex-1 flex items-center justify-center">
              {isOverload ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <motion.button
                      initial={{ scale: 0.95 }}
                      animate={{ scale: 1 }}
                      className="group w-full"
                    >
                      <Badge
                        variant="outline"
                        className="h-7 w-full gap-1 border-orange-500/30 bg-orange-50 dark:bg-orange-900/20 px-2 text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900/30 cursor-pointer justify-center"
                      >
                        <AlertTriangle className="h-3 w-3 animate-pulse" />
                        <span className="font-semibold text-[10px]">Alerta</span>
                      </Badge>
                    </motion.button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[calc(100vw-2rem)] max-w-96 bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-500/20 dark:bg-orange-500/30">
                          <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                            Sobrecarga Detectada
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Se detecta un incremento del <span className="font-semibold">+35%</span> en
                            la demanda para la próxima semana. Se recomienda aumentar recursos
                            operativos.
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 text-xs">
                        <Badge variant="secondary" className="bg-gray-100 dark:bg-gray-800">
                          Taller: {taller === "all" ? "Todos" : taller}
                        </Badge>
                        <Badge variant="secondary" className="bg-gray-100 dark:bg-gray-800">
                          Marca: {marca === "all" ? "Todas" : marca}
                        </Badge>
                        {modelo !== "all" && (
                          <Badge variant="secondary" className="bg-gray-100 dark:bg-gray-800">
                            Modelo: {modelo}
                          </Badge>
                        )}
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={handleTriggerAlert}
                          disabled={isNotifying}
                        >
                          {isNotifying ? "Enviando..." : "Notificar Staff"}
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600"
                          onClick={() => {
                            const element = document.getElementById("recommendations-panel")
                            element?.scrollIntoView({ behavior: "smooth" })
                          }}
                        >
                          Ver Acciones
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              ) : (
                <Badge
                  variant="outline"
                  className="h-7 w-full gap-1 border-green-500/30 bg-green-50 dark:bg-green-900/20 px-2 text-green-700 dark:text-green-300 justify-center"
                >
                  <CheckCircle2 className="h-3 w-3" />
                  <span className="font-medium text-[10px]">Óptimo</span>
                </Badge>
              )}
            </div>
          </div>

          {/* Desktop: Status Indicator Center */}
          <div className="hidden lg:flex lg:items-center lg:justify-center lg:flex-1">
            {isOverload ? (
              <Popover>
                <PopoverTrigger asChild>
                  <motion.button
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    className="group"
                  >
                    <Badge
                      variant="outline"
                      className="h-9 gap-2 border-orange-500/30 bg-orange-50 dark:bg-orange-900/20 px-4 text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900/30 cursor-pointer"
                    >
                      <AlertTriangle className="h-4 w-4 animate-pulse" />
                      <span className="font-semibold text-sm">Sobrecarga (+35%)</span>
                    </Badge>
                  </motion.button>
                </PopoverTrigger>
                <PopoverContent className="w-[calc(100vw-2rem)] max-w-96 bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-500/20 dark:bg-orange-500/30">
                        <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                          Sobrecarga Detectada
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Se detecta un incremento del <span className="font-semibold">+35%</span> en
                          la demanda para la próxima semana. Se recomienda aumentar recursos
                          operativos.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs">
                      <Badge variant="secondary" className="bg-gray-100 dark:bg-gray-800">
                        Taller: {taller === "all" ? "Todos" : taller}
                      </Badge>
                      <Badge variant="secondary" className="bg-gray-100 dark:bg-gray-800">
                        Marca: {marca === "all" ? "Todas" : marca}
                      </Badge>
                      {modelo !== "all" && (
                        <Badge variant="secondary" className="bg-gray-100 dark:bg-gray-800">
                          Modelo: {modelo}
                        </Badge>
                      )}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={handleTriggerAlert}
                        disabled={isNotifying}
                      >
                        {isNotifying ? "Enviando..." : "Notificar Staff"}
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600"
                        onClick={() => {
                          const element = document.getElementById("recommendations-panel")
                          element?.scrollIntoView({ behavior: "smooth" })
                        }}
                      >
                        Ver Acciones
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            ) : (
              <Badge
                variant="outline"
                className="h-9 gap-2 border-green-500/30 bg-green-50 dark:bg-green-900/20 px-4 text-green-700 dark:text-green-300"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span className="font-medium text-sm">Capacidad Óptima</span>
              </Badge>
            )}
          </div>

          {/* Desktop: Time Range Control */}
          <div className="hidden lg:flex items-center gap-1 rounded-lg bg-gray-100 dark:bg-gray-900 p-1">
            <Button
              variant={range === "weekly" ? "default" : "ghost"}
              size="sm"
              onClick={() => onRangeChange("weekly")}
              className={
                range === "weekly"
                  ? "h-8 text-sm bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 shadow-sm hover:bg-white dark:hover:bg-gray-950"
                  : "h-8 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-transparent"
              }
            >
              Semanal
            </Button>
            <Button
              variant={range === "monthly" ? "default" : "ghost"}
              size="sm"
              onClick={() => onRangeChange("monthly")}
              className={
                range === "monthly"
                  ? "h-8 text-sm bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 shadow-sm hover:bg-white dark:hover:bg-gray-950"
                  : "h-8 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-transparent"
              }
            >
              Mensual
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
