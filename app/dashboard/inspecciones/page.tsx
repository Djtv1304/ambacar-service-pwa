"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, ClipboardCheck } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { getInspecciones } from "@/lib/api/inspecciones"
import { useAuthToken } from "@/hooks/use-auth-token"
import type { InspeccionListItem } from "@/lib/types"

export default function InspeccionesPage() {
  const [inspecciones, setInspecciones] = useState<InspeccionListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const { getToken } = useAuthToken()

  useEffect(() => {
    const loadInspecciones = async () => {
      try {
        const token = await getToken()
        if (!token) {
          toast.error("No se encontró token de autenticación")
          setLoading(false)
          return
        }

        const data = await getInspecciones(token)
        setInspecciones(data)
      } catch (error) {
        console.error("Error loading inspecciones:", error)
        toast.error("Error al cargar las inspecciones")
      } finally {
        setLoading(false)
      }
    }

    loadInspecciones()
  }, [getToken])

  const filteredInspecciones = inspecciones.filter((inspeccion) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      inspeccion.numero_inspeccion.toLowerCase().includes(searchLower) ||
      inspeccion.orden_trabajo_info.numero_orden.toLowerCase().includes(searchLower) ||
      inspeccion.orden_trabajo_info.vehiculo_placa.toLowerCase().includes(searchLower) ||
      inspeccion.orden_trabajo_info.cliente_nombre.toLowerCase().includes(searchLower)
    )
  })

  const pendientes = filteredInspecciones.filter((i) => i.estado === "PENDIENTE").length
  const enProceso = filteredInspecciones.filter((i) => i.estado === "EN_PROCESO").length
  const completadas = filteredInspecciones.filter((i) => i.estado === "COMPLETADA").length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inspecciones - {new Date().toLocaleDateString("es-EC")}</h1>
          <p className="text-muted-foreground mt-1">Técnico: Alex Ramírez</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/20">{pendientes}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendientes}</div>
            <p className="text-xs text-muted-foreground mt-1">Inspecciones por iniciar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">En Proceso</CardTitle>
            <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">{enProceso}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enProceso}</div>
            <p className="text-xs text-muted-foreground mt-1">Inspecciones iniciadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completadas</CardTitle>
            <Badge className="bg-green-500/10 text-green-600 border-green-500/20">{completadas}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completadas}</div>
            <p className="text-xs text-muted-foreground mt-1">Inspecciones finalizadas</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Total del Día: {filteredInspecciones.length}</CardTitle>
          <CardDescription>Busca por número de placa o cliente</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por número de placa o cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Inspections List */}
      <div className="space-y-4">
        {filteredInspecciones.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <ClipboardCheck className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-lg font-medium">No se encontraron inspecciones</p>
              <p className="text-sm text-muted-foreground mt-1">
                {searchTerm ? "Intenta con otro término de búsqueda" : "No hay inspecciones programadas para hoy"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredInspecciones.map((inspeccion, index) => {
            const formatFechaHora = (fecha: string) => {
              const date = new Date(fecha)
              return date.toLocaleString("es-EC", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            }

            const getButtonConfig = () => {
              if (inspeccion.estado === "PENDIENTE") {
                return {
                  text: "Empezar Inspección",
                  href: `/dashboard/ot/${inspeccion.orden_trabajo}`,
                }
              } else if (inspeccion.estado === "EN_PROCESO") {
                return {
                  text: "Continuar Inspección",
                  href: `/dashboard/inspeccion/${inspeccion.orden_trabajo}`,
                }
              } else {
                return {
                  text: "Ver Inspección",
                  href: `/dashboard/inspeccion/${inspeccion.orden_trabajo}`,
                }
              }
            }

            const buttonConfig = getButtonConfig()

            return (
              <motion.div
                key={inspeccion.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-lg">
                            {inspeccion.numero_inspeccion} - {inspeccion.orden_trabajo_info.numero_orden}
                          </h3>
                          {inspeccion.estado === "PENDIENTE" && (
                            <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/20">Pendiente</Badge>
                          )}
                          {inspeccion.estado === "EN_PROCESO" && (
                            <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">En Proceso</Badge>
                          )}
                          {inspeccion.estado === "COMPLETADA" && (
                            <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Completada</Badge>
                          )}
                        </div>

                        <div>
                          <p className="text-sm text-muted-foreground">
                            Placa: <span className="font-medium text-foreground">{inspeccion.orden_trabajo_info.vehiculo_placa}</span>
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Cliente: <span className="font-medium text-foreground">{inspeccion.orden_trabajo_info.cliente_nombre}</span>
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Inspector: <span className="font-medium text-foreground">{inspeccion.inspector_nombre}</span>
                          </p>
                        </div>

                        <p className="text-sm text-muted-foreground">
                          Fecha: {formatFechaHora(inspeccion.fecha_inspeccion)}
                        </p>

                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                inspeccion.porcentaje_completado === 100 ? "bg-green-500" : "bg-blue-500"
                              }`}
                              style={{
                                width: `${inspeccion.porcentaje_completado}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                            {inspeccion.porcentaje_completado}% completado
                          </span>
                        </div>
                      </div>

                      <div className="flex-shrink-0">
                        <Button asChild className="bg-[#ED1C24] hover:bg-[#c41820] w-full md:w-auto">
                          <Link href={buttonConfig.href}>{buttonConfig.text}</Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })
        )}
      </div>
    </div>
  )
}
