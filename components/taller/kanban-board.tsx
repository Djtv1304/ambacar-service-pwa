"use client"

import { motion } from "framer-motion"
import { Clock, AlertTriangle, Car } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import Link from "next/link"
import type { KanbanBoard, KanbanCard, WorkOrderPhase } from "@/lib/fixtures/technical-progress"
import { PHASE_CONFIG, formatDuration } from "@/lib/fixtures/technical-progress"
import { cn } from "@/lib/utils"

interface KanbanBoardViewProps {
  board: KanbanBoard
}

interface KanbanColumnProps {
  phase: WorkOrderPhase
  cards: KanbanCard[]
}

interface KanbanCardItemProps {
  card: KanbanCard
}

// Brand icons mapping (simplified)
const BRAND_COLORS: Record<string, string> = {
  Toyota: "bg-red-500",
  Chevrolet: "bg-yellow-500",
  Kia: "bg-red-600",
  Hyundai: "bg-blue-500",
  Mazda: "bg-red-700",
  Nissan: "bg-red-600",
  Ford: "bg-blue-600",
  Suzuki: "bg-blue-500",
}

function KanbanCardItem({ card }: KanbanCardItemProps) {
  const brandColor = BRAND_COLORS[card.marca] || "bg-gray-500"
  const initials = card.tecnicoNombre.split(" ").map(n => n[0]).join("").slice(0, 2)

  return (
    <Link href={`/dashboard/taller/${card.ordenId}`}>
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Card
          className={cn(
            "cursor-pointer transition-shadow hover:shadow-md",
            card.alertaRetraso && "border-l-4 border-l-red-500"
          )}
        >
          <CardContent className="p-3">
            {/* Header - Plate + Brand */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={cn("h-6 w-6 rounded flex items-center justify-center", brandColor)}>
                  <Car className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="font-bold font-mono text-sm">{card.placa}</span>
              </div>
              {card.prioridad === "alta" && (
                <Badge variant="destructive" className="h-5 text-[10px]">
                  Alta
                </Badge>
              )}
            </div>

            {/* Vehicle model */}
            <p className="text-xs text-muted-foreground mb-2">
              {card.marca} {card.modelo}
            </p>

            {/* Problem description */}
            <p className="text-xs line-clamp-2 mb-3">
              {card.problemaBreve}
            </p>

            {/* Footer - Technician + Time */}
            <div className="flex items-center justify-between">
              {/* Technician */}
              <div className="flex items-center gap-1.5">
                <Avatar className="h-5 w-5">
                  <AvatarFallback className="text-[10px] bg-primary/10">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground truncate max-w-20">
                  {card.tecnicoNombre.split(" ")[0]}
                </span>
              </div>

              {/* Time in phase */}
              <div className={cn(
                "flex items-center gap-1 text-xs",
                card.alertaRetraso ? "text-red-600 font-medium" : "text-muted-foreground"
              )}>
                {card.alertaRetraso ? (
                  <AlertTriangle className="h-3 w-3" />
                ) : (
                  <Clock className="h-3 w-3" />
                )}
                <span>{formatDuration(card.tiempoEnFaseMinutos)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  )
}

function KanbanColumn({ phase, cards }: KanbanColumnProps) {
  const config = PHASE_CONFIG[phase]
  const delayedCount = cards.filter(c => c.alertaRetraso).length

  return (
    <div className="flex-shrink-0 w-72 flex flex-col h-full">
      {/* Column Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-muted/50 rounded-t-lg border border-b-0">
        <h3 className="font-semibold text-sm">{config.label}</h3>
        <div className="flex items-center gap-1.5">
          <Badge variant="secondary" className="h-5 text-xs font-normal">
            {cards.length}
          </Badge>
          {delayedCount > 0 && (
            <Badge variant="destructive" className="h-5 text-xs font-normal">
              {delayedCount} ⚠
            </Badge>
          )}
        </div>
      </div>

      {/* Cards container */}
      <div className="flex-1 border rounded-b-lg bg-muted/20 p-2 overflow-y-auto">
        <div className="space-y-2">
          {cards.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              Sin vehículos
            </div>
          ) : (
            cards.map((card) => (
              <KanbanCardItem key={card.id} card={card} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export function KanbanBoardView({ board }: KanbanBoardViewProps) {
  const phases: WorkOrderPhase[] = ["recepcion", "diagnostico", "reparacion", "calidad", "entrega"]
  const totalDelayed = Object.values(board.columnas)
    .flat()
    .filter(c => c.alertaRetraso).length

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tablero de Taller</h1>
          <p className="text-sm text-muted-foreground">
            {board.totalOrdenes} órdenes activas
          </p>
        </div>
        {totalDelayed > 0 && (
          <Badge variant="destructive" className="gap-1">
            <AlertTriangle className="h-3.5 w-3.5" />
            {totalDelayed} con retraso
          </Badge>
        )}
      </div>

      {/* Kanban Board - Horizontal scroll */}
      <ScrollArea className="w-full">
        <div className="flex gap-4 pb-4 h-[calc(100vh-200px)] min-h-96">
          {phases.map((phase) => (
            <KanbanColumn
              key={phase}
              phase={phase}
              cards={board.columnas[phase] || []}
            />
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  )
}

