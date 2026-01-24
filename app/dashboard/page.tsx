"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Calendar, ClipboardList, Wrench, ClipboardCheck, Clock, AlertCircle, Car } from "lucide-react"
import { StatCard } from "@/components/dashboard/stat-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { useAuth } from "@/components/auth/auth-provider"
import { useAuthToken } from "@/hooks/use-auth-token"
import { useIsMobile } from "@/hooks/use-mobile"
import { getDashboard, type DashboardData } from "@/lib/api/dashboard"
import Link from "next/link"

const estadoColors: Record<string, string> = {
  pendiente: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  confirmada: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  en_proceso: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  completada: "bg-green-500/10 text-green-500 border-green-500/20",
  cancelada: "bg-red-500/10 text-red-500 border-red-500/20",
  creada: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  en_diagnostico: "bg-orange-500/10 text-orange-500 border-orange-500/20",
}

const prioridadColors: Record<string, string> = {
  baja: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  media: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  alta: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  urgente: "bg-red-500/10 text-red-500 border-red-500/20",
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { getToken } = useAuthToken()
  const isMobile = useIsMobile()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = await getToken()
        if (!token) return
        const result = await getDashboard(token)
        setData(result)
      } catch (error) {
        console.error("Error fetching dashboard:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [getToken])

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bienvenido, {user?.nombre}</h1>
        <p className="text-muted-foreground mt-1">Resumen de actividades del taller</p>
      </div>

        {/* Alerts Section */}
        {user?.rol !== "cliente" && (
            <Card className="border-orange-500/20 bg-orange-500/5">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-orange-500" />
                        <CardTitle className="text-orange-500">Alertas del Sistema</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                            <span>2 repuestos por debajo del umbral mínimo</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                            <span>1 orden de trabajo con retraso en entrega estimada</span>
                        </li>
                    </ul>
                </CardContent>
            </Card>
        )}

      {/* Stats Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        <motion.div variants={item}>
          <StatCard
            title="Citas del Día"
            value={data?.stats.citasHoy ?? 0}
            description={`${data?.stats.citasConfirmadas ?? 0} confirmadas`}
            icon={Calendar}
          />
        </motion.div>

        <motion.div variants={item}>
          <StatCard
            title="OTs Abiertas"
            value={data?.stats.otAbiertas ?? 0}
            description="Requieren atención"
            icon={ClipboardList}
          />
        </motion.div>

        <motion.div variants={item}>
          <StatCard
            title="Vehículos en Taller"
            value={data?.stats.vehiculosEnTaller ?? 0}
            description="En proceso actualmente"
            icon={Wrench}
          />
        </motion.div>

        <motion.div variants={item}>
          <StatCard
            title="Inspecciones Completadas"
            value={data?.stats.inspeccionesCompletadas ?? 0}
            description="Este mes"
            icon={ClipboardCheck}
          />
        </motion.div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Citas de Hoy */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Citas de Hoy</CardTitle>
                <CardDescription>{data?.citasHoy.length ?? 0} citas programadas</CardDescription>
              </div>
              <Button asChild size="sm">
                <Link href="/dashboard/recepcion">Ver todas</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {!data?.citasHoy.length ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground">No hay citas programadas para hoy</p>
                </div>
              ) : (
                data.citasHoy.map((cita) => (
                  <div
                    key={cita.id}
                    className="flex items-start gap-4 rounded-lg border border-border p-4 transition-colors hover:bg-accent/50"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">
                          {cita.cliente.nombre} {cita.cliente.apellido}
                        </p>
                        <Badge variant="outline" className={estadoColors[cita.estado] || estadoColors.creada}>
                          {cita.estado}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {cita.vehiculo.marca} {cita.vehiculo.modelo} - {cita.vehiculo.placa}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {cita.hora} • {cita.servicioSolicitado}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Órdenes de Trabajo Activas */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Órdenes de Trabajo</CardTitle>
                <CardDescription>{data?.otActivas.length ?? 0} órdenes activas</CardDescription>
              </div>
              <Button asChild size="sm">
                <Link href="/dashboard/ot">Ver todas</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {!data?.otActivas.length ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <ClipboardList className="h-12 w-12 text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground">No hay órdenes de trabajo activas</p>
                </div>
              ) : (
                data.otActivas.slice(0, 4).map((ot) =>
                  isMobile ? (
                    <div
                      key={ot.id}
                      className="rounded-lg border border-border p-4 transition-colors hover:bg-accent/50"
                    >
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                          <Car className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className={prioridadColors[ot.prioridad] || prioridadColors.media}>
                            {ot.prioridad}
                          </Badge>
                          <Badge variant="outline" className={estadoColors[ot.estado] || estadoColors.creada}>
                            {ot.estado.replace("_", " ")}
                          </Badge>
                        </div>
                      </div>
                      <p className="font-medium text-lg mb-2">{ot.numero}</p>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                          {ot.cliente.nombre} {ot.cliente.apellido}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {ot.vehiculo.marca} {ot.vehiculo.modelo} - {ot.vehiculo.placa}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div
                      key={ot.id}
                      className="flex items-start gap-4 rounded-lg border border-border p-4 transition-colors hover:bg-accent/50"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Car className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{ot.numero}</p>
                          <div className="flex gap-2">
                            <Badge variant="outline" className={prioridadColors[ot.prioridad] || prioridadColors.media}>
                              {ot.prioridad}
                            </Badge>
                            <Badge variant="outline" className={estadoColors[ot.estado] || estadoColors.creada}>
                              {ot.estado.replace("_", " ")}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {ot.cliente.nombre} {ot.cliente.apellido}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {ot.vehiculo.marca} {ot.vehiculo.modelo} - {ot.vehiculo.placa}
                        </p>
                      </div>
                    </div>
                  )
                )
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
