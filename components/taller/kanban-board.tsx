"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import {
  Clock, AlertTriangle, Car, Calendar, UserPlus, Wrench, Building2,
  Search, Check, User,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import type { WorkOrderPhase } from "@/lib/fixtures/technical-progress"
import type { KanbanBoardAPI as KanbanBoard, KanbanCardAPI as KanbanCard, KanbanCitaCard } from "@/lib/api/taller"
import { PHASE_CONFIG, formatDuration } from "@/lib/fixtures/technical-progress"
import { getAsesoresServicio, getAsesoresTecnicos, type Empleado } from "@/lib/api/erp-ambacar"
import { CURRENT_TALLER_ID } from "@/lib/constants/taller"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface KanbanBoardViewProps {
  board: KanbanBoard
}

// Brand icons mapping
const BRAND_COLORS: Record<string, string> = {
  Toyota: "bg-red-500",
  Chevrolet: "bg-yellow-500",
  Kia: "bg-red-600",
  Hyundai: "bg-blue-500",
  Mazda: "bg-red-700",
  Nissan: "bg-red-600",
  Ford: "bg-blue-600",
  Suzuki: "bg-blue-500",
  GWM: "bg-red-600",
  BYD: "bg-green-600",
  HAVAL: "bg-red-600",
}

function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

// ============================================
// Perspective Dialog - Choose view for OT card
// ============================================

interface PerspectiveDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  card: KanbanCard | null
}

