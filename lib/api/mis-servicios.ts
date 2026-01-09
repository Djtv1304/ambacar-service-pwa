import type {
  ClientService,
  ServiceStatus,
  ServiceDetail,
  ServiceDetailAPIResponse,
  AdditionalWork,
  AdditionalWorkAPIResponse,
  TimelineEvent,
  TimelineEventAPIResponse,
  WorkActionAPIResponse,
} from "@/lib/mis-servicios/types"
import { apiRequest } from "./client"

/**
 * Tipo raw de la respuesta de la API (fechas como strings ISO)
 */
interface MisServicioAPIResponse {
  id: number
  ordenTrabajoId: string
  numeroOrden: string
  vehiculo: {
    id: string
    placa: string
    marca: string
    modelo: string
    anio: number
    color: string
  }
  estado: ServiceStatus
  progreso: number
  fechaIngreso: string
  fechaEstimadaEntrega: string | null
  taller: {
    nombre: string
    direccion: string
  }
  pendingApprovals: number
  totalEstimado: number
  servicioSolicitado: string
}

/**
 * Transforma la respuesta de la API al tipo ClientService usado por la UI
 * - Convierte strings ISO a objetos Date
 */
function transformToClientService(data: MisServicioAPIResponse): ClientService {
  return {
    ...data,
    fechaIngreso: new Date(data.fechaIngreso),
    fechaEstimadaEntrega: data.fechaEstimadaEntrega
      ? new Date(data.fechaEstimadaEntrega)
      : undefined,
  }
}

/**
 * Obtiene los servicios activos del usuario actual
 * GET /api/mis-servicios/
 */
export async function getMisServiciosActivos(token: string): Promise<ClientService[]> {
  const data = await apiRequest<MisServicioAPIResponse[]>("/api/mis-servicios/", {
    method: "GET",
    token,
  })
  return data.map(transformToClientService)
}

/**
 * Obtiene el historial de servicios completados del usuario actual
 * GET /api/mis-servicios/historial/
 */
export async function getMisServiciosHistorial(token: string): Promise<ClientService[]> {
  const data = await apiRequest<MisServicioAPIResponse[]>("/api/mis-servicios/historial/", {
    method: "GET",
    token,
  })
  return data.map(transformToClientService)
}

// ===========================================
// Transformaciones para ServiceDetail
// ===========================================

/**
 * Transforma un trabajo adicional de la API al tipo de la UI
 * - Convierte costos de string a number
 * - Convierte fechas de ISO string a Date
 */
function transformAdditionalWork(work: AdditionalWorkAPIResponse): AdditionalWork {
  return {
    ...work,
    costoManoObra: parseFloat(work.costoManoObra),
    costoRepuestos: parseFloat(work.costoRepuestos),
    costoTotal: parseFloat(work.costoTotal),
    fechaSolicitud: new Date(work.fechaSolicitud),
    fechaRespuesta: work.fechaRespuesta ? new Date(work.fechaRespuesta) : undefined,
  }
}

/**
 * Transforma un evento de timeline de la API al tipo de la UI
 * - Convierte fecha de ISO string a Date
 * - Convierte null a undefined para campos opcionales
 */
function transformTimelineEvent(event: TimelineEventAPIResponse): TimelineEvent {
  return {
    ...event,
    fecha: new Date(event.fecha),
    notas: event.notas ?? undefined,
  }
}

/**
 * Transforma el detalle completo del servicio de la API al tipo de la UI
 * - Convierte fechas de ISO string a Date
 * - Convierte descuento de string a number
 * - Convierte null a undefined donde corresponda
 */
function transformServiceDetail(data: ServiceDetailAPIResponse): ServiceDetail {
  return {
    ...data,
    fechaIngreso: new Date(data.fechaIngreso),
    fechaEstimadaEntrega: data.fechaEstimadaEntrega
      ? new Date(data.fechaEstimadaEntrega)
      : undefined,
    descuento: parseFloat(data.descuento),
    timeline: data.timeline.map(transformTimelineEvent),
    trabajosAdicionales: data.trabajosAdicionales.map(transformAdditionalWork),
    trabajosAprobados: data.trabajosAprobados.map(transformAdditionalWork),
    trabajosRechazados: data.trabajosRechazados.map(transformAdditionalWork),
    tecnicoAsignado: data.tecnicoAsignado
      ? {
          ...data.tecnicoAsignado,
          especialidad: data.tecnicoAsignado.especialidad ?? undefined,
        }
      : undefined,
  }
}

// ===========================================
// API para Detalle del Servicio
// ===========================================

/**
 * Obtiene el detalle completo de un servicio por su ID
 * GET /api/mis-servicios/{serviceId}/
 */
export async function getServiceDetail(
  serviceId: number | string,
  token: string
): Promise<ServiceDetail> {
  const data = await apiRequest<ServiceDetailAPIResponse>(
    `/api/mis-servicios/${serviceId}/`,
    { method: "GET", token }
  )
  return transformServiceDetail(data)
}

/**
 * Aprueba un trabajo adicional
 * POST /api/mis-servicios/{serviceId}/aprobar-trabajo/{workId}/
 *
 * @returns El mensaje de confirmación y el trabajo actualizado
 */
export async function approveAdditionalWork(
  serviceId: number | string,
  workId: number,
  token: string
): Promise<{ message: string; trabajo: AdditionalWork }> {
  const data = await apiRequest<WorkActionAPIResponse>(
    `/api/mis-servicios/${serviceId}/aprobar-trabajo/${workId}/`,
    { method: "POST", token }
  )
  return {
    message: data.message,
    trabajo: transformAdditionalWork(data.trabajo),
  }
}

/**
 * Rechaza un trabajo adicional
 * POST /api/mis-servicios/{serviceId}/rechazar-trabajo/{workId}/
 *
 * @returns El mensaje de confirmación y el trabajo actualizado
 */
export async function rejectAdditionalWork(
  serviceId: number | string,
  workId: number,
  token: string
): Promise<{ message: string; trabajo: AdditionalWork }> {
  const data = await apiRequest<WorkActionAPIResponse>(
    `/api/mis-servicios/${serviceId}/rechazar-trabajo/${workId}/`,
    { method: "POST", token }
  )
  return {
    message: data.message,
    trabajo: transformAdditionalWork(data.trabajo),
  }
}

// ===========================================
// API para Búsqueda de Servicios por Cédula
// ===========================================

/**
 * Busca servicios de un cliente por su cédula
 * GET /api/mis-servicios/buscar-por-cedula/?cedula=XXX
 *
 * Solo accesible por usuarios internos (operator, manager, technician)
 *
 * @param cedula - Número de cédula del cliente (10-13 dígitos)
 * @param token - Token de autenticación del usuario interno
 * @returns Información del cliente y su lista de servicios
 */
export async function buscarServiciosPorCedula(
  cedula: string,
  token: string
): Promise<{
  cliente: {
    id: number
    nombre: string
    apellido: string
    cedula: string
    email: string
    telefono: string
  }
  servicios: ClientService[]
}> {
  const response = await apiRequest<{
    cliente: {
      id: number
      nombre: string
      apellido: string
      cedula: string
      email: string
      telefono: string
    }
    servicios: MisServicioAPIResponse[]
  }>(`/api/mis-servicios/buscar-por-cedula/?cedula=${cedula}`, {
    method: "GET",
    token,
  })

  // Transformar servicios al formato ClientService
  const servicios: ClientService[] = response.servicios.map(transformToClientService)

  return {
    cliente: response.cliente,
    servicios,
  }
}
