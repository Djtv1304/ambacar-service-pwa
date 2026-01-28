/**
 * Phase Notification Service
 * Dispatches notifications when work order phases change
 */

const NOTIFICATIONS_API_BASE_URL =
  process.env.NEXT_PUBLIC_NOTIFICATIONS_API_URL || "http://localhost:8001"

// Service Types
export type ServiceTypeSlug =
  | "mantenimiento-preventivo"
  | "averia-revision"
  | "colision-pintura"
  | "avaluo-comercial"
  | "avaluo-mg"

// Phase IDs (slugs)
export type PhaseSlug =
  | "phase-schedule"
  | "phase-reception"
  | "phase-repair"
  | "phase-quality"
  | "phase-delivery"

// Event Types
export type PhaseEventType =
  | "appointment_scheduled"
  | "vehicle_received"
  | "repair_started"
  | "quality_check"
  | "vehicle_ready"

// Mapeo de fases internas a slugs de la API de notificaciones
export const INTERNAL_PHASE_TO_SLUG: Record<string, PhaseSlug> = {
  recepcion: "phase-reception",
  diagnostico: "phase-reception", // Diagnóstico es parte de recepción
  reparacion: "phase-repair",
  calidad: "phase-quality",
  entrega: "phase-delivery",
}

// Mapeo de fases a eventos
export const PHASE_SLUG_TO_EVENT: Record<PhaseSlug, PhaseEventType> = {
  "phase-schedule": "appointment_scheduled",
  "phase-reception": "vehicle_received",
  "phase-repair": "repair_started",
  "phase-quality": "quality_check",
  "phase-delivery": "vehicle_ready",
}

interface DispatchContext {
  nombre: string
  vehiculo: string
  placa: string
  fecha?: string
  hora?: string
  orden?: string
  tecnico?: string
  taller?: string
}

interface DispatchRequest {
  event_type: PhaseEventType
  service_type_id: ServiceTypeSlug
  phase_id: PhaseSlug
  customer_id: string
  target: "clients" | "staff"
  context: DispatchContext
}

interface DispatchResponse {
  success: boolean
  correlation_id: string
  notifications_queued: number
  errors: string[]
}

/**
 * Dispara una notificación de cambio de fase
 */
export async function dispatchPhaseNotification(
  request: DispatchRequest
): Promise<DispatchResponse> {
  const url = `${NOTIFICATIONS_API_BASE_URL}/api/v1/notifications/events/dispatch/`

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("[PhaseNotification] Dispatch failed:", data)
      throw new Error(data.error || data.detail || `HTTP ${response.status}`)
    }

    console.log(
      `[PhaseNotification] Dispatched ${request.event_type} to customer_id=${request.customer_id}: ${data.notifications_queued} notifications queued`
    )
    return data
  } catch (error) {
    console.error("[PhaseNotification] Error:", error)
    throw error
  }
}

/**
 * Contexto base para notificaciones de fase
 */
interface PhaseNotificationParams {
  customerId: string
  customerName: string
  vehicleDisplay: string
  vehiclePlate: string
  orderNumber?: string
  technicianName?: string
  serviceType?: ServiceTypeSlug
}

/**
 * Notifica que la recepción del vehículo ha iniciado
 * Disparar cuando: Staff inicia la fase de recepción
 */
export async function notifyReceptionStarted(
  params: PhaseNotificationParams
): Promise<DispatchResponse> {
  return dispatchPhaseNotification({
    event_type: "vehicle_received",
    service_type_id: params.serviceType || "mantenimiento-preventivo",
    phase_id: "phase-reception",
    customer_id: params.customerId,
    target: "clients",
    context: {
      nombre: params.customerName,
      vehiculo: params.vehicleDisplay,
      placa: params.vehiclePlate,
      orden: params.orderNumber,
      taller: "Ambacar Service",
    },
  })
}

/**
 * Notifica que la reparación ha iniciado
 * Disparar cuando: La fase de recepción/diagnóstico termina y empieza reparación
 */
export async function notifyRepairStarted(
  params: PhaseNotificationParams
): Promise<DispatchResponse> {
  return dispatchPhaseNotification({
    event_type: "repair_started",
    service_type_id: params.serviceType || "mantenimiento-preventivo",
    phase_id: "phase-repair",
    customer_id: params.customerId,
    target: "clients",
    context: {
      nombre: params.customerName,
      vehiculo: params.vehicleDisplay,
      placa: params.vehiclePlate,
      orden: params.orderNumber,
      tecnico: params.technicianName,
      taller: "Ambacar Service",
    },
  })
}

/**
 * Notifica que el control de calidad ha iniciado
 * Disparar cuando: La OT pasa a estado de control de calidad
 */
export async function notifyQualityCheckStarted(
  params: PhaseNotificationParams
): Promise<DispatchResponse> {
  return dispatchPhaseNotification({
    event_type: "quality_check",
    service_type_id: params.serviceType || "mantenimiento-preventivo",
    phase_id: "phase-quality",
    customer_id: params.customerId,
    target: "clients",
    context: {
      nombre: params.customerName,
      vehiculo: params.vehicleDisplay,
      placa: params.vehiclePlate,
      orden: params.orderNumber,
      taller: "Ambacar Service",
    },
  })
}

/**
 * Notifica que el vehículo está listo para entrega (lavado completado)
 * Disparar cuando: La OT pasa a estado de entrega/lavado
 */
export async function notifyVehicleReady(
  params: PhaseNotificationParams
): Promise<DispatchResponse> {
  return dispatchPhaseNotification({
    event_type: "vehicle_ready",
    service_type_id: params.serviceType || "mantenimiento-preventivo",
    phase_id: "phase-delivery",
    customer_id: params.customerId,
    target: "clients",
    context: {
      nombre: params.customerName,
      vehiculo: params.vehicleDisplay,
      placa: params.vehiclePlate,
      orden: params.orderNumber,
      taller: "Ambacar Service",
    },
  })
}

/**
 * Helper para notificar basado en la fase que INICIA
 * Útil para llamar cuando una fase comienza
 */
export async function notifyPhaseStarted(
  internalPhase: string,
  params: PhaseNotificationParams
): Promise<DispatchResponse | null> {
  switch (internalPhase) {
    case "recepcion":
      return notifyReceptionStarted(params)
    case "reparacion":
      return notifyRepairStarted(params)
    case "calidad":
      return notifyQualityCheckStarted(params)
    case "entrega":
      return notifyVehicleReady(params)
    default:
      console.log(`[PhaseNotification] No notification for phase: ${internalPhase}`)
      return null
  }
}

/**
 * Helper para notificar cuando una fase TERMINA
 * La notificación es para la fase que INICIA después
 */
export async function notifyPhaseCompleted(
  completedPhase: string,
  params: PhaseNotificationParams
): Promise<DispatchResponse | null> {
  // Cuando una fase termina, notificamos el inicio de la siguiente
  switch (completedPhase) {
    case "recepcion":
    case "diagnostico":
      // Después de recepción/diagnóstico viene reparación
      return notifyRepairStarted(params)
    case "reparacion":
      // Después de reparación viene control de calidad
      return notifyQualityCheckStarted(params)
    case "calidad":
      // Después de calidad viene entrega (lavado)
      return notifyVehicleReady(params)
    default:
      console.log(`[PhaseNotification] No next phase notification for: ${completedPhase}`)
      return null
  }
}
