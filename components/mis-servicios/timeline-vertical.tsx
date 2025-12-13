"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Check,
  Circle,
  Clock,
  Image as ImageIcon,
  Mic,
  FileText,
  ChevronDown,
  User
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { TimelineEvent, TimelineEvidence } from "@/lib/mis-servicios/types"
import { cn } from "@/lib/utils"

interface TimelineVerticalProps {
  events: TimelineEvent[]
  simplified?: boolean // For customer vs technician view
  className?: string
}

interface EvidenceThumbnailProps {
  evidence: TimelineEvidence
  onClick: () => void
}

function EvidenceThumbnail({ evidence, onClick }: EvidenceThumbnailProps) {
  const iconMap = {
    foto: ImageIcon,
    video: ImageIcon,
    audio: Mic,
    documento: FileText,
  }
  const Icon = iconMap[evidence.tipo]

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="relative h-14 w-14 sm:h-16 sm:w-16 rounded-lg overflow-hidden border border-border bg-muted hover:border-primary transition-colors"
    >
      {evidence.tipo === "foto" || evidence.tipo === "video" ? (
        <img
          src={evidence.thumbnail || evidence.url}
          alt={evidence.descripcion || "Evidencia"}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="h-full w-full flex items-center justify-center">
          <Icon className="h-6 w-6 text-muted-foreground" />
        </div>
      )}
    </motion.button>
  )
}

function EvidenceModal({
  evidence,
  open,
  onClose
}: {
  evidence: TimelineEvidence | null
  open: boolean
  onClose: () => void
}) {
  if (!evidence) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{evidence.descripcion || "Evidencia"}</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          {(evidence.tipo === "foto" || evidence.tipo === "video") && (
            <img
              src={evidence.url}
              alt={evidence.descripcion || "Evidencia"}
              className="w-full rounded-lg"
            />
          )}
          {evidence.tipo === "audio" && (
            <div className="p-4 bg-muted rounded-lg">
              <audio controls className="w-full">
                <source src={evidence.url} />
              </audio>
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-2">
            {new Date(evidence.fecha).toLocaleString("es-EC")}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function TimelineVertical({ events, simplified = true, className }: TimelineVerticalProps) {
  const [selectedEvidence, setSelectedEvidence] = useState<TimelineEvidence | null>(null)
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set())

  const toggleExpanded = (eventId: string) => {
    setExpandedEvents((prev) => {
      const next = new Set(prev)
      if (next.has(eventId)) {
        next.delete(eventId)
      } else {
        next.add(eventId)
      }
      return next
    })
  }

  // Format time
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString("es-EC", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("es-EC", {
      day: "numeric",
      month: "short",
    })
  }

  return (
    <>
      <div className={cn("relative", className)}>
        {events.map((event, index) => {
          const isLast = index === events.length - 1
          const isExpanded = expandedEvents.has(event.id)
          const hasDetails = !simplified && (event.notas || event.responsable)

          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative pl-8 pb-8"
            >
              {/* Timeline line */}
              {!isLast && (
                <div
                  className={cn(
                    "absolute left-[11px] top-6 w-0.5 h-[calc(100%-16px)]",
                    event.completada
                      ? "bg-primary"
                      : event.enProgreso
                        ? "bg-gradient-to-b from-primary to-muted"
                        : "bg-muted"
                  )}
                />
              )}

              {/* Timeline dot */}
              <div className="absolute left-0 top-1">
                {event.completada ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="h-6 w-6 rounded-full bg-primary flex items-center justify-center"
                  >
                    <Check className="h-3.5 w-3.5 text-primary-foreground" />
                  </motion.div>
                ) : event.enProgreso ? (
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="h-6 w-6 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center"
                  >
                    <Circle className="h-2 w-2 fill-primary text-primary" />
                  </motion.div>
                ) : (
                  <div className="h-6 w-6 rounded-full bg-muted border-2 border-border flex items-center justify-center">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div
                className={cn(
                  "rounded-lg border p-4 transition-colors",
                  event.completada
                    ? "bg-card border-border"
                    : event.enProgreso
                      ? "bg-primary/5 border-primary/30"
                      : "bg-muted/50 border-border"
                )}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div>
                    <h4 className={cn(
                      "font-semibold text-sm sm:text-base",
                      !event.completada && !event.enProgreso && "text-muted-foreground"
                    )}>
                      {event.fase}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(event.fecha)} • {formatTime(event.fecha)}
                    </p>
                  </div>

                  {event.enProgreso && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-primary text-primary-foreground rounded-full">
                      En curso
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className={cn(
                  "text-sm mt-2",
                  !event.completada && !event.enProgreso && "text-muted-foreground"
                )}>
                  {event.descripcion}
                </p>

                {/* Expandable details button */}
                {hasDetails && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpanded(event.id)}
                    className="mt-2 -ml-2 h-8 text-xs"
                  >
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 mr-1 transition-transform",
                        isExpanded && "rotate-180"
                      )}
                    />
                    {isExpanded ? "Menos detalles" : "Más detalles"}
                  </Button>
                )}

                {/* Expanded details */}
                <AnimatePresence>
                  {isExpanded && hasDetails && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-3 mt-3 border-t space-y-2">
                        {event.responsable && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <User className="h-3.5 w-3.5" />
                            <span>Responsable: {event.responsable}</span>
                          </div>
                        )}
                        {event.notas && (
                          <p className="text-xs text-muted-foreground">
                            {event.notas}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Evidence thumbnails */}
                {event.evidencia && event.evidencia.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-muted-foreground mb-2">
                      Evidencia ({event.evidencia.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {event.evidencia.map((ev) => (
                        <EvidenceThumbnail
                          key={ev.id}
                          evidence={ev}
                          onClick={() => setSelectedEvidence(ev)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Evidence modal */}
      <EvidenceModal
        evidence={selectedEvidence}
        open={!!selectedEvidence}
        onClose={() => setSelectedEvidence(null)}
      />
    </>
  )
}

