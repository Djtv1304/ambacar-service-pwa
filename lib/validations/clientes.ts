import { z } from "zod"

export const crearClienteSchema = z.object({
    email: z
        .string()
        .min(1, "El correo es requerido")
        .email("Ingresa un correo válido"),
    password: z
        .string()
        .min(8, "La contraseña debe tener al menos 8 caracteres")
        .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
        .regex(/[a-z]/, "Debe contener al menos una minúscula")
        .regex(/[0-9]/, "Debe contener al menos un número"),
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
}).refine((data) => data.password === data.password_confirm, {
    message: "Las contraseñas no coinciden",
    path: ["password_confirm"],
})

export const editarClienteSchema = z.object({
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

export type CrearClienteFormData = z.infer<typeof crearClienteSchema>
export type EditarClienteFormData = z.infer<typeof editarClienteSchema>
