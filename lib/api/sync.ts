import { Cliente, ClienteAPI, Vehiculo, VehiculoAgendamientoAPI } from "@/lib/types"
import { SyncCustomerPayload } from "@/app/api/sync/customer/route"
import { SyncVehiclePayload } from "@/app/api/sync/vehicle/route"

/**
 * Convierte datos de Cliente o ClienteAPI al formato requerido por el microservicio
 */
export function buildSyncCustomerPayload(
  cliente: Cliente | ClienteAPI,
  customerId: string
): SyncCustomerPayload {
  // Detectar si es ClienteAPI (tiene first_name/last_name) o Cliente (tiene nombre/apellido)
  const isClienteAPI = "first_name" in cliente

  // Obtener teléfono y limpiar espacios
  let phone = ""
  let whatsapp = ""

  if (!isClienteAPI && "telefono" in cliente) {
    // Es tipo Cliente
    phone = cliente.telefono?.replace(/\s+/g, "") || ""
    whatsapp = cliente.telefono?.replace(/\s+/g, "") || ""
  } else if ("phone" in cliente && cliente.phone) {
    // Es ClienteAPI pero tiene phone (puede venir del formulario)
    phone = (cliente.phone as string).replace(/\s+/g, "")
    whatsapp = (cliente.phone as string).replace(/\s+/g, "")
  }

  return {
    customer_id: customerId,
    first_name: isClienteAPI ? cliente.first_name : cliente.nombre,
    last_name: isClienteAPI ? cliente.last_name : cliente.apellido,
    email: cliente.email,
    phone,
    whatsapp,
    sync_version: 1,
  }
}

/**
 * Convierte datos de Vehiculo o VehiculoAgendamientoAPI al formato requerido por el microservicio
 */
export function buildSyncVehiclePayload(
  vehiculo: Vehiculo | VehiculoAgendamientoAPI,
  customerId: string
): SyncVehiclePayload {
  // Detectar si es VehiculoAgendamientoAPI (estructura diferente)
  const isVehiculoAPI = "modelo_tecnico_detalle" in vehiculo

  if (isVehiculoAPI) {
    return {
      vehicle_id: vehiculo.id.toString(),
      customer_id: customerId,
      plate: vehiculo.placa,
      brand: vehiculo.modelo_tecnico_detalle?.marca || "Sin marca",
      model: vehiculo.modelo_tecnico_detalle?.modelo || "Sin modelo",
      year: vehiculo.anio_fabricacion || new Date().getFullYear(),
      current_kilometers: vehiculo.kilometraje_actual || 0,
      last_service_date: vehiculo.ultima_fecha_servicio || null,
      next_service_kilometers: null, // No disponible en este tipo
      sync_version: 1,
    }
  } else {
    // Es tipo Vehiculo
    return {
      vehicle_id: vehiculo.id,
      customer_id: customerId,
      plate: vehiculo.placa,
      brand: vehiculo.marca,
      model: vehiculo.modelo,
      year: vehiculo.anio,
      current_kilometers: vehiculo.kilometraje,
      last_service_date: vehiculo.ultimoServicio
        ? vehiculo.ultimoServicio.toISOString().split("T")[0]
        : null,
      next_service_kilometers: null, // Calcular si es necesario
      sync_version: 1,
    }
  }
}

/**
 * Sincroniza un cliente con el microservicio de notificaciones
 */
export async function syncCustomer(
  cliente: Cliente | ClienteAPI,
  customerId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const payload = buildSyncCustomerPayload(cliente, customerId)

    const response = await fetch("/api/sync/customer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const error = await response.json()
      return { success: false, error: error.error || "Unknown error" }
    }

    return { success: true }
  } catch (error) {
    console.error("Error syncing customer:", error)
    return { success: false, error: String(error) }
  }
}

/**
 * Sincroniza un vehículo con el microservicio de notificaciones
 */
export async function syncVehicle(
  vehiculo: Vehiculo | VehiculoAgendamientoAPI,
  customerId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const payload = buildSyncVehiclePayload(vehiculo, customerId)

    const response = await fetch("/api/sync/vehicle", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const error = await response.json()
      return { success: false, error: error.error || "Unknown error" }
    }

    return { success: true }
  } catch (error) {
    console.error("Error syncing vehicle:", error)
    return { success: false, error: String(error) }
  }
}

/**
 * Sincroniza un cliente y sus vehículos en secuencia
 */
export async function syncCustomerWithVehicles(
  cliente: Cliente | ClienteAPI,
  vehiculos: (Vehiculo | VehiculoAgendamientoAPI)[],
  customerId: string
): Promise<{
  customer: { success: boolean; error?: string }
  vehicles: { success: boolean; error?: string }[]
}> {
  // Primero sincronizar cliente
  const customerResult = await syncCustomer(cliente, customerId)

  // Luego sincronizar vehículos en paralelo
  const vehicleResults = await Promise.all(
    vehiculos.map((vehiculo) => syncVehicle(vehiculo, customerId))
  )

  return {
    customer: customerResult,
    vehicles: vehicleResults,
  }
}
