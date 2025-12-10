"use client"

import type React from "react"

import { useState, useRef, useCallback, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Camera, RotateCcw, Check, AlertCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { TIPOS_FOTO, FOTOS_REQUERIDAS } from "@/lib/recepcion/constants"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface FotoCapturada {
    tipo: string
    archivo: File
    preview: string
    orden: number
}

interface CameraDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onFotosCapturadas: (fotos: FotoCapturada[]) => void
    isLoading?: boolean
}

export function CameraDialog({ open, onOpenChange, onFotosCapturadas, isLoading }: CameraDialogProps) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [fotosCapturadas, setFotosCapturadas] = useState<FotoCapturada[]>([])
    const [indexActual, setIndexActual] = useState(0)
    const [cameraActive, setCameraActive] = useState(false)
    const [isCapturing, setIsCapturing] = useState(false)
    const [fotoSeleccionadaRetomar, setFotoSeleccionadaRetomar] = useState<number | null>(null)

    const tipoActual = TIPOS_FOTO[indexActual] || TIPOS_FOTO[0]
    const fotosRestantes = FOTOS_REQUERIDAS - fotosCapturadas.length

    // Debug: Monitorear cambios en cameraActive
    useEffect(() => {
        console.log("[CameraDialog] ⚡ cameraActive cambió a:", cameraActive)
    }, [cameraActive])

    // Limpiar la cámara cuando se cierra el diálogo
    const limpiarCamara = useCallback(() => {
        console.log("[CameraDialog] Limpiando cámara y deteniendo tracks...")
        if (videoRef.current?.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream
            const tracks = stream.getTracks()
            tracks.forEach((track) => track.stop())
            videoRef.current.srcObject = null
            console.log("[CameraDialog] ✅ Cámara limpiada, tracks detenidos")
        }
        setCameraActive(false)
    }, [])

    // Resetear estado cuando se cierra el diálogo
    useEffect(() => {
        if (!open) {
            console.log("[CameraDialog] Modal cerrado, limpiando...")
            limpiarCamara()
            setFotosCapturadas([])
            setIndexActual(0)
            setIsCapturing(false)
            setFotoSeleccionadaRetomar(null)
        }

        // Cleanup cuando el componente se desmonte
        return () => {
            if (videoRef.current?.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream
                const tracks = stream.getTracks()
                tracks.forEach((track) => track.stop())
                videoRef.current.srcObject = null
                console.log("[CameraDialog] Cleanup: cámara detenida")
            }
        }
    }, [open, limpiarCamara])

    const iniciarCamara = useCallback(async () => {
        console.log("[CameraDialog] Iniciando cámara...")

        // Primero activar el estado para que la UI se prepare
        setCameraActive(true)
        console.log("[CameraDialog] cameraActive establecido a true (antes de obtener stream)")

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: "environment",
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
            })
            console.log("[CameraDialog] Stream obtenido:", stream)

            if (videoRef.current) {
                videoRef.current.srcObject = stream
                console.log("[CameraDialog] Stream asignado al video")

                // Asegurar que el video se reproduzca
                try {
                    await videoRef.current.play()
                    console.log("[CameraDialog] Video reproduciendo exitosamente")
                } catch (playError) {
                    console.error("[CameraDialog] Error al reproducir video:", playError)
                }
            }
        } catch (error) {
            console.error("[CameraDialog] Error al acceder a la cámara:", error)
            // Si hay error, desactivar la cámara
            setCameraActive(false)
            alert("No se pudo acceder a la cámara. Por favor verifica los permisos.")
        }
    }, [])

    const capturarFoto = useCallback(async () => {
        if (!canvasRef.current || !videoRef.current) return

        setIsCapturing(true)
        try {
            const context = canvasRef.current.getContext("2d")
            if (context) {
                canvasRef.current.width = videoRef.current.videoWidth
                canvasRef.current.height = videoRef.current.videoHeight
                context.drawImage(videoRef.current, 0, 0)

                canvasRef.current.toBlob((blob) => {
                    if (blob) {
                        // Si estamos retomando una foto específica, usar el tipo de esa foto
                        const tipoFoto = fotoSeleccionadaRetomar !== null
                            ? TIPOS_FOTO[fotoSeleccionadaRetomar]?.id || tipoActual.id
                            : tipoActual.id

                        const file = new File([blob], `foto-${tipoFoto}.jpg`, {
                            type: "image/jpeg",
                        })
                        const preview = canvasRef.current?.toDataURL() || ""

                        const nuevaFoto = {
                            tipo: tipoFoto,
                            archivo: file,
                            preview,
                            orden: fotoSeleccionadaRetomar !== null ? fotoSeleccionadaRetomar + 1 : indexActual + 1,
                        }

                        // Si estamos retomando una foto específica, reemplazarla
                        if (fotoSeleccionadaRetomar !== null) {
                            console.log("[CameraDialog] Reemplazando foto en índice:", fotoSeleccionadaRetomar)
                            setFotosCapturadas((prev) => {
                                const nuevasFotos = [...prev]
                                nuevasFotos[fotoSeleccionadaRetomar] = nuevaFoto
                                console.log("[CameraDialog] Fotos después de reemplazar:", nuevasFotos.length)
                                return nuevasFotos
                            })
                            setFotoSeleccionadaRetomar(null)
                            setCameraActive(false)
                            if (videoRef.current?.srcObject) {
                                const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
                                tracks.forEach((track) => track.stop())
                            }
                        } else {
                            // Agregar nueva foto
                            console.log("[CameraDialog] Agregando nueva foto, total será:", fotosCapturadas.length + 1)
                            setFotosCapturadas((prev) => [...prev, nuevaFoto])

                            // Incrementar el índice para la siguiente foto
                            setIndexActual((prev) => prev + 1)

                            if (fotosCapturadas.length + 1 >= FOTOS_REQUERIDAS) {
                                setCameraActive(false)
                                if (videoRef.current?.srcObject) {
                                    const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
                                    tracks.forEach((track) => track.stop())
                                }
                            }
                        }
                    }
                }, "image/jpeg")
            }
        } finally {
            setIsCapturing(false)
        }
    }, [fotosCapturadas.length, tipoActual.id, indexActual, fotoSeleccionadaRetomar])

    const retomar = () => {
        // Si hay una foto seleccionada, retomar solo esa
        if (fotoSeleccionadaRetomar !== null) {
            console.log("[CameraDialog] Retomando foto en índice:", fotoSeleccionadaRetomar)
            // NO resetear fotoSeleccionadaRetomar aquí - se necesita para capturarFoto()
            setIndexActual(fotoSeleccionadaRetomar)
            iniciarCamara()
        } else {
            // Reiniciar todo el flujo
            reiniciarFlujo()
        }
    }

    const reiniciarFlujo = () => {
        console.log("[CameraDialog] Reiniciando flujo completo")
        setFotosCapturadas([])
        setIndexActual(0)
        setFotoSeleccionadaRetomar(null)
        iniciarCamara()
    }

    const seleccionarFotoParaRetomar = (index: number) => {
        console.log("[CameraDialog] Foto seleccionada para retomar:", index)
        setFotoSeleccionadaRetomar(index)
    }

    const confirmar = () => {
        if (fotosCapturadas.length === FOTOS_REQUERIDAS) {
            onFotosCapturadas(fotosCapturadas)
            setFotosCapturadas([])
            setIndexActual(0)
            setCameraActive(false)
            onOpenChange(false)
        }
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file && canvasRef.current) {
            const reader = new FileReader()
            reader.onload = (event) => {
                const img = new Image()
                img.onload = () => {
                    const context = canvasRef.current?.getContext("2d")
                    if (context && canvasRef.current) {
                        canvasRef.current.width = img.width
                        canvasRef.current.height = img.height
                        context.drawImage(img, 0, 0)

                        const preview = canvasRef.current.toDataURL()

                        // Si estamos retomando una foto específica, usar el tipo de esa foto
                        const tipoFoto = fotoSeleccionadaRetomar !== null
                            ? TIPOS_FOTO[fotoSeleccionadaRetomar]?.id || tipoActual.id
                            : tipoActual.id

                        const nuevaFoto = {
                            tipo: tipoFoto,
                            archivo: file,
                            preview,
                            orden: fotoSeleccionadaRetomar !== null ? fotoSeleccionadaRetomar + 1 : indexActual + 1,
                        }

                        // Si estamos retomando una foto específica, reemplazarla
                        if (fotoSeleccionadaRetomar !== null) {
                            console.log("[CameraDialog] Reemplazando foto desde archivo en índice:", fotoSeleccionadaRetomar)
                            setFotosCapturadas((prev) => {
                                const nuevasFotos = [...prev]
                                nuevasFotos[fotoSeleccionadaRetomar] = nuevaFoto
                                return nuevasFotos
                            })
                            setFotoSeleccionadaRetomar(null)
                            setCameraActive(false)
                        } else {
                            // Agregar nueva foto
                            setFotosCapturadas((prev) => [...prev, nuevaFoto])

                            // Incrementar el índice para la siguiente foto
                            setIndexActual((prev) => prev + 1)

                            if (fotosCapturadas.length + 1 >= FOTOS_REQUERIDAS) {
                                setCameraActive(false)
                            }
                        }
                    }
                }
                img.src = event.target?.result as string
            }
            reader.readAsDataURL(file)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg" aria-describedby="dialog-description">
                <DialogHeader>
                    <DialogTitle>Tomar Fotos de Vehículo</DialogTitle>
                </DialogHeader>

                <p id="dialog-description" className="sr-only">
                    Captura las 4 fotos requeridas del vehículo: frontal, trasera, lateral izquierda y lateral derecha
                </p>

                <div className="space-y-4">
                    {/* Progress */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">
                                {fotosCapturadas.length >= FOTOS_REQUERIDAS && !cameraActive
                                    ? `Fotos completas (${FOTOS_REQUERIDAS}/${FOTOS_REQUERIDAS})`
                                    : fotoSeleccionadaRetomar !== null && cameraActive
                                        ? `Retomando foto ${fotoSeleccionadaRetomar + 1}/${FOTOS_REQUERIDAS}`
                                        : `Foto ${fotosCapturadas.length + 1}/${FOTOS_REQUERIDAS}`}
                            </span>
                            <Badge className="bg-[#ED1C24]/10 text-[#ED1C24] border-[#ED1C24]/20">
                                {fotosCapturadas.length >= FOTOS_REQUERIDAS && !cameraActive
                                    ? "Revisar Fotos"
                                    : fotoSeleccionadaRetomar !== null
                                        ? `Retomando: ${TIPOS_FOTO[fotoSeleccionadaRetomar]?.label || ""}`
                                        : tipoActual.label}
                            </Badge>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                            <motion.div
                                className="bg-[#ED1C24] h-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${(fotosCapturadas.length / FOTOS_REQUERIDAS) * 100}%` }}
                                transition={{ duration: 0.3 }}
                            />
                        </div>
                    </div>

                    {/* Alert */}
                    {fotosRestantes > 0 && !cameraActive && fotosCapturadas.length === 0 && (
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                Presiona el botón para comenzar a capturar las fotos del vehículo
                            </AlertDescription>
                        </Alert>
                    )}
                    {fotosRestantes > 0 && !cameraActive && fotosCapturadas.length > 0 && (
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                {fotosRestantes === 1
                                    ? "Captura la última foto para completar"
                                    : `Te faltan ${fotosRestantes} fotos`}
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Camera o Preview */}
                    {cameraActive ? (
                        <div className="space-y-4">
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                className="w-full rounded-lg bg-black aspect-video object-cover"
                            />
                            <canvas ref={canvasRef} className="hidden" />

                            <div className="space-y-3">
                                <p className="text-xs text-center text-muted-foreground">
                                    También puedes elegir una foto desde tus archivos
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        className="flex-1 bg-transparent"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isCapturing}
                                    >
                                        <AlertCircle className="mr-2 h-4 w-4" />
                                        Elegir Archivo
                                    </Button>
                                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
                                    <Button
                                        onClick={capturarFoto}
                                        disabled={isCapturing}
                                        size="lg"
                                        className="flex-1 bg-[#ED1C24] hover:bg-[#c41820]"
                                    >
                                        {isCapturing ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Capturando...
                                            </>
                                        ) : (
                                            <>
                                                <Camera className="mr-2 h-4 w-4" />
                                                {fotoSeleccionadaRetomar !== null
                                                    ? `Capturar (${fotoSeleccionadaRetomar + 1}/4)`
                                                    : `Capturar (${fotosCapturadas.length + 1}/4)`}
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Miniaturas */}
                            {fotosCapturadas.length > 0 && (
                                <div
                                    className="space-y-3"
                                    onClick={(e) => {
                                        // Deseleccionar si se hace click fuera de las imágenes
                                        if (e.target === e.currentTarget) {
                                            setFotoSeleccionadaRetomar(null)
                                        }
                                    }}
                                >
                                    {fotosCapturadas.length === FOTOS_REQUERIDAS && (
                                        <Alert className="bg-blue-50 border-blue-200">
                                            <Check className="h-4 w-4 text-blue-600" />
                                            <AlertDescription className="text-blue-900 font-medium">
                                                ¿Deseas retomar alguna foto? Selecciona la imagen y presiona el botón con el ícono de repetir
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                    <div
                                        className="grid grid-cols-2 gap-3"
                                        onClick={(e) => {
                                            // Deseleccionar si se hace click en el gap entre imágenes
                                            if (e.target === e.currentTarget) {
                                                setFotoSeleccionadaRetomar(null)
                                            }
                                        }}
                                    >
                                        <AnimatePresence>
                                            {fotosCapturadas.map((foto, idx) => (
                                                <motion.div
                                                    key={`${foto.tipo}-${idx}`}
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.8 }}
                                                    className="relative"
                                                >
                                                    <button
                                                        onClick={() => {
                                                            // Toggle: si ya está seleccionada, deseleccionar
                                                            if (fotoSeleccionadaRetomar === idx) {
                                                                setFotoSeleccionadaRetomar(null)
                                                            } else {
                                                                seleccionarFotoParaRetomar(idx)
                                                            }
                                                        }}
                                                        className={`w-full rounded-lg overflow-hidden transition-all ${
                                                            fotoSeleccionadaRetomar === idx
                                                                ? "ring-[3px] ring-[#ED1C24] shadow-lg"
                                                                : "hover:ring-2 hover:ring-gray-300"
                                                        }`}
                                                        disabled={cameraActive}
                                                    >
                                                        <img
                                                            src={foto.preview || "/placeholder.svg?height=120&width=120"}
                                                            alt={foto.tipo}
                                                            className="w-full aspect-video object-cover rounded-lg"
                                                        />
                                                    </button>
                                                    <Badge className="absolute top-2 right-2 bg-[#ED1C24] rounded-md">{foto.tipo}</Badge>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-2">
                                {fotosCapturadas.length < FOTOS_REQUERIDAS && (
                                    <Button
                                        onClick={iniciarCamara}
                                        size="lg"
                                        className="flex-1 bg-[#ED1C24] hover:bg-[#c41820]"
                                        disabled={isLoading}
                                    >
                                        <Camera className="mr-2 h-4 w-4" />
                                        {fotosCapturadas.length === 0 ? "Comenzar a Capturar" : "Continuar Capturando"}
                                    </Button>
                                )}

                                {fotosCapturadas.length === FOTOS_REQUERIDAS && (
                                    <>
                                        {fotoSeleccionadaRetomar !== null ? (
                                            <Button
                                                onClick={retomar}
                                                size="lg"
                                                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                                                disabled={isLoading}
                                            >
                                                <RotateCcw className="mr-2 h-4 w-4" />
                                                Retomar Foto
                                            </Button>
                                        ) : (
                                            <Button
                                                onClick={reiniciarFlujo}
                                                variant="outline"
                                                size="lg"
                                                className="flex-1"
                                                disabled={isLoading}
                                            >
                                                <RotateCcw className="mr-2 h-4 w-4" />
                                                Retomar Todas
                                            </Button>
                                        )}
                                        <Button
                                            onClick={confirmar}
                                            size="lg"
                                            className="flex-1 bg-green-600 hover:bg-green-700"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Subiendo...
                                                </>
                                            ) : (
                                                <>
                                                    <Check className="mr-2 h-4 w-4" />
                                                    Confirmar Fotos
                                                </>
                                            )}
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}