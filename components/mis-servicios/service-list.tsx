"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Car, History, Inbox, User, ArrowLeft } from "lucide-react"
import { ScrollableTabs, TabsContent } from "@/components/ui/scrollable-tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ServiceCard } from "@/components/mis-servicios/service-card"
import type { ClientService } from "@/lib/mis-servicios/types"

interface ServiceListProps {
  activeServices: ClientService[]
  completedServices: ClientService[]
  isLoading?: boolean
  /** When true, hides client-specific CTAs like the big approval banner */
  isInternalUser?: boolean
  /** Name of the client being viewed (for internal users) */
  clientName?: string
  /** Callback to clear client selection (for internal users) */
  onClearClient?: () => void
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
  isInternalUser = false,
  clientName,
  onClearClient
}: ServiceListProps) {
  const totalPending = activeServices.reduce((acc, s) => acc + s.pendingApprovals, 0)

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
      {/* Internal user header - Shows which client they're viewing */}
      {isInternalUser && clientName && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg border bg-muted/30"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Viendo servicios de</p>
              <p className="font-semibold">{clientName}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onClearClient}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Nueva búsqueda
          </Button>
        </motion.div>
      )}

      {/* Internal user info badge about pending approvals (non-actionable) */}
      {isInternalUser && totalPending > 0 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="outline" className="border-amber-500/50 bg-amber-500/10 text-amber-600">
            {totalPending} pendiente{totalPending > 1 ? "s" : ""}
          </Badge>
          <span>de aprobación por el cliente</span>
        </div>
      )}

      <ScrollableTabs tabs={tabs} defaultValue="active">
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
                  <motion.div key={service.id} variants={itemVariants}>
                    <ServiceCard service={service} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="history" className="mt-0">
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
                  <motion.div key={service.id} variants={itemVariants}>
                    <ServiceCard service={service} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>
      </ScrollableTabs>
    </div>
  )
}

