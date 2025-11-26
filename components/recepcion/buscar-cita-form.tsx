"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion } from "framer-motion"
import { AlertCircle, Loader2, Search } from "lucide-react"
import { buscarCitaSchema, type BuscarCitaFormData } from "@/lib/validations/recepcion"
import { buscarCita } from "@/lib/recepcion/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"

interface BuscarCitaFormProps {
    onCitaFound: (cita: any) => void
}

export function BuscarCitaForm({ onCitaFound }: BuscarCitaFormProps) {
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()

    const form = useForm<BuscarCitaFormData>({
        resolver: zodResolver(buscarCitaSchema),
        defaultValues: {
            numero_referencia: "",
        },
    })

    async function onSubmit(data: BuscarCitaFormData) {
        setIsLoading(true)
        try {
            const cita = await buscarCita(data.numero_referencia)
            onCitaFound(cita)
            toast({
                title: "¡Éxito!",
                description: "Cita encontrada. Procede a iniciar la recepción.",
            })
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "No se encontró la cita",
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
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            Ingresa el número de referencia de la cita. Formato: <code className="text-xs">CIT-YYYYMM-####</code>
                        </AlertDescription>
                    </Alert>

                    <FormField
                        control={form.control}
                        name="numero_referencia"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Número de Referencia *</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="CIT-202501-0001"
                                        {...field}
                                        aria-describedby="numero-referencia-error"
                                        className="text-base"
                                    />
                                </FormControl>
                                <FormMessage id="numero-referencia-error" />
                            </FormItem>
                        )}
                    />

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-[#ED1C24] hover:bg-[#c41820] text-white"
                        size="lg"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Buscando...
                            </>
                        ) : (
                            <>
                                <Search className="mr-2 h-4 w-4" />
                                Buscar Cita
                            </>
                        )}
                    </Button>
                </form>
            </Form>
        </motion.div>
    )
}