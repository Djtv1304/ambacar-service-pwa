"use client"

import { useState } from "react"
import {
  User,
  Car,
  Wrench,
  Clock,
  Phone,
  ChevronDown,
  Gauge,
  Hash,
  Calendar,
  AlertTriangle
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"

interface OTInfoCardProps {
  cliente: {
    nombre: string
    apellido?: string
    telefono?: string
    cedula?: string
  }
  vehiculo: {
    marca: string
    modelo: string
    placa: string
    anio?: number
    color?: string
    vin?: string
    kilometraje?: number
  }
  tipoOrden: string
  fechaIngreso: Date | string
  fechaEstimadaEntrega: Date | string
  fechaEntregaReal?: Date | string
  asesor?: string
}

function getRelativeDeliveryInfo(date: Date | string): { text: string; isLate: boolean; isToday: boolean } {
  const deliveryDate = new Date(date)
  const now = new Date()
  const diffMs = deliveryDate.getTime() - now.getTime()
  const diffHours = diffMs / (1000 * 60 * 60)
  const diffDays = diffMs / (1000 * 60 * 60 * 24)

  if (diffMs < 0) {
    return { text: "Atrasado", isLate: true, isToday: false }
  }

  if (diffHours < 24) {
    const time = deliveryDate.toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit" })
    return { text: `Hoy a las ${time}`, isLate: false, isToday: true }
  }

  if (diffDays < 2) {
    const time = deliveryDate.toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit" })
    return { text: `Mañana a las ${time}`, isLate: false, isToday: false }
  }

  return {
    text: deliveryDate.toLocaleDateString("es-EC", { weekday: "short", day: "numeric", month: "short" }),
    isLate: false,
    isToday: false
  }
}

const ORDER_TYPE_CONFIG: Record<string, { color: string }> = {
  mantenimiento: { color: "bg-blue-500/10 text-blue-600 border-blue-500/30" },
  reparacion: { color: "bg-orange-500/10 text-orange-600 border-orange-500/30" },
  garantia: { color: "bg-purple-500/10 text-purple-600 border-purple-500/30" },
  default: { color: "bg-gray-500/10 text-gray-600 border-gray-500/30" },
}

export function OTInfoCard({
  cliente,
  vehiculo,
  tipoOrden,
  fechaIngreso,
  fechaEstimadaEntrega,
  fechaEntregaReal,
  asesor
}: OTInfoCardProps) {
  const [showDetails, setShowDetails] = useState(false)
  const deliveryInfo = getRelativeDeliveryInfo(fechaEstimadaEntrega)
  const tipoConfig = ORDER_TYPE_CONFIG[tipoOrden.toLowerCase()] || ORDER_TYPE_CONFIG.default

  const handleCall = () => {
    if (cliente.telefono) {
      window.location.href = `tel:${cliente.telefono}`
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Información General</CardTitle>
          <Badge variant="outline" className={tipoConfig.color}>
            {tipoOrden}
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
                {cliente.nombre} {cliente.apellido || ""}
              </p>
            </div>
            {cliente.telefono && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCall}
                className="shrink-0 h-9 w-9 text-green-600 hover:text-green-700 hover:bg-green-500/10"
              >
                <Phone className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Vehicle */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Car className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">Vehículo</p>
              <p className="font-semibold">
                {vehiculo.marca} {vehiculo.modelo}
              </p>
              <p className="text-sm text-muted-foreground font-mono">
                {vehiculo.placa}
              </p>
            </div>
          </div>

          {/* Delivery estimate */}
          <div className="flex items-center gap-3">
            <div className={cn(
              "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
              deliveryInfo.isLate ? "bg-red-500/10" : deliveryInfo.isToday ? "bg-orange-500/10" : "bg-primary/10"
            )}>
              <Clock className={cn(
                "h-5 w-5",
                deliveryInfo.isLate ? "text-red-500" : deliveryInfo.isToday ? "text-orange-500" : "text-primary"
              )} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">Entrega Estimada</p>
              <p className={cn(
                "font-semibold flex items-center gap-1",
                deliveryInfo.isLate && "text-red-600"
              )}>
                {deliveryInfo.isLate && <AlertTriangle className="h-4 w-4" />}
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
              <p className="font-semibold">{tipoOrden}</p>
            </div>
          </div>
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
              {vehiculo.vin && (
                <div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Hash className="h-3 w-3" /> VIN
                  </p>
                  <p className="text-xs font-mono truncate">{vehiculo.vin}</p>
                </div>
              )}

              {/* Kilometraje */}
              {vehiculo.kilometraje && (
                <div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Gauge className="h-3 w-3" /> Kilometraje
                  </p>
                  <p className="text-sm font-medium">
                    {vehiculo.kilometraje.toLocaleString()} km
                  </p>
                </div>
              )}

              {/* Año */}
              {vehiculo.anio && (
                <div>
                  <p className="text-xs text-muted-foreground">Año</p>
                  <p className="text-sm font-medium">{vehiculo.anio}</p>
                </div>
              )}

              {/* Color */}
              {vehiculo.color && (
                <div>
                  <p className="text-xs text-muted-foreground">Color</p>
                  <p className="text-sm font-medium">{vehiculo.color}</p>
                </div>
              )}

              {/* Fecha Ingreso */}
              <div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Ingreso
                </p>
                <p className="text-sm font-medium">
                  {new Date(fechaIngreso).toLocaleDateString("es-EC", { dateStyle: "medium" })}
                </p>
              </div>

              {/* Asesor */}
              {asesor && (
                <div>
                  <p className="text-xs text-muted-foreground">Asesor</p>
                  <p className="text-sm font-medium">{asesor}</p>
                </div>
              )}

              {/* Cédula */}
              {cliente.cedula && (
                <div>
                  <p className="text-xs text-muted-foreground">Cédula</p>
                  <p className="text-sm font-medium">{cliente.cedula}</p>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  )
}

