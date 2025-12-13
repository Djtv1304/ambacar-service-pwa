"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  AlertTriangle,
  Check,
  X,
  ChevronDown,
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import type { AdditionalWork } from "@/lib/mis-servicios/types"
import { cn } from "@/lib/utils"

interface AdditionalWorkManagerProps {
  pendingWork: AdditionalWork[]
  approvedWork: AdditionalWork[]
  rejectedWork: AdditionalWork[]
  onApprove: (workId: string) => Promise<void>
  onReject: (workId: string) => Promise<void>
  className?: string
}

const severityConfig = {
  critico: {
    label: "Crítico",
    color: "text-red-600",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
    icon: AlertTriangle,
  },
  importante: {
    label: "Importante",
    color: "text-orange-600",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/30",
    icon: AlertTriangle,
  },
  recomendado: {
    label: "Recomendado",
    color: "text-blue-600",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    icon: null,
  },
  opcional: {
    label: "Opcional",
    color: "text-gray-600",
    bgColor: "bg-gray-500/10",
    borderColor: "border-gray-500/30",
    icon: null,
  },
}

interface WorkItemCardProps {
  work: AdditionalWork
  onApprove?: (workId: string) => Promise<void>
  onReject?: (workId: string) => Promise<void>
  showActions?: boolean
  status?: "approved" | "rejected"
}

