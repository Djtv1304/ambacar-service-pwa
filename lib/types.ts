// Core entity types for the Ambacar system

export type UserRole = "admin" | "operator" | "technician" | "manager" | "customer"

export interface User {
  id: number
  email: string
  username: string
  first_name: string
  last_name: string
  role: UserRole
  phone?: string
  avatar?: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Cliente {
  id: string
  cedula: string
  nombre: string
  apellido: string
  email: string
  telefono: string
  direccion?: string
  ciudad: string
  vehiculos: Vehiculo[]
  createdAt: Date
  updatedAt: Date
}

export interface Vehiculo {
  id: string
  clienteId: string
  placa: string
  marca: string
  modelo: string
  anio: number
  color: string
  vin?: string
  kilometraje: number
  ultimoServicio?: Date
  createdAt: Date
  updatedAt: Date
}

export interface Cita {
  id: string
  clienteId: string
  vehiculoPlaca: string
  vehiculoId?: string
  fecha: string
  hora: string
  servicio: string
  observaciones?: string
  estado: "pendiente" | "confirmada" | "en_proceso" | "completada" | "cancelada"
  tecnicoAsignado?: string
  sucursal?: string
  createdAt: string
  updatedAt: string
}

export interface OrdenTrabajo {
  id: string
  numero: string
  citaId?: string
  clienteId: string
  vehiculoId: string
  tecnicoId?: string
  estado:
    | "creada"
    | "en_diagnostico"
    | "presupuestada"
    | "aprobada"
    | "en_proceso"
    | "en_prueba"
    | "completada"
    | "entregada"
  prioridad: "baja" | "media" | "alta" | "urgente"
  fechaIngreso: Date
  fechaEstimadaEntrega?: Date
  fechaEntrega?: Date
  diagnostico?: string
  trabajosRealizados?: string
  observaciones?: string
  subtareas: Subtarea[]
  repuestos: RepuestoOT[]
  totalManoObra: number
  totalRepuestos: number
  total: number
  sucursal: string
  createdAt: Date
  updatedAt: Date
}

export interface Subtarea {
  id: string
  descripcion: string
  tecnicoId?: string
  estado: "pendiente" | "en_proceso" | "completada"
  tiempoEstimado: number // en minutos
  tiempoReal?: number
  createdAt: Date
}

export interface Repuesto {
  id: string
  sku: string
  nombre: string
  descripcion?: string
  categoria: string
  marca: string
  precioCompra: number
  precioVenta: number
  stock: StockSucursal[]
  umbralMinimo: number
  createdAt: Date
  updatedAt: Date
}

export interface StockSucursal {
  sucursal: string
  cantidad: number
  ubicacion?: string
}

export interface RepuestoOT {
  repuestoId: string
  cantidad: number
  precioUnitario: number
  subtotal: number
}

export interface Factura {
  id: string
  numero: string
  ordenTrabajoId: string
  clienteId: string
  fecha: Date
  subtotal: number
  iva: number
  descuento: number
  total: number
  estado: "pendiente" | "pagada" | "anulada"
  metodoPago?: "efectivo" | "tarjeta" | "transferencia" | "credito"
  observaciones?: string
  createdAt: Date
  updatedAt: Date
}

export interface Recepcion {
  id: string
  ordenTrabajoId: string
  vehiculoId: string
  operadorId: string
  fecha: Date
  kilometraje: number
  nivelCombustible: number // 0-100
  estadoExterior: ChecklistItem[]
  estadoInterior: ChecklistItem[]
  observaciones?: string
  fotos: string[]
  firmaCliente?: string
  createdAt: Date
  updatedAt: Date
}

export interface ChecklistItem {
  item: string
  estado: "bueno" | "regular" | "malo" | "no_aplica"
  observacion?: string
}

export interface Diagnostico {
  id: string
  ordenTrabajoId: string
  tecnicoId: string
  fecha: Date
  hallazgos: Hallazgo[]
  recomendaciones?: string
  estado: "en_revision" | "enviado_cliente" | "aprobado" | "rechazado"
  createdAt: Date
  updatedAt: Date
}

export interface Hallazgo {
  id: string
  descripcion: string
  severidad: "critico" | "importante" | "recomendado" | "opcional"
  tiempoEstimado: number // minutos
  costoManoObra: number
  repuestosNecesarios: RepuestoOT[]
  aprobado: boolean
  fotos?: string[]
}

// Auth related types
export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  username: string
  password: string
  password_confirm: string
  first_name: string
  last_name: string
  role: UserRole
  phone?: string
}

export interface AuthResponse {
  user: User
  access: string
  refresh: string
}

export interface Reporte {
  id: string
  tipo: "ventas" | "productividad" | "inventario" | "clientes"
  titulo: string
  fechaInicio: Date
  fechaFin: Date
  parametros: Record<string, any>
  generadoPor: string
  createdAt: Date
}

// API Types for Ordenes de Trabajo
export interface TipoOT {
  id: number
  codigo: string
  nombre: string
  descripcion: string
}

