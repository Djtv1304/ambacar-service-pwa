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
    .min(1, "La placa es requerida")
    .regex(/^[A-Z]{3}\d{3,4}$/i, "La placa debe tener el formato AAA222 o AAA2222 (3 letras y 3-4 números)"),
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
  kilometraje: z.number().min(1, "El kilometraje debe ser mayor a 0").max(999999, "El kilometraje es muy alto"),
  color: z
    .string()
    .min(1, "El color es requerido")
    .max(30, "El color no puede exceder 30 caracteres")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "El color solo puede contener letras"),
  vin: z
    .string()
    .min(17, "El VIN debe tener exactamente 17 caracteres")
    .max(17, "El VIN debe tener exactamente 17 caracteres")
    .regex(/^[A-HJ-NPR-Z0-9]{17}$/i, "El VIN debe tener 17 caracteres alfanuméricos (no se permiten I, O, Q)"),
})

export const citaSchema = z.object({
  fecha: z.string().min(1, "La fecha es requerida"),
  hora: z.string().min(1, "La hora es requerida"),
  servicio: z
    .string()
    .min(5, "Describe el servicio que necesitas (mínimo 5 caracteres)")
    .max(200, "La descripción no puede exceder 200 caracteres"),
  observaciones: z.string().max(500, "Las observaciones no pueden exceder 500 caracteres").optional(),
  sucursal: z.string().min(1, "La sucursal es requerida"),
})

export const cancelacionSchema = z.object({
  cedula: z.string().min(10, "La cédula debe tener al menos 10 caracteres"),
  referencia: z.string().min(5, "La referencia debe tener al menos 5 caracteres"),
})

export type ClienteFormData = z.infer<typeof clienteSchema>
export type VehiculoFormData = z.infer<typeof vehiculoSchema>
export type CitaFormData = z.infer<typeof citaSchema>
export type CancelacionFormData = z.infer<typeof cancelacionSchema>
