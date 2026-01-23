"use client"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Loader2, Save, AlertTriangle, Info, Search, Lightbulb, Eye, RefreshCw, Camera, Trash2, X, ImagePlus, CheckCircle2, Calendar, User, DollarSign, FileText } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { SEVERIDADES_HALLAZGO, TIPOS_NOVEDAD, type SeveridadHallazgo, type TipoNovedad } from "@/lib/inspeccion/constants"
import type { HallazgoOTPayload, HallazgoOT } from "@/lib/types"
import { registrarHallazgo, registrarHallazgoConFotos } from "@/lib/api/ordenes-trabajo"
import { useAuthToken } from "@/hooks/use-auth-token"
import { useAuth } from "@/components/auth/auth-provider"
import { toast } from "sonner"

const MAX_FOTOS_HALLAZGO = 6

interface FotoCapturada {
  archivo: File
  preview: string
  orden: number
}

interface RegistroHallazgoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ordenTrabajoId: number
  onHallazgoRegistrado?: () => void
  clienteNombre: string
}

interface ConfirmacionHallazgoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  hallazgo: HallazgoOT | null
}

function ConfirmacionHallazgoDialog({ open, onOpenChange, hallazgo }: ConfirmacionHallazgoDialogProps) {
  if (!hallazgo) return null

  const costoTotal = parseFloat(hallazgo.costo_mano_obra || "0") + parseFloat(hallazgo.costo_repuestos || "0")
  const fechaFormateada = new Date(hallazgo.fecha_reporte).toLocaleString("es-EC", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  const getSeveridadColor = (severidad: string) => {
    switch (severidad) {
      case "CRITICO":
        return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900"
      case "IMPORTANTE":
        return "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-900"
      case "RECOMENDADO":
        return "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-900"
      case "OPCIONAL":
        return "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900"
      default:
        return "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-950/30 border-gray-200 dark:border-gray-900"
    }
  }

  const getEstadoAprobacionBadge = (estado: string) => {
    switch (estado) {
      case "PENDIENTE":
        return <Badge className="bg-amber-500 text-white text-xs sm:text-sm whitespace-nowrap">Pendiente de Autorización</Badge>
      case "APROBADO":
        return <Badge className="bg-green-500 text-white text-xs sm:text-sm">Aprobado</Badge>
      case "RECHAZADO":
        return <Badge className="bg-red-500 text-white text-xs sm:text-sm">Rechazado</Badge>
      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl lg:max-w-4xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/30 shrink-0">
              <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl sm:text-2xl">Hallazgo Registrado Exitosamente</DialogTitle>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                El hallazgo ha sido creado y está listo para revisión
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6 px-6 pb-4 overflow-y-auto flex-1">
          {/* Información Principal */}
          <div className="grid gap-3 sm:gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-gray-500 dark:text-gray-400 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">ID del Hallazgo</p>
                  <p className="text-lg sm:text-xl font-bold text-primary">#{hallazgo.id}</p>
                </div>
              </div>
              {getEstadoAprobacionBadge(hallazgo.estado_aprobacion)}
            </div>

            <div className={`p-3 sm:p-4 rounded-lg border ${getSeveridadColor(hallazgo.severidad)}`}>
              <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <p className="font-semibold text-sm sm:text-base">{hallazgo.tipo_novedad_display}</p>
                  </div>
                  <p className="text-xs sm:text-sm break-words">{hallazgo.descripcion}</p>
                  {hallazgo.justificacion_tecnica && (
                    <div className="mt-3 pt-3 border-t border-current/20">
                      <p className="text-xs font-medium mb-1">Justificación Técnica:</p>
                      <p className="text-xs sm:text-sm break-words">{hallazgo.justificacion_tecnica}</p>
                    </div>
                  )}
                </div>
                <Badge variant="outline" className="self-start shrink-0 text-xs">
                  {hallazgo.severidad}
                </Badge>
              </div>
            </div>
          </div>

          {/* Detalles Adicionales */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
              <User className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Reportado por</p>
                <p className="text-xs sm:text-sm font-medium truncate">{hallazgo.usuario_reporte_nombre}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
              <Calendar className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Fecha de Registro</p>
                <p className="text-xs sm:text-sm font-medium">{fechaFormateada}</p>
              </div>
            </div>
          </div>

          {/* Costos */}
          {costoTotal > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-gray-500 dark:text-gray-400 shrink-0" />
                <p className="font-semibold text-sm sm:text-base">Costos Estimados</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {parseFloat(hallazgo.costo_mano_obra) > 0 && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                    <p className="text-xs text-muted-foreground mb-1">Mano de Obra</p>
                    <p className="text-base sm:text-lg font-bold break-all">${parseFloat(hallazgo.costo_mano_obra).toFixed(2)}</p>
                  </div>
                )}
                {parseFloat(hallazgo.costo_repuestos) > 0 && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                    <p className="text-xs text-muted-foreground mb-1">Repuestos</p>
                    <p className="text-base sm:text-lg font-bold break-all">${parseFloat(hallazgo.costo_repuestos).toFixed(2)}</p>
                  </div>
                )}
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 sm:p-4 bg-primary text-white rounded-lg">
                <span className="font-semibold text-sm sm:text-base">Costo Total Estimado:</span>
                <span className="text-xl sm:text-2xl font-bold">${costoTotal.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Evidencia Fotográfica */}
          {hallazgo.fotos && hallazgo.fotos.length > 0 && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="flex items-center gap-2">
                  <Camera className="h-5 w-5 text-gray-500 dark:text-gray-400 shrink-0" />
                  <p className="font-semibold text-sm sm:text-base">Evidencia Fotográfica</p>
                </div>
                <Badge variant="outline" className="self-start sm:ml-auto text-xs">
                  {hallazgo.fotos.length} foto{hallazgo.fotos.length !== 1 ? 's' : ''} adjuntada{hallazgo.fotos.length !== 1 ? 's' : ''}
                </Badge>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                {hallazgo.fotos.map((foto, idx) => (
                  <motion.div
                    key={foto.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="relative group"
                  >
                    <img
                      src={foto.imagen}
                      alt={`Evidencia ${idx + 1}`}
                      className="w-full aspect-video object-cover rounded-lg border-2 border-gray-200 dark:border-gray-700 cursor-pointer hover:border-primary transition-colors"
                      loading="lazy"
                    />
                    <Badge className="absolute bottom-2 left-2 bg-black/80 text-xs">{idx + 1}</Badge>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Badge variant="outline" className="bg-white/95 dark:bg-gray-900/95 text-[10px] sm:text-xs shadow-lg">
                        {(foto.tamano_bytes / 1024).toFixed(0)} KB
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Alert de autorización */}
          {hallazgo.requiere_autorizacion && hallazgo.estado_aprobacion === "PENDIENTE" && (
            <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900">
              <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <AlertDescription className="text-amber-900 dark:text-amber-300 text-xs sm:text-sm block">
                Este hallazgo requiere autorización del cliente antes de proceder con los trabajos adicionales.
                El estado actual es <strong>Pendiente de Autorización</strong>.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="px-6 pb-6 pt-4 shrink-0 border-t border-gray-200 dark:border-gray-800">
          <Button
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-sm sm:text-base"
          >
            Entendido
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
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

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [tipoNovedad, setTipoNovedad] = useState<TipoNovedad>("HALLAZGO")
  const [descripcion, setDescripcion] = useState("")
  const [justificacionTecnica, setJustificacionTecnica] = useState("")
  const [severidad, setSeveridad] = useState<SeveridadHallazgo>("RECOMENDADO")
  const [costoManoObra, setCostoManoObra] = useState("")
  const [costoRepuestos, setCostoRepuestos] = useState("")
  const [requiereAutorizacion, setRequiereAutorizacion] = useState(true)
  const [isGuardando, setIsGuardando] = useState(false)

  // Estados para captura de fotos
  const [fotos, setFotos] = useState<FotoCapturada[]>([])
  const [cameraActive, setCameraActive] = useState(false)
  const [isCapturing, setIsCapturing] = useState(false)

  // Estados para confirmación
  const [showConfirmacion, setShowConfirmacion] = useState(false)
  const [hallazgoCreado, setHallazgoCreado] = useState<HallazgoOT | null>(null)

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
      setFotos([])
      detenerCamara()
    }
  }, [open])

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      detenerCamara()
    }
  }, [])

  // Limpiar estado de confirmación cuando se cierra
  useEffect(() => {
    if (!showConfirmacion) {
      setHallazgoCreado(null)
    }
  }, [showConfirmacion])

  const iniciarCamara = async () => {
    setCameraActive(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        try {
          await videoRef.current.play()
        } catch (playError) {
          console.error("Error al reproducir video:", playError)
        }
      }
    } catch (error) {
      console.error("Error al acceder a la cámara:", error)
      setCameraActive(false)
      toast.error("No se pudo acceder a la cámara", {
        description: "Por favor verifica los permisos de la cámara en tu navegador",
      })
    }
  }

  const detenerCamara = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
      videoRef.current.srcObject = null
      setCameraActive(false)
    }
  }

  const capturarFoto = () => {
    if (!canvasRef.current || !videoRef.current) return

    setIsCapturing(true)
    try {
      const context = canvasRef.current.getContext("2d")
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth
        canvasRef.current.height = videoRef.current.videoHeight
        context.drawImage(videoRef.current, 0, 0)

        canvasRef.current.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `hallazgo-${Date.now()}.jpg`, {
              type: "image/jpeg",
            })
            const preview = canvasRef.current?.toDataURL() || ""

            const nuevaFoto: FotoCapturada = {
              archivo: file,
              preview,
              orden: fotos.length + 1,
            }

            setFotos((prev) => [...prev, nuevaFoto])

            if (fotos.length + 1 >= MAX_FOTOS_HALLAZGO) {
              detenerCamara()
            }

            toast.success(`Foto ${fotos.length + 1} capturada`, {
              description: `${MAX_FOTOS_HALLAZGO - fotos.length - 1} fotos restantes`,
            })
          }
        }, "image/jpeg", 0.95)
      }
    } finally {
      setIsCapturing(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && canvasRef.current) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const img = new Image()
        img.onload = () => {
          const context = canvasRef.current?.getContext("2d")
          if (context && canvasRef.current) {
            canvasRef.current.width = img.width
            canvasRef.current.height = img.height
            context.drawImage(img, 0, 0)

            const preview = canvasRef.current.toDataURL()

            const nuevaFoto: FotoCapturada = {
              archivo: file,
              preview,
              orden: fotos.length + 1,
            }

            setFotos((prev) => [...prev, nuevaFoto])

            if (fotos.length + 1 >= MAX_FOTOS_HALLAZGO) {
              detenerCamara()
            }

            toast.success(`Foto ${fotos.length + 1} agregada`)
          }
        }
        img.src = event.target?.result as string
      }
      reader.readAsDataURL(file)
    }
  }

  const eliminarFoto = (index: number) => {
    setFotos((prev) => prev.filter((_, idx) => idx !== index))
    toast.info("Foto eliminada")
  }

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

      // Usar la función correspondiente según si hay fotos o no
      const response = fotos.length > 0
        ? await registrarHallazgoConFotos(payload, fotos.map((f) => f.archivo), token)
        : await registrarHallazgo(payload, token)

      // Guardar la respuesta
      setHallazgoCreado(response)

      // Cerrar el dialog de registro
      onOpenChange(false)

      // Ejecutar callback de refresh
      onHallazgoRegistrado?.()

      // Mostrar dialog de confirmación
      setShowConfirmacion(true)
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
              <p className="text-xs text-amber-600 dark:text-amber-400">La descripción es obligatoria</p>
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

            <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900">
              <Info className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <AlertDescription className="text-amber-900 dark:text-amber-300 text-sm block">
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
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                <span className="font-medium text-gray-700 dark:text-gray-300">Costo Total Estimado:</span>
                <span className="text-lg font-bold text-primary">${costoTotal.toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* Evidencia Fotográfica */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Evidencia Fotográfica (Opcional)</Label>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900">
                {fotos.length} / {MAX_FOTOS_HALLAZGO} fotos
              </Badge>
            </div>

            {/* Miniaturas de fotos capturadas */}
            {fotos.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <AnimatePresence>
                  {fotos.map((foto, idx) => (
                    <motion.div
                      key={`foto-${idx}`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="relative group"
                    >
                      <img
                        src={foto.preview}
                        alt={`Foto ${idx + 1}`}
                        className="w-full aspect-video object-cover rounded-lg border-2 border-gray-200 dark:border-gray-700"
                      />
                      <Badge className="absolute bottom-2 left-2 bg-black/70">{idx + 1}</Badge>
                      <button
                        type="button"
                        onClick={() => eliminarFoto(idx)}
                        disabled={isGuardando}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Eliminar foto"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Cámara activa */}
            {cameraActive && (
              <div className="space-y-4">
                <div className="relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full rounded-lg bg-black aspect-video object-cover"
                  />
                </div>
                <canvas ref={canvasRef} className="hidden" />

                <div className="space-y-3">
                  <p className="text-xs text-center text-muted-foreground">
                    También puedes elegir una foto desde tus archivos
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-transparent dark:border-gray-700 dark:hover:bg-gray-800"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isCapturing || isGuardando}
                    >
                      <ImagePlus className="mr-2 h-4 w-4" />
                      Elegir Archivo
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                    <Button
                      onClick={capturarFoto}
                      disabled={isCapturing || isGuardando}
                      size="sm"
                      className="flex-1 bg-primary hover:bg-primary/90"
                    >
                      {isCapturing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Capturando...
                        </>
                      ) : (
                        <>
                          <Camera className="mr-2 h-4 w-4" />
                          Capturar
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Botones de control de cámara */}
            {!cameraActive && fotos.length < MAX_FOTOS_HALLAZGO && (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={iniciarCamara}
                disabled={isGuardando}
              >
                <Camera className="mr-2 h-4 w-4" />
                {fotos.length === 0 ? "Capturar Fotos" : `Agregar más fotos (${fotos.length}/${MAX_FOTOS_HALLAZGO})`}
              </Button>
            )}

            {cameraActive && (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={detenerCamara}
                disabled={isGuardando}
              >
                <X className="mr-2 h-4 w-4" />
                Cerrar Cámara
              </Button>
            )}

            {fotos.length >= MAX_FOTOS_HALLAZGO && (
              <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900">
                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertDescription className="text-blue-900 dark:text-blue-300 text-sm block">
                  Has alcanzado el límite máximo de {MAX_FOTOS_HALLAZGO} fotos. Puedes eliminar algunas para agregar nuevas.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Requiere Autorización */}
          <div className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-900 dark:border-gray-800">
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
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 dark:bg-gray-900 dark:border-gray-800 space-y-3">
                <p className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Resumen del Hallazgo
                </p>
                <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
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
                  {fotos.length > 0 && (
                    <p><strong>Fotos adjuntas:</strong> {fotos.length}</p>
                  )}
                  <p><strong>Requiere autorización:</strong> {requiereAutorizacion ? "Sí" : "No"}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
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
          <Button onClick={handleGuardar} disabled={!puedeGuardar || isGuardando} className="bg-primary hover:bg-primary/90">
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

      <ConfirmacionHallazgoDialog
        open={showConfirmacion}
        onOpenChange={setShowConfirmacion}
        hallazgo={hallazgoCreado}
      />
    </>
  )
}
