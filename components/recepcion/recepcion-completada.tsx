"use client"

import { motion } from "framer-motion"
import { CheckCircle, Printer, Eye, Car, User, Calendar, Wrench, Image as ImageIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { RecepcionCompletadaResponse } from "@/lib/recepcion/api"

interface RecepcionCompletadaProps {
    data: RecepcionCompletadaResponse
}

export function RecepcionCompletada({ data }: RecepcionCompletadaProps) {
    const { mensaje, recepcion, orden_trabajo } = data

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

    const handleImageClick = (url: string) => {
        window.open(url, "_blank")
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
                                <p className="text-sm text-green-700 mt-1">{mensaje}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Orden de Trabajo */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <Card>
                    <CardHeader className="pb-3 bg-[#ED1C24]/5">
                        <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Wrench className="h-5 w-5 text-[#ED1C24]" />
                                <span>Orden de Trabajo Generada</span>
                            </div>
                            <Badge className="bg-[#ED1C24] hover:bg-[#c41820]">{orden_trabajo.numero_orden}</Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-muted-foreground">ID Orden de Trabajo</p>
                                <p className="font-medium">#{orden_trabajo.id}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Estado</p>
                                <Badge variant="outline" className="capitalize">
                                    {orden_trabajo.estado}
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Detalles de Recepción */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-[#ED1C24]" />
                            <span>Detalles de Recepción</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-muted-foreground">Número de Recepción</p>
                                <p className="font-medium">{recepcion.numero_recepcion}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Estado</p>
                                <Badge variant="outline">{recepcion.estado_display}</Badge>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Fecha y Hora</p>
                                <p className="font-medium">
                                    {new Date(recepcion.fecha_hora_recepcion).toLocaleDateString("es-EC", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Asesor</p>
                                <p className="font-medium">{recepcion.asesor_info.nombre_completo}</p>
                            </div>
                        </div>

                        <div className="pt-2 border-t">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-muted-foreground">Kilometraje de Ingreso</p>
                                    <p className="font-medium">{recepcion.kilometraje_ingreso.toLocaleString()} km</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Nivel de Combustible</p>
                                    <p className="font-medium capitalize">{recepcion.nivel_combustible}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Cliente y Vehículo */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Cliente */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5 text-[#ED1C24]" />
                                <span>Cliente</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div>
                                <p className="text-xs text-muted-foreground">Nombre</p>
                                <p className="font-medium">{recepcion.cliente_info.nombre_completo}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Cédula</p>
                                <p className="font-medium">{recepcion.cliente_info.cedula}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Email</p>
                                <p className="font-medium text-sm">{recepcion.cliente_info.email}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Teléfono</p>
                                <p className="font-medium">{recepcion.cliente_info.telefono}</p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Vehículo */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2">
                                <Car className="h-5 w-5 text-[#ED1C24]" />
                                <span>Vehículo</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div>
                                <p className="text-xs text-muted-foreground">Placa</p>
                                <p className="font-medium text-lg">{recepcion.vehiculo_info.placa}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Marca y Modelo</p>
                                <p className="font-medium">
                                    {recepcion.vehiculo_info.marca} {recepcion.vehiculo_info.modelo}
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <p className="text-xs text-muted-foreground">Año</p>
                                    <p className="font-medium">{recepcion.vehiculo_info.anio}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Color</p>
                                    <p className="font-medium capitalize">{recepcion.vehiculo_info.color}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Fotos del Vehículo */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <ImageIcon className="h-5 w-5 text-[#ED1C24]" />
                                <span>Fotos del Vehículo</span>
                            </div>
                            <Badge variant="outline">
                                {recepcion.cantidad_fotos} foto{recepcion.cantidad_fotos !== 1 ? "s" : ""}
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {recepcion.fotos && recepcion.fotos.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {recepcion.fotos.map((foto, index) => (
                                    <motion.div
                                        key={foto.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.7 + index * 0.1 }}
                                        className="group relative cursor-pointer"
                                        onClick={() => handleImageClick(foto.url_imagen)}
                                    >
                                        <div className="aspect-square rounded-lg overflow-hidden border-2 border-muted hover:border-[#ED1C24] transition-colors">
                                            <img
                                                src={foto.url_imagen}
                                                alt={`Foto ${foto.tipo_foto}`}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                            />
                                        </div>
                                        <div className="mt-2 space-y-1">
                                            <p className="text-xs font-medium capitalize">{foto.tipo_foto.replace("_", " ")}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {foto.ancho_imagen}x{foto.alto_imagen} • {foto.tamano_mb.toFixed(2)} MB
                                            </p>
                                        </div>
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                            <Eye className="h-8 w-8 text-white" />
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-8">No hay fotos disponibles</p>
                        )}
                    </CardContent>
                </Card>
            </motion.div>

            {/* Motivo de Visita y Observaciones */}
            {(recepcion.motivo_visita || recepcion.observaciones_cliente || recepcion.descripcion_danos) && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle>Información Adicional</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {recepcion.motivo_visita && (
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Motivo de Visita</p>
                                    <p className="text-sm">{recepcion.motivo_visita}</p>
                                </div>
                            )}
                            {recepcion.observaciones_cliente && (
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Observaciones del Cliente</p>
                                    <p className="text-sm">{recepcion.observaciones_cliente}</p>
                                </div>
                            )}
                            {recepcion.tiene_danos_previos && recepcion.descripcion_danos && (
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Descripción de Daños Previos</p>
                                    <p className="text-sm">{recepcion.descripcion_danos}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Acciones */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
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
