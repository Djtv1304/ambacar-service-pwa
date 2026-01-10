"use client"

import { useState, useCallback, useMemo } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { isTechnician, isInternalUser } from "@/lib/auth/roles"
import { TechnicianOrdersList } from "@/components/taller/technician-orders-list"
import { KanbanBoardView } from "@/components/taller/kanban-board"
import { motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useKanbanBoard } from "@/hooks/use-kanban-board"
import { useOrdenesTaller } from "@/hooks/use-ordenes-taller"
import { RefreshCw, Search, User, Flag, Filter, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { KanbanBoardAPI, KanbanCardAPI } from "@/lib/api/taller"

export default function TallerPage() {
  const { user, isLoading } = useAuth()

  // Loading state
  if (isLoading) {
    return <TallerPageSkeleton />
  }

  // Determine which view to show based on role
  const userIsTechnician = isTechnician(user)
  const userIsAdmin = isInternalUser(user) && !userIsTechnician

  // Technician View - Show their assigned orders
  if (userIsTechnician) {
    return <TechnicianOrdersView />
  }

  // Admin/Manager/Operator View - Show Kanban Board
  if (userIsAdmin) {
    return <KanbanBoardContent />
  }

  // Default fallback - Show Kanban for demo purposes
  return <KanbanBoardContent />
}

function KanbanBoardContent() {
  const { board, isLoading, error, refetch } = useKanbanBoard()
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Estados de filtros
  const [searchPlaca, setSearchPlaca] = useState("")
  const [filterTecnico, setFilterTecnico] = useState<string>("all")
  const [filterPrioridad, setFilterPrioridad] = useState<string>("all")

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refetch()
    setIsRefreshing(false)
    // Los filtros se mantienen activos
  }

  // Lógica de filtrado
  const filterCards = useCallback((cards: KanbanCardAPI[]): KanbanCardAPI[] => {
    return cards.filter((card) => {
      // Filtro por placa (búsqueda)
      const matchesPlaca = searchPlaca.trim() === "" ||
        card.placa.toLowerCase().includes(searchPlaca.toLowerCase().trim())

      // Filtro por técnico
      const matchesTecnico = filterTecnico === "all" ||
        card.tecnicoId === filterTecnico ||
        (filterTecnico === "sin-asignar" && card.tecnicoId === "")

      // Filtro por prioridad
      const matchesPrioridad = filterPrioridad === "all" ||
        card.prioridad === filterPrioridad

      return matchesPlaca && matchesTecnico && matchesPrioridad
    })
  }, [searchPlaca, filterTecnico, filterPrioridad])

  // Aplicar filtros a las columnas
  const filteredBoard = useMemo((): KanbanBoardAPI | null => {
    if (!board) return null

    return {
      totalOrdenes: board.totalOrdenes,
      columnas: {
        recepcion: filterCards(board.columnas.recepcion),
        diagnostico: filterCards(board.columnas.diagnostico),
        reparacion: filterCards(board.columnas.reparacion),
        calidad: filterCards(board.columnas.calidad),
        entrega: filterCards(board.columnas.entrega),
      }
    }
  }, [board, filterCards])

  if (isLoading) {
    return <TallerPageSkeleton />
  }

  if (error || !board) {
    return (
      <div className="p-4 md:p-6">
        <div className="flex flex-col items-center justify-center h-96 space-y-4">
          <p className="text-lg text-muted-foreground dark:text-gray-400">
            {error || "No se pudo cargar el tablero"}
          </p>
          <Button onClick={() => window.location.reload()}>
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Header con botón de actualizar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h1 className="text-2xl font-bold dark:text-gray-100">Tablero de Taller</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="dark:border-gray-700 dark:hover:bg-gray-800"
        >
          <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
          Actualizar
        </Button>
      </div>

      {/* Barra de Filtros */}
      <div className="flex flex-col md:flex-row gap-3 p-4 bg-card/50 dark:bg-card/40 border border-border/60 dark:border-border/50 rounded-lg">
        {/* Búsqueda por Placa */}
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground dark:text-muted-foreground/60" />
            <Input
              type="text"
              placeholder="Buscar por placa..."
              value={searchPlaca}
              onChange={(e) => setSearchPlaca(e.target.value)}
              className="pl-9 h-9 dark:bg-background/50 dark:border-border/60"
            />
            {searchPlaca && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={() => setSearchPlaca("")}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>

        {/* Filtro por Técnico */}
        <Select value={filterTecnico} onValueChange={setFilterTecnico}>
          <SelectTrigger className="w-full md:w-[200px] h-9 dark:border-border/60 dark:bg-background/50">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground dark:text-muted-foreground/60" />
              <SelectValue placeholder="Todos los técnicos" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los técnicos</SelectItem>
            <SelectItem value="sin-asignar">Sin asignar</SelectItem>
            <Separator className="my-1" />
            {getTecnicosList(board).map((tecnico) => (
              <SelectItem key={tecnico.id} value={tecnico.id}>
                {tecnico.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Filtro por Prioridad */}
        <Select value={filterPrioridad} onValueChange={setFilterPrioridad}>
          <SelectTrigger className="w-full md:w-[180px] h-9 dark:border-border/60 dark:bg-background/50">
            <div className="flex items-center gap-2">
              <Flag className="h-4 w-4 text-muted-foreground dark:text-muted-foreground/60" />
              <SelectValue placeholder="Todas las prioridades" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="alta">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                Alta
              </div>
            </SelectItem>
            <SelectItem value="normal">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-yellow-500" />
                Normal
              </div>
            </SelectItem>
            <SelectItem value="baja">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                Baja
              </div>
            </SelectItem>
          </SelectContent>
        </Select>

        {/* Botón para limpiar filtros */}
        {(searchPlaca || filterTecnico !== "all" || filterPrioridad !== "all") && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchPlaca("")
              setFilterTecnico("all")
              setFilterPrioridad("all")
            }}
            className="dark:hover:bg-gray-800"
          >
            <X className="h-4 w-4 mr-1.5" />
            Limpiar
          </Button>
        )}
      </div>

      {/* Indicador de resultados filtrados */}
      {filteredBoard && (searchPlaca || filterTecnico !== "all" || filterPrioridad !== "all") && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground dark:text-muted-foreground/80">
          <Filter className="h-4 w-4" />
          Mostrando {getTotalFilteredCards(filteredBoard)} de {board?.totalOrdenes || 0} órdenes
        </div>
      )}

      {/* Tablero Kanban */}
      <KanbanBoardView board={filteredBoard!} />
    </div>
  )
}

/**
 * Extrae la lista única de técnicos del tablero
 */
function getTecnicosList(board: KanbanBoardAPI | null): Array<{ id: string; nombre: string }> {
  if (!board) return []

  const tecnicos = new Map<string, string>()

  Object.values(board.columnas).forEach((columna) => {
    columna.forEach((card) => {
      if (card.tecnicoId && card.tecnicoId !== "") {
        tecnicos.set(card.tecnicoId, card.tecnicoNombre)
      }
    })
  })

  return Array.from(tecnicos.entries()).map(([id, nombre]) => ({ id, nombre }))
}

/**
 * Cuenta el total de tarjetas filtradas
 */
function getTotalFilteredCards(board: KanbanBoardAPI): number {
  return Object.values(board.columnas).reduce(
    (total, columna) => total + columna.length,
    0
  )
}

/**
 * Vista de órdenes para técnicos (y ADMIN cuando forceShowTechnicianView = true)
 * Consume API /api/taller/ que filtra órdenes según usuario autenticado
 */
function TechnicianOrdersView() {
  const { ordenes, isLoading, error, refetch } = useOrdenesTaller()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refetch()
    setIsRefreshing(false)
  }

  if (isLoading) {
    return <TechnicianOrdersListSkeleton />
  }

  if (error) {
    return (
      <div className="p-4 md:p-6">
        <div className="flex flex-col items-center justify-center h-96 space-y-4">
          <p className="text-lg text-muted-foreground dark:text-gray-400">
            {error}
          </p>
          <Button onClick={() => window.location.reload()}>
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  if (ordenes.length === 0) {
    return (
      <div className="p-4 md:p-6">
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
          {/* Icon */}
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="h-24 w-24 rounded-full bg-primary/10 dark:bg-primary/5 flex items-center justify-center"
            >
              <svg
                className="h-12 w-12 text-primary dark:text-primary/80"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
            </motion.div>
            {/* Decorative pulse - only once */}
            <motion.div
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="absolute inset-0 h-24 w-24 rounded-full bg-primary/20 dark:bg-primary/10"
            />
          </div>

          {/* Text content */}
          <div className="text-center space-y-2 max-w-md">
            <h3 className="text-xl font-semibold text-foreground dark:text-gray-100">
              No tienes órdenes asignadas
            </h3>
            <p className="text-sm text-muted-foreground dark:text-muted-foreground/80">
              Parece que no hay órdenes de trabajo para ti en este momento. Las nuevas órdenes aparecerán aquí automáticamente al actualizar.
            </p>
          </div>

          {/* Action button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="dark:border-gray-700 dark:hover:bg-gray-800"
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
            Actualizar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Header con botón de actualizar */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold dark:text-gray-100">Mis Órdenes</h1>
          <p className="text-sm text-muted-foreground dark:text-muted-foreground/80">
            {ordenes.length} {ordenes.length === 1 ? 'orden' : 'órdenes'} asignadas
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="dark:border-gray-700 dark:hover:bg-gray-800"
        >
          <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
          Actualizar
        </Button>
      </div>

      {/* Lista de órdenes */}
      <TechnicianOrdersList orders={ordenes} />
    </div>
  )
}

/**
 * Skeleton para la vista de técnico mientras carga
 */
function TechnicianOrdersListSkeleton() {
  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48 dark:bg-gray-800" />
        <Skeleton className="h-4 w-32 dark:bg-gray-800" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-48 w-full dark:bg-gray-800" />
        ))}
      </div>
    </div>
  )
}

function TallerPageSkeleton() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-6 w-24" />
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="w-72 shrink-0 space-y-3">
            <Skeleton className="h-10 w-full rounded-t-lg" />
            <div className="space-y-2 p-2 border rounded-b-lg">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
