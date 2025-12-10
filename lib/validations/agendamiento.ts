import { z } from "zod"

export const clienteSchema = z.object({
  cedula: z
    .string()
    .min(10, "La cédula debe tener al menos 10 caracteres")
    .max(13, "La cédula no puede exceder 13 caracteres")
    .regex(/^[0-9]+$/, "La cédula solo debe contener números"),
  nombre: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(50, "El nombre no puede exceder 50 caracteres"),
  apellido: z
    .string()
    .min(2, "El apellido debe tener al menos 2 caracteres")
    .max(50, "El apellido no puede exceder 50 caracteres"),
  telefono: z
    .string()
    .min(10, "El teléfono debe tener al menos 10 dígitos")
    .regex(/^[0-9+\s()-]+$/, "Formato de teléfono inválido"),
  email: z.string().email("Email inválido").min(5, "El email es muy corto"),
})

export const vehiculoSchema = z.object({
  placa: z
    .string()
    .min(6, "La placa debe tener al menos 6 caracteres")
    .max(10, "La placa no puede exceder 10 caracteres")
    .regex(/^[A-Z0-9-]+$/i, "Formato de placa inválido"),
  marca: z.union([z.string(), z.number()]).refine((val) => val !== "" && val !== 0, {
    message: "La marca es requerida",
  }),
  modelo: z.union([z.string(), z.number()]).refine((val) => val !== "" && val !== 0, {
    message: "El modelo es requerido",
  }),
  anio: z
    .number()
    .min(1990, "El año debe ser mayor a 1990")
    .max(new Date().getFullYear() + 1, "El año no puede ser futuro"),
  kilometraje: z.number().min(0, "El kilometraje no puede ser negativo").max(999999, "El kilometraje es muy alto"),
})

export const citaSchema = z.object({
  fecha: z.string().min(1, "La fecha es requerida"),
  hora: z.string().min(1, "La hora es requerida"),
  servicio: z
    .string()
    .min(5, "Describe el servicio que necesitas (mínimo 5 caracteres)")
    .max(200, "La descripción no puede exceder 200 caracteres"),
  observaciones: z.string().max(500, "Las observaciones no pueden exceder 500 caracteres").optional(),
})

export const cancelacionSchema = z.object({
  cedula: z.string().min(10, "La cédula debe tener al menos 10 caracteres"),
  referencia: z.string().min(5, "La referencia debe tener al menos 5 caracteres"),
})

export type ClienteFormData = z.infer<typeof clienteSchema>
export type VehiculoFormData = z.infer<typeof vehiculoSchema>
export type CitaFormData = z.infer<typeof citaSchema>
export type CancelacionFormData = z.infer<typeof cancelacionSchema>
