import { z } from "zod"

const passwordValidation = z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
    .regex(/[a-z]/, "Debe contener al menos una minúscula")
    .regex(/[0-9]/, "Debe contener al menos un número")

export const crearUsuarioSchema = z.object({
    email: z
        .string()
        .min(1, "El correo es requerido")
        .email("Ingresa un correo válido"),
    password: passwordValidation,
    password_confirm: z
        .string()
        .min(1, "Confirma la contraseña"),
    first_name: z
        .string()
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(50, "El nombre no puede exceder 50 caracteres"),
    last_name: z
        .string()
        .min(2, "El apellido debe tener al menos 2 caracteres")
        .max(50, "El apellido no puede exceder 50 caracteres"),
    cedula: z
        .string()
        .length(10, "La cédula debe tener 10 dígitos")
        .regex(/^\d+$/, "La cédula solo debe contener números"),
    phone: z
        .string()
        .min(10, "El teléfono debe tener al menos 10 dígitos"),
    role: z
        .enum(["admin", "operator", "technician", "manager"], {
            required_error: "Selecciona un rol",
        }),
}).refine((data) => data.password === data.password_confirm, {
    message: "Las contraseñas no coinciden",
    path: ["password_confirm"],
})

export const editarUsuarioSchema = z.object({
    email: z
        .string()
        .min(1, "El correo es requerido")
        .email("Ingresa un correo válido"),
    username: z
        .string()
        .min(3, "El usuario debe tener al menos 3 caracteres")
        .max(30, "El usuario no puede exceder 30 caracteres"),
    first_name: z
        .string()
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(50, "El nombre no puede exceder 50 caracteres"),
    last_name: z
        .string()
        .min(2, "El apellido debe tener al menos 2 caracteres")
        .max(50, "El apellido no puede exceder 50 caracteres"),
    cedula: z
        .string()
        .length(10, "La cédula debe tener 10 dígitos")
        .regex(/^\d+$/, "La cédula solo debe contener números"),
    phone: z
        .string()
        .min(10, "El teléfono debe tener al menos 10 dígitos"),
})

export const cambiarPasswordPropioSchema = z.object({
    password_actual: z
        .string()
        .min(1, "La contraseña actual es requerida"),
    password_nuevo: passwordValidation,
    password_confirmacion: z
        .string()
        .min(1, "Confirma la nueva contraseña"),
}).refine((data) => data.password_nuevo === data.password_confirmacion, {
    message: "Las contraseñas no coinciden",
    path: ["password_confirmacion"],
})

export const resetearPasswordAdminSchema = z.object({
    password_nuevo: passwordValidation,
    password_confirmacion: z
        .string()
        .min(1, "Confirma la nueva contraseña"),
}).refine((data) => data.password_nuevo === data.password_confirmacion, {
    message: "Las contraseñas no coinciden",
    path: ["password_confirmacion"],
})

export type CrearUsuarioFormData = z.infer<typeof crearUsuarioSchema>
export type EditarUsuarioFormData = z.infer<typeof editarUsuarioSchema>
export type CambiarPasswordPropioFormData = z.infer<typeof cambiarPasswordPropioSchema>
export type ResetearPasswordAdminFormData = z.infer<typeof resetearPasswordAdminSchema>
