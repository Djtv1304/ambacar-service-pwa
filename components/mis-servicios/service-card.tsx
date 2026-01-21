"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { MapPin, Clock, AlertCircle, AlertTriangle, Calendar, Info } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import type { ClientService } from "@/lib/mis-servicios/types"
import { SERVICE_STATUS_MAP } from "@/lib/mis-servicios/types"
import { cn } from "@/lib/utils"

interface ServiceCardProps {
  service: ClientService
  className?: string
}

export function ServiceCard({ service, className }: ServiceCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const statusInfo = SERVICE_STATUS_MAP[service.estado]

  // Determine if this is just an appointment (not clickable)
  const isAppointmentOnly = service.tipo === "cita"

  // Check if delivery date is overdue (only for non-delivered services)
  const isOverdue = service.fechaEstimadaEntrega &&
    service.estado !== "entregado" &&
    new Date(service.fechaEstimadaEntrega) < new Date()

  // Format date
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("es-EC", {
      day: "numeric",
      month: "short",
    })
  }

  // Format date and time for appointment
  const formatDateTime = (date: Date | string) => {
    const d = new Date(date)
    return {
      date: d.toLocaleDateString("es-EC", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }),
      time: d.toLocaleTimeString("es-EC", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    }
  }

  // Card content (shared between clickable and non-clickable versions)
  const cardContent = (
    <motion.div
      whileHover={!isAppointmentOnly ? { scale: 1.01 } : undefined}
      whileTap={!isAppointmentOnly ? { scale: 0.99 } : undefined}
      transition={{ duration: 0.2 }}
      className={cn(
        "flex flex-col sm:flex-row bg-card border rounded-xl shadow-sm overflow-hidden transition-shadow",
        !isAppointmentOnly && "hover:shadow-md cursor-pointer",
        isAppointmentOnly && "cursor-default",
        className
      )}
    >
      {/* Vehicle Image Container - Mobile: top full width, Desktop: left fixed width */}
      <div className="relative w-full aspect-video sm:w-48 md:w-56 sm:aspect-auto shrink-0 overflow-hidden">
        {/* Skeleton while loading */}
        {!imageLoaded && (
          <Skeleton className="absolute inset-0 w-full h-full" />
        )}
        <Image
          src={service.vehiculo.imagen || "/placeholder.svg"}
          alt={`${service.vehiculo.marca} ${service.vehiculo.modelo}`}
          fill
          className={cn(
            "object-cover transition-opacity duration-300",
            imageLoaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={() => setImageLoaded(true)}
          sizes="(max-width: 640px) 100vw, 224px"
        />

        {/* Pending approvals badge overlay - mobile only (only for orden_trabajo) */}
        {!isAppointmentOnly && service.pendingApprovals > 0 && (
          <div className="absolute top-3 right-3 sm:hidden">
            <Badge variant="destructive" className="gap-1 shadow-lg">
              <AlertCircle className="h-3 w-3" />
              {service.pendingApprovals}
            </Badge>
          </div>
        )}

        {/* Appointment badge overlay - mobile only (for cita type) */}
        {isAppointmentOnly && (
          <div className="absolute top-3 right-3 sm:hidden">
            <Badge className="gap-1 shadow-lg bg-purple-500 hover:bg-purple-500">
              <Calendar className="h-3 w-3" />
              Cita
            </Badge>
          </div>
        )}

        {/* Gradient overlay for mobile */}
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/30 to-transparent sm:hidden" />
      </div>

      {/* Content Container */}
      <div className="flex flex-col p-5 w-full gap-3">
        {/* Header Row - Title + Badges */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 min-w-0 flex-1">
            <h3 className="font-semibold text-base sm:text-lg leading-tight truncate">
              {service.vehiculo.marca} {service.vehiculo.modelo}
            </h3>
            <p className="text-sm text-muted-foreground">
              {service.vehiculo.placa} • {service.numeroOrden}
            </p>
          </div>

          {/* Badges - Right aligned */}
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0">
            {!isAppointmentOnly && service.pendingApprovals > 0 && (
              <Badge
                variant="outline"
                className="hidden sm:flex gap-1 border-orange-500/50 bg-orange-500/10 text-orange-600"
              >
                <AlertCircle className="h-3 w-3" />
                {service.pendingApprovals} pendiente{service.pendingApprovals > 1 ? "s" : ""}
              </Badge>
            )}
            {statusInfo && (
              <Badge
                variant="outline"
                className={cn(
                  statusInfo.bgColor,
                  statusInfo.color,
                  statusInfo.borderColor
                )}
              >
                {statusInfo.label}
              </Badge>
            )}
          </div>
        </div>

        {/* Service description */}
        <p className="text-sm text-muted-foreground line-clamp-2">
          {service.servicioSolicitado}
        </p>

        {/* Appointment Info Banner (for cita type) */}
        {isAppointmentOnly && (
          <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20">
            <Info className="h-4 w-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-purple-700 dark:text-purple-300">
                Cita programada
              </p>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-0.5">
                {(() => {
                  const dt = formatDateTime(service.fechaIngreso)
                  return `${dt.date} a las ${dt.time}`
                })()}
              </p>
              <p className="text-[10px] text-purple-500 dark:text-purple-500 mt-1">
                Presenta tu vehículo en el taller para iniciar el servicio
              </p>
            </div>
          </div>
        )}

        {/* Footer with location and date */}
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs text-muted-foreground mt-auto">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{service.taller.nombre}</span>
          </div>

          {!isAppointmentOnly && service.fechaEstimadaEntrega && (
            <div
              className={cn(
                "flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors",
                isOverdue && "bg-red-500/10"
              )}
            >
              <Clock className={cn(
                "h-3.5 w-3.5 shrink-0",
                isOverdue && "text-red-600 dark:text-red-400"
              )} />
              <span className={cn(
                isOverdue && "text-red-600 dark:text-red-400"
              )}>
                Entrega Estimada: {formatDate(service.fechaEstimadaEntrega)}
              </span>
              {isOverdue && (
                <span className="flex items-center gap-1 text-red-600 dark:text-red-400 font-medium">
                  <AlertTriangle className="h-3 w-3" />
                  Vencido
                </span>
              )}
            </div>
          )}
        </div>

        {/* Progress bar for active services (only for orden_trabajo) */}
        {!isAppointmentOnly && service.estado !== "entregado" && (
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${service.progreso}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        )}
      </div>
    </motion.div>
  )

  // Return clickable or non-clickable version
  if (isAppointmentOnly) {
    return cardContent
  }

  return (
    <Link href={`/dashboard/mis-servicios/${service.id}`}>
      {cardContent}
    </Link>
  )
}
