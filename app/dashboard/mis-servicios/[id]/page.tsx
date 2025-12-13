"use client"

import { use, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  MapPin,
  Clock,
  AlertCircle,
  FileText,
  ChevronDown,
  User,
  Fuel,
  Gauge
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TimelineVertical } from "@/components/mis-servicios/timeline-vertical"
import { AdditionalWorkManager } from "@/components/mis-servicios/additional-work-manager"
import { DigitalProforma } from "@/components/mis-servicios/digital-proforma"
import { ServiceCompletionReport } from "@/components/mis-servicios/service-completion-report"
import { useServiceData } from "@/hooks/use-service-data"
import { SERVICE_STATUS_MAP } from "@/lib/mis-servicios/types"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth/auth-provider"

export default function ServiceDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params)
  const serviceId = resolvedParams.id

  const { service, isLoading, error, approveWork, rejectWork } = useServiceData(serviceId)
  const { user } = useAuth()
  const approvalsRef = useRef<HTMLDivElement>(null)
  const [showCompletionReport, setShowCompletionReport] = useState(false)

  // Check if user is a customer (simplified view) or staff (detailed view)
  const isCustomer = user?.role === "customer"

  const scrollToApprovals = () => {
    approvalsRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Format dates
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("es-EC", {
      weekday: "long",
      day: "numeric",
      month: "long",
    })
  }

  if (isLoading) {
    return <ServiceDetailSkeleton />
  }

  if (error || !service) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <p className="text-lg text-muted-foreground">
          {error || "No se encontró el servicio"}
        </p>
        <Button asChild>
          <Link href="/dashboard/mis-servicios">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Mis Servicios
          </Link>
        </Button>
      </div>
    )
  }

  const statusInfo = SERVICE_STATUS_MAP[service.estado]
  const isFinished = service.estado === "listo" || service.estado === "entregado"

  return (
    <div className="space-y-6 pb-8">
      {/* Back button */}
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href="/dashboard/mis-servicios">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Link>
      </Button>

      {/* A. Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-xl border bg-card"
      >
        <div className="flex flex-col md:flex-row">
          {/* Vehicle image */}
          <div className="relative w-full md:w-64 h-48 md:h-auto shrink-0 bg-muted">
            <Image
              src={service.vehiculo.imagen || "/placeholder.svg"}
              alt={`${service.vehiculo.marca} ${service.vehiculo.modelo}`}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent md:hidden" />
            <div className="absolute bottom-3 left-3 md:hidden">
              <Badge
                variant="outline"
                className={cn(
                  "backdrop-blur-sm bg-background/80",
                  statusInfo.color
                )}
              >
                {statusInfo.label}
              </Badge>
            </div>
          </div>

          {/* Info section */}
          <div className="flex-1 p-5 md:p-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl sm:text-2xl font-bold">
                    {service.vehiculo.marca} {service.vehiculo.modelo}
                  </h1>
                  <Badge
                    variant="outline"
                    className={cn(
                      "hidden md:inline-flex",
                      statusInfo.bgColor,
                      statusInfo.color,
                      statusInfo.borderColor
                    )}
                  >
                    {statusInfo.label}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {service.vehiculo.placa} • {service.numeroOrden}
                </p>
                <div className="flex items-center gap-1.5 mt-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{service.taller.nombre}</span>
                </div>
              </div>

              <div className="flex flex-col items-start md:items-end gap-1">
                <p className="text-2xl font-bold text-primary">
                  ${service.total.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">Total estimado</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-5">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Progreso del servicio</span>
                <span className="font-medium">{service.progreso}%</span>
              </div>
              <Progress value={service.progreso} className="h-2" />
              {service.fechaEstimadaEntrega && (
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  Entrega estimada: {formatDate(service.fechaEstimadaEntrega)}
                </p>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* B. Pending Approvals Alert */}
      {service.pendingApprovals > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border-2 border-orange-500/30 bg-orange-500/5 p-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="shrink-0 h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <h3 className="font-semibold text-orange-600 dark:text-orange-400">
                  Aprobaciones Requeridas
                </h3>
                <p className="text-sm text-muted-foreground">
                  Hay {service.pendingApprovals} trabajo
                  {service.pendingApprovals > 1 ? "s" : ""} adicional
                  {service.pendingApprovals > 1 ? "es" : ""} que requieren tu aprobación
                </p>
              </div>
            </div>
            <Button
              onClick={scrollToApprovals}
              className="bg-orange-500 hover:bg-orange-600 text-white shrink-0"
            >
              Revisar y Aprobar
            </Button>
          </div>
        </motion.div>
      )}

      {/* Main Content - Tabs for mobile, side-by-side for desktop */}
      <Tabs defaultValue="timeline" className="space-y-4">
        <TabsList className="w-full grid grid-cols-3 lg:hidden">
          <TabsTrigger value="timeline">Progreso</TabsTrigger>
          <TabsTrigger value="approvals" className="relative">
            Trabajos
            {service.pendingApprovals > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-orange-500 text-[10px] text-white flex items-center justify-center">
                {service.pendingApprovals}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="proforma">Proforma</TabsTrigger>
        </TabsList>

        {/* Mobile tabs content */}
        <TabsContent value="timeline" className="lg:hidden mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Línea de Tiempo</CardTitle>
            </CardHeader>
            <CardContent>
              <TimelineVertical
                events={service.timeline}
                simplified={isCustomer}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approvals" className="lg:hidden mt-0">
          <div ref={approvalsRef}>
            <AdditionalWorkManager
              pendingWork={service.trabajosAdicionales}
              approvedWork={service.trabajosAprobados}
              rejectedWork={service.trabajosRechazados}
              onApprove={approveWork}
              onReject={rejectWork}
            />
          </div>
        </TabsContent>

        <TabsContent value="proforma" className="lg:hidden mt-0">
          <DigitalProforma service={service} />
        </TabsContent>

        {/* Desktop layout - always visible */}
        <div className="hidden lg:grid lg:grid-cols-5 gap-6">
          {/* Left column - Timeline */}
          <div className="lg:col-span-3 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Línea de Tiempo</CardTitle>
              </CardHeader>
              <CardContent>
                <TimelineVertical
                  events={service.timeline}
                  simplified={isCustomer}
                />
              </CardContent>
            </Card>

            {/* Proforma */}
            <DigitalProforma service={service} />
          </div>

          {/* Right column - Approvals and Details */}
          <div className="lg:col-span-2 space-y-6">
            <div ref={approvalsRef}>
              <AdditionalWorkManager
                pendingWork={service.trabajosAdicionales}
                approvedWork={service.trabajosAprobados}
                rejectedWork={service.trabajosRechazados}
                onApprove={approveWork}
                onReject={rejectWork}
              />
            </div>

            {/* D. Service Details Accordion */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Detalles del Servicio</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="cliente">
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Datos del Cliente
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 text-sm">
                        <p>
                          <span className="text-muted-foreground">Nombre:</span>{" "}
                          {service.cliente.nombre} {service.cliente.apellido}
                        </p>
                        <p>
                          <span className="text-muted-foreground">Email:</span>{" "}
                          {service.cliente.email}
                        </p>
                        <p>
                          <span className="text-muted-foreground">Teléfono:</span>{" "}
                          {service.cliente.telefono}
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="recepcion">
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        <Gauge className="h-4 w-4" />
                        Datos de Recepción
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Kilometraje:</span>
                          <span className="font-medium">
                            {service.recepcion.kilometraje.toLocaleString()} km
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Fuel className="h-3.5 w-3.5" />
                            Combustible:
                          </span>
                          <div className="flex items-center gap-2">
                            <Progress
                              value={service.recepcion.nivelCombustible}
                              className="w-20 h-2"
                            />
                            <span className="font-medium text-xs">
                              {service.recepcion.nivelCombustible}%
                            </span>
                          </div>
                        </div>
                        {service.recepcion.observaciones && (
                          <div>
                            <p className="text-muted-foreground mb-1">Observaciones:</p>
                            <p className="bg-muted/50 rounded p-2 text-xs">
                              {service.recepcion.observaciones}
                            </p>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {service.tecnicoAsignado && (
                    <AccordionItem value="tecnico">
                      <AccordionTrigger>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Técnico Asignado
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2 text-sm">
                          <p>
                            <span className="text-muted-foreground">Nombre:</span>{" "}
                            {service.tecnicoAsignado.nombre}
                          </p>
                          {service.tecnicoAsignado.especialidad && (
                            <p>
                              <span className="text-muted-foreground">Especialidad:</span>{" "}
                              {service.tecnicoAsignado.especialidad}
                            </p>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )}
                </Accordion>
              </CardContent>
            </Card>

            {/* Completion Report Button */}
            {isFinished && (
              <Button
                className="w-full"
                size="lg"
                onClick={() => setShowCompletionReport(true)}
              >
                <FileText className="mr-2 h-5 w-5" />
                Ver Reporte de Servicio
              </Button>
            )}
          </div>
        </div>
      </Tabs>

      {/* Mobile - Details Accordion (always visible) */}
      <Card className="lg:hidden">
        <CardHeader>
          <CardTitle className="text-lg">Detalles del Servicio</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="cliente">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Datos del Cliente
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="text-muted-foreground">Nombre:</span>{" "}
                    {service.cliente.nombre} {service.cliente.apellido}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Email:</span>{" "}
                    {service.cliente.email}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Teléfono:</span>{" "}
                    {service.cliente.telefono}
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="recepcion">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <Gauge className="h-4 w-4" />
                  Datos de Recepción
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Kilometraje:</span>
                    <span className="font-medium">
                      {service.recepcion.kilometraje.toLocaleString()} km
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Fuel className="h-3.5 w-3.5" />
                      Combustible:
                    </span>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={service.recepcion.nivelCombustible}
                        className="w-20 h-2"
                      />
                      <span className="font-medium text-xs">
                        {service.recepcion.nivelCombustible}%
                      </span>
                    </div>
                  </div>
                  {service.recepcion.observaciones && (
                    <div>
                      <p className="text-muted-foreground mb-1">Observaciones:</p>
                      <p className="bg-muted/50 rounded p-2 text-xs">
                        {service.recepcion.observaciones}
                      </p>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Mobile - Completion Report Button */}
      {isFinished && (
        <div className="lg:hidden">
          <Button
            className="w-full"
            size="lg"
            onClick={() => setShowCompletionReport(true)}
          >
            <FileText className="mr-2 h-5 w-5" />
            Ver Reporte de Servicio
          </Button>
        </div>
      )}

      {/* Completion Report Modal */}
      {service && (
        <ServiceCompletionReport
          service={service}
          open={showCompletionReport}
          onClose={() => setShowCompletionReport(false)}
        />
      )}
    </div>
  )
}

function ServiceDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-24" />

      {/* Hero skeleton */}
      <div className="rounded-xl border overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <Skeleton className="w-full md:w-64 h-48" />
          <div className="flex-1 p-6 space-y-4">
            <div className="flex justify-between">
              <div className="space-y-2">
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-40" />
              </div>
              <div className="text-right space-y-2">
                <Skeleton className="h-8 w-24 ml-auto" />
                <Skeleton className="h-3 w-20 ml-auto" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-2 w-full" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <Skeleton className="h-96 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

