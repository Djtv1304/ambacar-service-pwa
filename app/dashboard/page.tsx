"use client"

import { motion } from "framer-motion"
import { Calendar, ClipboardList, Wrench, ClipboardCheck, Clock, AlertCircle, Car } from "lucide-react"
import { StatCard } from "@/components/dashboard/stat-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { mockCitas } from "@/lib/fixtures/ordenes-trabajo"
import { mockOrdenesTrabajoData } from "@/lib/fixtures/ordenes-trabajo"
import { mockClientes, mockVehiculos } from "@/lib/fixtures/clientes"
import { useAuth } from "@/components/auth/auth-provider"
import Link from "next/link"

const estadoColors = {
  pendiente: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  confirmada: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  en_proceso: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  completada: "bg-green-500/10 text-green-500 border-green-500/20",
  cancelada: "bg-red-500/10 text-red-500 border-red-500/20",
  creada: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  en_diagnostico: "bg-orange-500/10 text-orange-500 border-orange-500/20",
}

const prioridadColors = {
  baja: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  media: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  alta: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  urgente: "bg-red-500/10 text-red-500 border-red-500/20",
}

export default function DashboardPage() {
  const { user } = useAuth()

  // Calculate stats
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const citasHoy = mockCitas.filter((c) => {
    const citaDate = new Date(c.fecha)
    citaDate.setHours(0, 0, 0, 0)
    return citaDate.getTime() === today.getTime()
  })

  const otAbiertas = mockOrdenesTrabajoData.filter((ot) => !["completada", "entregada"].includes(ot.estado))

  const vehiculosEnTaller = mockOrdenesTrabajoData.filter((ot) =>
    ["en_proceso", "en_diagnostico", "en_prueba"].includes(ot.estado),
  )

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

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bienvenido, {user?.nombre}</h1>
        <p className="text-muted-foreground mt-1">Resumen de actividades del taller</p>
      </div>

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
            value={citasHoy.length}
            description={`${citasHoy.filter((c) => c.estado === "confirmada").length} confirmadas`}
            icon={Calendar}
            trend={{ value: 12, isPositive: true }}
          />
        </motion.div>

        <motion.div variants={item}>
          <StatCard
            title="OTs Abiertas"
            value={otAbiertas.length}
            description="Requieren atención"
            icon={ClipboardList}
            trend={{ value: 8, isPositive: false }}
          />
        </motion.div>

        <motion.div variants={item}>
          <StatCard
            title="Vehículos en Taller"
            value={vehiculosEnTaller.length}
            description="En proceso actualmente"
            icon={Wrench}
          />
        </motion.div>

        <motion.div variants={item}>
          <StatCard
            title="Inspecciones Completadas"
            value={mockOrdenesTrabajoData.filter((ot) => ot.estado === "completada").length}
            description="Este mes"
            icon={ClipboardCheck}
          />
        </motion.div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Citas Próximas */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Citas de Hoy</CardTitle>
                <CardDescription>{citasHoy.length} citas programadas</CardDescription>
              </div>
              <Button asChild size="sm">
                <Link href="/dashboard/citas">Ver todas</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {citasHoy.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground">No hay citas programadas para hoy</p>
                </div>
              ) : (
                citasHoy.map((cita) => {
                  const cliente = mockClientes.find((c) => c.id === cita.clienteId)
                  const vehiculo = mockVehiculos.find((v) => v.id === cita.vehiculoId)

                  return (
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
                            {cliente?.nombre} {cliente?.apellido}
                          </p>
                          <Badge variant="outline" className={estadoColors[cita.estado]}>
                            {cita.estado}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {vehiculo?.marca} {vehiculo?.modelo} - {vehiculo?.placa}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {cita.hora} • {cita.servicioSolicitado}
                        </p>
                      </div>
                    </div>
                  )
                })
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
                <CardDescription>{otAbiertas.length} órdenes activas</CardDescription>
              </div>
              <Button asChild size="sm">
                <Link href="/dashboard/ot">Ver todas</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {otAbiertas.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <ClipboardList className="h-12 w-12 text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground">No hay órdenes de trabajo activas</p>
                </div>
              ) : (
                otAbiertas.slice(0, 4).map((ot) => {
                  const cliente = mockClientes.find((c) => c.id === ot.clienteId)
                  const vehiculo = mockVehiculos.find((v) => v.id === ot.vehiculoId)

                  return (
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
                            <Badge variant="outline" className={prioridadColors[ot.prioridad]}>
                              {ot.prioridad}
                            </Badge>
                            <Badge variant="outline" className={estadoColors[ot.estado]}>
                              {ot.estado.replace("_", " ")}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {cliente?.nombre} {cliente?.apellido}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {vehiculo?.marca} {vehiculo?.modelo} - {vehiculo?.placa}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>
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
    </div>
  )
}
