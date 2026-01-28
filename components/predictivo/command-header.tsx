"use client"

import { useState, useEffect, useRef, useCallback } from "react"
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
import { marcaOptions, modeloOptions } from "@/lib/fixtures/predictive-data"
import type { TallerPredictivo } from "@/lib/api/predictivo"
import { TrendingUp, AlertTriangle, CheckCircle2, ChevronUp, ChevronDown, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface CommandHeaderProps {
  taller: string
  marca: string
  modelo: string
  range: "weekly" | "monthly"
  periods: number
  isOverload: boolean
  isLoading?: boolean
  workshops: TallerPredictivo[]
  isLoadingWorkshops?: boolean
  onTallerChange: (value: string) => void
  onMarcaChange: (value: string) => void
  onModeloChange: (value: string) => void
  onRangeChange: (range: "weekly" | "monthly") => void
  onPeriodsChange: (periods: number) => void
}

const PERIOD_LIMITS = {
  weekly: { min: 1, max: 52 },
  monthly: { min: 1, max: 12 },
}

// ============================================================================
// Period Input Component - Desktop Version
// ============================================================================
interface PeriodInputProps {
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  unit: string
  unitSingular: string
  isLoading?: boolean
}

function PeriodInput({ value, onChange, min, max, unit, unitSingular, isLoading }: PeriodInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [localValue, setLocalValue] = useState(value.toString())
  const [isFocused, setIsFocused] = useState(false)

  // Sync local value with prop
  useEffect(() => {
    if (!isFocused) {
      setLocalValue(value.toString())
    }
  }, [value, isFocused])

  const handleIncrement = useCallback(() => {
    if (value < max && !isLoading) {
      onChange(value + 1)
    }
  }, [value, max, onChange, isLoading])

  const handleDecrement = useCallback(() => {
    if (value > min && !isLoading) {
      onChange(value - 1)
    }
  }, [value, min, onChange, isLoading])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "")
    setLocalValue(raw)
  }

  const handleInputBlur = () => {
    setIsFocused(false)
    const parsed = parseInt(localValue, 10)
    if (isNaN(parsed) || parsed < min) {
      onChange(min)
      setLocalValue(min.toString())
    } else if (parsed > max) {
      onChange(max)
      setLocalValue(max.toString())
    } else {
      onChange(parsed)
      setLocalValue(parsed.toString())
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      inputRef.current?.blur()
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      handleIncrement()
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      handleDecrement()
    }
  }

  return (
    <div className="group relative">
      <div
        className={cn(
          "flex items-center gap-2 rounded-xl border px-3 py-1.5 transition-all duration-200",
          "bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900/60 dark:to-gray-900/60",
          isFocused
            ? "border-blue-400 dark:border-blue-500 shadow-lg shadow-blue-500/10 ring-2 ring-blue-500/20"
            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600",
          isLoading && "opacity-60 pointer-events-none"
        )}
      >
        {/* Decrement Button */}
        <button
          type="button"
          onClick={handleDecrement}
          disabled={value <= min || isLoading}
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-lg transition-all duration-150",
            "hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-95",
            value <= min
              ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
              : "text-gray-600 dark:text-gray-300"
          )}
        >
          <ChevronDown className="h-4 w-4" />
        </button>

        {/* Editable Number Display */}
        <div className="flex items-baseline gap-1.5">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              value={localValue}
              onChange={handleInputChange}
              onFocus={() => setIsFocused(true)}
              onBlur={handleInputBlur}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              className={cn(
                "w-10 bg-transparent text-center text-xl font-bold tabular-nums outline-none",
                "text-gray-900 dark:text-gray-100",
                "selection:bg-blue-200 dark:selection:bg-blue-800"
              )}
              aria-label={`Número de ${unit}`}
            />
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
              </div>
            )}
          </div>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
            {value === 1 ? unitSingular : unit}
          </span>
        </div>

        {/* Increment Button */}
        <button
          type="button"
          onClick={handleIncrement}
          disabled={value >= max || isLoading}
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-lg transition-all duration-150",
            "hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-95",
            value >= max
              ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
              : "text-gray-600 dark:text-gray-300"
          )}
        >
          <ChevronUp className="h-4 w-4" />
        </button>
      </div>

      {/* Range Hint */}
      <div
        className={cn(
          "absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-gray-400 dark:text-gray-500 whitespace-nowrap transition-opacity duration-200",
          isFocused ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}
      >
        {min} - {max}
      </div>
    </div>
  )
}

