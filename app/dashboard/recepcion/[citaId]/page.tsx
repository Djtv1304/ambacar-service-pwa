"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Camera, ArrowLeft, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { CitaResumen } from "@/components/recepcion/cita-resumen"
import { IniciarRecepcionForm } from "@/components/recepcion/iniciar-recepcion-form"
import { CameraDialog } from "@/components/recepcion/camera-dialog"
import { RecepcionCompletada } from "@/components/recepcion/recepcion-completada"
import { buscarCita, completarRecepcion, subirFoto, RecepcionCompletadaResponse } from "@/lib/recepcion/api"
import { FOTOS_REQUERIDAS } from "@/lib/recepcion/constants"

interface FotoCapturada {
    tipo: string
    archivo: File
    preview: string
    orden: number
}

function LoadingSkeleton() {
    return (
        <Card>
            <CardContent className="pt-6 space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-20" />
                    <Skeleton className="h-20" />
                </div>
            </CardContent>
        </Card>
    )
}

export default function RecepcionDetailPage() {
    const { citaId } = useParams()
    const router = useRouter()
    const { toast } = useToast()

    // Steps: 0 = Resumen, 1 = Iniciar Recepción, 2 = Fotos, 3 = Completada
    const [step, setStep] = useState(0)
    const [isLoadingCita, setIsLoadingCita] = useState(true)
    const [loadError, setLoadError] = useState<string | null>(null)
    const [cita, setCita] = useState<any>(null)
    const [recepcion, setRecepcion] = useState<any>(null)
    const [fotosCapturadas, setFotosCapturadas] = useState<FotoCapturada[]>([])
    const [isUploadingPhotos, setIsUploadingPhotos] = useState(false)
    const [recepcionCompletada, setRecepcionCompletada] = useState<RecepcionCompletadaResponse | null>(null)
    const [showCamera, setShowCamera] = useState(false)

    // Auto-load cita based on numero_referencia from URL
    useEffect(() => {
        async function loadCita() {
            if (!citaId || citaId === "nueva") {
                router.push("/dashboard/recepcion/nueva")
                return
            }

            setIsLoadingCita(true)
            setLoadError(null)

            try {
                // citaId is the numero_referencia (e.g., CIT-202601-0002)
                const citaData = await buscarCita(citaId as string)
                setCita(citaData)
                toast({
                    title: "Cita cargada",
                    description: `Cita ${citaData.cita.numero_cita} encontrada correctamente.`,
                })
            } catch (error: any) {
                setLoadError(error.message || "No se pudo cargar la cita")
                toast({
                    title: "Error",
                    description: error.message || "No se encontró la cita",
                    variant: "destructive",
                })
            } finally {
                setIsLoadingCita(false)
            }
        }

        loadCita()
    }, [citaId, router, toast])

    const handleRecepcionInitiated = (recepcionData: any) => {
        setRecepcion(recepcionData)
        setStep(2)
    }

    const handleFotosCapturadas = async (fotos: FotoCapturada[]) => {
        setIsUploadingPhotos(true)
        setShowCamera(false)
        try {
            for (const foto of fotos) {
                await subirFoto(recepcion.id, foto.tipo, foto.archivo, foto.orden)
            }

            setFotosCapturadas(fotos)
            toast({
                title: "Fotos subidas",
                description: `${fotos.length} fotos han sido subidas exitosamente.`,
            })
        } catch (error: any) {
            toast({
                title: "Error al subir fotos",
                description: error.message || "Hubo un problema al subir las fotos. Intenta nuevamente.",
                variant: "destructive",
            })
        } finally {
            setIsUploadingPhotos(false)
        }
    }

    const handleCompletarRecepcion = async () => {
        setIsUploadingPhotos(true)
        try {
            const response = await completarRecepcion(recepcion.id)
            setRecepcionCompletada(response)
            toast({
                title: "Recepción completada",
                description: response.mensaje || "La Orden de Trabajo ha sido generada automáticamente.",
            })
            setStep(3)
        } catch (error: any) {
            toast({
                title: "Error al completar recepción",
                description: error.message || "Hubo un problema al completar la recepción. Verifica que todas las fotos estén subidas.",
                variant: "destructive",
            })
        } finally {
            setIsUploadingPhotos(false)
        }
    }

    const stepLabels = ["Resumen", "Iniciar Recepción", "Fotos", "Completada"]

    // Show loading state
    if (isLoadingCita) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/dashboard/recepcion">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Recepción Digital</h1>
                        <p className="text-muted-foreground mt-1">Cargando cita...</p>
                    </div>
                </div>
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
                <LoadingSkeleton />
            </div>
        )
    }

    // Show error state
    if (loadError) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/dashboard/recepcion">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Recepción Digital</h1>
                        <p className="text-muted-foreground mt-1">Error al cargar la cita</p>
                    </div>
                </div>
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <p className="text-lg font-medium text-destructive mb-4">{loadError}</p>
                        <Button asChild>
                            <Link href="/dashboard/recepcion">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Volver a Recepción
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard/recepcion">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Recepción Digital</h1>
                    <p className="text-muted-foreground mt-1">{step <= 3 ? stepLabels[step] : "Recepción Completada"}</p>
                </div>
            </div>

            {/* Progreso */}
            <div className="flex items-center justify-between">
                {stepLabels.map((label, idx) => (
                    <motion.div key={idx} className="flex-1 flex items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm transition-all ${
                                idx < step
                                    ? "bg-primary text-white"
                                    : idx === step
                                        ? "bg-primary text-white ring-2 ring-primary ring-offset-2 dark:ring-offset-background"
                                        : "bg-muted text-muted-foreground"
                            }`}
                        >
                            {idx < step ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                        </div>
                        {idx < stepLabels.length - 1 && (
                            <div className={`flex-1 h-1 mx-2 transition-colors ${idx < step ? "bg-primary" : "bg-muted"}`} />
                        )}
                    </motion.div>
                ))}
            </div>

            {/* Contenido */}
            <motion.div key={step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                {step === 0 && cita && <CitaResumen cita={cita} onProceed={() => setStep(1)} />}

                {step === 1 && cita && recepcion === null && (
                    <Card>
                        <CardContent>
                            <IniciarRecepcionForm cita={cita} kmIngreso={cita.vehiculo.kilometraje_actual} onRecepcionInitiated={handleRecepcionInitiated} />
                        </CardContent>
                    </Card>
                )}

                {step === 2 && recepcion && (
                    <Card>
                        <CardContent className="pt-6 space-y-4">
                            <div>
                                <h3 className="font-semibold mb-2">Tomar 4 Fotos del Vehículo</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Se requieren: Frontal, Trasera, Lateral Izquierdo, Lateral Derecho
                                </p>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setShowCamera(true)}
                                className="w-full p-8 rounded-lg border-2 border-dashed border-primary/30 hover:border-primary flex flex-col items-center justify-center gap-3 transition-colors"
                            >
                                <Camera className="w-8 h-8 text-primary" />
                                <span className="font-medium">Abrir Cámara</span>
                                <span className="text-xs text-muted-foreground">
                  {fotosCapturadas.length}/{FOTOS_REQUERIDAS} fotos capturadas
                </span>
                            </motion.button>

                            <CameraDialog
                                open={showCamera}
                                onOpenChange={setShowCamera}
                                onFotosCapturadas={handleFotosCapturadas}
                                isLoading={isUploadingPhotos}
                            />

                            {fotosCapturadas.length === FOTOS_REQUERIDAS && !isUploadingPhotos && (
                                <motion.button
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    onClick={handleCompletarRecepcion}
                                    className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium transition-colors"
                                >
                                    <CheckCircle2 className="inline mr-2 w-4 h-4" />
                                    Completar Recepción
                                </motion.button>
                            )}
                        </CardContent>
                    </Card>
                )}

                {step === 3 && recepcionCompletada && <RecepcionCompletada data={recepcionCompletada} />}
            </motion.div>
        </div>
    )
}
