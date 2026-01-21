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
 * Editar un usuario existente
 */
export async function editarUsuario(id: number, payload: UpdateUsuarioPayload): Promise<UpdateUsuarioResponse> {
    const token = await getAccessToken()
    if (!token) {
        throw new ApiError("No autorizado", 401)
    }

    return apiRequest<UpdateUsuarioResponse>(`/api/usuarios/${id}/`, {
        method: "PUT",
        token,
        body: JSON.stringify(payload),
    })
}
