"use client"

import { use } from "react"
import { useOrdenTallerDetalle } from "@/hooks/use-orden-taller-detalle"
import { TechnicianOrderDetail } from "@/components/taller/technician-order-detail"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

export default function TallerOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params)
  const orderId = resolvedParams.id

  const { orden, isLoading, error } = useOrdenTallerDetalle(orderId)

  // Loading state
  if (isLoading) {
    return <TechnicianOrderDetailSkeleton />
  }

  // Error state
  if (error || !orden) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="max-w-md w-full space-y-4 text-center">
          <div className="text-destructive text-lg font-semibold dark:text-red-400">
            Error al cargar la orden
          </div>
          <p className="text-muted-foreground dark:text-gray-400">
            {error || "No se pudo cargar el detalle de la orden de trabajo"}
          </p>
          <Button onClick={() => window.location.reload()} variant="outline" className="dark:border-gray-700 dark:hover:bg-gray-800">
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  return <TechnicianOrderDetail order={orden} />
}

/**
 * Skeleton loading state para la página de detalle
 */
function TechnicianOrderDetailSkeleton() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-8 w-64 dark:bg-gray-800" />
        <Skeleton className="h-6 w-32 dark:bg-gray-800" />
        <div className="flex gap-3">
          <Skeleton className="h-5 w-24 dark:bg-gray-800" />
          <Skeleton className="h-5 w-24 dark:bg-gray-800" />
        </div>
      </div>

      {/* Info card skeleton */}
      <div className="border rounded-lg p-6 space-y-4 dark:border-gray-800">
        <Skeleton className="h-6 w-48 dark:bg-gray-800" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-20 w-full dark:bg-gray-800" />
          <Skeleton className="h-20 w-full dark:bg-gray-800" />
        </div>
      </div>

      {/* Phases skeleton */}
      <div className="border rounded-lg p-6 space-y-4 dark:border-gray-800">
        <Skeleton className="h-6 w-40 dark:bg-gray-800" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full dark:bg-gray-800" />
        ))}
      </div>

      {/* Additional work skeleton */}
      <div className="border rounded-lg p-6 space-y-4 dark:border-gray-800">
        <Skeleton className="h-6 w-48 dark:bg-gray-800" />
        <Skeleton className="h-16 w-full dark:bg-gray-800" />
        <Skeleton className="h-16 w-full dark:bg-gray-800" />
      </div>

      {/* Parts skeleton */}
      <div className="border rounded-lg p-6 space-y-4 dark:border-gray-800">
        <Skeleton className="h-6 w-40 dark:bg-gray-800" />
        <Skeleton className="h-48 w-full dark:bg-gray-800" />
      </div>
    </div>
  )
}
