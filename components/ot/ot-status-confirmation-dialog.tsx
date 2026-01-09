"use client"

import { AlertTriangle, Info, Loader2, ArrowRight } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import type { EstadoOrdenTrabajo } from "@/lib/types"

interface OTStatusConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentEstado: EstadoOrdenTrabajo
  newEstado: EstadoOrdenTrabajo
  ordenId: number
  onConfirm: () => Promise<void>
  isLoading: boolean
}

export function OTStatusConfirmationDialog({
  open,
  onOpenChange,
  currentEstado,
  newEstado,
  onConfirm,
  isLoading,
}: OTStatusConfirmationDialogProps) {
  const isFinalState = newEstado.es_final
  const isDestructive = isFinalState

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md dark:bg-card/95 dark:border-border/60">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            {isDestructive ? (
              <div className="h-10 w-10 rounded-full bg-destructive/10 dark:bg-destructive/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5 text-destructive dark:text-destructive/90" />
              </div>
            ) : (
              <div className="h-10 w-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center shrink-0">
                <Info className="h-5 w-5 text-primary dark:text-primary/90" />
              </div>
            )}
            <AlertDialogTitle className="dark:text-foreground/95">
              Confirmar Cambio de Estado
            </AlertDialogTitle>
          </div>
        </AlertDialogHeader>

        {/* Content wrapper - not using AlertDialogDescription to avoid HTML nesting errors */}
        <div className="space-y-4 pt-2">
          <div>
            <p className="text-sm font-medium text-foreground dark:text-foreground/90 mb-3">
              ¿Estás seguro de cambiar el estado de esta orden de trabajo?
            </p>

            {/* Estado actual → Estado nuevo */}
            <div className="flex items-center gap-2 sm:gap-3 p-3 rounded-lg bg-muted/50 dark:bg-muted/40 border border-border/50 dark:border-border/40">
              <Badge
                variant="outline"
                className="border-2 dark:border-opacity-70 flex-1 sm:flex-none justify-center text-xs sm:text-sm"
                style={{
                  borderColor: currentEstado.color,
                  backgroundColor: `${currentEstado.color}10`,
                }}
              >
                <span
                  className="h-2 w-2 rounded-full mr-1.5 sm:mr-2 inline-block"
                  style={{ backgroundColor: currentEstado.color }}
                />
                <span className="dark:text-foreground/90">{currentEstado.nombre}</span>
              </Badge>

              <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground dark:text-muted-foreground/70 shrink-0" />

              <Badge
                variant="outline"
                className="border-2 dark:border-opacity-70 flex-1 sm:flex-none justify-center text-xs sm:text-sm"
                style={{
                  borderColor: newEstado.color,
                  backgroundColor: `${newEstado.color}10`,
                }}
              >
                <span
                  className="h-2 w-2 rounded-full mr-1.5 sm:mr-2 inline-block"
                  style={{ backgroundColor: newEstado.color }}
                />
                <span className="dark:text-foreground/90">{newEstado.nombre}</span>
              </Badge>
            </div>
          </div>

          {/* Warning para estados finales */}
          {isFinalState && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 dark:bg-destructive/15 border border-destructive/30 dark:border-destructive/50">
              <AlertTriangle className="h-4 w-4 text-destructive dark:text-destructive/90 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-destructive dark:text-destructive/95">
                  Este cambio es irreversible
                </p>
                <p className="text-xs text-destructive/80 dark:text-destructive/75">
                  Los estados finales no pueden ser revertidos una vez aplicados.
                </p>
              </div>
            </div>
          )}

          {/* Info adicional */}
          {newEstado.descripcion && (
            <AlertDialogDescription className="text-sm dark:text-muted-foreground/90">
              {newEstado.descripcion}
            </AlertDialogDescription>
          )}
        </div>

        <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-2">
          <AlertDialogCancel
            disabled={isLoading}
            className="w-full sm:w-auto dark:bg-muted/40 dark:hover:bg-muted/60 dark:text-foreground/90"
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              onConfirm()
            }}
            disabled={isLoading}
            className={`w-full sm:w-auto ${isDestructive ? "bg-destructive text-destructive-foreground hover:bg-destructive/90 dark:bg-destructive/90 dark:hover:bg-destructive" : "dark:bg-primary/90 dark:hover:bg-primary dark:text-primary-foreground"}`}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cambiando...
              </>
            ) : (
              <>Confirmar Cambio</>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
