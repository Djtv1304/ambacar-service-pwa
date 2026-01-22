"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Car, History, Inbox, User, ArrowLeft, RefreshCw, Hand, Wrench } from "lucide-react"
import { ScrollableTabs, TabsContent } from "@/components/ui/scrollable-tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ServiceCard } from "@/components/mis-servicios/service-card"
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh"
import { useIsMobile } from "@/hooks/use-mobile"
import { toast } from "sonner"
import type { ClientService } from "@/lib/mis-servicios/types"

const PULL_TO_REFRESH_HINT_KEY = "mis-servicios-pull-refresh-hint-shown"

type ServiceViewContext = "customer" | "operator-own" | "operator-client"

interface ServiceListProps {
  activeServices: ClientService[]
  completedServices: ClientService[]
  isLoading?: boolean
  /** Separate loading state for active tab */
  activeLoading?: boolean
  /** Separate loading state for history tab */
  historialLoading?: boolean
  /** When true, hides client-specific CTAs like the big approval banner */
  isInternalUser?: boolean
  /** Context of the service view - determines UI behavior */
  viewContext?: ServiceViewContext
  /** Name of the client being viewed (for internal users) */
  clientName?: string
  /** Name of the operator viewing their own services */
  operatorName?: string
  /** Callback to clear client selection (for internal users) */
  onClearClient?: () => void
  /** Callback to go back to mode selector (for operators) */
  onBackToSelector?: () => void
  /** Callback when tab changes - used for lazy loading */
  onTabChange?: (tab: "active" | "history") => void
  /** Callback to refresh active services */
  onRefreshActive?: () => Promise<void>
  /** Callback to refresh history services */
  onRefreshHistorial?: () => Promise<void>
}

// Animation variants for staggered list
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
    },
  },
}

function EmptyState({ type }: { type: "active" | "history" }) {
  const isActive = type === "active"

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
        {isActive ? (
          <Car className="h-8 w-8 text-muted-foreground" />
        ) : (
          <History className="h-8 w-8 text-muted-foreground" />
        )}
      </div>
      <h3 className="text-lg font-semibold mb-2">
        {isActive ? "No tienes servicios activos" : "Sin historial de servicios"}
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm">
        {isActive
          ? "Cuando ingreses tu vehículo al taller, podrás ver el progreso aquí."
          : "Aquí aparecerán los servicios que hayas completado anteriormente."}
      </p>
    </motion.div>
  )
}

function ServiceListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="border rounded-xl overflow-hidden">
          <div className="flex flex-col sm:flex-row">
            <Skeleton className="w-full sm:w-40 h-32" />
            <div className="flex-1 p-4 space-y-3">
              <div className="flex justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-6 w-24" />
              </div>
              <Skeleton className="h-4 w-full" />
              <div className="flex justify-between">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-1.5 w-full rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function ServiceList({
  activeServices,
  completedServices,
  isLoading,
  activeLoading,
  historialLoading,
  isInternalUser = false,
  viewContext = "customer",
  clientName,
  operatorName,
  onClearClient,
  onBackToSelector,
  onTabChange,
  onRefreshActive,
  onRefreshHistorial,
}: ServiceListProps) {
  const [currentTab, setCurrentTab] = useState<"active" | "history">("active")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const totalPending = activeServices.reduce((acc, s) => acc + s.pendingApprovals, 0)

  // Banner configuration based on view context
  const bannerConfig = useMemo(() => {
    // Operador viendo servicios de cliente
    if (viewContext === "operator-client" && clientName) {
      return {
        icon: <User className="h-5 w-5 text-primary" />,
        bgColor: "bg-primary/10 dark:bg-primary/20",
        label: "Viendo servicios de",
        name: clientName,
        buttonLabel: "Volver al menú",
        onAction: onBackToSelector || onClearClient,
      }
    }

    // Operador viendo servicios propios
    if (viewContext === "operator-own" && operatorName) {
      return {
        icon: <Wrench className="h-5 w-5 text-green-600 dark:text-green-400" />,
        bgColor: "bg-green-500/10 dark:bg-green-500/20",
        label: "Mis servicios personales",
        name: operatorName,
        buttonLabel: "Volver al menú",
        onAction: onBackToSelector,
      }
    }

    return null
  }, [viewContext, clientName, operatorName, onBackToSelector, onClearClient])

  // Mostrar botones de aprobación solo para customers y operadores viendo servicios propios
  const showApprovalActions = viewContext === "customer" || viewContext === "operator-own"

  // Handle tab change with lazy loading
  const handleTabChange = useCallback((value: string) => {
    const tab = value as "active" | "history"
    setCurrentTab(tab)
    onTabChange?.(tab)
  }, [onTabChange])

  // Handle refresh for current tab
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    try {
      if (currentTab === "active" && onRefreshActive) {
        await onRefreshActive()
      } else if (currentTab === "history" && onRefreshHistorial) {
        await onRefreshHistorial()
      }
    } finally {
      setIsRefreshing(false)
    }
  }, [currentTab, onRefreshActive, onRefreshHistorial])

  // Pull-to-refresh hook
  const { pullToRefreshProps, isPulling, pullDistance } = usePullToRefresh({
    onRefresh: handleRefresh,
    disabled: isLoading || isRefreshing,
  })

  // Check if on mobile/tablet for pull-to-refresh hint
  const isMobile = useIsMobile()

  // Show pull-to-refresh hint toast on first visit (mobile/tablet only)
  useEffect(() => {
    if (!isMobile) return

    const hasShownHint = localStorage.getItem(PULL_TO_REFRESH_HINT_KEY)
    if (hasShownHint) return

    // Show hint after a short delay
    const timeoutId = setTimeout(() => {
      toast.info("Desliza hacia abajo para actualizar", {
        description: "Puedes refrescar los datos deslizando desde arriba",
        icon: <Hand className="h-5 w-5" />,
        duration: 5000,
      })
      localStorage.setItem(PULL_TO_REFRESH_HINT_KEY, "true")
    }, 1500)

    return () => clearTimeout(timeoutId)
  }, [isMobile])

  // Tab configuration for ScrollableTabs
  const tabs = [
    {
      value: "active",
      label: "Servicios Activos",
      icon: <Car className="h-4 w-4 shrink-0" />,
      badge: activeServices.length > 0 && (
        <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded-full">
          {activeServices.length}
        </span>
      ),
    },
    {
      value: "history",
      label: "Historial",
      icon: <History className="h-4 w-4 shrink-0" />,
    },
  ]

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <ServiceListSkeleton />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Banner dinámico según el contexto */}
      {bannerConfig && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg border bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-full ${bannerConfig.bgColor} flex items-center justify-center`}>
              {bannerConfig.icon}
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">{bannerConfig.label}</p>
              <p className="font-semibold text-gray-900 dark:text-white">{bannerConfig.name}</p>
            </div>
          </div>
          {bannerConfig.onAction && (
            <Button
              variant="outline"
              size="sm"
              onClick={bannerConfig.onAction}
              className="shrink-0"
            >
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              {bannerConfig.buttonLabel}
            </Button>
          )}
        </motion.div>
      )}

      {/* Badge de aprobaciones pendientes */}
      {!showApprovalActions && totalPending > 0 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="outline" className="border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400">
            {totalPending} pendiente{totalPending > 1 ? "s" : ""}
          </Badge>
          <span>de aprobación por el cliente</span>
        </div>
      )}

      {/* Refresh button for desktop */}
      <div className="hidden sm:flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing || activeLoading || historialLoading}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          Actualizar
        </Button>
      </div>

      {/* Pull-to-refresh indicator for mobile */}
      <div className="sm:hidden overflow-hidden">
        <AnimatePresence mode="wait">
          {(isPulling || isRefreshing) && (
            <motion.div
              key="pull-indicator"
              initial={{ opacity: 0, y: -40 }}
              animate={{
                opacity: 1,
                y: 0,
                scale: isRefreshing ? 1 : Math.min(1, 0.85 + (pullDistance / 80) * 0.15)
              }}
              exit={{ opacity: 0, y: -40 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 30,
              }}
              className="flex justify-center py-3"
            >
              <motion.div
                className="flex items-center gap-2 text-sm bg-muted/50 backdrop-blur-sm px-4 py-2 rounded-full border shadow-sm"
                animate={{
                  backgroundColor: isRefreshing
                    ? "hsl(var(--primary) / 0.1)"
                    : "hsl(var(--muted) / 0.5)"
                }}
                transition={{ duration: 0.2 }}
              >
                <motion.div
                  animate={{
                    rotate: isRefreshing ? 360 : pullDistance * 3,
                  }}
                  transition={{
                    rotate: isRefreshing
                      ? { duration: 1, repeat: Infinity, ease: "linear" }
                      : { duration: 0 }
                  }}
                >
                  <RefreshCw className="h-4 w-4 text-primary" />
                </motion.div>
                <span className="text-muted-foreground font-medium">
                  {isRefreshing ? "Actualizando..." : "Suelta para actualizar"}
                </span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div {...pullToRefreshProps}>
        <ScrollableTabs tabs={tabs} value={currentTab} onValueChange={handleTabChange}>
          {/* Alert for pending approvals - ONLY for clients, NOT internal users */}
          {!isInternalUser && totalPending > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-orange-500/30 bg-orange-500/5 p-4"
          >
            <div className="flex items-center gap-3">
              <div className="shrink-0 h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                <Inbox className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="font-medium text-sm">
                  Tienes {totalPending} trabajo{totalPending > 1 ? "s" : ""} adicional{totalPending > 1 ? "es" : ""} pendiente{totalPending > 1 ? "s" : ""} de aprobación
                </p>
                <p className="text-xs text-muted-foreground">
                  Revisa los detalles de cada servicio para aprobar o rechazar
                </p>
              </div>
            </div>
          </motion.div>
        )}

        <TabsContent value="active" className="mt-0">
          {activeLoading ? (
            <ServiceListSkeleton />
          ) : (
            <AnimatePresence mode="wait">
              {activeServices.length === 0 ? (
                <EmptyState type="active" />
              ) : (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-4"
                >
                  {activeServices.map((service) => (
                    <motion.div key={`${service.tipo}-${service.id}`} variants={itemVariants}>
                      <ServiceCard service={service} />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-0">
          {historialLoading ? (
            <ServiceListSkeleton />
          ) : (
            <AnimatePresence mode="wait">
              {completedServices.length === 0 ? (
                <EmptyState type="history" />
              ) : (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-4"
                >
                  {completedServices.map((service) => (
                    <motion.div key={`${service.tipo}-${service.id}`} variants={itemVariants}>
                      <ServiceCard service={service} />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </TabsContent>
        </ScrollableTabs>
      </div>
    </div>
  )
}

