import { z } from "zod"

export const buscarCitaSchema = z.object({
    numero_referencia: z
        .string()
        .min(5, "Número de referencia inválido")
        .regex(/^CIT-\d{6}-\d{4}$/, "Formato debe ser CIT-YYYYMM-####"),
})

export const iniciarRecepcionSchema = z.object({
    kilometraje_ingreso: z.number().min(0, "El kilometraje no puede ser negativo").max(999999, "Kilometraje inválido"),
    nivel_combustible: z.enum(["1/4", "1/2", "3/4", "lleno"], {
        errorMap: () => ({ message: "Seleccione un nivel de combustible válido" }),
    }),
    observaciones_cliente: z.string().max(500, "Las observaciones no pueden exceder 500 caracteres").optional(),
    tiene_danos_previos: z.boolean().default(false),
})

export const fotoRecepcionSchema = z.object({
    tipo_foto: z.enum(["FRONTAL", "TRASERA", "LATERAL_IZQ", "LATERAL_DER"], {
        errorMap: () => ({ message: "Tipo de foto inválido" }),
    }),
    archivo: z
        .instanceof(File)
        .refine((file) => file.size <= 5 * 1024 * 1024, "La imagen no puede exceder 5MB")
        .refine((file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type), "Formato de imagen inválido"),
})

export const completarRecepcionSchema = z.object({
    recepcion_id: z.number(),
    fotos_confirmadas: z.array(z.enum(["FRONTAL", "TRASERA", "LATERAL_IZQ", "LATERAL_DER"])),
})

export type BuscarCitaFormData = z.infer<typeof buscarCitaSchema>
// Manual type definition to resolve Zod .default() incompatibility with react-hook-form
export type IniciarRecepcionFormData = z.input<typeof iniciarRecepcionSchema>
export type FotoRecepcionFormData = z.infer<typeof fotoRecepcionSchema>
export type CompletarRecepcionFormData = z.infer<typeof completarRecepcionSchema>