"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { ArrowLeft, Circle, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { getOrdenTrabajoDetalle } from "@/lib/api/ordenes-trabajo"
import { useAuthToken } from "@/hooks/use-auth-token"
import type { OrdenTrabajoDetalle } from "@/lib/types"
import { toast } from "sonner"

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

export default function OTDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap params using React.use()
  const resolvedParams = use(params)
  const otId = resolvedParams.id

  const [ot, setOt] = useState<OrdenTrabajoDetalle | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentEstado, setCurrentEstado] = useState<string>("")
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
    toast.success("Estado actualizado", {
      description: `La orden de trabajo ahora está en estado: ${newEstado}`,
    })
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

  // Default values for tasks/repuestos (to be implemented later)
  const completedTasks = 0
  const totalTasks = 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/ot">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold tracking-tight">{ot.numero_orden}</h1>
            <Badge variant="outline" className={getEstadoColorClass(currentEstado)}>
              {ot.estado_detalle.nombre.toUpperCase()}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            {ot.cliente_detalle.first_name} {ot.cliente_detalle.last_name} - {ot.vehiculo_detalle.modelo_tecnico_detalle.marca} {ot.vehiculo_detalle.modelo_tecnico_detalle.modelo}
          </p>
        </div>
        <Select value={currentEstado} onValueChange={handleEstadoChange}>
          <SelectTrigger className="w-[200px]">
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
            <SelectItem value="CANCELADA">Cancelada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Vehicle & Client Info */}
          <Card>
            <CardHeader>
              <CardTitle>Información General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Cliente</p>
                  <p className="text-base">
                    {ot.cliente_detalle.first_name} {ot.cliente_detalle.last_name}
                  </p>
                  <p className="text-sm text-muted-foreground">Cédula: {ot.cliente_detalle.cedula}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Vehículo</p>
                  <p className="text-base">
                    {ot.vehiculo_detalle.modelo_tecnico_detalle.marca} {ot.vehiculo_detalle.modelo_tecnico_detalle.modelo} ({ot.vehiculo_detalle.modelo_tecnico_detalle.anio})
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {ot.vehiculo_detalle.placa} - {ot.vehiculo_detalle.color}
                  </p>
                </div>
                {ot.asesor_detalle && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Asesor Asignado</p>
                    <p className="text-base">
                      {ot.asesor_detalle.first_name} {ot.asesor_detalle.last_name}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tipo de Orden</p>
                  <p className="text-base">{ot.tipo_detalle.nombre}</p>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Fecha Ingreso</p>
                  <p className="text-base">
                    {new Date(ot.fecha_apertura).toLocaleDateString("es-EC", { dateStyle: "medium" })}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Entrega Estimada</p>
                  <p className="text-base">
                    {new Date(ot.fecha_promesa_entrega).toLocaleDateString("es-EC", { dateStyle: "medium" })}
                  </p>
                </div>
                {ot.fecha_entrega_real && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Fecha Entrega</p>
                    <p className="text-base">
                      {new Date(ot.fecha_entrega_real).toLocaleDateString("es-EC", { dateStyle: "medium" })}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Kilometraje Ingreso</p>
                  <p className="text-base">{ot.kilometraje_ingreso.toLocaleString()} km</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">VIN</p>
                  <p className="text-base">{ot.vehiculo_detalle.vin}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Diagnostico */}
          {ot.descripcion_trabajo && (
            <Card>
              <CardHeader>
                <CardTitle>Diagnóstico</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{ot.descripcion_trabajo}</p>
              </CardContent>
            </Card>
          )}

          {/* Subtareas */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Tareas</CardTitle>
                  <CardDescription>
                    {ot.tareas.length > 0 ? `${completedTasks} de ${totalTasks} completadas` : 'No hay tareas registradas'}
                  </CardDescription>
                </div>
                <Button size="sm" variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Tarea
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {ot.tareas.length > 0 ? (
                <div className="space-y-3">
                  {/* Tareas will be mapped here when available */}
                  <p className="text-sm text-muted-foreground">Las tareas se mostrarán aquí</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Circle className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-sm text-muted-foreground">No hay tareas asignadas a esta orden</p>
                  <p className="text-xs text-muted-foreground mt-1">Las tareas aparecerán aquí una vez sean creadas</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Repuestos */}
          <Card>
            <CardHeader>
              <CardTitle>Repuestos Utilizados</CardTitle>
            </CardHeader>
            <CardContent>
              {ot.repuestos.length > 0 ? (
                <div className="space-y-3">
                  {/* Repuestos will be mapped here when available */}
                  <p className="text-sm text-muted-foreground">Los repuestos se mostrarán aquí</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Circle className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-sm text-muted-foreground">No hay repuestos registrados</p>
                  <p className="text-xs text-muted-foreground mt-1">Los repuestos utilizados aparecerán aquí</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Cost Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Resumen de Costos</CardTitle>
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
            <CardHeader>
              <CardTitle>Observaciones</CardTitle>
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
                <p className="text-sm text-muted-foreground">Cliente solicita llamada antes de cualquier trabajo adicional</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
