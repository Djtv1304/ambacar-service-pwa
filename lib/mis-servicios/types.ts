// Types for the "Mis Servicios" (Client Service Tracking) module

// Service Status for client-facing views
export type ServiceStatus =
  | "recepcion"
  | "diagnostico"
  | "en_progreso"
  | "esperando_aprobacion"
  | "listo"
  | "entregado"

export interface ServiceStatusInfo {
  code: ServiceStatus
  label: string
  color: string
  bgColor: string
  borderColor: string
  progress: number
}

export const SERVICE_STATUS_MAP: Record<ServiceStatus, ServiceStatusInfo> = {
  recepcion: {
    code: "recepcion",
    label: "En Recepción",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    progress: 10,
  },
  diagnostico: {
    code: "diagnostico",
    label: "En Diagnóstico",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/20",
    progress: 25,
  },
  en_progreso: {
    code: "en_progreso",
    label: "En Progreso",
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-500/20",
    progress: 50,
  },
  esperando_aprobacion: {
    code: "esperando_aprobacion",
    label: "Esperando Aprobación",
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/20",
    progress: 40,
  },
  listo: {
    code: "listo",
    label: "Listo",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/20",
    progress: 100,
  },
  entregado: {
    code: "entregado",
    label: "Entregado",
    color: "text-emerald-600",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
    progress: 100,
  },
}

// Client Service represents a vehicle currently in service
export interface ClientService {
  id: string
  ordenTrabajoId: string
  numeroOrden: string
  vehiculo: {
    id: string
    placa: string
    marca: string
    modelo: string
    anio: number
    color: string
    imagen?: string
  }
  estado: ServiceStatus
  progreso: number // 0-100
  fechaIngreso: Date
  fechaEstimadaEntrega?: Date
  taller: {
    nombre: string
    direccion: string
  }
  pendingApprovals: number
  totalEstimado: number
  servicioSolicitado: string
}

// Timeline Event for service progress visualization
export interface TimelineEvent {
  id: string
  fase: string
  descripcion: string
  fecha: Date
  completada: boolean
  enProgreso: boolean
  evidencia?: TimelineEvidence[]
  responsable?: string
  notas?: string
}

export interface TimelineEvidence {
  id: string
  tipo: "foto" | "video" | "audio" | "documento"
  url: string
  thumbnail?: string
  descripcion?: string
  fecha: Date
}

// Additional Work Item (Trabajo Adicional)
export interface AdditionalWork {
  id: string
  titulo: string
  descripcion: string
  justificacionTecnica: string
  severidad: "critico" | "importante" | "recomendado" | "opcional"
  costoManoObra: number
  costoRepuestos: number
  costoTotal: number
  repuestos: AdditionalWorkPart[]
  fotos?: string[]
  estado: "pendiente" | "aprobado" | "rechazado"
  fechaSolicitud: Date
  fechaRespuesta?: Date
}

export interface AdditionalWorkPart {
  id: string
  nombre: string
  cantidad: number
  precioUnitario: number
  subtotal: number
}

// Service Detail - Complete service information
export interface ServiceDetail extends ClientService {
  cliente: {
    id: string
    nombre: string
    apellido: string
    email: string
    telefono: string
  }
  recepcion: {
    kilometraje: number
    nivelCombustible: number
    observaciones?: string
    fotosIngreso: string[]
  }
  timeline: TimelineEvent[]
  trabajosAdicionales: AdditionalWork[]
  trabajosAprobados: AdditionalWork[]
  trabajosRechazados: AdditionalWork[]
  subtotal: number
  descuento: number
  iva: number
  total: number
  tecnicoAsignado?: {
    id: string
    nombre: string
    especialidad?: string
  }
}

// Proforma/Budget item
export interface ProformaItem {
  descripcion: string
  detalle?: string
  cantidad: number
  precioUnitario: number
  subtotal: number
}

// Completion Report
export interface ServiceCompletionReport {
  id: string
  ordenTrabajoId: string
  vehiculo: {
    placa: string
    marca: string
    modelo: string
  }
  cliente: {
    nombre: string
    apellido: string
  }
  fechaIngreso: Date
  fechaFinalizacion: Date
  fasesCompletadas: TimelineEvent[]
  trabajosRealizados: {
    descripcion: string
    tecnico: string
    completadoEn: Date
  }[]
  trabajosAdicionalesAprobados: AdditionalWork[]
  evidenciaAntes: string[]
  evidenciaDespues: string[]
  costoFinal: {
    manoObra: number
    repuestos: number
    adicionales: number
    descuento: number
    subtotal: number
    iva: number
    total: number
  }
}

// Hook return type for useServiceData
export interface UseServiceDataReturn {
  service: ServiceDetail | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
  approveWork: (workId: string) => Promise<void>
  rejectWork: (workId: string) => Promise<void>
}

