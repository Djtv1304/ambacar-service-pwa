/**
 * Ambacar ERP (Zeus) API client-side helpers.
 * Fetches data through the Next.js API proxy at /api/erp/*
 */

export interface Agencia {
  idAgencia: string
  nombreAgencia: string
  ciudadAgencia: string
  direccion: string
  urlComoLlegar: string | null
}

export interface Taller {
  idTaller: number
  nombreTaller: string
  idAgencia: string
}

export interface Empleado {
  idEmpleado: number
  nombreEmpleado: string
}

export interface RepuestoStock {
  agencia: string
  codigo: string
  descripcion: string
  linea: string
  precio: number
  stockActual: number
}

export interface StockResponse {
  page: number
  pageSize: number
  totalPages: number
  repuestos: RepuestoStock[]
}

/**
 * Fetches filtered agencies from the internal proxy.
 * GET /api/erp/agencias
 */
export async function getAgencias(): Promise<Agencia[]> {
  const response = await fetch("/api/erp/agencias", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })

  if (!response.ok) {
    throw new Error(`Error fetching agencies: ${response.status}`)
  }

  return response.json()
}

/**
 * Searches stock repuestos for a given agency.
 * GET /api/erp/stock-repuestos?idAgencia=XX&descripcion=TEXTO&page=1&pageSize=50
 */
export async function getStockRepuestos(
  idAgencia: string,
  descripcion: string,
  page: number = 1,
  pageSize: number = 50
): Promise<StockResponse> {
  const params = new URLSearchParams({
    idAgencia,
    descripcion,
    page: page.toString(),
    pageSize: pageSize.toString(),
  })

  const response = await fetch(`/api/erp/stock-repuestos?${params}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })

  if (!response.ok) {
    throw new Error(`Error fetching stock: ${response.status}`)
  }

  return response.json()
}

/**
 * Fetches all talleres (workshops) from the ERP.
 * GET /api/erp/talleres
 */
export async function getTalleres(): Promise<Taller[]> {
  const response = await fetch("/api/erp/talleres", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })

  if (!response.ok) {
    throw new Error(`Error fetching talleres: ${response.status}`)
  }

  return response.json()
}

/**
 * Fetches asesores de servicio (operators) for a given taller.
 * GET /api/erp/asesores-servicio?idTaller=XX
 */
export async function getAsesoresServicio(idTaller: number): Promise<Empleado[]> {
  const response = await fetch(`/api/erp/asesores-servicio?idTaller=${idTaller}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })

  if (!response.ok) {
    throw new Error(`Error fetching asesores de servicio: ${response.status}`)
  }

  return response.json()
}

/**
 * Fetches asesores tecnicos (technicians) for a given taller.
 * GET /api/erp/asesores-tecnicos?idTaller=XX
 */
export async function getAsesoresTecnicos(idTaller: number): Promise<Empleado[]> {
  const response = await fetch(`/api/erp/asesores-tecnicos?idTaller=${idTaller}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })

  if (!response.ok) {
    throw new Error(`Error fetching asesores tecnicos: ${response.status}`)
  }

  return response.json()
}
