"use client"

import { useState } from "react"
import Link from "next/link"
import { Search, Plus, CreditCard, Clock, DollarSign, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mockFacturas } from "@/lib/fixtures/facturas"
import { mockClientes } from "@/lib/fixtures/clientes"
import { mockOrdenesTrabajoData } from "@/lib/fixtures/ordenes-trabajo"

const estadoColors = {
  pendiente: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  pagada: "bg-green-500/10 text-green-500 border-green-500/20",
  anulada: "bg-red-500/10 text-red-500 border-red-500/20",
}

export default function FacturacionPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterEstado, setFilterEstado] = useState<string>("todas")

  const filteredFacturas = mockFacturas.filter((factura) => {
    const cliente = mockClientes.find((c) => c.id === factura.clienteId)

    const matchesSearch =
      searchQuery === "" ||
      factura.numero.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cliente?.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cliente?.apellido.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesEstado = filterEstado === "todas" || factura.estado === filterEstado

    return matchesSearch && matchesEstado
  })

  const facturasPorEstado = {
    pendientes: filteredFacturas.filter((f) => f.estado === "pendiente"),
    pagadas: filteredFacturas.filter((f) => f.estado === "pagada"),
  }

  const totalPendiente = facturasPorEstado.pendientes.reduce((sum, f) => sum + f.total, 0)
  const totalPagado = facturasPorEstado.pagadas.reduce((sum, f) => sum + f.total, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Facturación</h1>
          <p className="text-muted-foreground mt-1">Gestiona las facturas y pagos</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/facturacion/nueva">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Factura
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Pendiente</p>
                <p className="text-2xl font-bold text-yellow-500">${totalPendiente.toFixed(2)}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Pagado</p>
                <p className="text-2xl font-bold text-green-500">${totalPagado.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Facturas</p>
                <p className="text-2xl font-bold">{filteredFacturas.length}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por número de factura o cliente..."
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
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="pagada">Pagada</SelectItem>
                <SelectItem value="anulada">Anulada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="todas" className="space-y-4">
        <TabsList>
          <TabsTrigger value="todas">
            Todas <Badge className="ml-2">{filteredFacturas.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="pendientes">
            Pendientes <Badge className="ml-2">{facturasPorEstado.pendientes.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="pagadas">
            Pagadas <Badge className="ml-2">{facturasPorEstado.pagadas.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="todas" className="space-y-4">
          {filteredFacturas.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CreditCard className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-lg font-medium">No se encontraron facturas</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredFacturas.map((factura) => {
                const cliente = mockClientes.find((c) => c.id === factura.clienteId)
                const ot = mockOrdenesTrabajoData.find((o) => o.id === factura.ordenTrabajoId)

                return (
                  <Card key={factura.id} className="transition-colors hover:bg-accent/50">
                    <CardContent className="p-6">
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold">{factura.numero}</h3>
                                <Badge variant="outline" className={estadoColors[factura.estado]}>
                                  {factura.estado}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {cliente?.nombre} {cliente?.apellido}
                              </p>
                            </div>
                          </div>

                          <div className="grid gap-3 sm:grid-cols-3">
                            <div className="flex items-center gap-2 text-sm">
                              <span className="font-medium">OT:</span>
                              <span>{ot?.numero}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <span className="font-medium">Fecha:</span>
                              <span>
                                {new Date(factura.fecha).toLocaleDateString("es-EC", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                            {factura.metodoPago && (
                              <div className="flex items-center gap-2 text-sm">
                                <span className="font-medium">Método:</span>
                                <span className="capitalize">{factura.metodoPago}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Subtotal: </span>
                              <span>${factura.subtotal.toFixed(2)}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">IVA: </span>
                              <span>${factura.iva.toFixed(2)}</span>
                            </div>
                            {factura.descuento > 0 && (
                              <div>
                                <span className="text-muted-foreground">Descuento: </span>
                                <span className="text-green-500">-${factura.descuento.toFixed(2)}</span>
                              </div>
                            )}
                          </div>

                          <div className="text-lg font-bold">
                            Total: <span className="text-primary">${factura.total.toFixed(2)}</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/dashboard/facturacion/${factura.id}`}>Ver Detalles</Link>
                          </Button>
                          {factura.estado === "pendiente" && <Button size="sm">Registrar Pago</Button>}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pendientes" className="space-y-4">
          {facturasPorEstado.pendientes.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CreditCard className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-lg font-medium">No hay facturas pendientes</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {facturasPorEstado.pendientes.map((factura) => {
                const cliente = mockClientes.find((c) => c.id === factura.clienteId)

                return (
                  <Card key={factura.id} className="transition-colors hover:bg-accent/50">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{factura.numero}</h3>
                          <p className="text-sm text-muted-foreground">
                            {cliente?.nombre} {cliente?.apellido}
                          </p>
                          <p className="text-lg font-bold mt-2">${factura.total.toFixed(2)}</p>
                        </div>
                        <Button size="sm">Registrar Pago</Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pagadas" className="space-y-4">
          {facturasPorEstado.pagadas.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CreditCard className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-lg font-medium">No hay facturas pagadas</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {facturasPorEstado.pagadas.map((factura) => {
                const cliente = mockClientes.find((c) => c.id === factura.clienteId)

                return (
                  <Card key={factura.id} className="transition-colors hover:bg-accent/50">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{factura.numero}</h3>
                            <Badge variant="outline" className={estadoColors.pagada}>
                              Pagada
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {cliente?.nombre} {cliente?.apellido}
                          </p>
                          <p className="text-lg font-bold mt-2">${factura.total.toFixed(2)}</p>
                        </div>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/dashboard/facturacion/${factura.id}`}>Ver Detalles</Link>
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
