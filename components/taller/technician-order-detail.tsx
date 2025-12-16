"use client"

import { useState, useCallback } from "react"
import { motion } from "framer-motion"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TechnicianOrderHeader } from "@/components/taller/technician-order-header"
import { OrderInfoCard } from "@/components/taller/order-info-card"
import { PhaseTimeline } from "@/components/taller/phase-timeline"
import { AdditionalWorkList } from "@/components/taller/additional-work-list"
import { PartsUsedList } from "@/components/taller/parts-used-list"
import type { TechnicianOrder } from "@/lib/fixtures/technical-progress"
import { toast } from "sonner"

interface TechnicianOrderDetailProps {
  order: TechnicianOrder
}

export function TechnicianOrderDetail({ order: initialOrder }: TechnicianOrderDetailProps) {
  const [order, setOrder] = useState(initialOrder)

  // Handle status change
  const handleStatusChange = useCallback(async (newStatus: TechnicianOrder["estado"]) => {
    // TODO: API call to update status
    setOrder(prev => ({ ...prev, estado: newStatus }))
    toast.success(`Estado actualizado a "${newStatus}"`)
  }, [])

  // Handle phase completion
  const handleCompletePhase = useCallback(async (phaseId: string, data: { observaciones: string; evidencia: File[] }) => {
    // TODO: API call to complete phase
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API

    setOrder(prev => {
      const updatedFases = [...prev.fases]
      const currentIndex = updatedFases.findIndex(f => f.id === phaseId)

      if (currentIndex !== -1) {
        // Complete current phase
        updatedFases[currentIndex] = {
          ...updatedFases[currentIndex],
          estado: "completed",
          fechaFin: new Date(),
          observaciones: data.observaciones,
        }

        // Start next phase if exists
        if (currentIndex + 1 < updatedFases.length) {
          updatedFases[currentIndex + 1] = {
            ...updatedFases[currentIndex + 1],
            estado: "in_progress",
            fechaInicio: new Date(),
            duracionMinutos: 0,
          }
        }
      }

      return { ...prev, fases: updatedFases }
    })

    toast.success("Fase completada exitosamente")
  }, [])

  // Handle additional work toggle
  const handleToggleWork = useCallback(async (itemId: string, completed: boolean) => {
    // TODO: API call to update work item
    await new Promise(resolve => setTimeout(resolve, 500)) // Simulate API

    setOrder(prev => ({
      ...prev,
      trabajosAdicionales: prev.trabajosAdicionales.map(item =>
        item.id === itemId ? { ...item, completado: completed } : item
      ),
    }))

    toast.success(completed ? "Trabajo marcado como realizado" : "Trabajo marcado como pendiente")
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <TechnicianOrderHeader
        order={order}
        onStatusChange={handleStatusChange}
      />

      {/* Main Content */}
      <div className="p-4 pb-24 space-y-4 max-w-4xl mx-auto">
        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <OrderInfoCard order={order} />
        </motion.div>

        {/* Phase Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <PhaseTimeline
            phases={order.fases}
            onCompletePhase={handleCompletePhase}
          />
        </motion.div>

        {/* Additional Work */}
        {order.trabajosAdicionales.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <AdditionalWorkList
              items={order.trabajosAdicionales}
              onToggleComplete={handleToggleWork}
            />
          </motion.div>
        )}

        {/* Parts Used */}
        {order.repuestosUtilizados.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <PartsUsedList parts={order.repuestosUtilizados} />
          </motion.div>
        )}
      </div>

      {/* Floating Action Button - Register Finding */}
      <div className="fixed bottom-6 right-6 z-40">
        <Button size="lg" className="shadow-lg gap-2 rounded-full h-14 px-6">
          <Plus className="h-5 w-5" />
          <span className="hidden sm:inline">Registrar Hallazgo</span>
        </Button>
      </div>
    </div>
  )
}

