"use client"

import { useState } from "react"
import Link from "next/link"
import { Plus, Search, Filter, CalendarIcon, Clock, Car } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AppointmentCalendar } from "@/components/appointments/appointment-calendar"
import { mockCitas } from "@/lib/fixtures/ordenes-trabajo"
import { mockClientes, mockVehiculos } from "@/lib/fixtures/clientes"

const estadoColors = {
  pendiente: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  confirmada: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  en_proceso: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  completada: "bg-green-500/10 text-green-500 border-green-500/20",
  cancelada: "bg-red-500/10 text-red-500 border-red-500/20",
}

export default function CitasPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterEstado, setFilterEstado] = useState<string>("todas")
  const [filterSucursal, setFilterSucursal] = useState<string>("todas")

  const filteredCitas = mockCitas.filter((cita) => {
    const cliente = mockClientes.find((c) => c.id === cita.clienteId)
    const vehiculo = mockVehiculos.find((v) => v.id === cita.vehiculoId)

    const matchesSearch =
      searchQuery === "" ||
      cliente?.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cliente?.apellido.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehiculo?.placa.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesEstado = filterEstado === "todas" || cita.estado === filterEstado
    const matchesSucursal = filterSucursal === "todas" || cita.sucursal === filterSucursal

    return matchesSearch && matchesEstado && matchesSucursal
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Citas</h1>
          <p className="text-muted-foreground mt-1">Gestiona las citas y agenda del taller</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/citas/nueva">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Cita
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por cliente o placa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterEstado} onValueChange={setFilterEstado}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todos los estados</SelectItem>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="confirmada">Confirmada</SelectItem>
                <SelectItem value="en_proceso">En Proceso</SelectItem>
                <SelectItem value="completada">Completada</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterSucursal} onValueChange={setFilterSucursal}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas las sucursales</SelectItem>
                <SelectItem value="Quito Norte">Quito Norte</SelectItem>
                <SelectItem value="Quito Sur">Quito Sur</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="lista" className="space-y-4">
        <TabsList>
          <TabsTrigger value="lista">Lista</TabsTrigger>
          <TabsTrigger value="calendario">Calendario</TabsTrigger>
        </TabsList>

        <TabsContent value="lista" className="space-y-4">
          {filteredCitas.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CalendarIcon className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-lg font-medium">No se encontraron citas</p>
                <p className="text-sm text-muted-foreground">Intenta ajustar los filtros o crea una nueva cita</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredCitas.map((cita) => {
                const cliente = mockClientes.find((c) => c.id === cita.clienteId)
                const vehiculo = mockVehiculos.find((v) => v.id === cita.vehiculoId)

                return (
                  <Card key={cita.id} className="transition-colors hover:bg-accent/50">
                    <CardContent className="p-6">
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold">
                                  {cliente?.nombre} {cliente?.apellido}
                                </h3>
                                <Badge variant="outline" className={estadoColors[cita.estado]}>
                                  {cita.estado}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">{cita.servicioSolicitado}</p>
                            </div>
                          </div>

                          <div className="grid gap-3 sm:grid-cols-3">
                            <div className="flex items-center gap-2 text-sm">
                              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {new Date(cita.fecha).toLocaleDateString("es-EC", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>{cita.hora}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Car className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {vehiculo?.marca} {vehiculo?.modelo} - {vehiculo?.placa}
                              </span>
                            </div>
                          </div>

                          {cita.observaciones && (
                            <p className="text-sm text-muted-foreground">
                              <span className="font-medium">Observaciones:</span> {cita.observaciones}
                            </p>
                          )}

                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="rounded-full bg-muted px-2 py-1">{cita.sucursal}</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            Ver Detalles
                          </Button>
                          {cita.estado === "confirmada" && <Button size="sm">Iniciar Recepción</Button>}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="calendario">
          <AppointmentCalendar appointments={mockCitas} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
