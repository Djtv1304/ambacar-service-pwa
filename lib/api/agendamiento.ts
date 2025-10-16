import type { Cliente, Vehiculo, Cita } from "../types"
import { clientes } from "../fixtures/clientes"
import { citas, disponibilidadTaller } from "../fixtures/citas"

// ============================================================================
// API STUBS - TODO: Replace with actual API calls
// ============================================================================

/**
 * Busca un cliente por cédula
 */
export async function buscarClientePorCedula(cedula: string): Promise<Cliente | null> {
  // TODO: Integrar con API real
  await new Promise((resolve) => setTimeout(resolve, 500)) // Simular latencia

  const cliente = clientes.find((c) => c.cedula === cedula)
  return cliente || null
}

/**
 * Registra un nuevo cliente
 */
export async function registrarCliente(data: {
  cedula: string
  nombre: string
  apellido: string
  telefono: string
  email: string
  ciudad: string
}): Promise<Cliente> {
  // TODO: Integrar con API real
  await new Promise((resolve) => setTimeout(resolve, 800))

  const nuevoCliente: Cliente = {
    id: `CLI-${Date.now()}`,
    ...data,
    direccion: "",
    vehiculos: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  return nuevoCliente
}

/**
 * Obtiene los vehículos de un cliente por cédula
 */
export async function fetchVehiculosByCedula(cedula: string): Promise<Vehiculo[]> {
  // TODO: Integrar con API real
  await new Promise((resolve) => setTimeout(resolve, 500))

  const cliente = clientes.find((c) => c.cedula === cedula)
  return cliente?.vehiculos || []
}

/**
 * Registra un nuevo vehículo para un cliente
 */
export async function registrarVehiculo(
  clienteId: string,
  data: {
    placa: string
    marca: string
    modelo: string
    anio: number
    color: string
    vin?: string
    kilometraje: number
  },
): Promise<Vehiculo> {
  // TODO: Integrar con API real
  await new Promise((resolve) => setTimeout(resolve, 800))

  const nuevoVehiculo: Vehiculo = {
    id: `VEH-${Date.now()}`,
    clienteId,
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  return nuevoVehiculo
}

/**
 * Obtiene la disponibilidad del taller para un mes específico
 * Retorna fechas y horarios no disponibles
 */
export async function prefetchDisponibilidad(
  year: number,
  month: number,
): Promise<{
  fechasNoDisponibles: string[]
  horariosOcupados: Record<string, string[]>
}> {
  // TODO: Integrar con API real - consultar capacidad del taller + citas programadas
  await new Promise((resolve) => setTimeout(resolve, 600))

  const fechasNoDisponibles = disponibilidadTaller.diasNoLaborables

  // Simular horarios ocupados por fecha
  const horariosOcupados: Record<string, string[]> = {}
  citas.forEach((cita) => {
    if (cita.estado !== "cancelada") {
      if (!horariosOcupados[cita.fecha]) {
        horariosOcupados[cita.fecha] = []
      }
      horariosOcupados[cita.fecha].push(cita.hora)
    }
  })

  return { fechasNoDisponibles, horariosOcupados }
}

/**
 * Reserva temporalmente un slot de cita (bloqueo de 15 minutos)
 */
export async function reservarSlot(data: {
  fecha: string
  hora: string
  placa: string
}): Promise<{ success: boolean; reservaId?: string }> {
  // TODO: Integrar con API real - bloquear temporalmente el slot
  await new Promise((resolve) => setTimeout(resolve, 400))

  return {
    success: true,
    reservaId: `RESERVA-${Date.now()}`,
  }
}

/**
 * Crea una nueva cita
 */
export async function crearCita(data: {
  clienteId: string
  vehiculoPlaca: string
  fecha: string
  hora: string
  servicio: string
  observaciones?: string
}): Promise<Cita> {
  // TODO: Integrar con API real
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const nuevaCita: Cita = {
    id: `CITA-${Date.now()}`,
    ...data,
    estado: "confirmada",
    sucursal: "Principal",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  return nuevaCita
}

/**
 * Busca una cita por cédula y referencia
 */
export async function buscarCita(cedula: string, referencia: string): Promise<Cita | null> {
  // TODO: Integrar con API real
  await new Promise((resolve) => setTimeout(resolve, 500))

  const cita = citas.find((c) => c.id === referencia)
  if (!cita) return null

  // Verificar que la cita pertenece al cliente con esa cédula
  const cliente = clientes.find((cl) => cl.id === cita.clienteId && cl.cedula === cedula)
  if (!cliente) return null

  return cita
}

/**
 * Cancela una cita
 */
export async function cancelarCita(citaId: string): Promise<{ success: boolean }> {
  // TODO: Integrar con API real - liberar slot del calendario
  await new Promise((resolve) => setTimeout(resolve, 800))

  return { success: true }
}

/**
 * Envía confirmación por email
 */
export async function sendEmailConfirm(payload: {
  email: string
  cita: Cita
  cliente: Cliente
}): Promise<void> {
  // TODO: Integrar con servicio de email (SendGrid, AWS SES, etc.)
  console.log("[v0] Email confirmation stub called:", payload)
  await new Promise((resolve) => setTimeout(resolve, 300))
}

/**
 * Envía confirmación por WhatsApp
 */
export async function sendWhatsAppConfirm(payload: {
  telefono: string
  cita: Cita
  cliente: Cliente
}): Promise<void> {
  // TODO: Integrar con WhatsApp Business API
  console.log("[v0] WhatsApp confirmation stub called:", payload)
  await new Promise((resolve) => setTimeout(resolve, 300))
}

/**
 * Envía notificación de cancelación por email
 */
export async function sendEmailCancel(payload: {
  email: string
  cita: Cita
}): Promise<void> {
  // TODO: Integrar con servicio de email
  console.log("[v0] Email cancellation stub called:", payload)
  await new Promise((resolve) => setTimeout(resolve, 300))
}

/**
 * Envía notificación de cancelación por WhatsApp
 */
export async function sendWhatsAppCancel(payload: {
  telefono: string
  cita: Cita
}): Promise<void> {
  // TODO: Integrar con WhatsApp Business API
  console.log("[v0] WhatsApp cancellation stub called:", payload)
  await new Promise((resolve) => setTimeout(resolve, 300))
}
