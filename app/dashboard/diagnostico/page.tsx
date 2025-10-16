"use client"

import { useState } from "react"
import Link from "next/link"
import { Search, Stethoscope, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { mockOrdenesTrabajoData } from "@/lib/fixtures/ordenes-trabajo"
import { mockClientes, mockVehiculos } from "@/lib/fixtures/clientes"

const estadoColors = {
  en_revision: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  enviado_cliente: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  aprobado: "bg-green-500/10 text-green-500 border-green-500/20",
  rechazado: "bg-red-500/10 text-red-500 border-red-500/20",
}

export default function DiagnosticoPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterEstado, setFilterEstado] = useState<string>("todas")

  // Filter OTs that need or have diagnostics
  const otsParaDiagnostico = mockOrdenesTrabajoData.filter(
    (ot) => ot.estado === "en_diagnostico" || ot.estado === "presupuestada",
  )

  const filteredOTs = otsParaDiagnostico.filter((ot) => {
    const cliente = mockClientes.find((c) => c.id === ot.clienteId)
    const vehiculo = mockVehiculos.find((v) => v.id === ot.vehiculoId)

    const matchesSearch =
      searchQuery === "" ||
      ot.numero.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cliente?.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cliente?.apellido.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehiculo?.placa.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesSearch
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Diagnóstico</h1>
          <p className="text-muted-foreground mt-1">Gestiona los diagnósticos y presupuestos</p>
        </div>
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
          </div>
        </CardContent>
      </Card>

      {/* OTs List */}
      {filteredOTs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Stethoscope className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium">No hay órdenes para diagnóstico</p>
            <p className="text-sm text-muted-foreground">Las órdenes en diagnóstico aparecerán aquí</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredOTs.map((ot) => {
            const cliente = mockClientes.find((c) => c.id === ot.clienteId)
            const vehiculo = mockVehiculos.find((v) => v.id === ot.vehiculoId)

            return (
              <Card key={ot.id} className="transition-colors hover:bg-accent/50">
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{ot.numero}</h3>
                            <Badge
                              variant="outline"
                              className={
                                ot.estado === "en_diagnostico"
                                  ? "bg-orange-500/10 text-orange-500 border-orange-500/20"
                                  : "bg-purple-500/10 text-purple-500 border-purple-500/20"
                              }
                            >
                              {ot.estado === "en_diagnostico" ? "En Diagnóstico" : "Presupuestada"}
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
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {new Date(ot.fechaIngreso).toLocaleDateString("es-EC", {
                              day: "2-digit",
                              month: "short",
                            })}
                          </span>
                        </div>
                      </div>

                      {ot.diagnostico && (
                        <div className="rounded-lg border border-border bg-muted/50 p-3">
                          <p className="text-sm">
                            <span className="font-medium">Diagnóstico:</span> {ot.diagnostico}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button asChild>
                        <Link href={`/dashboard/diagnostico/${ot.id}`}>
                          {ot.estado === "en_diagnostico" ? "Crear Diagnóstico" : "Ver Diagnóstico"}
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
