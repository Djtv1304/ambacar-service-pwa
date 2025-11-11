// Core entity types for the Ambacar system

export type UserRole = "admin" | "receptionist" | "mechanic" | "workshop_manager" | "customer"

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

