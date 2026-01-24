"use client"

import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, ClipboardCheck, Clock, Car, AlertTriangle, Calendar, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { obtenerCitasConfirmadas, type CitaConfirmada } from "@/lib/recepcion/api"
import { useToast } from "@/hooks/use-toast"

type CitaStatus = "on_time" | "delayed" | "expired"

interface CitaConEstado extends CitaConfirmada {
  status: CitaStatus
}

function getCitaStatus(cita: CitaConfirmada): CitaStatus {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const citaDate = new Date(cita.fecha + "T00:00:00")
  const citaDateOnly = new Date(citaDate.getFullYear(), citaDate.getMonth(), citaDate.getDate())

  // If the appointment date is before today, it's expired
  if (citaDateOnly < today) {
    return "expired"
  }

  // If it's today, check the time
  if (citaDateOnly.getTime() === today.getTime()) {
    const [hours, minutes] = cita.hora.split(":").map(Number)
    const citaDateTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes)

    // If the appointment time has passed, it's delayed
    if (now > citaDateTime) {
      return "delayed"
    }
  }

  return "on_time"
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00")
  return date.toLocaleDateString("es-EC", {
    day: "2-digit",
    month: "short",
  })
}

function formatHora(hora: string): string {
  // Convert "07:40:00" to "07:40"
  return hora.slice(0, 5)
}

function CitaCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4 lg:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-5 w-24" />
            </div>
            <div className="flex flex-col gap-2 md:grid md:grid-cols-2 md:gap-3 lg:grid-cols-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <Skeleton className="h-10 w-full lg:w-40" />
        </div>
      </CardContent>
    </Card>
  )
}

interface CitaCardProps {
  cita: CitaConEstado
  onIniciarRecepcion: (cita: CitaConEstado) => void
}

