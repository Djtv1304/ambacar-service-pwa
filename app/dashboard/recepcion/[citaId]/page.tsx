"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, Camera } from "lucide-react"
import { motion } from "framer-motion"
import { useToast } from "@/hooks/use-toast"
import { BuscarCitaForm } from "@/components/recepcion/buscar-cita-form"
import { CitaResumen } from "@/components/recepcion/cita-resumen"
import { IniciarRecepcionForm } from "@/components/recepcion/iniciar-recepcion-form"
import { CameraDialog } from "@/components/recepcion/camera-dialog"
import { RecepcionCompletada } from "@/components/recepcion/recepcion-completada"
import { completarRecepcion, subirFoto } from "@/lib/recepcion/api"
import { FOTOS_REQUERIDAS } from "@/lib/recepcion/constants"

interface FotoCapturada {
    tipo: string
    archivo: File
    preview: string
    orden: number
}

export default function RecepcionDetailPage() {
    const { citaId } = useParams()
    const { toast } = useToast()

    const [step, setStep] = useState(0)
    const [cita, setCita] = useState<any>(null)
    const [recepcion, setRecepcion] = useState<any>(null)
    const [kmIngreso, setKmIngreso] = useState(0)
    const [fotosCapturadas, setFotosCapturadas] = useState<FotoCapturada[]>([])
    const [isUploadingPhotos, setIsUploadingPhotos] = useState(false)
    const [ot, setOt] = useState<any>(null)
    const [showCamera, setShowCamera] = useState(false)

    useEffect(() => {
        if (citaId && citaId !== "nueva") {
            // TODO: Cargar cita por ID si viene en URL
        }
    }, [citaId])

    const handleCitaFound = (citaData: any) => {
        setCita(citaData)
        setKmIngreso(citaData.vehiculo.kilometraje_actual)
        setStep(1)
    }

    const handleKmEdited = (km: number) => {
        setKmIngreso(km)
    }

    const handleRecepcionInitiated = (recepcionData: any) => {
        setRecepcion(recepcionData)
        setStep(3)
    }

    const handleFotosCapturadas = async (fotos: FotoCapturada[]) => {
        setIsUploadingPhotos(true)
        try {
            for (let i = 0; i < fotos.length; i++) {
                const foto = fotos[i]
                await subirFoto(recepcion.id, foto.tipo, foto.archivo, i + 1)
            }

            setFotosCapturadas(fotos)
            toast({
                title: "¡Fotos subidas!",
                description: "Todas las fotos han sido capturadas exitosamente.",
            })

            setTimeout(() => setStep(4), 500)
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Error al subir fotos",
                variant: "destructive",
            })
        } finally {
            setIsUploadingPhotos(false)
        }
    }

    const handleCompletarRecepcion = async () => {
        setIsUploadingPhotos(true)
        try {
            const otData = await completarRecepcion(recepcion.id)
            setOt(otData)
            toast({
                title: "¡Recepción completada!",
                description: "La Orden de Trabajo ha sido generada automáticamente.",
            })
            setStep(5)
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Error al completar recepción",
                variant: "destructive",
            })
        } finally {
            setIsUploadingPhotos(false)
        }
    }

    const stepLabels = ["Buscar Cita", "Resumen", "Iniciar Recepción", "Fotos", "Completada"]


    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Recepción Digital</h1>
                <p className="text-muted-foreground mt-1">{step < 5 ? stepLabels[step] : "Recepción Completada"}</p>
            </div>

            {/* Progreso */}
            <div className="flex items-center justify-between">
                {stepLabels.map((label, idx) => (
                    <motion.div key={idx} className="flex-1 flex items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm transition-all ${
                                idx < step
                                    ? "bg-[#ED1C24] text-white"
                                    : idx === step
                                        ? "bg-[#ED1C24] text-white ring-2 ring-[#ED1C24] ring-offset-2"
                                        : "bg-muted text-muted-foreground"
                            }`}
                        >
                            {idx < step ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                        </div>
                        {idx < stepLabels.length - 1 && (
                            <div className={`flex-1 h-1 mx-2 transition-colors ${idx < step ? "bg-[#ED1C24]" : "bg-muted"}`} />
                        )}
                    </motion.div>
                ))}
            </div>

            {/* Contenido */}
            <motion.div key={step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                {step === 0 && (
                    <Card>
                        <CardContent className="pt-6">
                            <BuscarCitaForm onCitaFound={handleCitaFound} />
                        </CardContent>
                    </Card>
                )}

                {step === 1 && cita && <CitaResumen cita={cita} onKmEdited={handleKmEdited} onProceed={() => setStep(2)} />}

                {step === 2 && cita && recepcion === null && (
                    <Card>
                        <CardContent className="pt-6">
                            <IniciarRecepcionForm cita={cita} kmIngreso={kmIngreso} onRecepcionInitiated={handleRecepcionInitiated} />
                        </CardContent>
                    </Card>
                )}

                {step === 3 && recepcion && (
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
                                className="w-full p-8 rounded-lg border-2 border-dashed border-[#ED1C24]/30 hover:border-[#ED1C24] flex flex-col items-center justify-center gap-3 transition-colors"
                            >
                                <Camera className="w-8 h-8 text-[#ED1C24]" />
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

                {step === 5 && ot && <RecepcionCompletada ot={ot} />}
            </motion.div>
        </div>
    )
}