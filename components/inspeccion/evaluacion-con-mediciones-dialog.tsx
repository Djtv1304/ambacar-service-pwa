"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Loader2, Save, AlertCircle, Ruler } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { ESTADOS_INSPECCION } from "@/lib/inspeccion/constants"
import type {
  PuntoInspeccionEvaluado,
  PuntoInspeccionCatalogo,
  Mediciones,
  CampoMedicion,
} from "@/lib/types"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface EvaluacionConMedicionesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  puntoCatalogo: PuntoInspeccionCatalogo
  evaluacionExistente?: PuntoInspeccionEvaluado
  onGuardar: (evaluacion: PuntoInspeccionEvaluado) => Promise<void>
}

export function EvaluacionConMedicionesDialog({
  open,
  onOpenChange,
  puntoCatalogo,
  evaluacionExistente,
  onGuardar,
}: EvaluacionConMedicionesDialogProps) {
  const [estado, setEstado] = useState<"verde" | "amarillo" | "rojo" | "na" | "">("")
  const [observaciones, setObservaciones] = useState("")
  const [mediciones, setMediciones] = useState<Mediciones>({})
  const [erroresMediciones, setErroresMediciones] = useState<Record<string, string>>({})
  const [isGuardando, setIsGuardando] = useState(false)

  // Cargar datos existentes si hay una evaluación previa
  useEffect(() => {
    if (open && evaluacionExistente) {
      setEstado(evaluacionExistente.estado)
      setObservaciones(evaluacionExistente.observaciones || "")
      setMediciones(evaluacionExistente.mediciones || {})
      setErroresMediciones({})
    } else if (open && !evaluacionExistente) {
      // Resetear al abrir sin evaluación existente
      setEstado("")
      setObservaciones("")
      setMediciones({})
      setErroresMediciones({})
    }
  }, [open, evaluacionExistente])

  const handleMedicionChange = (campo: string, valor: string | number, config?: CampoMedicion) => {
    // Validar rangos para campos numéricos
    if (config && config.tipo === "number" && typeof valor === "number") {
      if (valor < config.min || valor > config.max) {
        setErroresMediciones((prev) => ({
          ...prev,
          [campo]: `Valor debe estar entre ${config.min} y ${config.max} ${config.unidad}`,
        }))
      } else {
        // Limpiar error si el valor es válido
        setErroresMediciones((prev) => {
          const newErrors = { ...prev }
          delete newErrors[campo]
          return newErrors
        })
      }
    }

    setMediciones((prev) => ({
      ...prev,
      [campo]: valor,
    }))
  }

  const handleGuardar = async () => {
    if (!estado) {
      alert("Debes seleccionar un estado antes de guardar")
      return
    }

    // N/A no requiere validaciones adicionales
    if (estado !== "na") {
      // Validaciones según el estado
      if (estado === "amarillo" && !observaciones.trim()) {
        alert("Debes agregar observaciones para el estado Amarillo")
        return
      }

      // Validar mediciones si requiere
      if (puntoCatalogo.requiere_mediciones && puntoCatalogo.campos_medicion) {
        const camposFaltantes: string[] = []
        Object.keys(puntoCatalogo.campos_medicion).forEach((campo) => {
          if (!mediciones[campo] && mediciones[campo] !== 0) {
            camposFaltantes.push(formatCampoNombre(campo))
          }
        })

        if (camposFaltantes.length > 0) {
          alert(`Debes completar todas las mediciones: ${camposFaltantes.join(", ")}`)
          return
        }

        // Verificar que no haya errores de validación
        if (Object.keys(erroresMediciones).length > 0) {
          alert("Por favor corrige los errores en las mediciones antes de guardar")
          return
        }
      }
    }

    setIsGuardando(true)
    try {
      const evaluacion: PuntoInspeccionEvaluado = {
        punto_id: puntoCatalogo.id,
        nombre: puntoCatalogo.nombre,
        estado,
        observaciones: observaciones.trim() || undefined,
        fotos: [], // Las fotos se agregan después si el estado es ROJO
        mediciones: puntoCatalogo.requiere_mediciones ? mediciones : undefined,
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

  // Validar si todas las mediciones están completas y sin errores
  const medicionesCompletas =
    !puntoCatalogo.requiere_mediciones ||
    (puntoCatalogo.campos_medicion &&
      Object.keys(puntoCatalogo.campos_medicion).every(
        (campo) => mediciones[campo] !== undefined && mediciones[campo] !== ""
      ) &&
      Object.keys(erroresMediciones).length === 0)

  const puedeGuardar =
    estado &&
    (estado === "na" || ((!mostrarObservaciones || observaciones.trim()) && medicionesCompletas))

  // Formatear nombre de campo para mostrar
  const formatCampoNombre = (campo: string): string => {
    return campo
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="space-y-2">
              <Badge className="bg-blue-100 text-blue-800 border-blue-200 w-fit">
                {puntoCatalogo.categoria_display.toUpperCase()}
              </Badge>
              <DialogTitle className="text-2xl">{puntoCatalogo.nombre}</DialogTitle>
              <p className="text-sm text-muted-foreground">{puntoCatalogo.descripcion}</p>
            </div>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Mediciones (si requiere) */}
            {puntoCatalogo.requiere_mediciones && puntoCatalogo.campos_medicion && (
              <Card className="border-blue-200 bg-blue-50/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Ruler className="h-5 w-5 text-blue-600" />
                    Mediciones Requeridas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(puntoCatalogo.campos_medicion).map(([campo, config]) => (
                    <div key={campo} className="space-y-2">
                      <Label htmlFor={campo} className="text-base font-semibold">
                        {formatCampoNombre(campo)} <span className="text-red-500">*</span>
                      </Label>

                      {config.tipo === "number" && (
                        <div className="space-y-1">
                          <div className="relative">
                            <Input
                              id={campo}
                              type="number"
                              min={config.min}
                              max={config.max}
                              step="0.1"
                              value={mediciones[campo] || ""}
                              onChange={(e) => handleMedicionChange(campo, parseFloat(e.target.value) || 0, config)}
                              placeholder={`Ingresa valor (${config.min}-${config.max})`}
                              className={`pr-16 ${erroresMediciones[campo] ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                            />
                            <div className="absolute right-3 top-0 h-full flex items-center">
                              <span className="text-sm font-medium text-muted-foreground">{config.unidad}</span>
                            </div>
                          </div>
                          {erroresMediciones[campo] ? (
                            <p className="text-xs text-red-600">{erroresMediciones[campo]}</p>
                          ) : (
                            <p className="text-xs text-muted-foreground">
                              Rango: {config.min} - {config.max} {config.unidad}
                            </p>
                          )}
                        </div>
                      )}

                      {config.tipo === "select" && (
                        <Select
                          value={mediciones[campo]?.toString() || ""}
                          onValueChange={(value) => handleMedicionChange(campo, value)}
                        >
                          <SelectTrigger id={campo}>
                            <SelectValue placeholder="Selecciona una opción" />
                          </SelectTrigger>
                          <SelectContent>
                            {config.opciones.map((opcion) => (
                              <SelectItem key={opcion} value={opcion}>
                                {opcion}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

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
