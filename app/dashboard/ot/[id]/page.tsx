"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { ArrowLeft, ClipboardCheck, AlertTriangle, Building2, Phone, Mail, MapPin, Stethoscope } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OTInfoCard } from "@/components/ot/ot-info-card"
import { OTPhasesStepper, type Phase } from "@/components/ot/ot-phases-stepper"
import { RepuestosList, type Repuesto } from "@/components/ot/ot-repuestos-list"
import { getOrdenTrabajoDetalle } from "@/lib/api/ordenes-trabajo"
import { useAuthToken } from "@/hooks/use-auth-token"
import type { OrdenTrabajoDetalle, HallazgoOT } from "@/lib/types"
import { toast } from "sonner"
import { RegistroHallazgoDialog } from "@/components/hallazgos/registro-hallazgo-dialog"

const estadoColors: Record<string, string> = {
  creada: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  en_diagnostico: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  presupuestada: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  aprobada: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  en_proceso: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
  en_prueba: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
  completada: "bg-green-500/10 text-green-500 border-green-500/20",
  entregada: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
}

// Helper function to get estado color class
const getEstadoColorClass = (codigo: string): string => {
  const codigoLower = codigo.toLowerCase().replace(/-/g, "_")
  return estadoColors[codigoLower] || estadoColors.creada
}

// Mock phases for demonstration (will be replaced with real data)
const getMockPhases = (estado: string): Phase[] => {
  const phases: Phase[] = [
    { id: "p1", nombre: "Recepción", estado: "completed", duracionMinutos: 30, observaciones: "Vehículo recibido sin daños" },
    { id: "p2", nombre: "Diagnóstico", estado: "completed", duracionMinutos: 120 },
    { id: "p3", nombre: "Reparación", estado: "in_progress", duracionMinutos: 180 },
    { id: "p4", nombre: "Control de Calidad", estado: "pending" },
    { id: "p5", nombre: "Entrega", estado: "pending" },
  ]

  // Adjust based on current state
  if (estado === "CTRL-CAL") {
    phases[2].estado = "completed"
    phases[3].estado = "in_progress"
  } else if (estado === "COMPLETA" || estado === "CERRADA") {
    phases.forEach(p => p.estado = "completed")
  }

  return phases
}

