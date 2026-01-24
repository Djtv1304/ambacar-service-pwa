import { apiRequest } from "@/lib/api/client"

export interface DashboardStats {
  citasHoy: number
  citasConfirmadas: number
  otAbiertas: number
  vehiculosEnTaller: number
  inspeccionesCompletadas: number
}

export interface DashboardCita {
  id: number
  cliente: { nombre: string; apellido: string }
  vehiculo: { marca: string; modelo: string; placa: string }
  hora: string
  servicioSolicitado: string
  estado: string
}

export interface DashboardOT {
  id: number
  numero: string
  cliente: { nombre: string; apellido: string }
  vehiculo: { marca: string; modelo: string; placa: string }
  prioridad: string
  estado: string
}

export interface DashboardData {
  stats: DashboardStats
  citasHoy: DashboardCita[]
  otActivas: DashboardOT[]
}

/**
 * Fetches dashboard summary data.
 * GET /api/dashboard/
 */
export async function getDashboard(token: string): Promise<DashboardData> {
  return apiRequest<DashboardData>("/api/dashboard/", { token })
}