// ============================================================================
// Period Input Component - Mobile Compact Version
// ============================================================================
interface PeriodInputCompactProps {
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  unit: string
  isLoading?: boolean
}

function PeriodInputCompact({ value, onChange, min, max, unit, isLoading }: PeriodInputCompactProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [localValue, setLocalValue] = useState(value.toString())
  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => {
    if (!isFocused) {
      setLocalValue(value.toString())
    }
  }, [value, isFocused])

  const handleIncrement = useCallback(() => {
    if (value < max && !isLoading) {
      onChange(value + 1)
    }
  }, [value, max, onChange, isLoading])

  const handleDecrement = useCallback(() => {
    if (value > min && !isLoading) {
      onChange(value - 1)
    }
  }, [value, min, onChange, isLoading])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "")
    setLocalValue(raw)
  }

  const handleInputBlur = () => {
    setIsFocused(false)
    const parsed = parseInt(localValue, 10)
    if (isNaN(parsed) || parsed < min) {
      onChange(min)
      setLocalValue(min.toString())
    } else if (parsed > max) {
      onChange(max)
      setLocalValue(max.toString())
    } else {
      onChange(parsed)
      setLocalValue(parsed.toString())
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      inputRef.current?.blur()
    }
  }

  return (
    <div
      className={cn(
        "flex items-center gap-0.5 rounded-lg border px-1 py-0.5 transition-all duration-200",
        "bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900/60 dark:to-gray-900/60",
        isFocused
          ? "border-blue-400 dark:border-blue-500 ring-1 ring-blue-500/20"
          : "border-gray-200 dark:border-gray-700",
        isLoading && "opacity-60"
      )}
    >
      {/* Decrement */}
      <button
        type="button"
        onClick={handleDecrement}
        disabled={value <= min || isLoading}
        className={cn(
          "flex h-6 w-5 items-center justify-center rounded transition-colors",
          value <= min
            ? "text-gray-300 dark:text-gray-600"
            : "text-gray-500 dark:text-gray-400 active:bg-gray-200 dark:active:bg-gray-700"
        )}
      >
        <ChevronDown className="h-3 w-3" />
      </button>

      {/* Number + Unit */}
      <div className="flex items-center gap-0.5 px-0.5">
        {isLoading ? (
          <div className="w-6 flex items-center justify-center">
            <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
          </div>
        ) : (
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            value={localValue}
            onChange={handleInputChange}
            onFocus={() => setIsFocused(true)}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            className={cn(
              "w-6 bg-transparent text-center text-xs font-bold tabular-nums outline-none",
              "text-gray-900 dark:text-gray-100"
            )}
          />
        )}
        <span className="text-[9px] font-medium text-gray-400 dark:text-gray-500 uppercase">
          {unit}
        </span>
      </div>

      {/* Increment */}
      <button
        type="button"
        onClick={handleIncrement}
        disabled={value >= max || isLoading}
        className={cn(
          "flex h-6 w-5 items-center justify-center rounded transition-colors",
          value >= max
            ? "text-gray-300 dark:text-gray-600"
            : "text-gray-500 dark:text-gray-400 active:bg-gray-200 dark:active:bg-gray-700"
        )}
      >
        <ChevronUp className="h-3 w-3" />
      </button>
    </div>
  )
}

/**
 * Converts UPPERCASE text to Title Case
 */
function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

