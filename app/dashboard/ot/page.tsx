"use client"

import { useState } from "react"
import Link from "next/link"
import { Search, Plus, ClipboardList, Clock, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mockOrdenesTrabajoData } from "@/lib/fixtures/ordenes-trabajo"
import { mockClientes, mockVehiculos } from "@/lib/fixtures/clientes"
import { mockUsers } from "@/lib/fixtures/users"

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

const prioridadColors = {
  baja: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  media: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  alta: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  urgente: "bg-red-500/10 text-red-500 border-red-500/20",
}

export default function OrdenesTrabajoPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterEstado, setFilterEstado] = useState<string>("todas")
  const [filterPrioridad, setFilterPrioridad] = useState<string>("todas")

  const filteredOTs = mockOrdenesTrabajoData.filter((ot) => {
    const cliente = mockClientes.find((c) => c.id === ot.clienteId)
    const vehiculo = mockVehiculos.find((v) => v.id === ot.vehiculoId)

    const matchesSearch =
      searchQuery === "" ||
      ot.numero.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cliente?.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cliente?.apellido.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehiculo?.placa.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesEstado = filterEstado === "todas" || ot.estado === filterEstado
    const matchesPrioridad = filterPrioridad === "todas" || ot.prioridad === filterPrioridad

    return matchesSearch && matchesEstado && matchesPrioridad
  })

  const otsPorEstado = {
    activas: filteredOTs.filter((ot) => !["completada", "entregada"].includes(ot.estado)),
    completadas: filteredOTs.filter((ot) => ["completada", "entregada"].includes(ot.estado)),
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Órdenes de Trabajo</h1>
          <p className="text-muted-foreground mt-1">Gestiona las órdenes de trabajo del taller</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/ot/nueva">
            <Plus className="mr-2 h-4 w-4" />
            Nueva OT
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
                placeholder="Buscar por OT, cliente o placa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterEstado} onValueChange={setFilterEstado}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todos los estados</SelectItem>
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
            <Select value={filterPrioridad} onValueChange={setFilterPrioridad}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas las prioridades</SelectItem>
                <SelectItem value="baja">Baja</SelectItem>
                <SelectItem value="media">Media</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
                <SelectItem value="urgente">Urgente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="activas" className="space-y-4">
        <TabsList>
          <TabsTrigger value="activas">
            Activas <Badge className="ml-2">{otsPorEstado.activas.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="completadas">
            Completadas <Badge className="ml-2">{otsPorEstado.completadas.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activas" className="space-y-4">
          {otsPorEstado.activas.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <ClipboardList className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-lg font-medium">No hay órdenes activas</p>
                <p className="text-sm text-muted-foreground">Las órdenes activas aparecerán aquí</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {otsPorEstado.activas.map((ot) => {
                const cliente = mockClientes.find((c) => c.id === ot.clienteId)
                const vehiculo = mockVehiculos.find((v) => v.id === ot.vehiculoId)
                const tecnico = mockUsers.find((u) => u.id === ot.tecnicoId)

                return (
                  <Card key={ot.id} className="transition-colors hover:bg-accent/50">
                    <CardContent className="p-6">
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold">{ot.numero}</h3>
                                <Badge variant="outline" className={estadoColors[ot.estado]}>
                                  {ot.estado.replace("_", " ")}
                                </Badge>
                                <Badge variant="outline" className={prioridadColors[ot.prioridad]}>
                                  {ot.prioridad}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {cliente?.nombre} {cliente?.apellido}
                              </p>
                            </div>
                          </div>

                          <div className="grid gap-3 sm:grid-cols-3">
                            <div className="flex items-center gap-2 text-sm">
                              <span className="font-medium">Vehículo:</span>
                              <span>
                                {vehiculo?.marca} {vehiculo?.modelo}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <span className="font-medium">Placa:</span>
                              <span>{vehiculo?.placa}</span>
                            </div>
                            {tecnico && (
                              <div className="flex items-center gap-2 text-sm">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span>
                                  {tecnico.nombre} {tecnico.apellido}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>
                                Ingreso:{" "}
                                {new Date(ot.fechaIngreso).toLocaleDateString("es-EC", {
                                  day: "2-digit",
                                  month: "short",
                                })}
                              </span>
                            </div>
                            {ot.fechaEstimadaEntrega && (
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">Entrega estimada:</span>
                                <span>
                                  {new Date(ot.fechaEstimadaEntrega).toLocaleDateString("es-EC", {
                                    day: "2-digit",
                                    month: "short",
                                  })}
                                </span>
                              </div>
                            )}
                          </div>

                          {ot.subtareas.length > 0 && (
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-muted-foreground">Progreso:</span>
                              <span>
                                {ot.subtareas.filter((st) => st.estado === "completada").length} / {ot.subtareas.length}{" "}
                                tareas
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/dashboard/ot/${ot.id}`}>Ver Detalles</Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completadas" className="space-y-4">
          {otsPorEstado.completadas.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <ClipboardList className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-lg font-medium">No hay órdenes completadas</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {otsPorEstado.completadas.map((ot) => {
                const cliente = mockClientes.find((c) => c.id === ot.clienteId)
                const vehiculo = mockVehiculos.find((v) => v.id === ot.vehiculoId)

                return (
                  <Card key={ot.id} className="transition-colors hover:bg-accent/50">
                    <CardContent className="p-6">
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold">{ot.numero}</h3>
                            <Badge variant="outline" className={estadoColors[ot.estado]}>
                              {ot.estado}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {cliente?.nombre} {cliente?.apellido} - {vehiculo?.marca} {vehiculo?.modelo}
                          </p>
                          <p className="text-sm font-medium">Total: ${ot.total.toFixed(2)}</p>
                        </div>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/dashboard/ot/${ot.id}`}>Ver Detalles</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
