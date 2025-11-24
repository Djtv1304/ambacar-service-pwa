"use client"

import { motion } from "framer-motion"
import { CheckCircle, Printer, Eye, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface RecepcionCompletadaProps {
    ot: any
    fotasFaltantes?: string[]
}

export function RecepcionCompletada({ ot, fotasFaltantes }: RecepcionCompletadaProps) {
    const containerVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                type: "spring" as const,
                stiffness: 300,
                damping: 30,
            },
        },
    }

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
            {/* Success Banner */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Card className="border-green-500/50 bg-green-500/5">
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0">
                                <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg text-green-900">¡Recepción Completada!</h3>
                                <p className="text-sm text-green-700 mt-1">
                                    La recepción ha sido procesada exitosamente y la Orden de Trabajo ha sido generada.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Alertas de Fotos Faltantes */}
            {fotasFaltantes && fotasFaltantes.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            Faltan {fotasFaltantes.length} foto(s): {fotasFaltantes.join(", ")}. Por favor, toma las fotos faltantes
                            para completar el expediente.
                        </AlertDescription>
                    </Alert>
                </motion.div>
            )}

            {/* OT Resumen */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center justify-between">
                            <span>Resumen de Orden de Trabajo</span>
                            <Badge className="bg-[#ED1C24]">{ot.numero_ot}</Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-muted-foreground">ID de Recepción</p>
                                <p className="font-medium">{ot.recepcion_id}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Estado</p>
                                <p className="font-medium capitalize">{ot.estado}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Creado el</p>
                                <p className="font-medium">{new Date(ot.creado_en).toLocaleDateString("es-EC")}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Cliente ID</p>
                                <p className="font-medium">{ot.cliente_id}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Acciones */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex gap-3"
            >
                <Button variant="outline" className="flex-1 bg-transparent" onClick={() => window.print()}>
                    <Printer className="mr-2 h-4 w-4" />
                    Imprimir
                </Button>
                <Button className="flex-1 bg-[#ED1C24] hover:bg-[#c41820]">
                    <Eye className="mr-2 h-4 w-4" />
                    Ver OT Completa
                </Button>
            </motion.div>
        </motion.div>
    )
}