export interface ClienteAPI {
  id: number
  first_name: string
  last_name: string
  email: string
}

export interface VehiculoAPI {
  id: number
  placa: string
  modelo_tecnico_detalle: {
    marca: string
    modelo: string
  }
  cliente: number
}

export interface CreateOrdenTrabajoData {
  tipo: number
  subtipo?: number
  cliente: number
  vehiculo: number
  fecha_promesa_entrega: string
  kilometraje_ingreso: number
  descripcion_trabajo: string
}

export interface SubtipoOT {
  id: number
  codigo: string
  nombre: string
  tipo__codigo: string
  tipo__nombre: string
}

export interface EstadoOT {
  id: number
  codigo: string
  nombre: string
  color: string
  es_inicial: boolean
  es_final: boolean
}

export interface ClienteTestData {
  id: number
  first_name: string
  last_name: string
  email: string
  cedula: string
}

export interface AsesorTestData {
  id: number
  first_name: string
  last_name: string
  email: string
  cedula: string
}

export interface VehiculoTestData {
  id: number
  placa: string
  cliente__id: number
  cliente__first_name: string
  cliente__last_name: string
  modelo_tecnico__marca: string
  modelo_tecnico__modelo: string
  kilometraje_actual: number
}

export interface TestDataResponse {
  info: string
  tipos_orden_trabajo: TipoOT[]
  subtipos_orden_trabajo: SubtipoOT[]
  estados_orden_trabajo: EstadoOT[]
  clientes: ClienteTestData[]
  asesores: AsesorTestData[]
  vehiculos: VehiculoTestData[]
}

// Agendamiento Types
export interface VerificarUsuarioResponse {
  existe: boolean
  usuario?: {
    id: number
    first_name: string
    last_name: string
    email: string
    cedula: string
    phone: string
  }
}

export interface VehiculoAgendamientoAPI {
  id: number
  cliente_nombre: string
  cliente_email: string
  modelo_tecnico_detalle: any | null
  marca_nombre: string
  modelo_nombre: string
  marca_display: string
  modelo_display: string
  historial_kilometraje: any[]
  placa: string
  vin: string | null
  marca_otro: string | null
  modelo_otro: string | null
  anio_fabricacion: number
  color: string | null
  kilometraje_actual: number
  fecha_compra: string | null
  numero_motor: string | null
  observaciones: string | null
  estado: string
  created_at: string
  updated_at: string
  cliente: number
  modelo_tecnico: number | null
  marca: number
  modelo: number
}

// Citas - Horarios Disponibles
export interface HorarioDisponible {
  hora: string
  hora_display: string
  disponible: boolean
}

export interface HorariosDisponiblesResponse {
  fecha: string
  horarios_disponibles: HorarioDisponible[]
  total_horarios: number
  horarios_disponibles_count: number
}

// Citas - Tipos de Servicio
export interface TipoServicio {
  id: number
  nombre: string
  descripcion: string
  duracion_estimada: number
  orden: number
  estado: string
  created_at: string
  updated_at: string
}

// Detailed OT types
export interface OrdenTrabajoDetalle {
  id: number
  cliente_detalle: {
    id: number
    first_name: string
    last_name: string
    role: string
    cedula: string
  }
  vehiculo_detalle: {
    cliente_nombre: string
    placa: string
    color: string
    vin: string
    kilometraje_actual: number
    modelo_tecnico_detalle: {
      id: number
      tipo_vehiculo_display: string
      combustible_display: string
      transmision_display: string
      marca: string
      modelo: string
      anio: number
    }
  }
  asesor_detalle: {
    first_name: string
    last_name: string
    role: string
    cedula: string
  } | null
  tipo_detalle: {
    id: number
    codigo: string
    nombre: string
    descripcion: string
    estado: string
    created_at: string
    updated_at: string
  }
  subtipo_detalle: {
    id: number
    codigo: string
    nombre: string
  } | null
  estado_detalle: {
    id: number
    codigo: string
    nombre: string
    descripcion: string | null
    color: string
    orden: number
    es_inicial: boolean
    es_final: boolean
    permite_edicion: boolean
    estado: string
    created_at: string
    updated_at: string
  }
  presupuesto_detalle: any | null
  etapas: any[]
  tareas: any[]
  repuestos: any[]
  rubros: any[]
  imagenes: any[]
  novedades: any[]
  fechas_adicionales: any[]
  nivel_combustible_display: string | null
  numero_orden: string
  fecha_apertura: string
  fecha_cierre: string | null
  fecha_promesa_entrega: string
  fecha_entrega_real: string | null
  kilometraje_ingreso: number
  nivel_combustible: number | null
  descripcion_trabajo: string
  observaciones_cliente: string | null
  observaciones_internas: string | null
  subtotal_mano_obra: string
  subtotal_repuestos: string
  subtotal: string
  descuento: string
  iva: string
  total: string
  es_garantia: boolean
  requiere_autorizacion: boolean
  autorizado: boolean
  fecha_autorizacion: string | null
  sincronizado_erp: boolean
  fecha_sincronizacion: string | null
  id_erp_externo: string | null
  tipo: number
  subtipo: number | null
  estado: number
  cliente: number
  vehiculo: number
  presupuesto: number | null
  asesor: number | null
}

