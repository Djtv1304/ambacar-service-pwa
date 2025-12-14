"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { MapPin, Clock, AlertCircle } from "lucide-react"
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

  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("es-EC", {
      day: "numeric",
      month: "short",
    })
  }

  return (
    <Link href={`/dashboard/mis-servicios/${service.id}`}>
      <motion.div
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "flex flex-col sm:flex-row bg-card border rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer",
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

          {/* Pending approvals badge overlay - mobile only */}
          {service.pendingApprovals > 0 && (
            <div className="absolute top-3 right-3 sm:hidden">
              <Badge variant="destructive" className="gap-1 shadow-lg">
                <AlertCircle className="h-3 w-3" />
                {service.pendingApprovals}
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
              {service.pendingApprovals > 0 && (
                <Badge
                  variant="outline"
                  className="hidden sm:flex gap-1 border-orange-500/50 bg-orange-500/10 text-orange-600"
                >
                  <AlertCircle className="h-3 w-3" />
                  {service.pendingApprovals} pendiente{service.pendingApprovals > 1 ? "s" : ""}
                </Badge>
              )}
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
            </div>
          </div>

          {/* Service description */}
          <p className="text-sm text-muted-foreground line-clamp-2">
            {service.servicioSolicitado}
          </p>

          {/* Footer with location and date */}
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs text-muted-foreground mt-auto">
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{service.taller.nombre}</span>
            </div>

            {service.fechaEstimadaEntrega && (
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 shrink-0" />
                <span>Entrega: {formatDate(service.fechaEstimadaEntrega)}</span>
              </div>
            )}
          </div>

          {/* Progress bar for active services */}
          {service.estado !== "entregado" && (
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
    </Link>
  )
}

