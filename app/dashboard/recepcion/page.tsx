"use client"

import { useState } from "react"
import Link from "next/link"
import { Search, ClipboardCheck, Clock, Car } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { mockCitas } from "@/lib/fixtures/ordenes-trabajo"
import { mockClientes, mockVehiculos } from "@/lib/fixtures/clientes"

export default function RecepcionPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterSucursal, setFilterSucursal] = useState<string>("todas")

  // Filter only confirmed appointments for reception
  const citasParaRecepcion = mockCitas.filter((cita) => cita.estado === "confirmada")

  const filteredCitas = citasParaRecepcion.filter((cita) => {
    const cliente = mockClientes.find((c) => c.id === cita.clienteId)
    const vehiculo = mockVehiculos.find((v) => v.id === cita.vehiculoId)

    const matchesSearch =
      searchQuery === "" ||
      cliente?.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cliente?.apellido.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehiculo?.placa.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesSucursal = filterSucursal === "todas" || cita.sucursal === filterSucursal

    return matchesSearch && matchesSucursal
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Recepción Digital</h1>
          <p className="text-muted-foreground mt-1">Gestiona la recepción de vehículos</p>
        </div>
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

      {/* Citas List */}
      {filteredCitas.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ClipboardCheck className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium">No hay citas confirmadas</p>
            <p className="text-sm text-muted-foreground">Las citas confirmadas aparecerán aquí para su recepción</p>
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
                            <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                              Confirmada
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{cita.servicioSolicitado}</p>
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {new Date(cita.fecha).toLocaleDateString("es-EC", {
                              day: "2-digit",
                              month: "short",
                            })}{" "}
                            - {cita.hora}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Car className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {vehiculo?.marca} {vehiculo?.modelo}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">Placa:</span>
                          <span>{vehiculo?.placa}</span>
                        </div>
                      </div>

                      {cita.observaciones && (
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium">Observaciones:</span> {cita.observaciones}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button asChild>
                        <Link href={`/dashboard/recepcion/${cita.id}`}>
                          <ClipboardCheck className="mr-2 h-4 w-4" />
                          Iniciar Recepción
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
