"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Save, AlertTriangle, Info, Search, Lightbulb, Eye, RefreshCw } from "lucide-react"
import { motion } from "framer-motion"
import { SEVERIDADES_HALLAZGO, TIPOS_NOVEDAD, type SeveridadHallazgo, type TipoNovedad } from "@/lib/inspeccion/constants"
import type { HallazgoOTPayload } from "@/lib/types"
import { registrarHallazgo } from "@/lib/api/ordenes-trabajo"
import { useAuthToken } from "@/hooks/use-auth-token"
import { useAuth } from "@/components/auth/auth-provider"
import { toast } from "sonner"

interface RegistroHallazgoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ordenTrabajoId: number
  onHallazgoRegistrado?: () => void
  clienteNombre: string
}

export function RegistroHallazgoDialog({
  open,
  onOpenChange,
  ordenTrabajoId,
  onHallazgoRegistrado,
  clienteNombre,
}: RegistroHallazgoDialogProps) {
  const { getToken } = useAuthToken()
  const { user } = useAuth()

  const [tipoNovedad, setTipoNovedad] = useState<TipoNovedad>("HALLAZGO")
  const [descripcion, setDescripcion] = useState("")
  const [justificacionTecnica, setJustificacionTecnica] = useState("")
  const [severidad, setSeveridad] = useState<SeveridadHallazgo>("RECOMENDADO")
  const [costoManoObra, setCostoManoObra] = useState("")
  const [costoRepuestos, setCostoRepuestos] = useState("")
  const [requiereAutorizacion, setRequiereAutorizacion] = useState(true)
  const [isGuardando, setIsGuardando] = useState(false)

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setTipoNovedad("HALLAZGO")
      setDescripcion("")
      setJustificacionTecnica("")
      setSeveridad("RECOMENDADO")
      setCostoManoObra("")
      setCostoRepuestos("")
      setRequiereAutorizacion(true)
    }
  }, [open])

  const handleGuardar = async () => {
    if (!descripcion.trim()) {
      toast.error("Debes ingresar una descripción del hallazgo")
      return
    }

    if (!user?.id) {
      toast.error("No se pudo identificar al usuario")
      return
    }

    setIsGuardando(true)
    try {
      const token = await getToken()
      if (!token) {
        toast.error("Error de autenticación")
        return
      }

      const payload: HallazgoOTPayload = {
        orden_trabajo: ordenTrabajoId,
        tipo_novedad: tipoNovedad,
        descripcion: descripcion.trim(),
        justificacion_tecnica: justificacionTecnica.trim() || undefined,
        severidad,
        costo_mano_obra: costoManoObra ? parseFloat(costoManoObra) : undefined,
        costo_repuestos: costoRepuestos ? parseFloat(costoRepuestos) : undefined,
        requiere_autorizacion: requiereAutorizacion,
        usuario_reporte: user.id,
      }

      await registrarHallazgo(payload, token)

      toast.success("Hallazgo registrado exitosamente", {
        description: "El cliente será notificado sobre este hallazgo.",
      })

      onHallazgoRegistrado?.()
      onOpenChange(false)
    } catch (error: any) {
      console.error("Error al guardar hallazgo:", error)
      toast.error("Error al guardar el hallazgo", {
        description: error?.message || "Por favor intenta de nuevo.",
      })
    } finally {
      setIsGuardando(false)
    }
  }

  const tipoNovedadSeleccionado = TIPOS_NOVEDAD.find((t) => t.value === tipoNovedad)
  const severidadSeleccionada = SEVERIDADES_HALLAZGO.find((s) => s.value === severidad)
  const puedeGuardar = descripcion.trim().length > 0

  // Calcular costo total estimado
  const costoTotal = (parseFloat(costoManoObra) || 0) + (parseFloat(costoRepuestos) || 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Registrar Hallazgo</DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Registra cualquier hallazgo importante encontrado durante el proceso de la orden de trabajo
          </p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Tipo de Novedad */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">
              Tipo de Novedad <span className="text-red-500">*</span>
            </Label>
            <Select value={tipoNovedad} onValueChange={(value: TipoNovedad) => setTipoNovedad(value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona el tipo de novedad" />
              </SelectTrigger>
              <SelectContent>
                {TIPOS_NOVEDAD.map((tipo) => (
                  <SelectItem key={tipo.value} value={tipo.value}>
                    <div className="flex items-center gap-2">
                      {tipo.value === "HALLAZGO" && <Search className="h-4 w-4 text-blue-500" />}
                      {tipo.value === "PROBLEMA" && <AlertTriangle className="h-4 w-4 text-red-500" />}
                      {tipo.value === "RECOMENDACION" && <Lightbulb className="h-4 w-4 text-yellow-500" />}
                      {tipo.value === "OBSERVACION" && <Eye className="h-4 w-4 text-gray-500" />}
                      {tipo.value === "CAMBIO" && <RefreshCw className="h-4 w-4 text-purple-500" />}
                      <span>{tipo.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {tipoNovedadSeleccionado && (
              <p className="text-xs text-muted-foreground">{tipoNovedadSeleccionado.description}</p>
            )}
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="descripcion" className="text-base font-semibold">
              Descripción <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Describa el problema o hallazgo encontrado durante la inspección del vehículo..."
              rows={3}
              className="resize-none"
            />
            {!descripcion.trim() && (
              <p className="text-xs text-amber-600">La descripción es obligatoria</p>
            )}
          </div>

          {/* Justificación Técnica */}
          <div className="space-y-2">
            <Label htmlFor="justificacion" className="text-base font-semibold">
              Justificación Técnica
            </Label>
            <Textarea
              id="justificacion"
              value={justificacionTecnica}
              onChange={(e) => setJustificacionTecnica(e.target.value)}
              placeholder="Explique técnicamente el problema y por qué es importante atenderlo (esta información se mostrará al cliente)..."
              rows={3}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Esta explicación ayudará al cliente a entender la importancia del hallazgo
            </p>
          </div>

          {/* Severidad */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">
              Severidad <span className="text-red-500">*</span>
            </Label>
            <RadioGroup value={severidad} onValueChange={(value: SeveridadHallazgo) => setSeveridad(value)} className="space-y-3">
              {SEVERIDADES_HALLAZGO.map((severidadOption) => (
                <div key={severidadOption.value} className="flex items-start space-x-3">
                  <RadioGroupItem value={severidadOption.value} id={severidadOption.value} className="mt-1" />
                  <Label htmlFor={severidadOption.value} className="cursor-pointer flex-1">
                    <div className={`font-medium ${severidadOption.color}`}>{severidadOption.label}</div>
                    <div className="text-sm text-muted-foreground">{severidadOption.description}</div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Costos Estimados */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Costos Estimados</Label>

            <Alert className="bg-amber-50 border-amber-200">
              <Info className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-900 text-sm">
                Los costos son aproximados y pueden variar según la disponibilidad de repuestos y tiempo real de trabajo.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="costoManoObra" className="text-sm">
                  Costo Mano de Obra
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="costoManoObra"
                    type="number"
                    step="0.01"
                    min="0"
                    value={costoManoObra}
                    onChange={(e) => setCostoManoObra(e.target.value)}
                    placeholder="0.00"
                    className="pl-7"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="costoRepuestos" className="text-sm">
                  Costo Repuestos
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="costoRepuestos"
                    type="number"
                    step="0.01"
                    min="0"
                    value={costoRepuestos}
                    onChange={(e) => setCostoRepuestos(e.target.value)}
                    placeholder="0.00"
                    className="pl-7"
                  />
                </div>
              </div>
            </div>

            {costoTotal > 0 && (
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border">
                <span className="font-medium text-gray-700">Costo Total Estimado:</span>
                <span className="text-lg font-bold text-[#ED1C24]">${costoTotal.toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* Requiere Autorización */}
          <div className="flex items-start space-x-3 p-4 border rounded-lg bg-gray-50">
            <Checkbox
              id="requiereAutorizacion"
              checked={requiereAutorizacion}
              onCheckedChange={(checked) => setRequiereAutorizacion(checked as boolean)}
            />
            <div className="space-y-1">
              <Label htmlFor="requiereAutorizacion" className="cursor-pointer font-medium">
                Requiere autorización del cliente
              </Label>
              <p className="text-sm text-muted-foreground">
                Marque esta opción si el trabajo adicional requiere aprobación antes de proceder
              </p>
            </div>
          </div>

          {/* Vista previa */}
          {descripcion.trim() && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="border rounded-lg p-4 bg-gray-50 space-y-3">
                <p className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Resumen del Hallazgo
                </p>
                <div className="text-sm text-gray-700 space-y-2">
                  {tipoNovedadSeleccionado && (
                    <p><strong>Tipo:</strong> {tipoNovedadSeleccionado.label}</p>
                  )}
                  <p><strong>Descripción:</strong> {descripcion}</p>
                  {justificacionTecnica && (
                    <p><strong>Justificación:</strong> {justificacionTecnica}</p>
                  )}
                  {severidadSeleccionada && (
                    <p><strong>Severidad:</strong> <span className={severidadSeleccionada.color}>{severidadSeleccionada.label}</span></p>
                  )}
                  {costoTotal > 0 && (
                    <p><strong>Costo estimado:</strong> ${costoTotal.toFixed(2)}</p>
                  )}
                  <p><strong>Requiere autorización:</strong> {requiereAutorizacion ? "Sí" : "No"}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-2 pt-2 border-t">
                  Este hallazgo será notificado a {clienteNombre}
                </p>
              </div>
            </motion.div>
          )}
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
  )
}
