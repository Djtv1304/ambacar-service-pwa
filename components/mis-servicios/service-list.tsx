"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Car, History, Inbox } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { ServiceCard } from "@/components/mis-servicios/service-card"
import type { ClientService } from "@/lib/mis-servicios/types"

interface ServiceListProps {
  activeServices: ClientService[]
  completedServices: ClientService[]
  isLoading?: boolean
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

export function ServiceList({ activeServices, completedServices, isLoading }: ServiceListProps) {
  const totalPending = activeServices.reduce((acc, s) => acc + s.pendingApprovals, 0)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <ServiceListSkeleton />
      </div>
    )
  }

  return (
    <Tabs defaultValue="active" className="space-y-6">
      <TabsList className="w-full sm:w-auto grid grid-cols-2 sm:inline-flex">
        <TabsTrigger value="active" className="gap-2">
          <Car className="h-4 w-4" />
          <span>Servicios Activos</span>
          {activeServices.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded-full">
              {activeServices.length}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="history" className="gap-2">
          <History className="h-4 w-4" />
          <span>Historial</span>
        </TabsTrigger>
      </TabsList>

      {/* Alert for pending approvals */}
      {totalPending > 0 && (
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
    </Tabs>
  )
}

