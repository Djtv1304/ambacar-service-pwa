"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Loader2, Save, AlertCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { ESTADOS_INSPECCION } from "@/lib/inspeccion/constants"
import type { PuntoInspeccionEvaluado } from "@/lib/types"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface EvaluacionPuntoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  puntoId: number
  puntoNombre: string
  puntoDescripcion: string
  evaluacionExistente?: PuntoInspeccionEvaluado
  onGuardar: (evaluacion: PuntoInspeccionEvaluado) => Promise<void>
}

export function EvaluacionPuntoDialog({
  open,
  onOpenChange,
  puntoId,
  puntoNombre,
  puntoDescripcion,
  evaluacionExistente,
  onGuardar,
}: EvaluacionPuntoDialogProps) {
  const [estado, setEstado] = useState<"verde" | "amarillo" | "rojo" | "na" | "">("")
  const [observaciones, setObservaciones] = useState("")
  const [isGuardando, setIsGuardando] = useState(false)

  // Cargar datos existentes si hay una evaluación previa
  useEffect(() => {
    if (open && evaluacionExistente) {
      setEstado(evaluacionExistente.estado)
      setObservaciones(evaluacionExistente.observaciones || "")
    } else if (open && !evaluacionExistente) {
      // Resetear al abrir sin evaluación existente
      setEstado("")
      setObservaciones("")
    }
  }, [open, evaluacionExistente])

  const handleGuardar = async () => {
    if (!estado) {
      alert("Debes seleccionar un estado antes de guardar")
      return
    }

    // Validaciones según el estado (N/A no requiere validaciones adicionales)
    if (estado === "amarillo" && !observaciones.trim()) {
      alert("Debes agregar observaciones para el estado Amarillo")
      return
    }

    setIsGuardando(true)
    try {
      const evaluacion: PuntoInspeccionEvaluado = {
        punto_id: puntoId,
        nombre: puntoNombre,
        estado,
        observaciones: observaciones.trim() || undefined,
        fotos: [], // Las fotos se agregan después si el estado es ROJO
        completado: true,
      }

      await onGuardar(evaluacion)
      onOpenChange(false)
    } catch (error) {
      console.error("Error al guardar evaluación:", error)
      alert("Error al guardar la evaluación. Por favor intenta de nuevo.")
    } finally {
      setIsGuardando(false)
    }
  }

  const estadoSeleccionado = ESTADOS_INSPECCION.find((e) => e.value === estado)

  const mostrarObservaciones = estado === "amarillo" || estado === "rojo"
  const mostrarAlertaFotos = estado === "rojo"
  const puedeGuardar = estado && (!mostrarObservaciones || observaciones.trim())

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{puntoNombre}</DialogTitle>
            <p className="text-sm text-muted-foreground mt-2">{puntoDescripcion}</p>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Estado */}
            <div className="space-y-2">
              <Label htmlFor="estado" className="text-base font-semibold">
                Estado del Punto de Inspección <span className="text-red-500">*</span>
              </Label>
              <Select value={estado} onValueChange={(value: any) => setEstado(value)}>
                <SelectTrigger id="estado" className="w-full">
                  <SelectValue placeholder="Selecciona el estado del punto" />
                </SelectTrigger>
                <SelectContent>
                  {ESTADOS_INSPECCION.map((estadoOption) => (
                    <SelectItem key={estadoOption.value} value={estadoOption.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${estadoOption.color}`} />
                        <span>{estadoOption.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {estadoSeleccionado && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                  <Badge className={`${estadoSeleccionado.color} text-white border-0 mt-2`}>
                    Estado seleccionado: {estadoSeleccionado.label}
                  </Badge>
                </motion.div>
              )}
            </div>

            {/* Observaciones (se muestra si estado es Amarillo o Rojo) */}
            <AnimatePresence>
              {mostrarObservaciones && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-2"
                >
                  <Label htmlFor="observaciones" className="text-base font-semibold">
                    Observaciones {estado === "amarillo" && <span className="text-red-500">*</span>}
                  </Label>
                  <Textarea
                    id="observaciones"
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    placeholder={
                      estado === "amarillo"
                        ? "Describe las precauciones o detalles importantes sobre este punto..."
                        : "Agrega observaciones adicionales (opcional)..."
                    }
                    rows={4}
                    className="resize-none"
                  />
                  {estado === "amarillo" && !observaciones.trim() && (
                    <p className="text-xs text-amber-600">Las observaciones son obligatorias para el estado Amarillo</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Alerta de fotos para estado ROJO */}
            <AnimatePresence>
              {mostrarAlertaFotos && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Alert className="border-blue-200 bg-blue-50">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-900">
                      Después de guardar este punto, podrás agregar las fotografías de evidencia requeridas para el estado
                      crítico.
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isGuardando}>
              Cancelar
            </Button>
            <Button onClick={handleGuardar} disabled={!puedeGuardar || isGuardando} className="bg-[#ED1C24] hover:bg-[#c41820]">
              {isGuardando ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Evaluación
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