// Inspección Types
export interface FotoInspeccion {
  id?: string
  archivo: File
  preview: string
  orden: number
}

export interface CampoMedicionNumber {
  tipo: "number"
  min: number
  max: number
  unidad: string
}

export interface CampoMedicionSelect {
  tipo: "select"
  opciones: string[]
}

export type CampoMedicion = CampoMedicionNumber | CampoMedicionSelect

export interface CamposMedicion {
  [key: string]: CampoMedicion
}

export interface PuntoInspeccionCatalogo {
  id: number
  codigo: string
  nombre: string
  descripcion: string
  categoria: string
  categoria_display: string
  requiere_mediciones: boolean
  campos_medicion: CamposMedicion | null
  orden_visualizacion: number
}

export interface Mediciones {
  [key: string]: string | number
}

export interface PuntoInspeccionEvaluado {
  punto_id: number
  nombre: string
  estado: "verde" | "amarillo" | "rojo" | "na"
  observaciones?: string
  fotos: FotoInspeccion[]
  mediciones?: Mediciones
  completado: boolean
}

export interface Inspeccion {
  id?: number
  orden_trabajo: number
  tecnico: number
  fecha: string
  puntos_evaluados: PuntoInspeccionEvaluado[]
  completada: boolean
  created_at?: string
  updated_at?: string
}

// API Inspecciones Types
export interface InspeccionListItem {
  id: number
  numero_inspeccion: string
  orden_trabajo: number
  orden_trabajo_info: {
    id: number
    numero_orden: string
    cliente_nombre: string
    vehiculo_placa: string
  }
  inspector_nombre: string
  fecha_inspeccion: string
  estado: "PENDIENTE" | "EN_PROCESO" | "COMPLETADA"
  estado_display: string
  porcentaje_completado: number
}

export interface FotoInspeccionAPI {
  id: number
  item_inspeccion: number
  imagen: string
  url_imagen: string
  descripcion: string
  usuario_captura: number
  usuario_nombre: string
  fecha_captura: string
  nombre_archivo_original: string
  formato_original: string
  tamano_mb: number
  ancho_imagen: number
  alto_imagen: number
}

export interface ItemInspeccion {
  id: number
  inspeccion: number
  item_catalogo: number
  item_catalogo_info: {
    id: number
    codigo: string
    nombre: string
    requiere_mediciones: boolean
  }
  estado: "VERDE" | "AMARILLO" | "ROJO" | "N/A"
  estado_display: string
  aplica: boolean
  observacion: string | null
  mediciones: Mediciones | null
  fotos: FotoInspeccionAPI[]
  requiere_foto_obligatoria: boolean
}

export interface InspeccionDetalle {
  id: number
  numero_inspeccion: string
  orden_trabajo: number
  orden_trabajo_info: {
    id: number
    numero_orden: string
    cliente_nombre: string
    vehiculo_placa: string
    kilometraje_ingreso: number
  }
  inspector: number
  inspector_info: {
    id: number
    nombre_completo: string
    role: string
  }
  fecha_inspeccion: string
  estado: "PENDIENTE" | "EN_PROCESO" | "COMPLETADA"
  estado_display: string
  observaciones_generales: string | null
  fecha_completada: string | null
  items: ItemInspeccion[]
  resumen: {
    total_items: number
    items_verde: number
    items_amarillo: number
    items_rojo: number
    items_na: number
  }
  items_completados: number
  items_totales: number
  porcentaje_completado: number
}

export interface HallazgoOT {
  id?: number
  orden_trabajo: number
  descripcion: string
  urgencia: "inmediato" | "puede-esperar" | "preventivo"
  costo_estimado?: number
  fotos: FotoInspeccion[]
  notificar_whatsapp: boolean
  notificar_email: boolean
  created_at?: string
  updated_at?: string
}

// Multimedia Gallery Types
export type MediaType = "RECEPCION" | "DIAGNOSTICO" | "REPARACION" | "ENTREGA" | "INSPECCION"

export interface MediaItem {
  media_id: number
  media_type: MediaType
  orden_trabajo_id: number
  tipo_foto: string
  imagen_url: string
  fase_ot: string | null
  punto_inspeccion: string | null
  estado_inspeccion: string | null
  usuario_id: number
  usuario_nombre?: string
  fecha_captura: string
  tamano_bytes: number
  formato: string
  ancho_px: number
  alto_px: number
  nombre_archivo_original: string
  total_anotaciones: number
  tiene_anotaciones: boolean
  imagen_url_firmada: string
}

export interface GaleriaOTResponse {
  orden_trabajo_id: number
  total_fotos: number
  total_con_anotaciones: number
  recepcion: MediaItem[]
  diagnostico: MediaItem[]
  reparacion: MediaItem[]
  entrega: MediaItem[]
  inspecciones: MediaItem[]
}

