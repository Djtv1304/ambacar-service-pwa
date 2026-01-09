"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { RefreshCcw, Check, ArrowRight } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useEstadosOT } from "@/hooks/use-estados-ot"
import { OTStatusConfirmationDialog } from "./ot-status-confirmation-dialog"
import type { EstadoOrdenTrabajo } from "@/lib/types"

interface OTStatusSelectorProps {
  currentEstado: EstadoOrdenTrabajo
  ordenId: number
  onEstadoChanged: (nuevoEstado: EstadoOrdenTrabajo) => void
}

export function OTStatusSelector({
  currentEstado,
  ordenId,
  onEstadoChanged,
}: OTStatusSelectorProps) {
  const { estados, isLoading: estadosLoading } = useEstadosOT()
  const [selectedEstado, setSelectedEstado] = useState<EstadoOrdenTrabajo | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isChanging, setIsChanging] = useState(false)

  const handleSelectChange = (estadoId: string) => {
    const nuevoEstado = estados.find((e) => e.id.toString() === estadoId)
    if (nuevoEstado && nuevoEstado.id !== currentEstado.id) {
      setSelectedEstado(nuevoEstado)
      setDialogOpen(true)
    }
  }

  const handleConfirmChange = async () => {
    if (!selectedEstado) return

    setIsChanging(true)
    try {
      await onEstadoChanged(selectedEstado)
      setDialogOpen(false)
      setSelectedEstado(null)
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setIsChanging(false)
    }
  }

  if (estadosLoading) {
    return (
      <div className="rounded-lg border border-border/60 dark:border-border/50 bg-card/50 dark:bg-card/40 px-3 py-2.5 sm:px-4 sm:py-3 md:px-5 shadow-sm dark:shadow-none">
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
          {/* Icon + Label */}
          <Skeleton className="h-4 w-4 md:w-32 dark:bg-muted/40" />
          {/* Separator */}
          <Skeleton className="h-6 w-px hidden md:block dark:bg-muted/40" />
          {/* Badge */}
          <Skeleton className="h-5 w-16 sm:w-24 dark:bg-muted/40" />
          {/* Spacer */}
          <div className="flex-1 min-w-2" />
          {/* Right section */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Select */}
            <Skeleton className="h-7 sm:h-8 w-32 sm:w-36 md:w-40 mr-2 sm:mr-0 dark:bg-muted/40" />
            {/* Arrow */}
            <Skeleton className="h-3 w-3 hidden xs:block dark:bg-muted/40" />
            {/* Counter */}
            <Skeleton className="h-4 w-8 dark:bg-muted/40" />
            {/* Progress bar */}
            <Skeleton className="h-1.5 w-16 sm:w-20 md:w-24 hidden sm:block dark:bg-muted/40" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* New compact horizontal layout - optimized for all screen sizes */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="group relative overflow-hidden rounded-lg border border-border/60 dark:border-border/50 bg-card/50 dark:bg-card/40 backdrop-blur-sm shadow-sm dark:shadow-none"
        style={{
          borderLeftWidth: "4px",
          borderLeftColor: currentEstado.color,
        }}
      >
        {/* Main content row - responsive layout */}
        <div className="flex items-center gap-2 px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3 md:gap-4 md:px-5">
          {/* Label with icon - hidden on mobile */}
          <div className="flex items-center gap-1.5 shrink-0 hidden md:flex">
            <RefreshCcw className="h-4 w-4 text-muted-foreground/70 dark:text-muted-foreground/60" />
            <span className="text-sm font-medium text-muted-foreground dark:text-muted-foreground/90">
              Estado del Trabajo
            </span>
          </div>

          {/* Icon only on mobile/tablet */}
          <div className="flex items-center shrink-0 md:hidden">
            <RefreshCcw className="h-4 w-4 text-muted-foreground/70 dark:text-muted-foreground/60" />
          </div>

          {/* Separator - hidden on mobile */}
          <div className="h-6 w-px bg-border/50 dark:bg-border/40 hidden md:block" />

          {/* Current estado badge */}
          <motion.div
            className="flex items-center gap-1.5 sm:gap-2 shrink-0 min-w-0"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <span
              className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full shrink-0 ring-2 ring-background dark:ring-background/80"
              style={{ backgroundColor: currentEstado.color }}
            />
            <span className="font-semibold text-xs sm:text-sm text-foreground dark:text-foreground/95 truncate">
              {currentEstado.nombre}
            </span>
          </motion.div>

          {/* Spacer - pushes everything to the right */}
          <div className="flex-1 min-w-2" />

          {/* Right section - wrapped to prevent overflow on small screens */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Estado selector - aligned right */}
            <div className="w-full mr-2">
              <Select
                value={currentEstado.id.toString()}
                onValueChange={handleSelectChange}
              >
                <SelectTrigger
                  className="h-7 sm:h-8 text-xs border-dashed hover:border-solid hover:bg-accent/50 dark:hover:bg-accent/40 transition-all dark:border-border/60"
                  size="sm"
                >
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{ backgroundColor: currentEstado.color }}
                      />
                      <span className="text-xs truncate">{currentEstado.nombre}</span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="max-h-[320px]" align="end">
                  {estados.map((estado) => {
                    const isCurrent = estado.id === currentEstado.id
                    const isDisabled = !estado.permite_edicion && !isCurrent

                    return (
                      <SelectItem
                        key={estado.id}
                        value={estado.id.toString()}
                        disabled={isDisabled}
                        className="py-2"
                      >
                        <div className="flex items-center gap-2.5 w-full">
                          <span
                            className="h-2.5 w-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: estado.color }}
                          />
                          <span className="flex-1 text-sm dark:text-foreground/95">{estado.nombre}</span>
                          {isCurrent && (
                            <Check className="h-3.5 w-3.5 text-primary dark:text-primary/90" />
                          )}
                          {estado.es_final && (
                            <Badge
                              variant="outline"
                              className="text-xs py-0 h-5 border-amber-500/50 dark:border-amber-500/40 bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400"
                            >
                              Final
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Arrow indicator - hidden on very small mobile */}
            <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground/40 dark:text-muted-foreground/30 shrink-0 hidden xs:block" />

            {/* Progress counter */}
            <div className="flex items-center shrink-0">
              <span className="text-xs font-semibold text-foreground dark:text-foreground/95 tabular-nums whitespace-nowrap">
                {currentEstado.orden}/{estados.length}
              </span>
            </div>

            {/* Progress bar - only on tablet and desktop */}
            <div className="w-16 sm:w-20 md:w-24 bg-muted/50 dark:bg-muted/40 rounded-full h-1.5 overflow-hidden shrink-0 hidden sm:block">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: currentEstado.color }}
                initial={{ width: 0 }}
                animate={{
                  width: `${(currentEstado.orden / estados.length) * 100}%`,
                }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
              />
            </div>
          </div>
        </div>

        {/* Hover hint - enhanced for dark mode */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-primary/5 dark:via-primary/10 to-transparent"
        />
      </motion.div>

      {selectedEstado && (
        <OTStatusConfirmationDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          currentEstado={currentEstado}
          newEstado={selectedEstado}
          ordenId={ordenId}
          onConfirm={handleConfirmChange}
          isLoading={isChanging}
        />
      )}
    </>
  )
}
