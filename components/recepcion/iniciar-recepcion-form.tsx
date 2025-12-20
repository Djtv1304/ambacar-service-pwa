"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"
import { iniciarRecepcionSchema, type IniciarRecepcionFormData } from "@/lib/validations/recepcion"
import { iniciarRecepcion } from "@/lib/recepcion/api"
import { NIVELES_COMBUSTIBLE } from "@/lib/recepcion/constants"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

interface IniciarRecepcionFormProps {
    cita: any
    kmIngreso: number
    onRecepcionInitiated: (recepcion: any) => void
}

export function IniciarRecepcionForm({ cita, kmIngreso, onRecepcionInitiated }: IniciarRecepcionFormProps) {
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()

    const form = useForm<IniciarRecepcionFormData>({
        resolver: zodResolver(iniciarRecepcionSchema),
        defaultValues: {
            kilometraje_ingreso: kmIngreso,
            nivel_combustible: "1/2",
            observaciones_cliente: "",
            tiene_danos_previos: false,
        },
        mode: "onChange",
    })

    async function onSubmit(data: IniciarRecepcionFormData) {
        setIsLoading(true)
        try {
            // Mapeo del motivo de visita desde tipo_servicio.nombre
            const motivoVisita = cita.tipo_servicio.nombre || "Servicio de mantenimiento"

            // TODO [RECEPCIÓN]: Cuando la API devuelva cita.observaciones, usar ese valor aquí
            // Las observaciones del formulario tienen prioridad sobre las de la cita
            const observacionesCliente = data.observaciones_cliente || cita.cita.observaciones || undefined

            const recepcion = await iniciarRecepcion({
                cita_id: cita.cita.id,
                cliente_id: cita.cliente.id,
                vehiculo_id: cita.vehiculo.id,
                kilometraje_ingreso: data.kilometraje_ingreso,
                nivel_combustible: data.nivel_combustible,
                motivo_visita: motivoVisita,
                observaciones_cliente: observacionesCliente,
                tiene_danos_previos: data.tiene_danos_previos ?? false,
            })

            toast({
                title: "¡Recepción iniciada!",
                description: `Número de recepción: ${recepcion.numero_recepcion}`,
            })

            onRecepcionInitiated(recepcion)
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Error al iniciar recepción",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        control={form.control}
                        name="kilometraje_ingreso"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Kilometraje de Ingreso *</FormLabel>
                                <FormControl>
                                    <input
                                        type="number"
                                        {...field}
                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="Ingresa el kilometraje"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="nivel_combustible"

                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nivel de Combustible *</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl className="w-full">
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona el nivel de combustible" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {NIVELES_COMBUSTIBLE.map((nivel) => (
                                            <SelectItem key={nivel.value} value={nivel.value}>
                                                {nivel.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="tiene_danos_previos"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base">¿Tiene daños previos visibles?</FormLabel>
                                    <FormDescription>Marca esta opción si el vehículo tiene daños o rasguños previos</FormDescription>
                                </div>
                                <FormControl>
                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="observaciones_cliente"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Observaciones del Cliente</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Anota cualquier observación importante del cliente..."
                                        className="resize-none"
                                        rows={4}
                                        {...field}
                                    />
                                </FormControl>
                                <FormDescription>Máximo 500 caracteres</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button
                        type="submit"
                        disabled={isLoading}
                        size="lg"
                        className="w-full bg-[#ED1C24] hover:bg-[#c41820] text-white"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Iniciando...
                            </>
                        ) : (
                            "Iniciar Recepción"
                        )}
                    </Button>
                </form>
            </Form>
        </motion.div>
    )
}