function CitaCard({ cita, onIniciarRecepcion }: CitaCardProps) {
  const isDelayed = cita.status === "delayed"
  const isExpired = cita.status === "expired"

  return (
    <Card
      id={`cita-${cita.id}`}
      className={`transition-colors hover:bg-accent/50 ${isDelayed ? "border-amber-500/50" : ""} ${isExpired ? "border-red-500/30 opacity-75" : ""}`}
    >
      <CardContent className="p-4 lg:p-6">
        {isDelayed && (
          <Alert variant="destructive" className="mb-4 border-amber-500 bg-amber-500/10">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <AlertDescription className="text-amber-700 dark:text-amber-400">
              Esta cita tiene un atraso. La hora programada era {formatHora(cita.hora)}.
            </AlertDescription>
          </Alert>
        )}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1 space-y-3">
            {/* Row 1: Name + Badge */}
            <div className="flex items-center justify-between lg:justify-start gap-2">
              <h3 className="font-semibold">{cita.cliente.nombre}</h3>
              <Badge
                variant="outline"
                className={`shrink-0 ${
                  isExpired
                    ? "bg-red-500/10 text-red-500 border-red-500/20"
                    : isDelayed
                      ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                      : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                }`}
              >
                {isExpired ? "Expirada" : isDelayed ? "Atrasada" : "Confirmada"}
              </Badge>
            </div>

            {/* Info rows */}
            <div className="flex flex-col gap-2 md:grid md:grid-cols-2 md:gap-3 lg:grid-cols-3">
              {/* Date/Time */}
              <div className="flex items-center justify-between md:justify-start gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>
                    {formatDate(cita.fecha)} - {formatHora(cita.hora)}
                  </span>
                </div>
                {/* Vehicle visible on mobile only in same row */}
                <div className="flex items-center gap-2 md:hidden">
                  <Car className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>
                    {cita.vehiculo.marca} {cita.vehiculo.modelo}
                  </span>
                </div>
              </div>
              {/* Vehicle - hidden on mobile, visible on tablet/desktop */}
              <div className="hidden md:flex items-center gap-2 text-sm">
                <Car className="h-4 w-4 text-muted-foreground shrink-0" />
                <span>
                  {cita.vehiculo.marca} {cita.vehiculo.modelo}
                </span>
              </div>
              {/* Placa */}
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">Placa:</span>
                <span>{cita.vehiculo.placa}</span>
              </div>
            </div>

            {/* Sucursal */}
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">Sucursal:</span> {cita.sucursal}
            </div>

            {cita.observaciones && (
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Observaciones:</span> {cita.observaciones}
              </p>
            )}
          </div>

          {/* Button */}
          <div className="flex gap-2">
            <Button
              className="w-full lg:w-auto"
              disabled={isExpired}
              onClick={() => onIniciarRecepcion(cita)}
            >
              <ClipboardCheck className="mr-2 h-4 w-4" />
              Iniciar Recepción
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function RecepcionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const highlightId = searchParams.get("highlight")
  const highlightHandled = useRef(false)
  const [citas, setCitas] = useState<CitaConfirmada[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterSucursal, setFilterSucursal] = useState<string>("todas")
  const [activeTab, setActiveTab] = useState("hoy")
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [selectedCita, setSelectedCita] = useState<CitaConEstado | null>(null)
  const { toast } = useToast()

  // Smooth scroll with easeInOutCubic
  const smoothScrollTo = useCallback((container: HTMLElement, target: number, duration: number): Promise<void> => {
    return new Promise((resolve) => {
      const start = container.scrollTop
      const distance = target - start
      if (Math.abs(distance) < 1) { resolve(); return }
      const startTime = performance.now()
      const easeInOutCubic = (t: number) =>
        t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
      const step = (currentTime: number) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)
        container.scrollTop = start + distance * easeInOutCubic(progress)
        if (progress < 1) requestAnimationFrame(step)
        else resolve()
      }
      requestAnimationFrame(step)
    })
  }, [])

  // Handle highlight scroll after data loads
  useEffect(() => {
    if (!highlightId || isLoading || highlightHandled.current) return
    highlightHandled.current = true

    // Small delay to ensure DOM has rendered
    const timer = setTimeout(async () => {
      const cardEl = document.getElementById(`cita-${highlightId}`)
      if (!cardEl) return

      // Find the main scrollable container
      const mainContainer = document.querySelector("main.overflow-y-auto") as HTMLElement
      if (!mainContainer) return

      // Calculate scroll position (center the card in viewport)
      const containerRect = mainContainer.getBoundingClientRect()
      const cardRect = cardEl.getBoundingClientRect()
      const scrollOffset = cardRect.top - containerRect.top + mainContainer.scrollTop - containerRect.height / 3

      await smoothScrollTo(mainContainer, scrollOffset, 800)

      // Apply ripple animation
      cardEl.classList.add("card-ripple-highlight")
      cardEl.addEventListener("animationend", () => {
        cardEl.classList.remove("card-ripple-highlight")
      }, { once: true })

      // Clean the URL param
      router.replace("/dashboard/recepcion", { scroll: false })
    }, 300)

    return () => clearTimeout(timer)
  }, [highlightId, isLoading, smoothScrollTo, router])

  const fetchCitas = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await obtenerCitasConfirmadas()
      setCitas(data)
    } catch (err: any) {
      setError(err.message || "Error al cargar las citas")
      toast({
        title: "Error",
        description: err.message || "No se pudieron cargar las citas confirmadas",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCitas()
  }, [])

  // Get unique sucursales from the data
  const sucursales = useMemo(() => {
    const uniqueSucursales = new Set(citas.map(c => c.sucursal))
    return Array.from(uniqueSucursales).sort()
  }, [citas])

  // Process citas with status
  const citasConEstado = useMemo((): CitaConEstado[] => {
    return citas.map(cita => ({
      ...cita,
      status: getCitaStatus(cita),
    }))
  }, [citas])

  // Filter citas based on search and sucursal
  const filteredCitas = useMemo(() => {
    return citasConEstado.filter((cita) => {
      const matchesSearch =
        searchQuery === "" ||
        cita.cliente.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cita.vehiculo.placa.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cita.numero_referencia.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesSucursal = filterSucursal === "todas" || cita.sucursal === filterSucursal

      return matchesSearch && matchesSucursal
    })
  }, [citasConEstado, searchQuery, filterSucursal])

  // Separate citas by status for tabs
  const citasHoy = useMemo(() => {
    return filteredCitas.filter(c => c.status === "on_time" || c.status === "delayed")
  }, [filteredCitas])

  const citasExpiradas = useMemo(() => {
    return filteredCitas.filter(c => c.status === "expired")
  }, [filteredCitas])

  // Counts for tabs
  const countHoy = citasConEstado.filter(c => c.status === "on_time" || c.status === "delayed").length
  const countExpiradas = citasConEstado.filter(c => c.status === "expired").length

  const handleIniciarRecepcion = (cita: CitaConEstado) => {
    setSelectedCita(cita)
    setShowConfirmDialog(true)
  }

  const handleConfirmRecepcion = () => {
    if (selectedCita) {
      router.push(`/dashboard/recepcion/${selectedCita.numero_referencia}`)
    }
  }

  const renderCitasList = (citasList: CitaConEstado[], emptyMessage: string) => {
    if (isLoading) {
      return (
        <div className="grid gap-4">
          <CitaCardSkeleton />
          <CitaCardSkeleton />
          <CitaCardSkeleton />
        </div>
      )
    }

    if (citasList.length === 0) {
      return (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ClipboardCheck className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium">No hay citas</p>
            <p className="text-sm text-muted-foreground">{emptyMessage}</p>
          </CardContent>
        </Card>
      )
    }

    return (
      <div className="grid gap-4">
        {citasList.map((cita) => (
          <CitaCard key={cita.id} cita={cita} onIniciarRecepcion={handleIniciarRecepcion} />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Recepción Digital</h1>
          <p className="text-muted-foreground mt-1">Gestiona la recepción de vehículos que han agendado una cita</p>
        </div>
        <div className="flex flex-col items-start md:items-end gap-2">
          <Button asChild>
            <Link href="/dashboard/recepcion/nueva">
              <ClipboardCheck className="mr-2 h-4 w-4" />
              Crear Recepción
            </Link>
          </Button>
          <p className="text-xs text-muted-foreground italic">
            Para clientes sin cita previa
          </p>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={fetchCitas}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por cliente, placa o referencia..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterSucursal} onValueChange={setFilterSucursal}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Todas las sucursales" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas las sucursales</SelectItem>
                {sucursales.map((sucursal) => (
                  <SelectItem key={sucursal} value={sucursal}>
                    {sucursal}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={fetchCitas} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="hoy" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Hoy y Próximas
            {countHoy > 0 && (
              <Badge variant="secondary" className="ml-1">
                {countHoy}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="expiradas" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Expiradas
            {countExpiradas > 0 && (
              <Badge variant="destructive" className="ml-1">
                {countExpiradas}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hoy" className="mt-4">
          {renderCitasList(citasHoy, "Las citas confirmadas para hoy aparecerán aquí")}
        </TabsContent>

        <TabsContent value="expiradas" className="mt-4">
          {renderCitasList(citasExpiradas, "No hay citas expiradas")}
        </TabsContent>
      </Tabs>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Inicio de Recepción</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas iniciar la recepción para esta cita?
            </AlertDialogDescription>
            {selectedCita && (
              <div className="mt-4 space-y-2 rounded-lg border border-border bg-muted/50 p-4">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-semibold">Cliente:</span>
                  <span>{selectedCita.cliente.nombre}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-semibold">Vehículo:</span>
                  <span>{selectedCita.vehiculo.marca} {selectedCita.vehiculo.modelo} - {selectedCita.vehiculo.placa}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-semibold">Fecha:</span>
                  <span>{formatDate(selectedCita.fecha)} - {formatHora(selectedCita.hora)}</span>
                </div>
              </div>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmRecepcion}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              Sí, Iniciar Recepción
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
