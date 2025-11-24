"use server"

import { apiRequest, ApiError } from "@/lib/api/client"
import { getAccessToken } from "@/lib/auth/cookies"

export interface CitaResponse {
    cita: {
        id: number
        numero_cita: string
        fecha_cita: string
        hora_cita: string
        estado: string
        // TODO [RECEPCIÓN]: Cuando la API devuelva el campo 'observaciones' en la cita, mapearlo
        // para usarlo en observaciones_cliente al iniciar recepción
        observaciones?: string
    }
    cliente: {
        id: number
        nombre_completo: string
        cedula: string
        email: string
        telefono: string
    }
    vehiculo: {
        id: number
        placa: string
        marca: string
        modelo: string
        anio: number
        color: string
        kilometraje_actual: number
        // TODO [RECEPCIÓN]: Cuando la API devuelva el VIN del vehículo, agregarlo aquí
        vin?: string
    }
    tipo_servicio: {
        id: number
        nombre: string
        // TODO [RECEPCIÓN]: Cuando la API devuelva el campo 'descripcion' en tipo_servicio,
        // mapearlo para mostrarlo en la UI del resumen de cita
        descripcion?: string
        // TODO [RECEPCIÓN]: Cuando la API devuelva 'duracion_estimada' en tipo_servicio,
        // mapearlo para mostrarlo en la UI del resumen de cita
        duracion_estimada?: number
    }
}

export interface RecepcionResponse {
    id: number
    numero_recepcion: string
    fecha_hora_recepcion: string
    estado: string
    estado_display: string
    cita: number
    vehiculo: number
    cliente: number
    asesor_recepcion: number
    orden_trabajo: number | null
    cliente_info: {
        id: number
        nombre_completo: string
        cedula: string
        email: string
        telefono: string
    }
    vehiculo_info: {
        id: number
        placa: string
        marca: string
        modelo: string
        anio: number
        color: string
    }
    asesor_info: {
        id: number
        nombre_completo: string
    }
    cita_info: {
        id: number
        numero_cita: string
        tipo_servicio: string
        fecha_cita: string
        hora_cita: string
    }
    orden_trabajo_info: any | null
    kilometraje_ingreso: number
    nivel_combustible: string
    motivo_visita: string
    observaciones_cliente: string
    tiene_danos_previos: boolean
    descripcion_danos: string
    fotos: any[]
    fotos_completas: boolean
    cantidad_fotos: number
    fecha_completada: string | null
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