"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Settings,
  Search,
  Car,
  RotateCcw,
  Save,
  Loader2,
  AlertTriangle,
  X,
  CheckCircle2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

import { PhaseEditor } from "@/components/configuracion/phase-editor"
import {
  searchOrders,
  getTemplateByServiceType,
  SERVICE_TYPE_LABELS,
  formatTime,
  calculateTotalTime,
  type ServiceType,
  type WorkflowPhase,
  type ActiveOrderForSearch,
} from "@/lib/fixtures/workflow-data"

type EditorMode = "global" | "exception"

interface WorkflowsPageProps {
  className?: string
}

export function WorkflowsPage({ className }: WorkflowsPageProps) {
  // State
  const [mode, setMode] = React.useState<EditorMode>("global")
  const [selectedServiceType, setSelectedServiceType] = React.useState<ServiceType>("preventivo")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [searchResults, setSearchResults] = React.useState<ActiveOrderForSearch[]>([])
  const [selectedOrder, setSelectedOrder] = React.useState<ActiveOrderForSearch | null>(null)
  const [fases, setFases] = React.useState<WorkflowPhase[]>([])
  const [isSaving, setIsSaving] = React.useState(false)
  const [hasChanges, setHasChanges] = React.useState(false)
  const [phaseErrors, setPhaseErrors] = React.useState<Record<string, string>>({})

  // Get initial phases based on mode
  React.useEffect(() => {
    if (mode === "global") {
      const template = getTemplateByServiceType(selectedServiceType)
      if (template) {
        setFases([...template.fases])
        setHasChanges(false)
      }
    }
  }, [mode, selectedServiceType])

  // Search handler
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      toast.error("Ingresa una placa o número de orden")
      return
    }

    const results = searchOrders(searchQuery)
    setSearchResults(results)

    if (results.length === 0) {
      toast.error("No se encontraron órdenes activas", {
        description: `No hay órdenes que coincidan con "${searchQuery}"`,
      })
    } else if (results.length === 1) {
      // Auto-select if only one result
      handleSelectOrder(results[0])
    }
  }

  // Select order for exception editing
  const handleSelectOrder = (order: ActiveOrderForSearch) => {
    setSelectedOrder(order)
    setMode("exception")
    setSearchResults([])
    setSearchQuery("")

    // Load phases for this order (custom or from template)
    if (order.fasesPersonalizadas) {
      setFases([...order.fasesPersonalizadas])
    } else {
      const template = getTemplateByServiceType(order.tipoServicio)
      if (template) {
        // Mark completed phases
        const fasesWithStatus = template.fases.map((fase) => ({
          ...fase,
          ejecutada: order.fasesCompletadas.includes(fase.id),
        }))
        setFases(fasesWithStatus)
      }
    }
    setHasChanges(false)
  }

  // Clear exception mode
  const handleClearException = () => {
    setMode("global")
    setSelectedOrder(null)
    setSearchQuery("")
    setSearchResults([])
    const template = getTemplateByServiceType(selectedServiceType)
    if (template) {
      setFases([...template.fases])
    }
    setHasChanges(false)
  }

  // Reset to template (exception mode only)
  const handleResetToTemplate = () => {
    if (!selectedOrder) return

    const template = getTemplateByServiceType(selectedOrder.tipoServicio)
    if (template) {
      const fasesWithStatus = template.fases.map((fase) => ({
        ...fase,
        ejecutada: selectedOrder.fasesCompletadas.includes(fase.id),
      }))
      setFases(fasesWithStatus)
      setHasChanges(true)
      toast.success("Flujo restablecido a plantilla estándar")
    }
  }

  // Handle phases change
  const handleFasesChange = (newFases: WorkflowPhase[]) => {
    setFases(newFases)
    setHasChanges(true)

    // Clear errors for valid phases
    const newErrors: Record<string, string> = {}
    newFases.forEach((fase) => {
      if (!fase.nombre.trim()) {
        newErrors[fase.id] = "El nombre es requerido"
      }
    })
    setPhaseErrors(newErrors)
  }

  // Save handler
  const handleSave = async () => {
    // Validate
    const errors: Record<string, string> = {}
    let hasErrors = false

    fases.forEach((fase) => {
      if (!fase.nombre.trim()) {
        errors[fase.id] = "El nombre es requerido"
        hasErrors = true
      }
      if (fase.tiempoEstimado < 1) {
        errors[fase.id] = "El tiempo debe ser al menos 1 minuto"
        hasErrors = true
      }
    })

    if (fases.length < 2) {
      toast.error("El flujo debe tener al menos 2 fases")
      return
    }

    const totalTime = calculateTotalTime(fases)
    if (totalTime === 0) {
      toast.error("El tiempo total no puede ser 0")
      return
    }

    if (hasErrors) {
      setPhaseErrors(errors)
      toast.error("Corrige los errores antes de guardar")
      return
    }

    setIsSaving(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsSaving(false)
    setHasChanges(false)

    if (mode === "exception" && selectedOrder) {
      toast.success("Flujo de excepción guardado", {
        description: `El flujo personalizado para ${selectedOrder.placa} ha sido actualizado.`,
      })
    } else {
      toast.success("Plantilla guardada", {
        description: `La plantilla de ${SERVICE_TYPE_LABELS[selectedServiceType]} ha sido actualizada.`,
      })
    }
  }

  return (
    <div className={className}>
      <div className="space-y-6">
        {/* Smart Header / Context Selector */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Configuración de Flujo de Trabajo</CardTitle>
            </div>
            <CardDescription>
              Define las fases estándar del servicio o crea excepciones para órdenes específicas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Mode Switcher */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              {/* Global Mode Selector */}
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium">Tipo de Servicio</label>
                <Select
                  value={selectedServiceType}
                  onValueChange={(value) => {
                    setSelectedServiceType(value as ServiceType)
                    if (mode === "global") {
                      setHasChanges(false)
                    }
                  }}
                  disabled={mode === "exception"}
                >
                  <SelectTrigger className="w-full sm:max-w-xs">
                    <SelectValue placeholder="Selecciona el tipo de servicio" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(SERVICE_TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {mode === "global" && (
                  <p className="text-xs text-muted-foreground">
                    Define las fases estándar para todos los nuevos servicios de este tipo
                  </p>
                )}
              </div>

              <div className="hidden sm:block">
                <Separator orientation="vertical" className="h-20" />
              </div>
              <Separator className="sm:hidden" />

              {/* Exception Mode Search */}
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium">Búsqueda por Vehículo</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      placeholder="Buscar por Placa o N° Orden"
                      className="pl-10"
                      disabled={mode === "exception"}
                    />
                  </div>
                  <Button
                    onClick={handleSearch}
                    disabled={mode === "exception"}
                    variant="secondary"
                  >
                    Buscar
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Busca una orden activa para modificar su flujo específico
                </p>
              </div>
            </div>

            {/* Search Results */}
            <AnimatePresence>
              {searchResults.length > 1 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
                    <p className="text-sm font-medium">
                      {searchResults.length} órdenes encontradas
                    </p>
                    <div className="space-y-2">
                      {searchResults.map((order) => (
                        <button
                          key={order.id}
                          onClick={() => handleSelectOrder(order)}
                          className="w-full flex items-center justify-between p-3 rounded-md bg-background border hover:border-primary hover:bg-primary/5 transition-colors text-left"
                        >
                          <div className="flex items-center gap-3">
                            <Car className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{order.placa}</p>
                              <p className="text-sm text-muted-foreground">
                                {order.vehiculoModelo} • {order.clienteNombre}
                              </p>
                            </div>
                          </div>
                          <Badge variant="secondary">{order.estadoActual}</Badge>
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Exception Mode Alert */}
        <AnimatePresence>
          {mode === "exception" && selectedOrder && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="flex items-center justify-between gap-4 w-full rounded-lg border border-amber-300 bg-amber-50 p-4">
                <div className="flex gap-3 flex-1 min-w-0">
                  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="font-medium text-amber-800 mb-1">Modo Excepción Activo</p>
                    <p className="text-sm text-amber-700">
                      Editando flujo exclusivo para el vehículo{" "}
                      <strong>{selectedOrder.placa}</strong> ({selectedOrder.vehiculoModelo}).
                    </p>
                    <p className="text-sm mt-1 text-amber-600">
                      Estos cambios no afectarán la plantilla global de{" "}
                      {SERVICE_TYPE_LABELS[selectedOrder.tipoServicio]}.
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearException}
                  className="shrink-0 border-amber-400 text-amber-800 hover:bg-amber-100 self-center"
                >
                  <X className="mr-2 h-4 w-4" />
                  Salir de Excepción
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Phase Editor */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-lg">
                  {mode === "exception" && selectedOrder
                    ? `Fases para ${selectedOrder.placa}`
                    : `Fases de ${SERVICE_TYPE_LABELS[selectedServiceType]}`}
                </CardTitle>
                <CardDescription>
                  Arrastra las fases para cambiar su orden. Las fases críticas no pueden eliminarse.
                </CardDescription>
              </div>
              {hasChanges && (
                <Badge variant="secondary" className="self-start">
                  <span className="mr-1.5 h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                  Cambios sin guardar
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <PhaseEditor
              fases={fases}
              onFasesChange={handleFasesChange}
              fasesCompletadas={selectedOrder?.fasesCompletadas}
              isExceptionMode={mode === "exception"}
              errors={phaseErrors}
            />
          </CardContent>
        </Card>

        {/* Footer Actions - Sticky */}
        <div className="sticky bottom-0 z-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-lg border bg-card p-4 shadow-lg">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>
              {fases.length} fases • Tiempo total: {formatTime(calculateTotalTime(fases))}
            </span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {mode === "exception" && (
              <Button variant="outline" onClick={handleResetToTemplate} disabled={isSaving} size="sm" className="sm:size-default">
                <RotateCcw className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Restablecer a Plantilla</span>
                <span className="sm:hidden">Restablecer</span>
              </Button>
            )}
            <Button
              onClick={handleSave}
              disabled={isSaving || !hasChanges}
              className="bg-[#E60000] hover:bg-[#CC0000] text-white flex-1 sm:flex-none"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

