import type {
  ClientService,
  ServiceStatus,
  ServiceDetail,
  ServiceDetailAPIResponse,
  AdditionalWork,
  AdditionalWorkAPIResponse,
  TimelineEvent,
  TimelineEventAPIResponse,
  TimelineEvidenceAPIResponse,
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
 * Infiere el tipo de evidencia a partir de la URL del archivo
 */
function inferEvidenceType(url: string): "foto" | "video" | "audio" | "documento" {
  const ext = url.split('.').pop()?.toLowerCase().split('?')[0] || ""
  if (["jpg", "jpeg", "png", "gif", "webp", "bmp"].includes(ext)) return "foto"
  if (["mp4", "mov", "avi", "webm"].includes(ext)) return "video"
  if (["mp3", "wav", "ogg", "m4a"].includes(ext)) return "audio"
  return "foto" // Default to foto for image URLs from the API
}

/**
 * Transforma un evento de timeline de la API al tipo de la UI
 * - Mapea nombre -> fase, estado -> completada/enProgreso, fechaInicio -> fecha
 * - Mapea observaciones -> notas
 * - Infiere tipo de evidencia a partir de la URL
 */
function transformTimelineEvent(event: TimelineEventAPIResponse): TimelineEvent {
  return {
    id: event.id,
    fase: event.nombre,
    descripcion: event.descripcion || "",
    fecha: event.fechaInicio ? new Date(event.fechaInicio) : new Date(),
    completada: event.estado === "completed",
    enProgreso: event.estado === "in_progress",
    evidencia: event.evidencia.map((ev) => ({
      id: ev.id,
      tipo: inferEvidenceType(ev.url),
      url: ev.url,
      thumbnail: ev.url,
      descripcion: ev.descripcion,
      fecha: event.fechaInicio ? new Date(event.fechaInicio) : new Date(),
    })),
    responsable: event.responsable,
    notas: event.observaciones ?? undefined,
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
