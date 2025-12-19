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
  User,
  Fuel,
  Gauge,
  Receipt,
  CheckCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { TimelineVertical } from "@/components/mis-servicios/timeline-vertical"
import { AdditionalWorkManager } from "@/components/mis-servicios/additional-work-manager"
import { ProformaSheet } from "@/components/mis-servicios/proforma-sheet"
import { ServiceCompletionReport } from "@/components/mis-servicios/service-completion-report"
import { useServiceData } from "@/hooks/use-service-data"
import { SERVICE_STATUS_MAP } from "@/lib/mis-servicios/types"
import { isCustomer, isInternalUser } from "@/lib/auth/roles"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth/auth-provider"
import { useSidebar } from "@/components/dashboard/sidebar-context"

export default function ServiceDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params)
  const serviceId = resolvedParams.id

  const { service, isLoading, error, approveWork, rejectWork } = useServiceData(serviceId)
  const { user } = useAuth()
  const { collapsed } = useSidebar()
  const approvalsRef = useRef<HTMLDivElement>(null)
  const [showCompletionReport, setShowCompletionReport] = useState(false)
  const [showProformaSheet, setShowProformaSheet] = useState(false)

  // Use centralized role utilities
  const userIsCustomer = isCustomer(user)
  const userIsInternal = isInternalUser(user)

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
    <>
      {/* Main content with bottom padding for sticky footer */}
      <div className="space-y-6 pb-28 lg:pb-8">
        {/* Back button */}
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link href="/dashboard/mis-servicios">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Link>
        </Button>

        {/* A. Hero Header - Compact version */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-xl border bg-card"
        >
          <div className="flex flex-col sm:flex-row">
            {/* Vehicle image */}
            <div className="relative w-full aspect-video sm:w-48 md:w-56 sm:aspect-auto shrink-0 overflow-hidden">
              <Image
                src={service.vehiculo.imagen || "/placeholder.svg"}
                alt={`${service.vehiculo.marca} ${service.vehiculo.modelo}`}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent sm:hidden" />
              <div className="absolute bottom-3 left-3 sm:hidden">
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
            <div className="flex-1 p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h1 className="text-lg sm:text-xl font-bold">
                      {service.vehiculo.marca} {service.vehiculo.modelo}
                    </h1>
                    <Badge
                      variant="outline"
                      className={cn(
                        "hidden sm:inline-flex",
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
                  <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{service.taller.nombre}</span>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">Progreso</span>
                  <span className="font-medium">{service.progreso}%</span>
                </div>
                <Progress value={service.progreso} className="h-2" />
                {service.fechaEstimadaEntrega && (
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5">
                    <Clock className="h-3 w-3" />
                    Entrega: {formatDate(service.fechaEstimadaEntrega)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* B. Pending Approvals Alert - Only show to clients, not internal users */}
        {service.pendingApprovals > 0 && !userIsInternal && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-orange-500/30 bg-orange-500/5 p-3 sm:p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="shrink-0 h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                  <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
                </div>
                <div>
                  <p className="font-medium text-sm text-orange-600 dark:text-orange-400">
                    {service.pendingApprovals} trabajo{service.pendingApprovals > 1 ? "s" : ""} pendiente{service.pendingApprovals > 1 ? "s" : ""}
                  </p>
                  <p className="text-xs text-muted-foreground hidden sm:block">
                    Requieren tu aprobación
                  </p>
                </div>
              </div>
              <Button
                onClick={scrollToApprovals}
                size="sm"
                className="bg-orange-500 hover:bg-orange-600 text-white shrink-0"
              >
                Revisar
              </Button>
            </div>
          </motion.div>
        )}

        {/* Internal User Info Banner - Shows pending count but no action */}
        {service.pendingApprovals > 0 && userIsInternal && (
          <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
            <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{service.pendingApprovals} trabajo{service.pendingApprovals > 1 ? "s" : ""}</span>
              {" "}pendiente{service.pendingApprovals > 1 ? "s" : ""} de aprobación por el cliente
            </p>
          </div>
        )}

        {/* Main Content - Two column layout on desktop */}
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Left column - Timeline (Primary Focus) */}
          <div className="lg:col-span-3 space-y-6">
            <Card>
              <CardHeader className="px-4 md:px-6 pb-3">
                <CardTitle className="text-lg">Línea de Tiempo</CardTitle>
              </CardHeader>
              <CardContent className="px-4 md:px-6">
                <TimelineVertical
                  events={service.timeline}
                  simplified={userIsCustomer}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right column - Approvals and Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Additional Work Manager */}
            <div ref={approvalsRef}>
              <AdditionalWorkManager
                pendingWork={service.trabajosAdicionales}
                approvedWork={service.trabajosAprobados}
                rejectedWork={service.trabajosRechazados}
                onApprove={approveWork}
                onReject={rejectWork}
                readOnly={userIsInternal}
              />
            </div>

            {/* Service Details Accordion */}
            <Card>
              <CardHeader className="px-4 md:px-6 pb-2">
                <CardTitle className="text-base">Detalles del Servicio</CardTitle>
              </CardHeader>
              <CardContent className="px-4 md:px-6 pt-0">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="cliente">
                    <AccordionTrigger className="text-sm py-3">
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
                    <AccordionTrigger className="text-sm py-3">
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
                      <AccordionTrigger className="text-sm py-3">
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

            {/* Completion Report Button - Desktop only */}
            {isFinished && (
              <Button
                className="w-full hidden lg:flex"
                size="lg"
                onClick={() => setShowCompletionReport(true)}
              >
                <FileText className="mr-2 h-5 w-5" />
                Ver Reporte de Servicio
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* STICKY FOOTER - Mobile/Tablet */}
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-t lg:hidden",
          "transition-all duration-300",
          collapsed ? "lg:left-20" : "lg:left-64"
        )}
      >
        {/* Container: FAB safe zone on left, stacked content on right */}
        <div className="flex items-center justify-end pl-20 pr-4 py-3">
          {/* Stacked block: 2 levels aligned to the right */}
          <div className="flex flex-col items-end gap-2">
            {/* Level 1: Label + Price inline */}
            <div className="flex w-full justify-around items-baseline gap-2">
              <span className="text-xs text-muted-foreground">Total estimado</span>
              <span className="text-base font-bold text-primary">
                ${service.total.toFixed(2)}
              </span>
            </div>

            {/* Horizontal divider - full width */}
            <div className="w-full h-px bg-border" />

            {/* Level 2: Action buttons in row */}
            <div className="flex items-center gap-2">
              {/* Aprobar pendientes - only for clients, not internal users */}
              {service.pendingApprovals > 0 && !userIsInternal && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={scrollToApprovals}
                  className="border-orange-500/50 text-orange-600 hover:bg-orange-500/10 px-2"
                >
                  <AlertCircle className="h-4 w-4" />
                  <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 justify-center text-xs">
                    {service.pendingApprovals}
                  </Badge>
                </Button>
              )}

              {/* Ver Proforma - Opens unified Sheet */}
              <Button size="sm" onClick={() => setShowProformaSheet(true)}>
                <Receipt className="h-4 w-4 mr-1.5" />
                Proforma
              </Button>

              {/* Reporte de cierre - if finished */}
              {isFinished && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setShowCompletionReport(true)}
                >
                  <CheckCircle className="h-4 w-4 mr-1.5" />
                  Reporte
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop - Floating action to open proforma */}
      <div className="hidden lg:block fixed bottom-6 right-6 z-40">
        <Button
          size="lg"
          className="shadow-lg gap-2"
          onClick={() => setShowProformaSheet(true)}
        >
          <Receipt className="h-5 w-5" />
          Ver Proforma
          <span className="font-bold">${service.total.toFixed(2)}</span>
        </Button>
      </div>

      {/* Unified Proforma Sheet - Single component for both mobile and desktop */}
      {service && (
        <ProformaSheet
          service={service}
          open={showProformaSheet}
          onClose={() => setShowProformaSheet(false)}
        />
      )}

      {/* Completion Report Modal */}
      {service && (
        <ServiceCompletionReport
          service={service}
          open={showCompletionReport}
          onClose={() => setShowCompletionReport(false)}
        />
      )}
    </>
  )
}

function ServiceDetailSkeleton() {
  return (
    <div className="space-y-6 pb-28 lg:pb-8">
      <Skeleton className="h-8 w-24" />

      {/* Hero skeleton */}
      <div className="rounded-xl border overflow-hidden">
        <div className="flex flex-col sm:flex-row">
          <Skeleton className="w-full aspect-video sm:w-56 sm:aspect-auto" />
          <div className="flex-1 p-5 space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-40" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-2 w-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <Skeleton className="h-96 rounded-xl" />
        </div>
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      </div>

      {/* Sticky footer skeleton - mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t lg:hidden">
        <div className="flex items-center justify-end pl-20 pr-4 py-3">
          <div className="flex flex-col items-end gap-2">
            <div className="flex w-full justify-around items-baseline gap-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-5 w-16" />
            </div>
            <div className="w-full h-px bg-border" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