export function CommandHeader({
  taller,
  marca,
  modelo,
  range,
  periods,
  isOverload,
  isLoading,
  workshops,
  isLoadingWorkshops,
  onTallerChange,
  onMarcaChange,
  onModeloChange,
  onRangeChange,
  onPeriodsChange,
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
        <div className="flex flex-col gap-2 p-2 sm:gap-3 sm:p-3 xl:gap-4 xl:p-4 xl:flex-row xl:items-center xl:justify-between">
          {/* Top row: Title only (mobile) */}
          <div className="flex items-center gap-1.5 min-w-0 xl:hidden">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 shrink-0">
              <TrendingUp className="h-3 w-3 text-white" />
            </div>
            <h1 className="text-base font-bold text-gray-900 dark:text-gray-100 truncate">
              Predicción de Demanda
            </h1>
          </div>

          {/* Desktop: Left side with Title + Filters */}
          <div className="hidden xl:flex xl:flex-row xl:items-center xl:gap-6">
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
              <Select value={taller} onValueChange={onTallerChange} disabled={isLoadingWorkshops}>
                <SelectTrigger className="h-9 w-auto border-0 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400">
                  <SelectValue placeholder={isLoadingWorkshops ? "Cargando..." : "Taller"} />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 max-h-[300px]">
                  <SelectItem
                    value="all"
                    className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-800"
                  >
                    Todos los Talleres
                  </SelectItem>
                  {workshops.map((workshop) => (
                    <SelectItem
                      key={workshop.id}
                      value={workshop.id}
                      className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-800"
                    >
                      {toTitleCase(workshop.nombre)}
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
          <div className="xl:hidden -mx-2 px-2 overflow-x-auto">
            <div className="flex items-center gap-1.5 min-w-max">
              <Select value={taller} onValueChange={onTallerChange} disabled={isLoadingWorkshops}>
                <SelectTrigger className="h-7 w-auto border-0 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 text-xs">
                  <SelectValue placeholder={isLoadingWorkshops ? "..." : "Taller"} />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 max-h-[280px]">
                  <SelectItem
                    value="all"
                    className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-800"
                  >
                    Todos
                  </SelectItem>
                  {workshops.map((workshop) => (
                    <SelectItem
                      key={workshop.id}
                      value={workshop.id}
                      className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-800"
                    >
                      {toTitleCase(workshop.nombre)}
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

          {/* Mobile/Tablet: Range Control + Period Selector + Status */}
          <div className="flex items-center gap-2 xl:hidden">
            {/* Time Range Control - Mobile */}
            <div className="flex items-center justify-center gap-0.5 rounded-lg bg-gray-100 dark:bg-gray-900 p-0.5">
              <Button
                variant={range === "weekly" ? "default" : "ghost"}
                size="sm"
                onClick={() => onRangeChange("weekly")}
                className={
                  range === "weekly"
                    ? "h-7 text-[10px] px-2 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 shadow-sm hover:bg-white dark:hover:bg-gray-950"
                    : "h-7 text-[10px] px-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-transparent"
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
                    ? "h-7 text-[10px] px-2 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 shadow-sm hover:bg-white dark:hover:bg-gray-950"
                    : "h-7 text-[10px] px-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-transparent"
                }
              >
                Men
              </Button>
            </div>

            {/* Period Selector - Mobile Compact */}
            <PeriodInputCompact
              value={periods}
              onChange={onPeriodsChange}
              min={PERIOD_LIMITS[range].min}
              max={PERIOD_LIMITS[range].max}
              unit={range === "weekly" ? "sem" : "mes"}
              isLoading={isLoading}
            />

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
          <div className="hidden xl:flex xl:items-center xl:justify-center xl:flex-1">
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

          {/* Desktop: Time Range Control + Period Selector */}
          <div className="hidden xl:flex items-center gap-3">
            {/* Range Toggle */}
            <div className="flex items-center gap-1 rounded-lg bg-gray-100 dark:bg-gray-900 p-1">
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

            {/* Period Selector - Inline Editable Number */}
            <PeriodInput
              value={periods}
              onChange={onPeriodsChange}
              min={PERIOD_LIMITS[range].min}
              max={PERIOD_LIMITS[range].max}
              unit={range === "weekly" ? "semanas" : "meses"}
              unitSingular={range === "weekly" ? "semana" : "mes"}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </>
  )
}
