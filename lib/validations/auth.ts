import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().min(1, "El correo electrónico es requerido").email("Correo electrónico inválido"),
  password: z.string().min(1, "La contraseña es requerida").min(6, "La contraseña debe tener al menos 6 caracteres"),
  rememberMe: z.boolean().optional(),
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
    phone: z.string().optional(),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: "Las contraseñas no coinciden",
    path: ["password_confirm"],
  })

export type RegisterFormData = z.infer<typeof registerSchema>
