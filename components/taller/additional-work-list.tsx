"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { CheckCircle2, Clock, Loader2, Wrench } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import type { AdditionalWorkItem } from "@/lib/fixtures/technical-progress"
import { cn } from "@/lib/utils"

interface AdditionalWorkListProps {
  items: AdditionalWorkItem[]
  onToggleComplete: (itemId: string, completed: boolean) => Promise<void>
}

export function AdditionalWorkList({ items, onToggleComplete }: AdditionalWorkListProps) {
  const [loadingItems, setLoadingItems] = useState<Set<string>>(new Set())
  const [confirmingItem, setConfirmingItem] = useState<AdditionalWorkItem | null>(null)

  const completedCount = items.filter(i => i.completado).length
  const totalCount = items.length

  if (items.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Wrench className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">Trabajos Adicionales</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <div className="h-16 w-16 rounded-full bg-muted/50 dark:bg-muted/30 flex items-center justify-center mb-4">
              <Wrench className="h-8 w-8 text-muted-foreground/50 dark:text-muted-foreground/40" />
            </div>
            <h3 className="font-medium text-sm mb-1 dark:text-gray-200">
              Sin trabajos adicionales
            </h3>
            <p className="text-xs text-muted-foreground dark:text-muted-foreground/80 max-w-[280px]">
              Los trabajos adicionales identificados durante el servicio aparecerán aquí.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const handleConfirmComplete = async () => {
    if (!confirmingItem) return

    setLoadingItems(prev => new Set(prev).add(confirmingItem.id))
    try {
      await onToggleComplete(confirmingItem.id, true)
    } catch (error) {
      console.error("Error completing item:", error)
    } finally {
      setLoadingItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(confirmingItem.id)
        return newSet
      })
      setConfirmingItem(null)
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Trabajos Adicionales</CardTitle>
            </div>
            <Badge variant="secondary" className="font-normal">
              {completedCount}/{totalCount} completados
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          {items.map((item) => {
            const isLoading = loadingItems.has(item.id)

            return (
              <motion.div
                key={item.id}
                layout
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg border transition-colors",
                  item.completado
                    ? "bg-green-500/5 border-green-500/20"
                    : "bg-card border-border"
                )}
              >
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className={cn(
                      "font-medium text-sm",
                      item.completado && "line-through text-muted-foreground"
                    )}>
                      {item.titulo}
                    </h4>
                    <span className="text-sm font-semibold shrink-0">
                      ${typeof item.costoTotal === 'number' ? item.costoTotal.toFixed(2) : Number(item.costoTotal || 0).toFixed(2)}
                    </span>
                  </div>
                  <p className={cn(
                    "text-xs mt-0.5",
                    "text-muted-foreground"
                  )}>
                    {item.descripcion}
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    {item.completado ? (
                      <Badge variant="outline" className="h-6 text-[10px] bg-green-500/10 text-green-600 border-green-500/30">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Realizado
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="h-6 text-[10px]">
                        <Clock className="h-3 w-3 mr-1" />
                        Pendiente
                      </Badge>
                    )}

                    {/* Action button - Only show for pending items (One-Way Logic) */}
                    {!item.completado && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setConfirmingItem(item)}
                        disabled={isLoading}
                        className="h-7 text-xs border-green-500/50 text-green-600 hover:bg-green-500/10"
                      >
                        {isLoading ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          "Marcar Realizado"
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </CardContent>
      </Card>

      {/* Confirmation AlertDialog */}
      <AlertDialog open={!!confirmingItem} onOpenChange={(open) => !open && setConfirmingItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar trabajo realizado</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Confirmar que el trabajo "<span className="font-medium text-foreground">{confirmingItem?.titulo}</span>" ha sido realizado?
              <br /><br />
              <span className="text-destructive font-medium">Esta acción no se puede deshacer.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmComplete}
              className="bg-green-600 hover:bg-green-700"
            >
              Sí, está realizado
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