function WorkItemCard({
  work,
  onApprove,
  onReject,
  showActions = true,
  status
}: WorkItemCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)

  const severity = severityConfig[work.severidad]
  const SeverityIcon = severity.icon

  const handleApprove = async () => {
    if (!onApprove) return
    setIsApproving(true)
    try {
      await onApprove(work.id)
    } finally {
      setIsApproving(false)
    }
  }

  const handleReject = async () => {
    if (!onReject) return
    setIsRejecting(true)
    try {
      await onReject(work.id)
    } finally {
      setIsRejecting(false)
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <Card
        className={cn(
          "overflow-hidden transition-all",
          status === "approved" && "border-green-500/30 bg-green-500/5",
          status === "rejected" && "border-gray-300 bg-gray-50 dark:bg-gray-900/50 opacity-75"
        )}
      >
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className={cn(
                  "font-semibold text-sm sm:text-base",
                  status === "rejected" && "line-through text-muted-foreground"
                )}>
                  {work.titulo}
                </h4>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs",
                    severity.bgColor,
                    severity.color,
                    severity.borderColor
                  )}
                >
                  {SeverityIcon && <SeverityIcon className="h-3 w-3 mr-1" />}
                  {severity.label}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {work.descripcion}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className={cn(
                "font-bold text-lg",
                status === "rejected" && "line-through text-muted-foreground"
              )}>
                ${work.costoTotal.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </div>

          {/* Status badges for history */}
          {status === "approved" && (
            <div className="flex items-center gap-2 text-green-600 text-sm mb-3">
              <Check className="h-4 w-4" />
              <span>Aprobado</span>
              {work.fechaRespuesta && (
                <span className="text-xs text-muted-foreground">
                  • {new Date(work.fechaRespuesta).toLocaleDateString("es-EC")}
                </span>
              )}
            </div>
          )}
          {status === "rejected" && (
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-3">
              <X className="h-4 w-4" />
              <span>Rechazado</span>
              {work.fechaRespuesta && (
                <span className="text-xs">
                  • {new Date(work.fechaRespuesta).toLocaleDateString("es-EC")}
                </span>
              )}
            </div>
          )}

          {/* Expandable details */}
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="-ml-2 h-8">
                <ChevronDown
                  className={cn(
                    "h-4 w-4 mr-1 transition-transform",
                    isExpanded && "rotate-180"
                  )}
                />
                {isExpanded ? "Ver menos" : "Ver detalles"}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-3 pt-3 border-t space-y-3">
                {/* Technical justification */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Justificación técnica:
                  </p>
                  <p className="text-sm">{work.justificacionTecnica}</p>
                </div>

                {/* Cost breakdown */}
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    Desglose de costos:
                  </p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Mano de obra:</span>
                      <span>${work.costoManoObra.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Repuestos:</span>
                      <span>${work.costoRepuestos.toFixed(2)}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-medium">
                      <span>Total:</span>
                      <span>${work.costoTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Parts list */}
                {work.repuestos.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      Repuestos necesarios:
                    </p>
                    <ul className="space-y-1">
                      {work.repuestos.map((part) => (
                        <li key={part.id} className="flex justify-between text-sm">
                          <span>
                            {part.cantidad}x {part.nombre}
                          </span>
                          <span className="text-muted-foreground">
                            ${part.subtotal.toFixed(2)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Photos */}
                {work.fotos && work.fotos.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      Evidencia fotográfica:
                    </p>
                    <div className="flex gap-2">
                      {work.fotos.map((foto, idx) => (
                        <div
                          key={idx}
                          className="h-16 w-16 rounded-lg overflow-hidden border bg-muted"
                        >
                          <img
                            src={foto}
                            alt={`Evidencia ${idx + 1}`}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Action buttons */}
          {showActions && !status && (
            <div className="flex gap-3 mt-4 pt-4 border-t">
              <Button
                onClick={handleReject}
                variant="outline"
                className="flex-1 border-red-500/30 text-red-600 hover:bg-red-500/10"
                disabled={isApproving || isRejecting}
              >
                {isRejecting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <X className="h-4 w-4 mr-2" />
                )}
                Rechazar
              </Button>
              <Button
                onClick={handleApprove}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                disabled={isApproving || isRejecting}
              >
                {isApproving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                Aprobar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function AdditionalWorkManager({
  pendingWork,
  approvedWork,
  rejectedWork,
  onApprove,
  onReject,
  className,
}: AdditionalWorkManagerProps) {
  const [showHistory, setShowHistory] = useState(false)
  const hasHistory = approvedWork.length > 0 || rejectedWork.length > 0

  return (
    <div className={cn("space-y-6", className)}>
      {/* Pending work */}
      {pendingWork.length > 0 && (
        <div>
          <h3 className="font-semibold text-lg mb-4">
            Trabajos Pendientes de Aprobación
          </h3>
          <AnimatePresence mode="popLayout">
            <div className="space-y-4">
              {pendingWork.map((work) => (
                <WorkItemCard
                  key={work.id}
                  work={work}
                  onApprove={onApprove}
                  onReject={onReject}
                />
              ))}
            </div>
          </AnimatePresence>
        </div>
      )}

      {/* Empty state for pending */}
      {pendingWork.length === 0 && (
        <div className="text-center py-8">
          <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-3">
            <Check className="h-6 w-6 text-green-500" />
          </div>
          <p className="font-medium">No hay trabajos pendientes</p>
          <p className="text-sm text-muted-foreground">
            Todos los trabajos adicionales han sido revisados
          </p>
        </div>
      )}

      {/* History toggle */}
      {hasHistory && (
        <div>
          <Collapsible open={showHistory} onOpenChange={setShowHistory}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between">
                <span>Historial de decisiones ({approvedWork.length + rejectedWork.length})</span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform",
                    showHistory && "rotate-180"
                  )}
                />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="space-y-4 mt-4">
                {/* Approved */}
                {approvedWork.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      Aprobados ({approvedWork.length})
                    </h4>
                    <div className="space-y-3">
                      {approvedWork.map((work) => (
                        <WorkItemCard
                          key={work.id}
                          work={work}
                          showActions={false}
                          status="approved"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Rejected */}
                {rejectedWork.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                      <X className="h-4 w-4 text-muted-foreground" />
                      Rechazados ({rejectedWork.length})
                    </h4>
                    <div className="space-y-3">
                      {rejectedWork.map((work) => (
                        <WorkItemCard
                          key={work.id}
                          work={work}
                          showActions={false}
                          status="rejected"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      )}
    </div>
  )
}

