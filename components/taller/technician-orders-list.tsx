"use client"

import { motion } from "framer-motion"
import {
  Car,
  ChevronRight,
  Wrench,
  AlertTriangle,
  Clock,
  Settings
} from "lucide-react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { TechnicianOrder } from "@/lib/fixtures/technical-progress"
import { PHASE_CONFIG, getRelativeDeliveryDate } from "@/lib/fixtures/technical-progress"
import { cn } from "@/lib/utils"

interface TechnicianOrdersListProps {
  orders: TechnicianOrder[]
}

interface OrderCardProps {
  order: TechnicianOrder
  index: number
}

const STATUS_CONFIG = {
  abierta: { label: "Abierta", color: "bg-blue-500", textColor: "text-blue-600" },
  en_proceso: { label: "En Proceso", color: "bg-green-500", textColor: "text-green-600" },
  pausada: { label: "Pausada", color: "bg-yellow-500", textColor: "text-yellow-600" },
  cerrada: { label: "Cerrada", color: "bg-gray-500", textColor: "text-gray-600" },
}

const ORDER_TYPE_CONFIG = {
  mantenimiento: { label: "Mant.", color: "bg-blue-500/10 text-blue-600 border-blue-500/30", icon: Settings },
  reparacion: { label: "Rep.", color: "bg-orange-500/10 text-orange-600 border-orange-500/30", icon: Wrench },
  garantia: { label: "Gar.", color: "bg-purple-500/10 text-purple-600 border-purple-500/30", icon: Wrench },
}

function OrderCard({ order, index }: OrderCardProps) {
  const statusConfig = STATUS_CONFIG[order.estado]
  const deliveryInfo = getRelativeDeliveryDate(order.fechaEstimadaEntrega)
  const typeConfig = ORDER_TYPE_CONFIG[order.tipoOrden] || ORDER_TYPE_CONFIG.mantenimiento

  // Calculate progress based on phases
  const completedPhases = order.fases.filter(f => f.estado === "completed").length
  const totalPhases = order.fases.length
  const progress = (completedPhases / totalPhases) * 100

  // Get current phase
  const currentPhase = order.fases.find(f => f.estado === "in_progress")
  const currentPhaseLabel = currentPhase ? PHASE_CONFIG[currentPhase.fase].label : "—"

  // Determine priority (high if delivery is today or late)
  const isHighPriority = deliveryInfo.isLate || deliveryInfo.text.includes("Hoy")

  return (
    <Link href={`/dashboard/taller/${order.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <Card className={cn(
          "overflow-hidden hover:shadow-md transition-shadow cursor-pointer",
          isHighPriority && "border-l-4 border-l-red-500"
        )}>
          <CardContent className="p-0">
            <div className="flex">
              {/* Left - Vehicle Thumbnail */}
              <div className="relative w-20 sm:w-24 shrink-0 bg-muted flex items-center justify-center">
                {/* Placeholder vehicle icon */}
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Car className="h-6 w-6 text-primary" />
                </div>
                {/* Priority indicator */}
                {isHighPriority && (
                  <div className="absolute top-2 left-2">
                    <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 p-3 sm:p-4 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  {/* Main info */}
                  <div className="min-w-0 flex-1">
                    {/* Order code + Status Badge */}
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-bold text-sm">{order.codigo}</h3>
                      <Badge
                        variant="outline"
                        className={cn(
                          "h-5 text-[10px] gap-1",
                          statusConfig.textColor
                        )}
                      >
                        <div className={cn("h-1.5 w-1.5 rounded-full", statusConfig.color)} />
                        {statusConfig.label}
                      </Badge>
                    </div>

                    {/* Vehicle + Plate */}
                    <p className="text-sm truncate">
                      {order.vehiculo.marca} {order.vehiculo.modelo}
                      <span className="font-mono text-xs text-muted-foreground ml-2">
                        {order.vehiculo.placa}
                      </span>
                    </p>
                  </div>

                  {/* Right side badges */}
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {/* Order type badge */}
                    <Badge variant="outline" className={cn("h-5 text-[10px]", typeConfig.color)}>
                      {typeConfig.label}
                    </Badge>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-2">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">
                      Fase: <span className="font-medium text-foreground">{currentPhaseLabel}</span>
                    </span>
                    <span className="font-medium">{completedPhases}/{totalPhases}</span>
                  </div>
                  <Progress value={progress} className="h-1.5" />
                </div>

                {/* Footer - Delivery date */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Wrench className="h-3.5 w-3.5" />
                    <span>Técnico asignado</span>
                  </div>

                  <div className={cn(
                    "flex items-center gap-1 text-xs font-medium",
                    deliveryInfo.isLate ? "text-red-600" :
                    deliveryInfo.text.includes("Hoy") ? "text-orange-600" : "text-muted-foreground"
                  )}>
                    {deliveryInfo.isLate ? (
                      <AlertTriangle className="h-3 w-3" />
                    ) : (
                      <Clock className="h-3 w-3" />
                    )}
                    <span>{deliveryInfo.text}</span>
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  )
}

export function TechnicianOrdersList({ orders }: TechnicianOrdersListProps) {
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Wrench className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Sin órdenes asignadas</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          No tienes órdenes de trabajo asignadas en este momento.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mis Órdenes</h1>
          <p className="text-sm text-muted-foreground">
            {orders.length} orden{orders.length !== 1 ? "es" : ""} asignada{orders.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Orders list */}
      <div className="space-y-3">
        {orders.map((order, index) => (
          <OrderCard key={order.id} order={order} index={index} />
        ))}
      </div>
    </div>
  )
}

