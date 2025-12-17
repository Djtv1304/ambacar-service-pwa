"use client"

import * as React from "react"
import { Reorder, useDragControls, AnimatePresence, motion } from "framer-motion"
import { GripVertical, Trash2, Clock, AlertCircle, Plus, Lock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
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

import type { WorkflowPhase } from "@/lib/fixtures/workflow-data"
import { formatTime } from "@/lib/fixtures/workflow-data"
import { canDeletePhase } from "@/lib/validations/workflow"
import { cn } from "@/lib/utils"

interface PhaseEditorProps {
  fases: WorkflowPhase[]
  onFasesChange: (fases: WorkflowPhase[]) => void
  fasesCompletadas?: string[]
  isExceptionMode?: boolean
  errors?: Record<string, string>
}

interface PhaseItemProps {
  fase: WorkflowPhase
  index: number
  onUpdate: (id: string, updates: Partial<WorkflowPhase>) => void
  onDelete: (id: string) => void
  canDelete: boolean
  deleteReason?: string
  isCompleted?: boolean
  error?: string
}

function PhaseItem({
  fase,
  index,
  onUpdate,
  onDelete,
  canDelete,
  deleteReason,
  isCompleted,
  error,
}: PhaseItemProps) {
  const dragControls = useDragControls()
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Auto-focus on new phases
  React.useEffect(() => {
    if (fase.nombre === "" && inputRef.current) {
      inputRef.current.focus()
    }
  }, [fase.nombre])

  return (
    <>
      <Reorder.Item
        value={fase}
        id={fase.id}
        dragListener={false}
        dragControls={dragControls}
        className="touch-none"
      >
        <motion.div
          layout
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10, height: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Card
            className={cn(
              "group transition-all duration-200 hover:shadow-md",
              isCompleted && "border-green-200 bg-green-50/50",
              error && "border-red-300 bg-red-50/30"
            )}
          >
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
                {/* Drag Handle + Order Number */}
                <div className="flex items-center gap-2 sm:flex-col sm:gap-1">
                  <button
                    onPointerDown={(e) => !isCompleted && dragControls.start(e)}
                    className={cn(
                      "touch-none p-1 rounded hover:bg-muted transition-colors cursor-grab active:cursor-grabbing",
                      isCompleted && "opacity-50 cursor-not-allowed"
                    )}
                    disabled={isCompleted}
                    aria-label="Arrastrar para reordenar"
                  >
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                  </button>
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white shrink-0"
                    style={{ backgroundColor: fase.color || "#6B7280" }}
                  >
                    {index + 1}
                  </div>
                  {isCompleted && (
                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 hidden sm:flex">
                      Ejecutada
                    </Badge>
                  )}
                </div>

                {/* Main Content */}
                <div className="flex-1 space-y-2 sm:space-y-3">
                  {/* Phase Name */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Input
                      ref={inputRef}
                      value={fase.nombre}
                      onChange={(e) => onUpdate(fase.id, { nombre: e.target.value })}
                      placeholder="Nombre de la fase"
                      disabled={isCompleted}
                      className={cn(
                        "font-semibold text-base h-9 max-w-xs",
                        isCompleted && "opacity-70"
                      )}
                    />
                    {fase.esCritica && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge variant="outline" className="border-amber-300 text-amber-700 gap-1">
                              <Lock className="h-3 w-3" />
                              Crítica
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Esta fase es obligatoria para el proceso</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    {isCompleted && (
                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 sm:hidden">
                        Ejecutada
                      </Badge>
                    )}
                  </div>

                  {/* Description */}
                  <Input
                    value={fase.descripcion}
                    onChange={(e) => onUpdate(fase.id, { descripcion: e.target.value })}
                    placeholder="Descripción breve (opcional)"
                    disabled={isCompleted}
                    className="text-sm text-muted-foreground h-8"
                  />

                  {/* Error message */}
                  {error && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {error}
                    </p>
                  )}
                </div>

                {/* Time & Delete */}
                <div className="flex items-center gap-2 sm:gap-3 sm:flex-col sm:items-end">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      min={1}
                      max={480}
                      value={fase.tiempoEstimado}
                      onChange={(e) =>
                        onUpdate(fase.id, { tiempoEstimado: parseInt(e.target.value) || 0 })
                      }
                      disabled={isCompleted}
                      className="w-20 h-8 text-sm text-center"
                    />
                    <span className="text-xs text-muted-foreground whitespace-nowrap">min</span>
                  </div>

                  {canDelete ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowDeleteDialog(true)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Eliminar fase</span>
                    </Button>
                  ) : (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled
                            className="text-muted-foreground h-8 w-8"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="left" className="max-w-xs">
                          <p className="text-sm">{deleteReason}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </Reorder.Item>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta fase?</AlertDialogTitle>
            <AlertDialogDescription>
              Estás a punto de eliminar la fase &quot;{fase.nombre}&quot;. Esta acción no se puede
              deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDelete(fase.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export function PhaseEditor({
  fases,
  onFasesChange,
  fasesCompletadas = [],
  isExceptionMode = false,
  errors = {},
}: PhaseEditorProps) {
  const handleReorder = (newFases: WorkflowPhase[]) => {
    // Update order numbers based on new positions
    const updatedFases = newFases.map((fase, index) => ({
      ...fase,
      orden: index + 1,
    }))
    onFasesChange(updatedFases)
  }

  const handleUpdatePhase = (id: string, updates: Partial<WorkflowPhase>) => {
    const updatedFases = fases.map((fase) =>
      fase.id === id ? { ...fase, ...updates } : fase
    )
    onFasesChange(updatedFases)
  }

  const handleDeletePhase = (id: string) => {
    const updatedFases = fases
      .filter((fase) => fase.id !== id)
      .map((fase, index) => ({ ...fase, orden: index + 1 }))
    onFasesChange(updatedFases)
  }

  const handleAddPhase = () => {
    const newPhase: WorkflowPhase = {
      id: `fase-new-${Date.now()}`,
      nombre: "",
      descripcion: "",
      tiempoEstimado: 30,
      orden: fases.length + 1,
      esCritica: false,
      color: "#6B7280",
    }
    onFasesChange([...fases, newPhase])
  }

  // Calculate total time
  const totalTime = fases.reduce((sum, fase) => sum + fase.tiempoEstimado, 0)

  return (
    <div className="space-y-4">
      {/* Summary Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-lg bg-muted/50 p-3 sm:p-4">
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Tiempo total estimado:</span>
          <span className="font-semibold">{formatTime(totalTime)}</span>
        </div>
        <div className="text-sm text-muted-foreground">
          {fases.length} {fases.length === 1 ? "fase" : "fases"} configuradas
        </div>
      </div>

      {/* Phase List */}
      <Reorder.Group
        axis="y"
        values={fases}
        onReorder={handleReorder}
        className="space-y-3"
      >
        <AnimatePresence mode="popLayout">
          {fases.map((fase, index) => {
            const { canDelete, reason } = canDeletePhase(fase, fasesCompletadas)
            const isCompleted = fasesCompletadas.includes(fase.id) || fase.ejecutada

            return (
              <PhaseItem
                key={fase.id}
                fase={fase}
                index={index}
                onUpdate={handleUpdatePhase}
                onDelete={handleDeletePhase}
                canDelete={canDelete}
                deleteReason={reason}
                isCompleted={isCompleted}
                error={errors[fase.id]}
              />
            )
          })}
        </AnimatePresence>
      </Reorder.Group>

      {/* Add Phase Button */}
      <motion.div layout>
        <Button
          variant="outline"
          onClick={handleAddPhase}
          className="w-full border-dashed hover:border-solid hover:bg-muted/50 h-12"
        >
          <Plus className="mr-2 h-4 w-4" />
          Agregar Nueva Fase
        </Button>
      </motion.div>

      {/* Exception Mode Warning */}
      {isExceptionMode && fasesCompletadas.length > 0 && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium">Modo Excepción Activo</p>
              <p className="text-amber-700 mt-1">
                Las fases marcadas como &quot;Ejecutadas&quot; no pueden ser eliminadas ni
                reordenadas porque ya fueron completadas en esta orden de trabajo.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

