"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Check,
  Clock,
  Play,
  Camera,
  Mic,
  ChevronDown,
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { PhaseTimelineItem } from "@/lib/fixtures/technical-progress"
import { PHASE_CONFIG, formatDuration } from "@/lib/fixtures/technical-progress"
import { cn } from "@/lib/utils"

interface PhaseTimelineProps {
  phases: PhaseTimelineItem[]
  onCompletePhase: (phaseId: string, data: PhaseCompletionData) => Promise<void>
}

interface PhaseCompletionData {
  observaciones: string
  evidencia: File[]
}

export function PhaseTimeline({ phases, onCompletePhase }: PhaseTimelineProps) {
  const [selectedPhase, setSelectedPhase] = useState<PhaseTimelineItem | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [observaciones, setObservaciones] = useState("")
  const [evidencia, setEvidencia] = useState<File[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set())

  const handleOpenComplete = (phase: PhaseTimelineItem) => {
    setSelectedPhase(phase)
    setObservaciones("")
    setEvidencia([])
    setIsDialogOpen(true)
  }

  const handleComplete = async () => {
    if (!selectedPhase) return

    setIsSubmitting(true)
    try {
      await onCompletePhase(selectedPhase.id, { observaciones, evidencia })
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error completing phase:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      setEvidencia([...evidencia, ...Array.from(files)])
    }
  }

  const toggleVoiceRecording = () => {
    // TODO: Implement voice recording
    setIsRecording(!isRecording)
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

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Fases del Servicio</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
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
        </CardContent>
      </Card>

      {/* Complete Phase Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Finalizar {selectedPhase && PHASE_CONFIG[selectedPhase.fase].label}
            </DialogTitle>
            <DialogDescription>
              Agrega observaciones y evidencia antes de continuar con la siguiente fase.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Observations textarea */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Observaciones</label>
                <Button
                  variant={isRecording ? "destructive" : "outline"}
                  size="sm"
                  onClick={toggleVoiceRecording}
                  className="h-8 gap-1.5"
                >
                  <Mic className={cn("h-4 w-4", isRecording && "animate-pulse")} />
                  {isRecording ? "Grabando..." : "Dictar"}
                </Button>
              </div>
              <Textarea
                placeholder="Describe las observaciones de esta fase..."
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                className="min-h-24 resize-none"
              />
            </div>

            {/* Evidence upload */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Evidencia Fotográfica
              </label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  id="evidence-upload"
                />
                <label
                  htmlFor="evidence-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                    <Camera className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Tomar o subir fotos</p>
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG hasta 10MB
                    </p>
                  </div>
                </label>
              </div>

              {/* Preview uploaded files */}
              {evidencia.length > 0 && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                  {evidencia.map((file, idx) => (
                    <div
                      key={idx}
                      className="h-16 w-16 rounded-lg overflow-hidden border shrink-0 bg-muted relative"
                    >
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${idx + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <button
                        onClick={() => setEvidencia(evidencia.filter((_, i) => i !== idx))}
                        className="absolute top-0.5 right-0.5 h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleComplete} disabled={isSubmitting}>
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
    </>
  )
}

