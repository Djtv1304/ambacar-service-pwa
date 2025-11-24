"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
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

    const tipoActual = TIPOS_FOTO[indexActual]
    const fotosRestantes = FOTOS_REQUERIDAS - fotosCapturadas.length

    const iniciarCamara = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment" },
            })
            if (videoRef.current) {
                videoRef.current.srcObject = stream
                setCameraActive(true)
            }
        } catch (error) {
            console.error("Error al acceder a la cámara:", error)
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
                        const file = new File([blob], `foto-${tipoActual.id}.jpg`, {
                            type: "image/jpeg",
                        })
                        const preview = canvasRef.current?.toDataURL() || ""

                        setFotosCapturadas((prev) => [
                            ...prev,
                            {
                                tipo: tipoActual.id,
                                archivo: file,
                                preview,
                                orden: fotosCapturadas.length + 1,
                            },
                        ])

                        if (fotosCapturadas.length + 1 >= FOTOS_REQUERIDAS) {
                            setCameraActive(false)
                            if (videoRef.current?.srcObject) {
                                const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
                                tracks.forEach((track) => track.stop())
                            }
                        }
                    }
                }, "image/jpeg")
            }
        } finally {
            setIsCapturing(false)
        }
    }, [fotosCapturadas.length, tipoActual.id])

    const retomar = () => {
        setFotosCapturadas((prev) => prev.slice(0, -1))
        if (!cameraActive) {
            iniciarCamara()
        }
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
                        setFotosCapturadas((prev) => [
                            ...prev,
                            {
                                tipo: tipoActual.id,
                                archivo: file,
                                preview,
                                orden: fotosCapturadas.length + 1,
                            },
                        ])

                        if (fotosCapturadas.length + 1 >= FOTOS_REQUERIDAS) {
                            setCameraActive(false)
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
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Tomar Fotos de Vehículo</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Progress */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">
                Foto {fotosCapturadas.length + 1}/{FOTOS_REQUERIDAS}
              </span>
                            <Badge className="bg-[#ED1C24]/10 text-[#ED1C24] border-[#ED1C24]/20">{tipoActual.label}</Badge>
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
                    {fotosRestantes > 0 && !cameraActive && (
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                {fotosRestantes === 1
                                    ? "Captura la última foto requerida"
                                    : `Faltan ${fotosRestantes} foto(s) para completar`}
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

                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    className="flex-1 bg-transparent"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isCapturing}
                                >
                                    <AlertCircle className="mr-2 h-4 w-4" />
                                    Galería
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
                                            Capturar
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Miniaturas */}
                            {fotosCapturadas.length > 0 && (
                                <div className="grid grid-cols-2 gap-2">
                                    <AnimatePresence>
                                        {fotosCapturadas.map((foto, idx) => (
                                            <motion.div
                                                key={`${foto.tipo}-${idx}`}
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.8 }}
                                                className="relative"
                                            >
                                                <img
                                                    src={foto.preview || "/placeholder.svg?height=120&width=120"}
                                                    alt={foto.tipo}
                                                    className="w-full rounded-lg aspect-video object-cover"
                                                />
                                                <Badge className="absolute top-2 right-2 bg-[#ED1C24]">{foto.tipo}</Badge>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
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
                                        Continuar Capturando
                                    </Button>
                                )}

                                {fotosCapturadas.length > 0 && (
                                    <Button onClick={retomar} variant="outline" size="lg" disabled={isLoading}>
                                        <RotateCcw className="mr-2 h-4 w-4" />
                                        Retomar
                                    </Button>
                                )}

                                {fotosCapturadas.length === FOTOS_REQUERIDAS && (
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
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}