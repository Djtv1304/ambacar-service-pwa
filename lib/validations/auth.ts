import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().min(1, "El correo electrónico es requerido").email("Correo electrónico inválido"),
  password: z.string().min(1, "La contraseña es requerida").min(6, "La contraseña debe tener al menos 6 caracteres"),
})

export type LoginFormData = z.infer<typeof loginSchema>

export const registerSchema = z
  .object({
    email: z.string().min(1, "El correo electrónico es requerido").email("Correo electrónico inválido"),
    username: z
      .string()
      .min(1, "El nombre de usuario es requerido")
      .min(3, "El nombre de usuario debe tener al menos 3 caracteres")
      .regex(/^[a-zA-Z0-9_]+$/, "Solo letras, números y guiones bajos"),
    password: z
      .string()
      .min(1, "La contraseña es requerida")
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
      .regex(/[a-z]/, "Debe contener al menos una minúscula")
      .regex(/[0-9]/, "Debe contener al menos un número"),
    password_confirm: z.string().min(1, "Confirma tu contraseña"),
    first_name: z.string().min(1, "El nombre es requerido"),
    last_name: z.string().min(1, "El apellido es requerido"),
    cedula: z
      .string()
      .min(1, "La cédula es requerida")
      .regex(/^\d{10}$/, "La cédula debe tener exactamente 10 dígitos"),
    phone: z
      .string()
      .min(1, "El teléfono es requerido")
      .regex(/^\+593 0\d{2} \d{3} \d{4}$/, "Formato inválido. Debe ser +593 0XX XXX XXXX"),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: "Las contraseñas no coinciden",
    path: ["password_confirm"],
  })

export type RegisterFormData = z.infer<typeof registerSchema>
