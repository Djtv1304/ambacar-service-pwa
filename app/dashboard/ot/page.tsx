"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, Plus, ClipboardList, Clock, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Spinner } from "@/components/ui/spinner"
import { getOrdenesTrabajo, type OrdenTrabajoAPI } from "@/lib/api/ordenes-trabajo"
import { getClientAccessToken } from "@/lib/auth/actions"
import { toast } from "sonner"

// Estado colors mapping
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

const prioridadColors: Record<string, string> = {
  baja: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  media: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  alta: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  urgente: "bg-red-500/10 text-red-500 border-red-500/20",
}

// Helper function to get estado color class
const getEstadoColorClass = (codigo: string): string => {
  const codigoLower = codigo.toLowerCase().replace(/-/g, "_")
  return estadoColors[codigoLower] || estadoColors.creada
}

// Estado list for completed OTs
const ESTADOS_COMPLETADOS = ["Entregada", "Completada", "Facturada"]

export default function OrdenesTrabajoPage() {
  const [ordenesData, setOrdenesData] = useState<OrdenTrabajoAPI[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterEstado, setFilterEstado] = useState<string>("todas")
  const [filterTipo, setFilterTipo] = useState<string>("todas")

  // Fetch ordenes de trabajo
  useEffect(() => {
    let isMounted = true

    const fetchOrdenes = async () => {
      // Get token from httpOnly cookies via server action
      const token = await getClientAccessToken()

      if (!token) {
        toast.error("No se encontró token de autenticación")
        setLoading(false)
        return
      }

      try {
        const data = await getOrdenesTrabajo(token)
        if (isMounted) {
          setOrdenesData(data)
        }
      } catch (error) {
        console.error("Error fetching ordenes:", error)
        if (isMounted) {
          toast.error("Error al cargar las órdenes de trabajo")
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchOrdenes()

    return () => {
      isMounted = false
    }
  }, [])

  // Filter ordenes
  const filteredOTs = ordenesData.filter((ot) => {
    const clienteNombre = `${ot.cliente_detalle.first_name} ${ot.cliente_detalle.last_name}`
    const matchesSearch =
      searchQuery === "" ||
      ot.numero_orden.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clienteNombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ot.vehiculo_detalle.placa.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesEstado = filterEstado === "todas" || ot.estado_detalle.nombre === filterEstado
    const matchesTipo = filterTipo === "todas" || ot.tipo_detalle.nombre === filterTipo

    return matchesSearch && matchesEstado && matchesTipo
  })

  // Separate by status
  const otsPorEstado = {
    activas: filteredOTs.filter((ot) => !ESTADOS_COMPLETADOS.includes(ot.estado_detalle.nombre)),
    completadas: filteredOTs.filter((ot) => ESTADOS_COMPLETADOS.includes(ot.estado_detalle.nombre)),
  }

  // Get unique estados and tipos for filters
  const uniqueEstados = Array.from(new Set(ordenesData.map((ot) => ot.estado_detalle.nombre)))
  const uniqueTipos = Array.from(new Set(ordenesData.map((ot) => ot.tipo_detalle.nombre)))


  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        {/*<Spinner className="h-8 w-8" />*/}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Debug Info */}
      {ordenesData.length === 0 && (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-yellow-600">
              ⚠️ No se han cargado datos de la API. Total de órdenes: {ordenesData.length}
            </p>
          </CardContent>
        </Card>
      )}

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
                {uniqueEstados.map((estado) => (
                  <SelectItem key={estado} value={estado}>
                    {estado}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterTipo} onValueChange={setFilterTipo}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todos los tipos</SelectItem>
                {uniqueTipos.map((tipo) => (
                  <SelectItem key={tipo} value={tipo}>
                    {tipo}
                  </SelectItem>
                ))}
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
              {otsPorEstado.activas.map((ot) => (
                <Card key={`ot-activa-${ot.id}`} className="transition-colors hover:bg-accent/50">
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold">{ot.numero_orden}</h3>
                              <Badge variant="outline" className={getEstadoColorClass(ot.estado_detalle.codigo)}>
                                {ot.estado_detalle.nombre}
                              </Badge>
                              <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                                {ot.tipo_detalle.nombre}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {ot.cliente_detalle.first_name} {ot.cliente_detalle.last_name}
                            </p>
                          </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium">Vehículo:</span>
                            <span>
                              {ot.vehiculo_detalle.modelo_tecnico_detalle.marca}{" "}
                              {ot.vehiculo_detalle.modelo_tecnico_detalle.modelo}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium">Placa:</span>
                            <span>{ot.vehiculo_detalle.placa}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>Juan Técnico</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>
                              Ingreso:{" "}
                              {new Date(ot.fecha_apertura).toLocaleDateString("es-EC", {
                                day: "2-digit",
                                month: "short",
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Entrega estimada:</span>
                            <span>
                              {new Date(ot.fecha_promesa_entrega).toLocaleDateString("es-EC", {
                                day: "2-digit",
                                month: "short",
                              })}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">Progreso:</span>
                          <span>1 / 2 tareas</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/dashboard/ot/${ot.id}`}>Ver Detalles</Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
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
              {otsPorEstado.completadas.map((ot) => (
                <Card key={`ot-completada-${ot.id}`} className="transition-colors hover:bg-accent/50">
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold">{ot.numero_orden}</h3>
                          <Badge variant="outline" className={getEstadoColorClass(ot.estado_detalle.codigo)}>
                            {ot.estado_detalle.nombre}
                          </Badge>
                          <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                            {ot.tipo_detalle.nombre}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {ot.cliente_detalle.first_name} {ot.cliente_detalle.last_name} - {ot.vehiculo_detalle.placa}
                        </p>
                        <p className="text-sm font-medium">Total: $0.00</p>
                      </div>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/dashboard/ot/${ot.id}`}>Ver Detalles</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
