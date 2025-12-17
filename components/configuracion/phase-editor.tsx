"use client"

import * as React from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
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

interface SortablePhaseItemProps {
  fase: WorkflowPhase
  index: number
  onUpdate: (id: string, updates: Partial<WorkflowPhase>) => void
  onDelete: (id: string) => void
  canDeletePhase: boolean
  deleteReason?: string
  isCompleted?: boolean
  error?: string
  isDragging?: boolean
}

function SortablePhaseItem({
  fase,
  index,
  onUpdate,
  onDelete,
  canDeletePhase: canDelete,
  deleteReason,
  isCompleted,
  error,
}: SortablePhaseItemProps) {
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: fase.id,
    disabled: isCompleted,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.9 : 1,
  }

  // Auto-focus on new phases
  React.useEffect(() => {
    if (fase.nombre === "" && inputRef.current) {
      inputRef.current.focus()
    }
  }, [fase.nombre])

  return (
    <>
      <div ref={setNodeRef} style={style}>
        <Card
          className={cn(
            "transition-all duration-200 hover:shadow-md",
            isDragging && "shadow-lg ring-2 ring-primary/20",
            isCompleted && "border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/30",
            error && "border-red-300 bg-red-50/30 dark:border-red-900 dark:bg-red-950/30"
          )}
        >
          <CardContent className="p-4">
            {/* Mobile Layout (< md) - Stacked Vertical Card */}
            <div className="flex flex-col gap-3 md:hidden">
              {/* Row 1: Grip + Order Number + Badges */}
              <div className="flex items-center gap-3">
                {/* Drag Handle - Larger touch target on mobile */}
                <button
                  {...attributes}
                  {...listeners}
                  className={cn(
                    "touch-none p-2 -m-1 rounded-lg hover:bg-muted transition-colors cursor-grab active:cursor-grabbing",
                    isCompleted && "opacity-50 cursor-not-allowed",
                    isDragging && "cursor-grabbing"
                  )}
                  disabled={isCompleted}
                  aria-label="Arrastrar para reordenar"
                >
                  <GripVertical className="h-5 w-5 text-muted-foreground" />
                </button>

                {/* Order Number Badge */}
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white shrink-0"
                  style={{ backgroundColor: fase.color || "#6B7280" }}
                >
                  {index + 1}
                </div>

                {/* Badges */}
                <div className="flex items-center gap-2 flex-1">
                  {fase.esCritica && (
                    <Badge variant="outline" className="border-amber-300 text-amber-700 text-xs px-2 py-0.5 gap-1">
                      <Lock className="h-3 w-3" />
                      Crítica
                    </Badge>
                  )}
                  {isCompleted && (
                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                      Ejecutada
                    </Badge>
                  )}
                </div>

                {/* Delete Button - Top right */}
                {canDelete ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 h-9 px-2 shrink-0 -mr-1 gap-1"
                    aria-label="Eliminar fase"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="text-xs">Eliminar Fase</span>
                  </Button>
                ) : (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled
                          className="text-muted-foreground h-9 w-9 shrink-0 -mr-1"
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

              {/* Row 2: Name Input - Full Width */}
              <Input
                ref={inputRef}
                value={fase.nombre}
                onChange={(e) => onUpdate(fase.id, { nombre: e.target.value })}
                placeholder="Nombre de la fase"
                disabled={isCompleted}
                className={cn(
                  "font-semibold text-base h-10 w-full",
                  isCompleted && "opacity-70"
                )}
              />

              {/* Row 3: Description - Full Width */}
              <Input
                value={fase.descripcion}
                onChange={(e) => onUpdate(fase.id, { descripcion: e.target.value })}
                placeholder="Descripción breve (opcional)"
                disabled={isCompleted}
                className="text-sm text-muted-foreground h-9 w-full"
              />

              {/* Row 4: Time Input */}
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                <Input
                  type="number"
                  min={1}
                  max={480}
                  value={fase.tiempoEstimado}
                  onChange={(e) =>
                    onUpdate(fase.id, { tiempoEstimado: parseInt(e.target.value) || 0 })
                  }
                  disabled={isCompleted}
                  className="w-20 h-9 text-sm text-center"
                />
                <span className="text-sm text-muted-foreground">minutos</span>
              </div>

              {/* Error message - Mobile */}
              {error && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  {error}
                </p>
              )}
            </div>

            {/*  DESDE AQUI PARA ARRIBA, ESTA PERFECTO EL CODIGO */}

            {/* Desktop Layout (md+) - Horizontal Row */}
            <div className="hidden md:flex md:items-start md:gap-4">
              {/* Drag Handle + Order Number */}
              <div className="flex flex-col items-center gap-1 pt-1">
                <button
                  {...attributes}
                  {...listeners}
                  className={cn(
                    "touch-none p-1 rounded hover:bg-muted transition-colors cursor-grab active:cursor-grabbing",
                    isCompleted && "opacity-50 cursor-not-allowed",
                    isDragging && "cursor-grabbing"
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
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 mt-1">
                    Ejecutada
                  </Badge>
                )}
              </div>

              {/* Main Content */}
              <div className="flex-1 space-y-3 min-w-0">
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
              <div className="flex flex-col items-end gap-3 shrink-0">
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
                    size="sm"
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 px-2 gap-1"
                    aria-label="Eliminar fase"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="text-xs">Eliminar</span>
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
      </div>

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
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = fases.findIndex((fase) => fase.id === active.id)
      const newIndex = fases.findIndex((fase) => fase.id === over.id)

      const newFases = arrayMove(fases, oldIndex, newIndex).map((fase, index) => ({
        ...fase,
        orden: index + 1,
      }))

      onFasesChange(newFases)
    }
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
          <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-muted-foreground">Tiempo total estimado:</span>
          <span className="font-semibold">{formatTime(totalTime)}</span>
        </div>
        <div className="text-sm text-muted-foreground">
          {fases.length} {fases.length === 1 ? "fase" : "fases"} configuradas
        </div>
      </div>

      {/* Phase List with DnD */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={fases.map(f => f.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {fases.map((fase, index) => {
              const { canDelete, reason } = canDeletePhase(fase, fasesCompletadas)
              const isCompleted = fasesCompletadas.includes(fase.id) || fase.ejecutada

              return (
                <SortablePhaseItem
                  key={fase.id}
                  fase={fase}
                  index={index}
                  onUpdate={handleUpdatePhase}
                  onDelete={handleDeletePhase}
                  canDeletePhase={canDelete}
                  deleteReason={reason}
                  isCompleted={isCompleted}
                  error={errors[fase.id]}
                />
              )
            })}
          </div>
        </SortableContext>
      </DndContext>

      {/* Add Phase Button */}
      <div>
        <Button
          variant="outline"
          onClick={handleAddPhase}
          className="w-full border-dashed hover:border-solid hover:bg-muted/50 h-12 text-sm sm:text-base"
        >
          <Plus className="mr-2 h-4 w-4" />
          Agregar Nueva Fase
        </Button>
      </div>

      {/* Exception Mode Warning */}
      {isExceptionMode && fasesCompletadas.length > 0 && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800 dark:bg-amber-950/30 dark:border-amber-900 dark:text-amber-200">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium">Modo Excepción Activo</p>
              <p className="text-amber-700 dark:text-amber-300 mt-1">
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