function PerspectiveDialog({ open, onOpenChange, card }: PerspectiveDialogProps) {
  const router = useRouter()

  if (!card) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            {card.placa} - {card.marca} {card.modelo}
          </DialogTitle>
          <DialogDescription>
            Selecciona la perspectiva para ver esta orden
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 py-4">
          <Button
            variant="outline"
            className="h-auto py-4 px-4 justify-start gap-4"
            onClick={() => {
              router.push(`/dashboard/taller/${card.ordenId}`)
              onOpenChange(false)
            }}
          >
            <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
              <Wrench className="h-5 w-5 text-orange-600" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-sm">Vista Técnico</p>
              <p className="text-xs text-muted-foreground">
                Fases, evidencia y ejecución del trabajo
              </p>
            </div>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-4 px-4 justify-start gap-4"
            onClick={() => {
              router.push(`/dashboard/ot/${card.ordenId}`)
              onOpenChange(false)
            }}
          >
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-sm">Vista Taller (OT)</p>
              <p className="text-xs text-muted-foreground">
                Costos, repuestos y gestión completa
              </p>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ============================================
// Staff Assignment Popover
// ============================================

interface StaffAssignPopoverProps {
  type: "asesor" | "tecnico"
  onAssign: (empleado: Empleado) => void
  children: React.ReactNode
}

function StaffAssignPopover({ type, onAssign, children }: StaffAssignPopoverProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [empleados, setEmpleados] = useState<Empleado[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return

    const fetchEmpleados = async () => {
      setLoading(true)
      try {
        const data = type === "asesor"
          ? await getAsesoresServicio(CURRENT_TALLER_ID)
          : await getAsesoresTecnicos(CURRENT_TALLER_ID)
        setEmpleados(data)
      } catch (error) {
        console.error(`Error fetching ${type}:`, error)
        toast.error(`Error al cargar ${type === "asesor" ? "asesores" : "técnicos"}`)
      } finally {
        setLoading(false)
      }
    }

    fetchEmpleados()
  }, [open, type])

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
      <PopoverContent className="w-64 p-0 overflow-hidden" align="start" side="bottom">
        <div className="p-2 border-b">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder={`Buscar ${type === "asesor" ? "asesor" : "técnico"}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pl-8 text-sm"
            />
          </div>
        </div>
        <div className="max-h-52 overflow-y-auto p-1">
          {loading ? (
            <div className="py-4 text-center text-sm text-muted-foreground">
              Cargando...
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-4 text-center text-sm text-muted-foreground">
              Sin resultados
            </div>
          ) : (
            filtered.map((empleado) => (
              <button
                key={empleado.idEmpleado}
                className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-accent text-left"
                onClick={() => {
                  onAssign(empleado)
                  setOpen(false)
                  setSearch("")
                }}
              >
                <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="truncate">{toTitleCase(empleado.nombreEmpleado)}</span>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

// ============================================
// Kanban Card Item (OT cards)
// ============================================

interface KanbanCardItemProps {
  card: KanbanCard
  onCardClick: (card: KanbanCard) => void
  onAssignTecnico?: (card: KanbanCard, empleado: Empleado) => void
}

function KanbanCardItem({ card, onCardClick, onAssignTecnico }: KanbanCardItemProps) {
  const brandColor = BRAND_COLORS[card.marca] || "bg-gray-500"
  const initials = card.tecnicoNombre
    ? card.tecnicoNombre.split(" ").map(n => n[0]).join("").slice(0, 2)
    : "?"

  const showAssignButton = onAssignTecnico && (!card.tecnicoId || card.tecnicoId === "")

  return (
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
        onClick={() => onCardClick(card)}
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
                {card.tecnicoNombre ? card.tecnicoNombre.split(" ")[0] : "Sin asignar"}
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

          {/* Assign technician button */}
          {showAssignButton && (
            <div className="mt-2 pt-2 border-t" onClick={(e) => e.stopPropagation()}>
              <StaffAssignPopover
                type="tecnico"
                onAssign={(empleado) => onAssignTecnico(card, empleado)}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full h-7 text-xs text-muted-foreground hover:text-primary"
                >
                  <UserPlus className="h-3 w-3 mr-1.5" />
                  Asignar Técnico
                </Button>
              </StaffAssignPopover>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ============================================
// Cita Card Item
// ============================================

interface CitaCardItemProps {
  cita: KanbanCitaCard
  onAssignAsesor: (cita: KanbanCitaCard, empleado: Empleado) => void
}

function CitaCardItem({ cita, onAssignAsesor }: CitaCardItemProps) {
  const brandColor = BRAND_COLORS[cita.vehiculoMarca] || "bg-gray-500"

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="border-l-4 border-l-blue-400 dark:border-l-blue-500">
        <CardContent className="p-3">
          {/* Header - Time + Plate */}
          <div className="flex items-center justify-between mb-2">
            <Badge variant="outline" className="h-5 text-[10px] font-mono border-blue-300 text-blue-700 dark:text-blue-400 dark:border-blue-600">
              {cita.hora}
            </Badge>
            <div className="flex items-center gap-1.5">
              <div className={cn("h-5 w-5 rounded flex items-center justify-center", brandColor)}>
                <Car className="h-3 w-3 text-white" />
              </div>
              <span className="font-bold font-mono text-xs">{cita.vehiculoPlaca}</span>
            </div>
          </div>

          {/* Client name */}
          <p className="text-sm font-medium mb-1 truncate">{cita.clienteNombre}</p>

          {/* Vehicle */}
          <p className="text-xs text-muted-foreground mb-1">
            {cita.vehiculoMarca} {cita.vehiculoModelo}
          </p>

          {/* Service type */}
          <p className="text-xs line-clamp-2 mb-2">
            {cita.servicio}
          </p>

          {/* Assigned advisor or assign button */}
          <div className="pt-2 border-t" onClick={(e) => e.stopPropagation()}>
            {cita.asesorAsignado ? (
              <div className="flex items-center gap-1.5">
                <Check className="h-3 w-3 text-green-600" />
                <span className="text-xs text-green-700 dark:text-green-400 truncate">
                  {toTitleCase(cita.asesorAsignado.nombre)}
                </span>
              </div>
            ) : (
              <StaffAssignPopover
                type="asesor"
                onAssign={(empleado) => onAssignAsesor(cita, empleado)}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full h-7 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                >
                  <UserPlus className="h-3 w-3 mr-1.5" />
                  Asignar Asesor
                </Button>
              </StaffAssignPopover>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ============================================
// Citas Column
// ============================================

interface CitasColumnProps {
  citas: KanbanCitaCard[]
  onAssignAsesor: (cita: KanbanCitaCard, empleado: Empleado) => void
}

function CitasColumn({ citas, onAssignAsesor }: CitasColumnProps) {
  const unassignedCount = citas.filter(c => !c.asesorAsignado).length

  return (
    <div className="flex-shrink-0 w-72 flex flex-col h-full">
      {/* Column Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-blue-50 dark:bg-blue-950/30 rounded-t-lg border border-b-0 border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <h3 className="font-semibold text-sm text-blue-900 dark:text-blue-100">Citas Hoy</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <Badge variant="secondary" className="h-5 text-xs font-normal">
            {citas.length}
          </Badge>
          {unassignedCount > 0 && (
            <Badge className="h-5 text-xs font-normal bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 border-0">
              {unassignedCount} sin asesor
            </Badge>
          )}
        </div>
      </div>

      {/* Cards container */}
      <div className="flex-1 border rounded-b-lg border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-950/10 p-3 overflow-y-auto">
        <div className="space-y-3">
          {citas.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              Sin citas para hoy
            </div>
          ) : (
            citas.map((cita) => (
              <CitaCardItem
                key={cita.id}
                cita={cita}
                onAssignAsesor={onAssignAsesor}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================
// OT Phases Column
// ============================================

interface KanbanColumnProps {
  phase: WorkOrderPhase
  cards: KanbanCard[]
  onCardClick: (card: KanbanCard) => void
  onAssignTecnico?: (card: KanbanCard, empleado: Empleado) => void
}

function KanbanColumn({ phase, cards, onCardClick, onAssignTecnico }: KanbanColumnProps) {
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
      <div className="flex-1 border rounded-b-lg bg-muted/20 p-3 overflow-y-auto">
        <div className="space-y-3">
          {cards.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              Sin vehículos
            </div>
          ) : (
            cards.map((card) => (
              <KanbanCardItem
                key={card.id}
                card={card}
                onCardClick={onCardClick}
                onAssignTecnico={
                  (phase === "diagnostico" || phase === "reparacion")
                    ? onAssignTecnico
                    : undefined
                }
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================
// Main Board View
// ============================================

export function KanbanBoardView({ board }: KanbanBoardViewProps) {
  const phases: WorkOrderPhase[] = ["recepcion", "diagnostico", "reparacion", "calidad", "entrega"]

  // Local state for assignments (visual only, no POST yet)
  const [citasState, setCitasState] = useState<KanbanCitaCard[]>(board.columnas.citas || [])
  const [selectedCard, setSelectedCard] = useState<KanbanCard | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  // Sync citas state when board updates
  useEffect(() => {
    setCitasState(board.columnas.citas || [])
  }, [board.columnas.citas])

  const totalDelayed = phases
    .flatMap((phase) => board.columnas[phase] || [])
    .filter((c) => c.alertaRetraso).length

  const handleCardClick = (card: KanbanCard) => {
    setSelectedCard(card)
    setDialogOpen(true)
  }

  const handleAssignAsesor = (cita: KanbanCitaCard, empleado: Empleado) => {
    setCitasState((prev) =>
      prev.map((c) =>
        c.id === cita.id
          ? { ...c, asesorAsignado: { id: empleado.idEmpleado.toString(), nombre: empleado.nombreEmpleado } }
          : c
      )
    )
    toast.success("Asesor asignado", {
      description: `${toTitleCase(empleado.nombreEmpleado)} asignado a cita de ${cita.clienteNombre}`,
    })
  }

  const handleAssignTecnico = (card: KanbanCard, empleado: Empleado) => {
    toast.success("Técnico asignado", {
      description: `${toTitleCase(empleado.nombreEmpleado)} asignado a ${card.placa}`,
    })
  }

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
          {/* Citas Column */}
          <CitasColumn
            citas={citasState}
            onAssignAsesor={handleAssignAsesor}
          />

          {/* Phase Columns */}
          {phases.map((phase) => (
            <KanbanColumn
              key={phase}
              phase={phase}
              cards={board.columnas[phase] || []}
              onCardClick={handleCardClick}
              onAssignTecnico={handleAssignTecnico}
            />
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* Perspective Dialog */}
      <PerspectiveDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        card={selectedCard}
      />
    </div>
  )
}
