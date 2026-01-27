"use client"

import { useState, useEffect, useMemo, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Check,
  Clock,
  Play,
  Camera,
  Mic,
  ChevronDown,
  Loader2,
  ClipboardList,
  User,
  Search,
  Upload,
  ImagePlus,
  X,
  MicOff,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import type { PhaseTimelineItem } from "@/lib/fixtures/technical-progress"
import { PHASE_CONFIG, formatDuration } from "@/lib/fixtures/technical-progress"
import { getAsesoresTecnicos, type Empleado } from "@/lib/api/erp-ambacar"
import { CURRENT_TALLER_ID } from "@/lib/constants/taller"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface PhaseTimelineProps {
  phases: PhaseTimelineItem[]
  onCompletePhase: (phaseId: string, data: PhaseCompletionData) => Promise<void>
  currentTecnicoId?: string
  currentTecnicoNombre?: string
}

export interface PhaseCompletionData {
  observaciones: string
  evidencia: File[]
  responsable_id: number
}

interface EvidenciaPreview {
  file: File
  preview: string
}

// ============================================
// Helper function for title case
// ============================================

function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

// ============================================
// Technician Selector Popover
// ============================================

interface TecnicoSelectorProps {
  selectedTecnico: Empleado | null
  onSelect: (empleado: Empleado) => void
  children: React.ReactNode
}

function TecnicoSelector({ selectedTecnico, onSelect, children }: TecnicoSelectorProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [empleados, setEmpleados] = useState<Empleado[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return

    const fetchEmpleados = async () => {
      setLoading(true)
      try {
        const data = await getAsesoresTecnicos(CURRENT_TALLER_ID)
        setEmpleados(data)
      } catch (error) {
        console.error("Error fetching tecnicos:", error)
        toast.error("Error al cargar técnicos")
      } finally {
        setLoading(false)
      }
    }

    fetchEmpleados()
  }, [open])

  const filtered = useMemo(() => {
    if (!search.trim()) return empleados
    const q = search.toLowerCase()
    return empleados.filter((e) =>
      e.nombreEmpleado.toLowerCase().includes(q)
    )
  }, [empleados, search])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0 overflow-hidden" align="start" side="bottom">
        <div className="p-2 border-b dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar técnico..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pl-8 text-sm dark:bg-gray-800 dark:border-gray-700"
            />
          </div>
        </div>
        <div className="max-h-52 overflow-y-auto p-1">
          {loading ? (
            <div className="py-4 text-center text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
              Cargando...
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-4 text-center text-sm text-muted-foreground">
              Sin resultados
            </div>
          ) : (
            filtered.map((empleado) => {
              const isSelected = selectedTecnico?.idEmpleado === empleado.idEmpleado
              const initials = empleado.nombreEmpleado
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()

              return (
                <button
                  key={empleado.idEmpleado}
                  className={cn(
                    "w-full flex items-center gap-2 px-2 py-2 text-sm rounded hover:bg-accent text-left",
                    isSelected && "bg-primary/10"
                  )}
                  onClick={() => {
                    onSelect(empleado)
                    setOpen(false)
                    setSearch("")
                  }}
                >
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-[10px] bg-primary/10">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate flex-1">{toTitleCase(empleado.nombreEmpleado)}</span>
                  {isSelected && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                </button>
              )
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

// ============================================
// Photo Choice Dialog
// ============================================

interface PhotoChoiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onChoose: (choice: "camera" | "upload") => void
}

function PhotoChoiceDialog({ open, onOpenChange, onChoose }: PhotoChoiceDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Agregar Evidencia</DialogTitle>
          <DialogDescription>
            Selecciona cómo deseas agregar la evidencia fotográfica
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 py-4">
          <Button
            variant="outline"
            className="h-auto py-4 px-4 justify-start gap-4"
            onClick={() => {
              onChoose("camera")
              onOpenChange(false)
            }}
          >
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Camera className="h-5 w-5 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-sm">Tomar Foto</p>
              <p className="text-xs text-muted-foreground">
                Usa la cámara del dispositivo
              </p>
            </div>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-4 px-4 justify-start gap-4"
            onClick={() => {
              onChoose("upload")
              onOpenChange(false)
            }}
          >
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
              <Upload className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-sm">Subir Archivo</p>
              <p className="text-xs text-muted-foreground">
                Selecciona desde tus archivos
              </p>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ============================================
// Simple Camera Dialog
// ============================================

interface SimpleCameraDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCapture: (files: File[]) => void
}

function SimpleCameraDialog({ open, onOpenChange, onCapture }: SimpleCameraDialogProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [isCapturing, setIsCapturing] = useState(false)
  const [capturedPhotos, setCapturedPhotos] = useState<{ file: File; preview: string }[]>([])

  const limpiarCamara = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      const tracks = stream.getTracks()
      tracks.forEach((track) => track.stop())
      videoRef.current.srcObject = null
    }
    setCameraActive(false)
  }, [])

  useEffect(() => {
    if (!open) {
      limpiarCamara()
      setCapturedPhotos([])
    }

    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        const tracks = stream.getTracks()
        tracks.forEach((track) => track.stop())
      }
    }
  }, [open, limpiarCamara])

  const iniciarCamara = useCallback(async () => {
    setCameraActive(true)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
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
  }, [])

  const capturarFoto = useCallback(async () => {
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
            const file = new File([blob], `evidencia-${Date.now()}.jpg`, {
              type: "image/jpeg",
            })
            const preview = canvasRef.current?.toDataURL() || ""
            setCapturedPhotos((prev) => [...prev, { file, preview }])
          }
        }, "image/jpeg", 0.9)
      }
    } finally {
      setIsCapturing(false)
    }
  }, [])

  const handleConfirm = () => {
    onCapture(capturedPhotos.map((p) => p.file))
    onOpenChange(false)
  }

  const handleRemovePhoto = (index: number) => {
    setCapturedPhotos((prev) => prev.filter((_, i) => i !== index))
  }

  useEffect(() => {
    if (open && !cameraActive && capturedPhotos.length === 0) {
      iniciarCamara()
    }
  }, [open, cameraActive, capturedPhotos.length, iniciarCamara])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Capturar Evidencia</DialogTitle>
          <DialogDescription>
            Toma fotos de la evidencia para esta fase
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {cameraActive && (
            <div className="space-y-4">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full rounded-lg bg-black aspect-video object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />

              <Button
                onClick={capturarFoto}
                disabled={isCapturing}
                className="w-full"
              >
                {isCapturing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Capturando...
                  </>
                ) : (
                  <>
                    <Camera className="mr-2 h-4 w-4" />
                    Capturar Foto
                  </>
                )}
              </Button>
            </div>
          )}

          {capturedPhotos.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">
                Fotos capturadas ({capturedPhotos.length})
              </p>
              <div className="grid grid-cols-3 gap-2">
                {capturedPhotos.map((photo, idx) => (
                  <div key={idx} className="relative">
                    <img
                      src={photo.preview}
                      alt={`Captura ${idx + 1}`}
                      className="w-full aspect-square object-cover rounded-lg"
                    />
                    <button
                      onClick={() => handleRemovePhoto(idx)}
                      className="absolute top-1 right-1 h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          {capturedPhotos.length > 0 && (
            <Button onClick={handleConfirm} className="bg-green-600 hover:bg-green-700">
              <Check className="mr-2 h-4 w-4" />
              Usar {capturedPhotos.length} Foto{capturedPhotos.length !== 1 ? "s" : ""}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ============================================
// Main Phase Timeline Component
// ============================================

export function PhaseTimeline({
  phases,
  onCompletePhase,
  currentTecnicoId,
  currentTecnicoNombre,
}: PhaseTimelineProps) {
  const [selectedPhase, setSelectedPhase] = useState<PhaseTimelineItem | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [observaciones, setObservaciones] = useState("")
  const [evidencia, setEvidencia] = useState<EvidenciaPreview[]>([])
  const [selectedTecnico, setSelectedTecnico] = useState<Empleado | null>(null)
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set())

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const recognitionRef = useRef<any>(null)

  // Photo dialogs state
  const [photoChoiceOpen, setPhotoChoiceOpen] = useState(false)
  const [cameraDialogOpen, setCameraDialogOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Initialize selected tecnico when dialog opens
  useEffect(() => {
    if (isDialogOpen && currentTecnicoId && currentTecnicoNombre) {
      setSelectedTecnico({
        idEmpleado: parseInt(currentTecnicoId, 10),
        nombreEmpleado: currentTecnicoNombre,
      })
    }
  }, [isDialogOpen, currentTecnicoId, currentTecnicoNombre])

  const handleOpenComplete = (phase: PhaseTimelineItem) => {
    setSelectedPhase(phase)
    setObservaciones("")
    setEvidencia([])
    setSelectedTecnico(null)
    setIsDialogOpen(true)
  }

  const handleComplete = async () => {
    if (!selectedPhase) return

    if (!selectedTecnico) {
      toast.error("Selecciona un responsable", {
        description: "Debes seleccionar al técnico responsable de esta fase",
      })
      return
    }

    setIsSubmitting(true)
    try {
      await onCompletePhase(selectedPhase.id, {
        observaciones,
        evidencia: evidencia.map((e) => e.file),
        responsable_id: selectedTecnico.idEmpleado,
      })
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error completing phase:", error)
      toast.error("Error al completar la fase", {
        description: error instanceof Error ? error.message : "Intenta de nuevo",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Voice recording handlers
  const startVoiceRecording = useCallback(() => {
    // Check for browser support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      toast.error("Navegador no compatible", {
        description: "Tu navegador no soporta reconocimiento de voz. Usa Chrome o Edge.",
      })
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = "es-EC"

    recognition.onstart = () => {
      setIsRecording(true)
      setIsTranscribing(false)
    }

    recognition.onresult = (event: any) => {
      let transcript = ""
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript
      }

      // Update observaciones with the transcript
      if (event.results[event.resultIndex].isFinal) {
        setObservaciones((prev) => {
          const separator = prev.trim() ? " " : ""
          return prev + separator + transcript
        })
      }
    }

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error)
      setIsRecording(false)

      if (event.error === "not-allowed") {
        toast.error("Permiso denegado", {
          description: "Por favor permite el acceso al micrófono para usar esta función",
        })
      } else if (event.error === "no-speech") {
        toast.info("No se detectó voz", {
          description: "Intenta hablar más cerca del micrófono",
        })
      }
    }

    recognition.onend = () => {
      setIsRecording(false)
      setIsTranscribing(false)
    }

    recognitionRef.current = recognition
    recognition.start()
  }, [])

  const stopVoiceRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    setIsRecording(false)
  }, [])

  const toggleVoiceRecording = () => {
    if (isRecording) {
      stopVoiceRecording()
    } else {
      startVoiceRecording()
    }
  }

  // Cleanup voice recording on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  // Photo handlers
  const handlePhotoChoice = (choice: "camera" | "upload") => {
    if (choice === "camera") {
      setCameraDialogOpen(true)
    } else {
      fileInputRef.current?.click()
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const newEvidencia: EvidenciaPreview[] = Array.from(files).map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }))
      setEvidencia([...evidencia, ...newEvidencia])
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleCameraCapture = (files: File[]) => {
    const newEvidencia: EvidenciaPreview[] = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }))
    setEvidencia([...evidencia, ...newEvidencia])
  }

  const handleRemoveEvidencia = (index: number) => {
    setEvidencia((prev) => {
      // Revoke URL to prevent memory leaks
      URL.revokeObjectURL(prev[index].preview)
      return prev.filter((_, i) => i !== index)
    })
  }

  const toggleExpanded = (phaseId: string) => {
    const newExpanded = new Set(expandedPhases)
    if (newExpanded.has(phaseId)) {
      newExpanded.delete(phaseId)
    } else {
      newExpanded.add(phaseId)
    }
    setExpandedPhases(newExpanded)
  }

  // Cleanup URLs on unmount
  useEffect(() => {
    return () => {
      evidencia.forEach((e) => URL.revokeObjectURL(e.preview))
    }
  }, [])

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">Fases del Servicio</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {phases.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
              <div className="h-16 w-16 rounded-full bg-muted/50 dark:bg-muted/30 flex items-center justify-center mb-4">
                <Clock className="h-8 w-8 text-muted-foreground/50 dark:text-muted-foreground/40" />
              </div>
              <h3 className="font-medium text-sm mb-1 dark:text-gray-200">
                Fases en configuración
              </h3>
              <p className="text-xs text-muted-foreground dark:text-muted-foreground/80 max-w-[280px]">
                Las fases del servicio se configurarán próximamente y aparecerán aquí.
              </p>
            </div>
          ) : (
            <div className="relative">
              {phases.map((phase, index) => {
              const isLast = index === phases.length - 1
              const config = PHASE_CONFIG[phase.fase]
              const isExpanded = expandedPhases.has(phase.id)
              const hasEvidence = phase.evidencia && phase.evidencia.length > 0

              return (
                <div key={phase.id} className="relative pl-8 pb-6">
                  {/* Connecting line */}
                  {!isLast && (
                    <div
                      className={cn(
                        "absolute left-[11px] top-6 w-0.5 h-[calc(100%-8px)]",
                        phase.estado === "completed"
                          ? "bg-green-500"
                          : phase.estado === "in_progress"
                            ? "bg-gradient-to-b from-green-500 to-muted"
                            : "bg-muted"
                      )}
                    />
                  )}

                  {/* Phase indicator */}
                  <div className="absolute left-0 top-0">
                    {phase.estado === "completed" ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center"
                      >
                        <Check className="h-3.5 w-3.5 text-white" />
                      </motion.div>
                    ) : phase.estado === "in_progress" ? (
                      <div className="relative">
                        <motion.div
                          className="absolute inset-0 h-6 w-6 rounded-full bg-primary/30"
                          animate={{ scale: [1, 1.5, 1.5], opacity: [0.6, 0, 0] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                        />
                        <div className="relative h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                          <Play className="h-3 w-3 text-white ml-0.5" />
                        </div>
                      </div>
                    ) : (
                      <div className="h-6 w-6 rounded-full bg-muted border-2 border-border flex items-center justify-center">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Phase content */}
                  <div
                    className={cn(
                      "rounded-lg border p-3 transition-all",
                      phase.estado === "completed"
                        ? "bg-green-500/5 border-green-500/20"
                        : phase.estado === "in_progress"
                          ? "bg-primary/5 border-primary/30 shadow-sm"
                          : "bg-muted/30 border-border"
                    )}
                  >
                    {/* Header row */}
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <h4 className={cn(
                          "font-semibold text-sm",
                          phase.estado === "pending" && "text-muted-foreground"
                        )}>
                          {config.label}
                        </h4>
                        {phase.duracionMinutos !== undefined && (
                          <p className="text-xs text-muted-foreground">
                            {formatDuration(phase.duracionMinutos)}
                            {phase.estado === "in_progress" && " (en curso)"}
                          </p>
                        )}
                      </div>

                      {/* Action button for in-progress phase */}
                      {phase.estado === "in_progress" && (
                        <Button
                          size="sm"
                          onClick={() => handleOpenComplete(phase)}
                          className="h-8"
                        >
                          Finalizar
                        </Button>
                      )}

                      {/* Expand button for completed phases with content */}
                      {phase.estado === "completed" && (phase.observaciones || hasEvidence) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpanded(phase.id)}
                          className="h-7 px-2"
                        >
                          <ChevronDown className={cn(
                            "h-4 w-4 transition-transform",
                            isExpanded && "rotate-180"
                          )} />
                        </Button>
                      )}
                    </div>

                    {/* Expanded content for completed phases */}
                    {phase.estado === "completed" && isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-3 pt-3 border-t border-green-500/20"
                      >
                        {phase.observaciones && (
                          <div className="mb-3">
                            <p className="text-xs font-medium text-muted-foreground mb-1">
                              Observaciones
                            </p>
                            <p className="text-sm">{phase.observaciones}</p>
                          </div>
                        )}

                        {hasEvidence && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-2">
                              Evidencia ({phase.evidencia!.length})
                            </p>
                            <div className="flex gap-2 overflow-x-auto pb-1">
                              {phase.evidencia!.map((ev) => (
                                <div
                                  key={ev.id}
                                  className="h-16 w-16 rounded-lg overflow-hidden border shrink-0 bg-muted"
                                >
                                  <img
                                    src={ev.url}
                                    alt={ev.descripcion || "Evidencia"}
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>
                </div>
              )
            })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Complete Phase Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Finalizar {selectedPhase && PHASE_CONFIG[selectedPhase.fase].label}
            </DialogTitle>
            <DialogDescription>
              Agrega observaciones y evidencia antes de continuar con la siguiente fase.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Responsable selector */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Responsable <span className="text-red-500">*</span>
              </label>
              <TecnicoSelector
                selectedTecnico={selectedTecnico}
                onSelect={setSelectedTecnico}
              >
                <Button
                  variant="outline"
                  className="w-full justify-between h-10 dark:bg-gray-800 dark:border-gray-700"
                >
                  {selectedTecnico ? (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-5 w-5">
                        <AvatarFallback className="text-[10px] bg-primary/10">
                          {selectedTecnico.nombreEmpleado
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{toTitleCase(selectedTecnico.nombreEmpleado)}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">Seleccionar técnico...</span>
                  )}
                  <User className="h-4 w-4 text-muted-foreground" />
                </Button>
              </TecnicoSelector>
            </div>

            {/* Observations textarea */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Observaciones</label>
                <Button
                  variant={isRecording ? "destructive" : "outline"}
                  size="sm"
                  onClick={toggleVoiceRecording}
                  className="h-8 gap-1.5"
                  disabled={isTranscribing}
                >
                  {isRecording ? (
                    <>
                      <MicOff className="h-4 w-4" />
                      Detener
                    </>
                  ) : isTranscribing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <Mic className="h-4 w-4" />
                      Dictar
                    </>
                  )}
                </Button>
              </div>
              <div className="relative">
                <Textarea
                  placeholder="Describe las observaciones de esta fase..."
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  className="min-h-24 resize-none dark:bg-gray-800 dark:border-gray-700"
                />
                {isRecording && (
                  <div className="absolute bottom-2 right-2">
                    <Badge variant="destructive" className="gap-1 animate-pulse">
                      <span className="h-2 w-2 rounded-full bg-white animate-ping" />
                      Grabando...
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            {/* Evidence upload */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Evidencia Fotográfica
              </label>
              <div
                onClick={() => setPhotoChoiceOpen(true)}
                className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer dark:border-gray-700 dark:hover:border-primary/50"
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="h-12 w-12 rounded-full bg-muted dark:bg-gray-800 flex items-center justify-center">
                    <ImagePlus className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Tomar o subir fotos</p>
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG hasta 10MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Hidden file input for upload */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />

              {/* Preview uploaded files */}
              {evidencia.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-muted-foreground mb-2">
                    {evidencia.length} foto{evidencia.length !== 1 ? "s" : ""} seleccionada{evidencia.length !== 1 ? "s" : ""}
                  </p>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {evidencia.map((ev, idx) => (
                      <div
                        key={idx}
                        className="h-16 w-16 rounded-lg overflow-hidden border shrink-0 bg-muted relative group"
                      >
                        <img
                          src={ev.preview}
                          alt={`Preview ${idx + 1}`}
                          className="h-full w-full object-cover"
                        />
                        <button
                          onClick={() => handleRemoveEvidencia(idx)}
                          className="absolute top-0.5 right-0.5 h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleComplete} disabled={isSubmitting || !selectedTecnico}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar y Avanzar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Photo Choice Dialog */}
      <PhotoChoiceDialog
        open={photoChoiceOpen}
        onOpenChange={setPhotoChoiceOpen}
        onChoose={handlePhotoChoice}
      />

      {/* Camera Dialog */}
      <SimpleCameraDialog
        open={cameraDialogOpen}
        onOpenChange={setCameraDialogOpen}
        onCapture={handleCameraCapture}
      />
    </>
  )
}
