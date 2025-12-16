"use client"

import {
  Phone,
  Car,
  Wrench,
  Clock,
  User,
  Hash,
  Gauge,
  ChevronDown
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import type { TechnicianOrder } from "@/lib/fixtures/technical-progress"
import { getRelativeDeliveryDate } from "@/lib/fixtures/technical-progress"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface OrderInfoCardProps {
  order: TechnicianOrder
}

const ORDER_TYPE_CONFIG = {
  mantenimiento: { label: "Mantenimiento", color: "bg-blue-500/10 text-blue-600 border-blue-500/30" },
  reparacion: { label: "Reparación", color: "bg-orange-500/10 text-orange-600 border-orange-500/30" },
  garantia: { label: "Garantía", color: "bg-purple-500/10 text-purple-600 border-purple-500/30" },
}

export function OrderInfoCard({ order }: OrderInfoCardProps) {
  const [showDetails, setShowDetails] = useState(false)
  const deliveryInfo = getRelativeDeliveryDate(order.fechaEstimadaEntrega)
  const typeConfig = ORDER_TYPE_CONFIG[order.tipoOrden]

  const handleCall = () => {
    window.location.href = `tel:${order.cliente.telefono}`
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Información General</CardTitle>
          <Badge variant="outline" className={typeConfig.color}>
            {typeConfig.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Primary info - Large and bold */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Client */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">Cliente</p>
              <p className="font-semibold truncate">
                {order.cliente.nombre} {order.cliente.apellido}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCall}
              className="shrink-0 h-9 w-9 text-green-600 hover:text-green-700 hover:bg-green-500/10"
            >
              <Phone className="h-4 w-4" />
            </Button>
          </div>

          {/* Vehicle */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Car className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">Vehículo</p>
              <p className="font-semibold">
                {order.vehiculo.marca} {order.vehiculo.modelo}
              </p>
              <p className="text-sm text-muted-foreground font-mono">
                {order.vehiculo.placa}
              </p>
            </div>
          </div>

          {/* Delivery estimate */}
          <div className="flex items-center gap-3">
            <div className={cn(
              "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
              deliveryInfo.isLate ? "bg-red-500/10" : "bg-primary/10"
            )}>
              <Clock className={cn(
                "h-5 w-5",
                deliveryInfo.isLate ? "text-red-500" : "text-primary"
              )} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">Entrega Estimada</p>
              <p className={cn(
                "font-semibold",
                deliveryInfo.isLate && "text-red-600"
              )}>
                {deliveryInfo.text}
              </p>
            </div>
          </div>

          {/* Order type */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Wrench className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">Tipo de Orden</p>
              <p className="font-semibold">{typeConfig.label}</p>
            </div>
          </div>
        </div>

        {/* Problem description */}
        <div className="rounded-lg bg-muted/50 p-3">
          <p className="text-xs font-medium text-muted-foreground mb-1">Descripción del Problema</p>
          <p className="text-sm">{order.descripcionProblema}</p>
        </div>

        {/* Collapsible secondary details */}
        <Collapsible open={showDetails} onOpenChange={setShowDetails}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-between -mx-1">
              <span className="text-muted-foreground text-xs">
                {showDetails ? "Ocultar detalles" : "Ver más detalles"}
              </span>
              <ChevronDown className={cn(
                "h-4 w-4 transition-transform",
                showDetails && "rotate-180"
              )} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t mt-2">
              {/* VIN */}
              <div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Hash className="h-3 w-3" /> VIN
                </p>
                <p className="text-xs font-mono truncate">{order.vehiculo.vin}</p>
              </div>

              {/* Kilometraje */}
              <div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Gauge className="h-3 w-3" /> Kilometraje
                </p>
                <p className="text-sm font-medium">
                  {order.vehiculo.kilometraje.toLocaleString()} km
                </p>
              </div>

              {/* Año */}
              <div>
                <p className="text-xs text-muted-foreground">Año</p>
                <p className="text-sm font-medium">{order.vehiculo.anio}</p>
              </div>

              {/* Color */}
              <div>
                <p className="text-xs text-muted-foreground">Color</p>
                <p className="text-sm font-medium">{order.vehiculo.color}</p>
              </div>

              {/* Asesor */}
              <div>
                <p className="text-xs text-muted-foreground">Asesor</p>
                <p className="text-sm font-medium">{order.asesor.nombre}</p>
              </div>

              {/* Técnico */}
              <div>
                <p className="text-xs text-muted-foreground">Técnico</p>
                <p className="text-sm font-medium">{order.tecnicoAsignado.nombre}</p>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  )
}