export default function OTDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap params using React.use()
  const resolvedParams = use(params)
  const otId = resolvedParams.id

  const [ot, setOt] = useState<OrdenTrabajoDetalle | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentEstado, setCurrentEstado] = useState<string>("")
  const [hallazgoDialogOpen, setHallazgoDialogOpen] = useState(false)
  const [phases, setPhases] = useState<Phase[]>([])
  const [repuestos, setRepuestos] = useState<Repuesto[]>([])
  const { getToken } = useAuthToken()

  // Fetch OT details
  useEffect(() => {
    let isMounted = true

    const fetchOTDetails = async () => {
      try {
        const token = await getToken()
        if (!token) {
          toast.error("No se encontró token de autenticación")
          setLoading(false)
          return
        }

        const data = await getOrdenTrabajoDetalle(parseInt(otId), token)
        if (isMounted) {
          setOt(data)
          setCurrentEstado(data.estado_detalle.codigo)
          setPhases(getMockPhases(data.estado_detalle.codigo))

          // Transform repuestos data if available
          if (data.repuestos && data.repuestos.length > 0) {
            setRepuestos(data.repuestos.map((r: any, idx: number) => ({
              id: `r-${idx}`,
              codigo: r.codigo || `REP-${idx}`,
              descripcion: r.descripcion || r.nombre || "Repuesto",
              cantidad: r.cantidad || 1,
              unidad: r.unidad || "Unidad",
              precioUnitario: parseFloat(r.precio_unitario) || 0,
            })))
          }
        }
      } catch (error) {
        console.error("Error fetching OT details:", error)
        if (isMounted) {
          toast.error("Error al cargar los detalles de la orden de trabajo")
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchOTDetails()

    return () => {
      isMounted = false
    }
  }, [otId, getToken])

  const handleEstadoChange = (newEstado: string) => {
    setCurrentEstado(newEstado)
    setPhases(getMockPhases(newEstado))
    toast.success("Estado actualizado", {
      description: `La orden de trabajo ahora está en estado: ${newEstado}`,
    })
  }

  const handleCompletePhase = async (phaseId: string, data: { observaciones: string; evidencia: File[] }) => {
    // TODO: API call to complete phase
    await new Promise(resolve => setTimeout(resolve, 1000))

    setPhases(prev => {
      const updated = [...prev]
      const idx = updated.findIndex(p => p.id === phaseId)
      if (idx !== -1) {
        updated[idx] = { ...updated[idx], estado: "completed", observaciones: data.observaciones }
        if (idx + 1 < updated.length) {
          updated[idx + 1] = { ...updated[idx + 1], estado: "in_progress" }
        }
      }
      return updated
    })

    toast.success("Fase completada exitosamente")
  }

  const handleAddRepuesto = async (repuesto: Omit<Repuesto, "id">) => {
    // TODO: API call to add part
    await new Promise(resolve => setTimeout(resolve, 500))

    setRepuestos(prev => [...prev, { ...repuesto, id: `r-${Date.now()}` }])
    toast.success("Repuesto agregado")
  }

  const handleGuardarHallazgo = async (hallazgo: HallazgoOT) => {
    try {
      // TODO: Replace with actual API call
      console.log("Guardando hallazgo:", hallazgo)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast.success("Hallazgo registrado", {
        description: "El hallazgo ha sido guardado y se notificará al cliente",
      })
    } catch (error) {
      console.error("Error al guardar hallazgo:", error)
      throw error
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (!ot) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <p className="text-lg text-muted-foreground">No se encontró la orden de trabajo</p>
        <Button asChild>
          <Link href="/dashboard/ot">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Órdenes
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-4 flex-1">
          <Button variant="ghost" size="icon" asChild className="shrink-0">
            <Link href="/dashboard/ot">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{ot.numero_orden}</h1>
              <Badge variant="outline" className={getEstadoColorClass(currentEstado)}>
                {ot.estado_detalle.nombre.toUpperCase()}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1 text-sm truncate">
              {ot.cliente_detalle.first_name} {ot.cliente_detalle.last_name} - {ot.vehiculo_detalle.marca} {ot.vehiculo_detalle.modelo}
            </p>
          </div>
        </div>

        {/* Actions - Responsive */}
        <div className="flex flex-wrap gap-2 sm:shrink-0">
          <Button
            onClick={() => setHallazgoDialogOpen(true)}
            variant="outline"
            size="sm"
            className="border-orange-500 text-orange-600 hover:bg-orange-50"
          >
            <AlertTriangle className="mr-2 h-4 w-4" />
            <span className="hidden xs:inline">Registrar</span> Hallazgos
          </Button>
          {currentEstado === "CTRL-CAL" && (
            <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Link href={`/dashboard/inspeccion/${ot.id}`}>
                <ClipboardCheck className="mr-2 h-4 w-4" />
                Inspección
              </Link>
            </Button>
          )}
          <Select value={currentEstado} onValueChange={handleEstadoChange}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ABIERTA">Abierta</SelectItem>
              <SelectItem value="DIAGNOST">En Diagnóstico</SelectItem>
              <SelectItem value="APROB-CLI">Pendiente Aprobación</SelectItem>
              <SelectItem value="PROCESO">En Proceso</SelectItem>
              <SelectItem value="PAUSADA">Pausada</SelectItem>
              <SelectItem value="CTRL-CAL">Control de Calidad</SelectItem>
              <SelectItem value="COMPLETA">Completada</SelectItem>
              <SelectItem value="CERRADA">Cerrada</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* NEW: Info Card with improved design */}
          <OTInfoCard
            cliente={{
              nombre: ot.cliente_detalle.first_name,
              apellido: ot.cliente_detalle.last_name,
              cedula: ot.cliente_detalle.cedula,
            }}
            vehiculo={{
              marca: ot.vehiculo_detalle.marca,
              modelo: ot.vehiculo_detalle.modelo,
              placa: ot.vehiculo_detalle.placa,
              color: ot.vehiculo_detalle.color,
              vin: ot.vehiculo_detalle.vin,
              kilometraje: ot.kilometraje_ingreso,
            }}
            tipoOrden={ot.tipo_detalle.nombre}
            fechaIngreso={ot.fecha_apertura}
            fechaEstimadaEntrega={ot.fecha_promesa_entrega}
            fechaEntregaReal={ot.fecha_entrega_real || undefined}
            asesor={ot.asesor_detalle ? `${ot.asesor_detalle.first_name} ${ot.asesor_detalle.last_name}` : undefined}
          />

          {/* Tabs: Diagnóstico y Sucursal */}
          <Card>
            <Tabs defaultValue="sucursal" className="w-full">
              <CardHeader className="pb-2">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="sucursal" className="text-sm">
                    <Building2 className="h-4 w-4 mr-1.5" />
                    Sucursal
                  </TabsTrigger>
                  <TabsTrigger value="diagnostico" className="text-sm">
                    <Stethoscope className="h-4 w-4 mr-1.5" />
                    Diagnóstico
                  </TabsTrigger>
                </TabsList>
              </CardHeader>
              <CardContent>
                <TabsContent value="sucursal" className="mt-0">
                  {ot.sucursal_detalle ? (
                    <div className="space-y-4">
                      {/* Nombre de la sucursal */}
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Building2 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-base">{ot.sucursal_detalle.nombre}</p>
                          {ot.sucursal_detalle.es_principal && (
                            <Badge variant="secondary" className="text-xs mt-0.5">
                              Sucursal Principal
                            </Badge>
                          )}
                        </div>
                      </div>

                      <Separator />

                      {/* Información de contacto */}
                      <div className="grid gap-3">
                        <div className="flex items-start gap-3">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                          <div>
                            <p className="text-xs text-muted-foreground">Dirección</p>
                            <p className="text-sm font-medium">{ot.sucursal_detalle.direccion}</p>
                            <p className="text-xs text-muted-foreground">{ot.sucursal_detalle.ciudad}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <Phone className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                          <div>
                            <p className="text-xs text-muted-foreground">Teléfono</p>
                            <a
                              href={`tel:${ot.sucursal_detalle.telefono}`}
                              className="text-sm font-medium text-primary hover:underline"
                            >
                              {ot.sucursal_detalle.telefono}
                            </a>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <Mail className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                          <div>
                            <p className="text-xs text-muted-foreground">Email</p>
                            <a
                              href={`mailto:${ot.sucursal_detalle.email}`}
                              className="text-sm font-medium text-primary hover:underline break-all"
                            >
                              {ot.sucursal_detalle.email}
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No hay información de sucursal disponible</p>
                  )}
                </TabsContent>
                <TabsContent value="diagnostico" className="mt-0">
                  {ot.descripcion_trabajo ? (
                    <p className="text-sm">{ot.descripcion_trabajo}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No hay diagnóstico registrado</p>
                  )}
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>

          {/* NEW: Phases Stepper (replaces old Tareas) */}
          <OTPhasesStepper
            phases={phases}
            onCompletePhase={handleCompletePhase}
          />

          {/* NEW: Repuestos with scroll and add button */}
          <RepuestosList
            repuestos={repuestos}
            onAddRepuesto={handleAddRepuesto}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Cost Summary */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Resumen de Costos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Mano de Obra</span>
                  <span className="font-medium">${parseFloat(ot.subtotal_mano_obra).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Repuestos</span>
                  <span className="font-medium">${parseFloat(ot.subtotal_repuestos).toFixed(2)}</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between">
                <span className="font-semibold">Total</span>
                <span className="text-2xl font-bold text-primary">${parseFloat(ot.total).toFixed(2)}</span>
              </div>

              <Button className="w-full" asChild>
                <Link href={`/dashboard/facturacion/nueva?otId=${ot.id}`}>Generar Factura</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Observaciones */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Observaciones</CardTitle>
            </CardHeader>
            <CardContent>
              {ot.observaciones_cliente || ot.observaciones_internas ? (
                <div className="space-y-3">
                  {ot.observaciones_cliente && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Cliente:</p>
                      <p className="text-sm">{ot.observaciones_cliente}</p>
                    </div>
                  )}
                  {ot.observaciones_internas && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Internas:</p>
                      <p className="text-sm">{ot.observaciones_internas}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Sin observaciones registradas</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Registro de Hallazgos Dialog */}
      <RegistroHallazgoDialog
        open={hallazgoDialogOpen}
        onOpenChange={setHallazgoDialogOpen}
        ordenTrabajoId={ot.id}
        onGuardar={handleGuardarHallazgo}
        clienteNombre={`${ot.cliente_detalle.first_name} ${ot.cliente_detalle.last_name}`}
      />
    </div>
  )
}
