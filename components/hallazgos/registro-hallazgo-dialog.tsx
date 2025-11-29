"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Save, Camera, X, AlertTriangle, Mail, MessageCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { URGENCIAS_HALLAZGO } from "@/lib/inspeccion/constants"
import type { HallazgoOT, FotoInspeccion } from "@/lib/types"
import { CameraInspeccionDialog } from "@/components/inspeccion/camera-inspeccion-dialog"

interface RegistroHallazgoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ordenTrabajoId: number
  onGuardar: (hallazgo: HallazgoOT) => Promise<void>
  clienteNombre: string
}

export function RegistroHallazgoDialog({
  open,
  onOpenChange,
  ordenTrabajoId,
  onGuardar,
  clienteNombre,
}: RegistroHallazgoDialogProps) {
  const [descripcion, setDescripcion] = useState("")
  const [urgencia, setUrgencia] = useState<"inmediato" | "puede-esperar" | "preventivo">("inmediato")
  const [costoEstimado, setCostoEstimado] = useState("")
  const [fotos, setFotos] = useState<FotoInspeccion[]>([])
  const [cameraOpen, setCameraOpen] = useState(false)
  const [isGuardando, setIsGuardando] = useState(false)

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setDescripcion("")
      setUrgencia("inmediato")
      setCostoEstimado("")
      setFotos([])
    }
  }, [open])

  const handleGuardar = async () => {
    if (!descripcion.trim()) {
      alert("Debes ingresar una descripción del hallazgo")
      return
    }

    setIsGuardando(true)
    try {
      const hallazgo: HallazgoOT = {
        orden_trabajo: ordenTrabajoId,
        descripcion: descripcion.trim(),
        urgencia,
        costo_estimado: costoEstimado ? parseFloat(costoEstimado) : undefined,
        fotos,
        notificar_whatsapp: true,
        notificar_email: true,
      }

      await onGuardar(hallazgo)
      onOpenChange(false)
    } catch (error) {
      console.error("Error al guardar hallazgo:", error)
      alert("Error al guardar el hallazgo. Por favor intenta de nuevo.")
    } finally {
      setIsGuardando(false)
    }
  }

  const handleEliminarFoto = (index: number) => {
    setFotos((prev) => prev.filter((_, i) => i !== index))
  }

  const urgenciaSeleccionada = URGENCIAS_HALLAZGO.find((u) => u.value === urgencia)

  const puedeGuardar = descripcion.trim().length > 0

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Registrar Hallazgo</DialogTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Registra cualquier hallazgo importante encontrado durante el proceso de la orden de trabajo
            </p>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Descripción */}
            <div className="space-y-2">
              <Label htmlFor="descripcion" className="text-base font-semibold">
                Descripción del Hallazgo <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="descripcion"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Por favor, proporcione detalles sobre el problema crítico encontrado durante la inspección del vehículo..."
                rows={4}
                className="resize-none"
              />
              {!descripcion.trim() && (
                <p className="text-xs text-amber-600">La descripción es obligatoria</p>
              )}
            </div>

            {/* Urgencia */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">
                Urgencia <span className="text-red-500">*</span>
              </Label>
              <RadioGroup value={urgencia} onValueChange={(value: any) => setUrgencia(value)} className="space-y-3">
                {URGENCIAS_HALLAZGO.map((urgenciaOption) => (
                  <div key={urgenciaOption.value} className="flex items-start space-x-3">
                    <RadioGroupItem value={urgenciaOption.value} id={urgenciaOption.value} className="mt-1" />
                    <Label htmlFor={urgenciaOption.value} className="cursor-pointer flex-1">
                      <div className="font-medium">{urgenciaOption.label}</div>
                      <div className="text-sm text-muted-foreground">{urgenciaOption.description}</div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Costo Estimado */}
            <div className="space-y-2">
              <Label htmlFor="costo" className="text-base font-semibold">
                Costo Estimado (opcional)
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="costo"
                  type="number"
                  step="0.01"
                  min="0"
                  value={costoEstimado}
                  onChange={(e) => setCostoEstimado(e.target.value)}
                  placeholder="Ingrese el costo estimado"
                  className="pl-7"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Ingresa el costo estimado si este hallazgo puede generar un costo adicional al cliente
              </p>
            </div>

            {/* Fotografías */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Fotografías (opcional)</Label>

              <div className="space-y-3">
                {fotos.length > 0 && (
                  <div className="grid grid-cols-3 gap-3">
                    {fotos.map((foto, idx) => (
                      <div key={`foto-hallazgo-${idx}`} className="relative group">
                        <img
                          src={foto.preview}
                          alt={`Foto ${idx + 1}`}
                          className="w-full aspect-video object-cover rounded-lg border-2 border-gray-200"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleEliminarFoto(idx)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                        <Badge className="absolute bottom-2 left-2 bg-black/70">{idx + 1}</Badge>
                      </div>
                    ))}
                  </div>
                )}

                <Button type="button" variant="outline" className="w-full" onClick={() => setCameraOpen(true)}>
                  <Camera className="mr-2 h-4 w-4" />
                  {fotos.length === 0 ? "Agregar Fotografías" : "Modificar Fotografías"}
                </Button>
              </div>
            </div>

            {/* Vista previa de notificación */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Notificación al Cliente</Label>
              <Alert className="bg-blue-50 border-blue-200">
                <AlertTriangle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-900">
                  <div className="space-y-2">
                    <p className="font-medium">Esta información se comunicará al cliente mediante:</p>
                    <div className="flex items-center gap-3 flex-wrap">
                      <Badge className="bg-green-600 text-white">
                        <MessageCircle className="mr-1 h-3 w-3" />
                        WhatsApp
                      </Badge>
                      <Badge className="bg-blue-600 text-white">
                        <Mail className="mr-1 h-3 w-3" />
                        Correo Electrónico
                      </Badge>
                    </div>
                    <p className="text-sm mt-2">
                      Basado en las preferencias configuradas para {clienteNombre}
                    </p>
                  </div>
                </AlertDescription>
              </Alert>

              {/* Preview del mensaje */}
              {descripcion.trim() && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="border rounded-lg p-4 bg-gray-50 space-y-2">
                    <p className="text-sm font-medium">Vista Previa de la Notificación:</p>
                    <div className="text-sm text-gray-700 space-y-2">
                      <p>{descripcion}</p>
                      {urgenciaSeleccionada && (
                        <p className="font-medium text-red-600">Urgencia: {urgenciaSeleccionada.label}</p>
                      )}
                      {costoEstimado && (
                        <p>Costo estimado: ${parseFloat(costoEstimado).toFixed(2)}</p>
                      )}
                      <p className="text-xs italic mt-3">Atentamente, Alex Vizuete.</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
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
                  Guardar Hallazgo
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CameraInspeccionDialog
        open={cameraOpen}
        onOpenChange={setCameraOpen}
        onFotosCapturadas={setFotos}
        puntoNombre="Hallazgo"
        fotosExistentes={fotos}
      />
    </>
  )
}
