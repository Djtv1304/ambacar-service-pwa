"use client"

import { useState } from "react"
import { User, Wrench, Clock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { mockOrdenesTrabajoData } from "@/lib/fixtures/ordenes-trabajo"
import { mockClientes, mockVehiculos } from "@/lib/fixtures/clientes"
import { mockUsers } from "@/lib/fixtures/users"

const bahias = ["Bahía 1", "Bahía 2", "Bahía 3", "Bahía 4"]

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

export default function TallerPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [selectedSucursal, setSelectedSucursal] = useState("Quito Norte")

  // Filter OTs for workshop planning
  const otsActivas = mockOrdenesTrabajoData.filter(
    (ot) => ["en_proceso", "en_prueba", "aprobada"].includes(ot.estado) && ot.sucursal === selectedSucursal,
  )

  const tecnicos = mockUsers.filter((u) => u.rol === "tecnico" && u.sucursal === selectedSucursal)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Planificación de Taller</h1>
          <p className="text-muted-foreground mt-1">Gestiona la asignación de trabajos y recursos</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Fecha</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Sucursal</label>
              <Select value={selectedSucursal} onValueChange={setSelectedSucursal}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Quito Norte">Quito Norte</SelectItem>
                  <SelectItem value="Quito Sur">Quito Sur</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Trabajos Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{otsActivas.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Técnicos Disponibles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tecnicos.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Bahías Ocupadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {otsActivas.filter((ot) => ot.estado === "en_proceso").length} / {bahias.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Tiempo Promedio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.5h</div>
          </CardContent>
        </Card>
      </div>

      {/* Planning Board */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* By Bahía */}
        <Card>
          <CardHeader>
            <CardTitle>Asignación por Bahía</CardTitle>
            <CardDescription>Vista de ocupación de bahías</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {bahias.map((bahia, index) => {
              const otEnBahia = otsActivas[index] // Mock assignment
              const cliente = otEnBahia ? mockClientes.find((c) => c.id === otEnBahia.clienteId) : null
              const vehiculo = otEnBahia ? mockVehiculos.find((v) => v.id === otEnBahia.vehiculoId) : null
              const tecnico = otEnBahia ? mockUsers.find((u) => u.id === otEnBahia.tecnicoId) : null

              return (
                <div key={bahia} className="rounded-lg border border-border p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Wrench className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{bahia}</span>
                    </div>
                    {otEnBahia ? (
                      <Badge variant="outline" className="bg-cyan-500/10 text-cyan-500 border-cyan-500/20">
                        Ocupada
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                        Disponible
                      </Badge>
                    )}
                  </div>

                  {otEnBahia ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{otEnBahia.numero}</span>
                        <Badge variant="outline" className={estadoColors[otEnBahia.estado]}>
                          {otEnBahia.estado.replace("_", " ")}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {vehiculo?.marca} {vehiculo?.modelo} - {vehiculo?.placa}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Cliente: {cliente?.nombre} {cliente?.apellido}
                      </p>
                      {tecnico && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <User className="h-3 w-3" />
                          <span>
                            {tecnico.nombre} {tecnico.apellido}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>Estimado: {otEnBahia.subtareas.reduce((sum, st) => sum + st.tiempoEstimado, 0)} min</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Sin asignación</p>
                  )}
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* By Técnico */}
        <Card>
          <CardHeader>
            <CardTitle>Carga por Técnico</CardTitle>
            <CardDescription>Trabajos asignados a cada técnico</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {tecnicos.map((tecnico) => {
              const otsAsignadas = otsActivas.filter((ot) => ot.tecnicoId === tecnico.id)
              const tiempoTotal = otsAsignadas.reduce(
                (sum, ot) => sum + ot.subtareas.reduce((s, st) => s + st.tiempoEstimado, 0),
                0,
              )

              return (
                <div key={tecnico.id} className="rounded-lg border border-border p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {tecnico.nombre} {tecnico.apellido}
                      </span>
                    </div>
                    <Badge variant="outline">
                      {otsAsignadas.length} {otsAsignadas.length === 1 ? "trabajo" : "trabajos"}
                    </Badge>
                  </div>

                  {otsAsignadas.length > 0 ? (
                    <div className="space-y-2">
                      {otsAsignadas.map((ot) => {
                        const vehiculo = mockVehiculos.find((v) => v.id === ot.vehiculoId)
                        return (
                          <div key={ot.id} className="flex items-center justify-between text-sm">
                            <span className="font-medium">{ot.numero}</span>
                            <span className="text-muted-foreground">
                              {vehiculo?.marca} {vehiculo?.modelo}
                            </span>
                          </div>
                        )
                      })}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border">
                        <Clock className="h-3 w-3" />
                        <span>Tiempo total estimado: {tiempoTotal} min</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Sin trabajos asignados</p>
                  )}
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
