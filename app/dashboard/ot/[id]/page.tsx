"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Clock, User, CheckCircle2, Circle, Loader2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { mockOrdenesTrabajoData, mockRepuestos } from "@/lib/fixtures/ordenes-trabajo"
import { mockClientes, mockVehiculos } from "@/lib/fixtures/clientes"
import { mockUsers } from "@/lib/fixtures/users"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

const estadoColors = {
  creada: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  en_diagnostico: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  presupuestada: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  aprobada: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  en_proceso: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
  en_prueba: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
  completada: "bg-green-500/10 text-green-500 border-green-500/20",
  entregada: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
}

export default function OTDetailPage({ params }: { params: { id: string } }) {
  const { toast } = useToast()
  const ot = mockOrdenesTrabajoData[0] // Mock data
  const cliente = mockClientes.find((c) => c.id === ot.clienteId)
  const vehiculo = mockVehiculos.find((v) => v.id === ot.vehiculoId)
  const tecnico = mockUsers.find((u) => u.id === ot.tecnicoId)

  const [currentEstado, setCurrentEstado] = useState(ot.estado)

  const completedTasks = ot.subtareas.filter((st) => st.estado === "completada").length
  const progress = (completedTasks / ot.subtareas.length) * 100

  const handleEstadoChange = (newEstado: string) => {
    setCurrentEstado(newEstado as any)
    toast({
      title: "Estado actualizado",
      description: `La orden de trabajo ahora está en estado: ${newEstado.replace("_", " ")}`,
    })
  }

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
            <h1 className="text-3xl font-bold tracking-tight">{ot.numero}</h1>
            <Badge variant="outline" className={estadoColors[currentEstado]}>
              {currentEstado.replace("_", " ")}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            {cliente?.nombre} {cliente?.apellido} - {vehiculo?.marca} {vehiculo?.modelo}
          </p>
        </div>
        <Select value={currentEstado} onValueChange={handleEstadoChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="creada">Creada</SelectItem>
            <SelectItem value="en_diagnostico">En Diagnóstico</SelectItem>
            <SelectItem value="presupuestada">Presupuestada</SelectItem>
            <SelectItem value="aprobada">Aprobada</SelectItem>
            <SelectItem value="en_proceso">En Proceso</SelectItem>
            <SelectItem value="en_prueba">En Prueba</SelectItem>
            <SelectItem value="completada">Completada</SelectItem>
            <SelectItem value="entregada">Entregada</SelectItem>
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
                    {cliente?.nombre} {cliente?.apellido}
                  </p>
                  <p className="text-sm text-muted-foreground">{cliente?.telefono}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Vehículo</p>
                  <p className="text-base">
                    {vehiculo?.marca} {vehiculo?.modelo} ({vehiculo?.anio})
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {vehiculo?.placa} - {vehiculo?.color}
                  </p>
                </div>
                {tecnico && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Técnico Asignado</p>
                    <p className="text-base">
                      {tecnico.nombre} {tecnico.apellido}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Sucursal</p>
                  <p className="text-base">{ot.sucursal}</p>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Fecha Ingreso</p>
                  <p className="text-base">
                    {new Date(ot.fechaIngreso).toLocaleDateString("es-EC", { dateStyle: "medium" })}
                  </p>
                </div>
                {ot.fechaEstimadaEntrega && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Entrega Estimada</p>
                    <p className="text-base">
                      {new Date(ot.fechaEstimadaEntrega).toLocaleDateString("es-EC", { dateStyle: "medium" })}
                    </p>
                  </div>
                )}
                {ot.fechaEntrega && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Fecha Entrega</p>
                    <p className="text-base">
                      {new Date(ot.fechaEntrega).toLocaleDateString("es-EC", { dateStyle: "medium" })}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Diagnostico */}
          {ot.diagnostico && (
            <Card>
              <CardHeader>
                <CardTitle>Diagnóstico</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{ot.diagnostico}</p>
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
                    {completedTasks} de {ot.subtareas.length} completadas
                  </CardDescription>
                </div>
                <Button size="sm" variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Tarea
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={progress} className="h-2" />

              <div className="space-y-3">
                {ot.subtareas.map((subtarea) => {
                  const tecnicoSubtarea = mockUsers.find((u) => u.id === subtarea.tecnicoId)

                  return (
                    <div
                      key={subtarea.id}
                      className="flex items-start gap-3 rounded-lg border border-border p-4 transition-colors hover:bg-accent/50"
                    >
                      {subtarea.estado === "completada" ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      ) : subtarea.estado === "en_proceso" ? (
                        <Loader2 className="h-5 w-5 text-blue-500 shrink-0 mt-0.5 animate-spin" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 space-y-1">
                        <p
                          className={cn(
                            "text-sm font-medium",
                            subtarea.estado === "completada" && "line-through text-muted-foreground",
                          )}
                        >
                          {subtarea.descripcion}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {tecnicoSubtarea && (
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {tecnicoSubtarea.nombre}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {subtarea.tiempoEstimado} min
                          </span>
                          {subtarea.tiempoReal && <span>Real: {subtarea.tiempoReal} min</span>}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Repuestos */}
          <Card>
            <CardHeader>
              <CardTitle>Repuestos Utilizados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {ot.repuestos.map((repuestoOT) => {
                  const repuesto = mockRepuestos.find((r) => r.id === repuestoOT.repuestoId)

                  return (
                    <div
                      key={repuestoOT.repuestoId}
                      className="flex items-center justify-between rounded-lg border border-border p-3"
                    >
                      <div>
                        <p className="text-sm font-medium">{repuesto?.nombre}</p>
                        <p className="text-xs text-muted-foreground">
                          {repuesto?.marca} - SKU: {repuesto?.sku}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">${repuestoOT.subtotal.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">
                          {repuestoOT.cantidad} x ${repuestoOT.precioUnitario.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
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
                  <span className="font-medium">${ot.totalManoObra.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Repuestos</span>
                  <span className="font-medium">${ot.totalRepuestos.toFixed(2)}</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between">
                <span className="font-semibold">Total</span>
                <span className="text-2xl font-bold text-primary">${ot.total.toFixed(2)}</span>
              </div>

              <Button className="w-full" asChild>
                <Link href={`/dashboard/facturacion/nueva?otId=${ot.id}`}>Generar Factura</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Observaciones */}
          {ot.observaciones && (
            <Card>
              <CardHeader>
                <CardTitle>Observaciones</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{ot.observaciones}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
