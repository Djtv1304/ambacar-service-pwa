"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  AlertTriangle,
  AlertCircle,
  Check,
  X,
  ChevronDown,
  Loader2,
  Info
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { AdditionalWork, AdditionalWorkPhoto } from "@/lib/mis-servicios/types"
import { cn } from "@/lib/utils"

interface AdditionalWorkManagerProps {
  pendingWork: AdditionalWork[]
  approvedWork: AdditionalWork[]
  rejectedWork: AdditionalWork[]
  onApprove: (workId: number) => Promise<void>
  onReject: (workId: number) => Promise<void>
  className?: string
  /** When true, hides approve/reject buttons (for internal users viewing client data) */
  readOnly?: boolean
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
    color: "text-gray-600 dark:text-muted-foreground",
    bgColor: "bg-gray-500/10",
    borderColor: "border-gray-500/30",
    icon: null,
  },
}

function PhotoModal({
  photo,
  open,
  onClose
}: {
  photo: AdditionalWorkPhoto | null
  open: boolean
  onClose: () => void
}) {
  if (!photo) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{photo.descripcion || "Evidencia fotográfica"}</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <img
            src={photo.url}
            alt={photo.descripcion || "Evidencia"}
            className="w-full rounded-lg"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Capturada: {new Date(photo.fecha).toLocaleString("es-EC", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface WorkItemCardProps {
  work: AdditionalWork
  onApprove?: (workId: number) => Promise<void>
  onReject?: (workId: number) => Promise<void>
  showActions?: boolean
  status?: "approved" | "rejected"
  /** When true, shows a waiting badge instead of action buttons */
  readOnly?: boolean
}

function WorkItemCard({
  work,
  onApprove,
  onReject,
  showActions = true,
  status,
  readOnly = false
}: WorkItemCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<AdditionalWorkPhoto | null>(null)
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)

  const severity = severityConfig[work.severidad]
  const SeverityIcon = severity.icon

  const handleApprove = async () => {
    if (!onApprove) return
    setIsApproving(true)
    try {
      await onApprove(work.id)
      setShowApproveDialog(false)
    } finally {
      setIsApproving(false)
    }
  }

  const handleReject = async () => {
    if (!onReject) return
    setIsRejecting(true)
    try {
      await onReject(work.id)
      setShowRejectDialog(false)
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
          status === "rejected" && "border-gray-300 dark:border-border bg-gray-50 dark:bg-gray-900/50 opacity-75"
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
              <p className="text-xs text-muted-foreground">Presupuesto</p>
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
                <div className="bg-muted/50 rounded-lg p-3 space-y-3">
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

                  {/* Price disclaimer */}
                  <div className="flex items-start gap-2 p-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-md">
                    <Info className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-blue-900 dark:text-blue-300">
                      <strong>Presupuesto referencial.</strong> El costo final puede variar según disponibilidad de repuestos y hallazgos durante la reparación.
                    </p>
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
                    <div className="flex gap-2 flex-wrap">
                      {work.fotos.map((foto) => (
                        <motion.button
                          key={foto.id}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedPhoto(foto)}
                          className="relative h-16 w-16 rounded-lg overflow-hidden border border-border bg-muted hover:border-primary transition-colors"
                        >
                          <img
                            src={foto.url}
                            alt={foto.descripcion || "Evidencia"}
                            className="h-full w-full object-cover"
                          />
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Action buttons - Hidden in readOnly mode */}
          {showActions && !status && !readOnly && work.requiereAprobacion && (
            <div className="flex gap-3 mt-4 pt-4 border-t">
              <Button
                onClick={() => setShowRejectDialog(true)}
                variant="outline"
                className="flex-1 border-red-500/30 text-red-600 hover:bg-red-500/10"
                disabled={isApproving || isRejecting}
              >
                <X className="h-4 w-4 mr-2" />
                Rechazar
              </Button>
              <Button
                onClick={() => setShowApproveDialog(true)}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                disabled={isApproving || isRejecting}
              >
                <Check className="h-4 w-4 mr-2" />
                Aprobar
              </Button>
            </div>
          )}

          {/* Read-only mode - Show waiting status instead of buttons */}
          {showActions && !status && readOnly && work.requiereAprobacion && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                  Esperando respuesta del cliente
                </span>
              </div>
            </div>
          )}

          {/* Informational-only work - no approval needed */}
          {showActions && !status && !work.requiereAprobacion && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-blue-500/10 dark:bg-blue-950/30 border border-blue-500/30 dark:border-blue-800">
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  Trabajo informativo - No requiere aprobacion
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Photo Modal */}
      <PhotoModal
        photo={selectedPhoto}
        open={!!selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
      />

      {/* Approve Confirmation Dialog */}
      <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Aprobar trabajo adicional?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <div>
                Estás a punto de aprobar <strong>{work.titulo}</strong> por un costo estimado de{" "}
                <strong className="text-green-600">${work.costoTotal.toFixed(2)}</strong>.
              </div>
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <div className="text-sm text-blue-900 dark:text-blue-300">
                  <Info className="h-4 w-4 inline mr-1" />
                  Este monto es un <strong>presupuesto referencial</strong>. El costo final puede variar según disponibilidad de repuestos y hallazgos adicionales durante la reparación.
                </div>
              </div>
              <div className="text-sm">
                Al aprobar, autorizas al taller a proceder con este trabajo. Esta acción no se puede deshacer.
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isApproving}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApprove}
              disabled={isApproving}
              className="bg-green-600 hover:bg-green-700"
            >
              {isApproving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Aprobando...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Sí, aprobar trabajo
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Confirmation Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Rechazar trabajo adicional?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <div>
                Estás a punto de rechazar <strong>{work.titulo}</strong>.
              </div>
              {work.severidad === "critico" && (
                <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <div className="text-sm text-red-900 dark:text-red-300">
                    <AlertTriangle className="h-4 w-4 inline mr-1" />
                    <strong>Advertencia:</strong> Este trabajo está marcado como crítico. Rechazarlo podría afectar la seguridad o funcionalidad de tu vehículo.
                  </div>
                </div>
              )}
              <div className="text-sm">
                Al rechazar, el taller no realizará este trabajo. Esta acción no se puede deshacer.
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRejecting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              disabled={isRejecting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isRejecting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Rechazando...
                </>
              ) : (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Sí, rechazar trabajo
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
  readOnly = false,
}: AdditionalWorkManagerProps) {
  const [showHistory, setShowHistory] = useState(false)
  const hasHistory = approvedWork.length > 0 || rejectedWork.length > 0

  return (
    <div className={cn("space-y-6", className)}>
      {/* Pending work */}
      {pendingWork.length > 0 && (
        <div>
          <h3 className="font-semibold text-lg mb-4">
            {readOnly ? "Trabajos Pendientes" : "Trabajos Pendientes de Aprobación"}
          </h3>
          <AnimatePresence mode="popLayout">
            <div className="space-y-4">
              {pendingWork.map((work) => (
                <WorkItemCard
                  key={work.id}
                  work={work}
                  onApprove={onApprove}
                  onReject={onReject}
                  readOnly={readOnly}
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
              {hasHistory ? (
                <>
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
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                    <AlertCircle className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="font-medium text-foreground">Sin decisiones previas</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Los trabajos aprobados o rechazados aparecerán aquí
                  </p>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  )
}

