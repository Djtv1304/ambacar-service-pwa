"use server"

import { apiRequest, ApiError } from "@/lib/api/client"
import { getAccessToken } from "@/lib/auth/cookies"

// Types for User API
export interface Usuario {
    id: number
    email: string
    username: string
    first_name: string
    last_name: string
    role: "admin" | "operator" | "technician" | "customer"
    role_display: string
    cedula: string
    phone: string
    avatar: string | null
    is_active: boolean
    created_at: string
    updated_at: string
}

export interface CreateUsuarioPayload {
    email: string
    password: string
    first_name: string
    last_name: string
    role: string
    cedula: string
    phone: string
}

export interface CreateUsuarioResponse {
    email: string
    first_name: string
    last_name: string
    role: string
    cedula: string
    phone: string
    is_active: boolean
    username: string
}

export interface UpdateUsuarioPayload {
    email?: string
    username?: string
    first_name?: string
    last_name?: string
    cedula?: string
    phone?: string
}

export interface UpdateUsuarioResponse {
    first_name: string
    last_name: string
    role: string
    phone: string
    is_active: boolean
}

/**
 * Obtener lista de todos los usuarios
 */
export async function obtenerUsuarios(): Promise<Usuario[]> {
    const token = await getAccessToken()
    if (!token) {
        throw new ApiError("No autorizado", 401)
    }

    return apiRequest<Usuario[]>("/api/usuarios/", {
        method: "GET",
        token,
    })
}

/**
 * Obtener lista de usuarios con rol customer (clientes)
 */
export async function obtenerClientes(): Promise<Usuario[]> {
    const usuarios = await obtenerUsuarios()
    return usuarios.filter(u => u.role === "customer")
}

/**
 * Crear un nuevo usuario
 */
export async function crearUsuario(payload: CreateUsuarioPayload): Promise<CreateUsuarioResponse> {
    const token = await getAccessToken()
    if (!token) {
        throw new ApiError("No autorizado", 401)
    }

    return apiRequest<CreateUsuarioResponse>("/api/usuarios/", {
        method: "POST",
        token,
        body: JSON.stringify(payload),
    })
}

/**
 * Editar un usuario existente (actualización parcial)
 */
export async function editarUsuario(id: number, payload: UpdateUsuarioPayload): Promise<UpdateUsuarioResponse> {
    const token = await getAccessToken()
    if (!token) {
        throw new ApiError("No autorizado", 401)
    }

    return apiRequest<UpdateUsuarioResponse>(`/api/usuarios/${id}/`, {
        method: "PATCH",
        token,
        body: JSON.stringify(payload),
    })
}

/**
 * Eliminar un usuario permanentemente
 * Solo disponible para usuarios con rol manager
 */
export async function eliminarUsuario(id: number): Promise<void> {
    const token = await getAccessToken()
    if (!token) {
        throw new ApiError("No autorizado", 401)
    }

    await apiRequest<void>(`/api/usuarios/${id}/`, {
        method: "DELETE",
        token,
    })
}

/**
 * Cambiar la contraseña propia del usuario autenticado
 */
export interface CambiarPasswordPayload {
    password_actual: string
    password_nuevo: string
    password_confirmacion: string
}

export interface CambiarPasswordResponse {
    email: string
    first_name: string
    last_name: string
    role: string
    cedula: string
    phone: string
    is_active: boolean
    username: string
}

export async function cambiarPasswordPropio(payload: CambiarPasswordPayload): Promise<CambiarPasswordResponse> {
    const token = await getAccessToken()
    if (!token) {
        throw new ApiError("No autorizado", 401)
    }

    return apiRequest<CambiarPasswordResponse>("/api/usuarios/cambiar-password/", {
        method: "POST",
        token,
        body: JSON.stringify(payload),
    })
}

/**
 * Admin: Resetear la contraseña de cualquier usuario
 * Requiere permisos de administrador o manager
 */
export interface ResetearPasswordPayload {
    password_nuevo: string
}

export interface ResetearPasswordResponse {
    message: string
}

export async function resetearPasswordUsuario(id: number, payload: ResetearPasswordPayload): Promise<ResetearPasswordResponse> {
    const token = await getAccessToken()
    if (!token) {
        throw new ApiError("No autorizado", 401)
    }

    return apiRequest<ResetearPasswordResponse>(`/api/usuarios/${id}/resetear-password/`, {
        method: "POST",
        token,
        body: JSON.stringify(payload),
    })
}

/**
 * Activar un usuario por ID
 */
export interface ActivarDesactivarResponse {
    message: string
    usuario: Usuario
}

export async function activarUsuario(id: number): Promise<ActivarDesactivarResponse> {
    const token = await getAccessToken()
    if (!token) {
        throw new ApiError("No autorizado", 401)
    }

    return apiRequest<ActivarDesactivarResponse>(`/api/usuarios/${id}/activar/`, {
        method: "POST",
        token,
    })
}

/**
 * Desactivar un usuario por ID
 */
export async function desactivarUsuario(id: number): Promise<ActivarDesactivarResponse> {
    const token = await getAccessToken()
    if (!token) {
        throw new ApiError("No autorizado", 401)
    }

    return apiRequest<ActivarDesactivarResponse>(`/api/usuarios/${id}/desactivar/`, {
        method: "POST",
        token,
    })
}

/**
 * Obtener lista de usuarios del staff (no clientes)
 */
export async function obtenerUsuariosStaff(): Promise<Usuario[]> {
    const usuarios = await obtenerUsuarios()
    return usuarios.filter(u => u.role !== "customer")
}
