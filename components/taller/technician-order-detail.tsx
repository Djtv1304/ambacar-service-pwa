"use client"

import { useState, useCallback } from "react"
import { motion } from "framer-motion"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TechnicianOrderHeader } from "@/components/taller/technician-order-header"
import { OrderInfoCard } from "@/components/taller/order-info-card"
import { PhaseTimeline, type PhaseCompletionData } from "@/components/taller/phase-timeline"
import { AdditionalWorkList } from "@/components/taller/additional-work-list"
import { RepuestosList, type Repuesto } from "@/components/ot/ot-repuestos-list"
import { RegistroHallazgoDialog } from "@/components/hallazgos/registro-hallazgo-dialog"
import type { TechnicianOrder } from "@/lib/fixtures/technical-progress"
import { completarEtapaOrdenTrabajo } from "@/lib/api/taller"
import { useAuthToken } from "@/hooks/use-auth-token"
import { toast } from "sonner"
import {
  notifyPhaseCompleted,
  type ServiceTypeSlug,
} from "@/lib/services/phase-notification-service"

interface TechnicianOrderDetailProps {
  order: TechnicianOrder
}

// Mapeo de tipo de orden a service type slug para notificaciones
function getServiceTypeSlug(tipoOrden: TechnicianOrder["tipoOrden"]): ServiceTypeSlug {
  switch (tipoOrden) {
    case "mantenimiento":
      return "mantenimiento-preventivo"
    case "reparacion":
      return "averia-revision"
    case "garantia":
      return "averia-revision"
    default:
      return "mantenimiento-preventivo"
  }
}

export function TechnicianOrderDetail({ order: initialOrder }: TechnicianOrderDetailProps) {
  const [order, setOrder] = useState(initialOrder)
  const [hallazgoDialogOpen, setHallazgoDialogOpen] = useState(false)
  const { getToken } = useAuthToken()

  // Transform repuestosUtilizados to Repuesto[] format for RepuestosList
  const repuestos: Repuesto[] = order.repuestosUtilizados.map((r) => ({
    id: r.id,
    codigo: r.codigo,
    descripcion: r.descripcion,
    cantidad: r.cantidad,
    unidad: r.unidad,
    precioUnitario: r.precioUnitario,
  }))

  // Handle status change
  const handleStatusChange = useCallback(async (newStatus: TechnicianOrder["estado"]) => {
    // TODO: API call to update status
    setOrder(prev => ({ ...prev, estado: newStatus }))
    toast.success(`Estado actualizado a "${newStatus}"`)
  }, [])

  // Handle phase completion
  const handleCompletePhase = useCallback(async (etapaOrdenTrabajoId: number, phaseId: string, data: PhaseCompletionData) => {
    try {
      // Get auth token
      const token = await getToken()
      if (!token) {
        throw new Error("No se pudo obtener el token de autenticación")
      }

      // Call API to complete phase using etapaOrdenTrabajoId
      await completarEtapaOrdenTrabajo(etapaOrdenTrabajoId.toString(), {
        observaciones: data.observaciones,
        evidencia: data.evidencia,
        responsable_id: data.responsable_id,
      }, token)

      // Find the completed phase to determine what notification to send
      const completedPhase = order.fases.find(f => f.id === phaseId)
      const completedPhaseName = completedPhase?.fase

      // Update local state on success
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

      // Dispatch phase notification (fire-and-forget, don't block the flow)
      if (completedPhaseName) {
        notifyPhaseCompleted(completedPhaseName, {
          customerId: order.cliente.id,
          customerName: `${order.cliente.nombre} ${order.cliente.apellido}`,
          vehicleDisplay: `${order.vehiculo.marca} ${order.vehiculo.modelo}`,
          vehiclePlate: order.vehiculo.placa,
          orderNumber: order.codigo,
          technicianName: order.tecnicoAsignado?.nombre,
          serviceType: getServiceTypeSlug(order.tipoOrden),
        }).then(result => {
          if (result) {
            console.log(`[Notification] Phase ${completedPhaseName} completed, ${result.notifications_queued} notifications sent`)
          }
        }).catch(err => {
          console.error("[Notification] Failed to send phase notification:", err)
          // Don't show error to user, notifications are non-blocking
        })
      }
    } catch (error) {
      console.error("Error completing phase:", error)
      throw error // Re-throw so PhaseTimeline can handle it
    }
  }, [getToken, order])

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

  // Handle adding a new repuesto
  const handleAddRepuesto = useCallback(async (repuesto: Omit<Repuesto, "id">) => {
    // Add to local state after successful API call (handled in RepuestosList)
    setOrder(prev => ({
      ...prev,
      repuestosUtilizados: [
        ...prev.repuestosUtilizados,
        {
          id: `r-${Date.now()}`,
          codigo: repuesto.codigo,
          descripcion: repuesto.descripcion,
          cantidad: repuesto.cantidad,
          unidad: repuesto.unidad,
          precioUnitario: repuesto.precioUnitario,
        },
      ],
    }))
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
            currentTecnicoId={order.tecnicoAsignado?.id}
            currentTecnicoNombre={order.tecnicoAsignado?.nombre}
          />
        </motion.div>

        {/* Additional Work */}
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

        {/* Repuestos - Uses shared component with ERP stock search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <RepuestosList
            repuestos={repuestos}
            onAddRepuesto={handleAddRepuesto}
            sucursalOT={order.sucursal?.nombre}
          />
        </motion.div>
      </div>

      {/* Floating Action Button - Register Finding */}
      <div className="fixed bottom-6 right-6 z-40">
        <Button
          size="lg"
          className="shadow-lg gap-2 rounded-full h-14 px-6"
          onClick={() => setHallazgoDialogOpen(true)}
        >
          <Plus className="h-5 w-5" />
          <span className="hidden sm:inline">Registrar Hallazgo</span>
        </Button>
      </div>

      {/* Registro de Hallazgos Dialog */}
      <RegistroHallazgoDialog
        open={hallazgoDialogOpen}
        onOpenChange={setHallazgoDialogOpen}
        ordenTrabajoId={parseInt(order.id, 10)}
        clienteNombre={`${order.cliente.nombre} ${order.cliente.apellido}`}
        onHallazgoRegistrado={() => {
          toast.success("Hallazgo registrado correctamente")
        }}
      />
    </div>
  )
}

