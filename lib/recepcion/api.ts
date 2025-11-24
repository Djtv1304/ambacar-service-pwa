"use server"

import { apiRequest, ApiError } from "@/lib/api/client"
import { getAccessToken } from "@/lib/auth/cookies"

export interface CitaResponse {
    id: number
    numero_referencia: string
    cliente: {
        id: number
        cedula: string
        nombre: string
        apellido: string
        email: string
        telefono: string
    }
    vehiculo: {
        id: number
        placa: string
        marca: string
        modelo: string
        anio: number
        vin?: string
        kilometraje_actual: number
    }
    fecha: string
    hora: string
    servicio: {
        id: number
        detalle: string
    }
    observaciones?: string
    estado: string
}

export interface RecepcionResponse {
    id: number
    numero_recepcion: string
    cita_id: number
    cliente_id: number
    vehiculo_id: number
    kilometraje_ingreso: number
    nivel_combustible: string
    motivo_visita: string
    observaciones_cliente?: string
    tiene_danos_previos: boolean
    estado: string
    asesor: {
        id: number
        nombre: string
        apellido: string
    }
    fotos_requeridas: string[]
    fotos_capturadas: string[]
}

export interface FotoUploadResponse {
    id: number
    recepcion_id: number
    tipo_foto: string
    archivo_url: string
    fecha_carga: string
}

export interface OrdenTrabajoResponse {
    id: number
    numero_ot: string
    recepcion_id: number
    cliente_id: number
    vehiculo_id: number
    estado: string
    creado_en: string
}

/**
 * Buscar cita por número de referencia
 */
export async function buscarCita(numeroReferencia: string): Promise<CitaResponse> {
    const token = await getAccessToken()
    if (!token) {
        throw new ApiError("No autorizado", 401)
    }

    return apiRequest<CitaResponse>("/api/recepciones/buscar-cita/", {
        method: "POST",
        token,
        body: JSON.stringify({
            numero_referencia: numeroReferencia,
        }),
    })
}

/**
 * Iniciar recepción para una cita
 */
export async function iniciarRecepcion(payload: {
    cita_id: number
    cliente_id: number
    vehiculo_id: number
    kilometraje_ingreso: number
    nivel_combustible: string
    motivo_visita: string
    observaciones_cliente?: string
    tiene_danos_previos: boolean
}): Promise<RecepcionResponse> {
    const token = await getAccessToken()
    if (!token) {
        throw new ApiError("No autorizado", 401)
    }

    return apiRequest<RecepcionResponse>("/api/recepciones/iniciar/", {
        method: "POST",
        token,
        body: JSON.stringify(payload),
    })
}

/**
 * Subir una foto de recepción
 */
export async function subirFoto(
    recepcionId: number,
    tipoFoto: string,
    archivo: File,
    orden: number,
): Promise<FotoUploadResponse> {
    const token = await getAccessToken()
    if (!token) {
        throw new ApiError("No autorizado", 401)
    }

    const formData = new FormData()
    formData.append("recepcion", recepcionId.toString())
    formData.append("tipo_foto", tipoFoto)
    formData.append("imagen", archivo)
    formData.append("orden", orden.toString())

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/fotos-recepcion/`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: formData,
    })

    if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new ApiError(error.detail || "Error al subir foto", response.status, error)
    }

    return response.json()
}

/**
 * Completar recepción y generar OT
 */
export async function completarRecepcion(recepcionId: number): Promise<OrdenTrabajoResponse> {
    const token = await getAccessToken()
    if (!token) {
        throw new ApiError("No autorizado", 401)
    }

    return apiRequest<OrdenTrabajoResponse>(`/api/recepciones/${recepcionId}/completar/`, {
        method: "POST",
        token,
    })
}

/**
 * Obtener estado de recepción
 */
export async function obtenerRecepcion(recepcionId: number): Promise<RecepcionResponse> {
    const token = await getAccessToken()
    if (!token) {
        throw new ApiError("No autorizado", 401)
    }

    return apiRequest<RecepcionResponse>(`/api/recepciones/${recepcionId}/`, {
        method: "GET",
        token,
    })
}