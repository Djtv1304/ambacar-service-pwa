"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { MapPin, Clock, AlertCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { ClientService } from "@/lib/mis-servicios/types"
import { SERVICE_STATUS_MAP } from "@/lib/mis-servicios/types"
import { cn } from "@/lib/utils"

interface ServiceCardProps {
  service: ClientService
  className?: string
}

export function ServiceCard({ service, className }: ServiceCardProps) {
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
      >
        <Card
          className={cn(
            "overflow-hidden transition-shadow hover:shadow-md cursor-pointer",
            className
          )}
        >
          <CardContent className="p-0">
            <div className="flex flex-col sm:flex-row">
              {/* Vehicle Image */}
              <div className="relative w-full sm:w-32 md:w-40 h-32 sm:h-auto shrink-0 bg-muted">
                <Image
                  src={service.vehiculo.imagen || "/placeholder.svg"}
                  alt={`${service.vehiculo.marca} ${service.vehiculo.modelo}`}
                  fill
                  className="object-cover"
                />
                {/* Pending approvals badge - mobile */}
                {service.pendingApprovals > 0 && (
                  <div className="absolute top-2 right-2 sm:hidden">
                    <Badge variant="destructive" className="gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {service.pendingApprovals}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 p-4 flex flex-col justify-between gap-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-base sm:text-lg leading-tight">
                      {service.vehiculo.marca} {service.vehiculo.modelo}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {service.vehiculo.placa} • {service.numeroOrden}
                    </p>
                  </div>

                  {/* Status badge + Pending approvals - desktop */}
                  <div className="flex items-center gap-2">
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
                        "shrink-0",
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
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {service.servicioSolicitado}
                </p>

                {/* Footer with location and date */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    <span className="line-clamp-1">{service.taller.nombre}</span>
                  </div>

                  {service.fechaEstimadaEntrega && (
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      <span>Entrega est.: {formatDate(service.fechaEstimadaEntrega)}</span>
                    </div>
                  )}
                </div>

                {/* Progress bar for active services */}
                {service.estado !== "entregado" && (
                  <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                    <motion.div
                      className="h-full bg-primary rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${service.progreso}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  )
}

