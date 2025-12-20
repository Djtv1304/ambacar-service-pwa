"use client"

import type React from "react"
import { useState, useRef, useCallback, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Camera, RotateCcw, Check, AlertCircle, ImagePlus } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { MIN_FOTOS_INSPECCION, MAX_FOTOS_INSPECCION } from "@/lib/inspeccion/constants"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { FotoInspeccion } from "@/lib/types"

interface CameraInspeccionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onFotosCapturadas: (fotos: FotoInspeccion[]) => void
  puntoNombre?: string
  fotosExistentes?: FotoInspeccion[]
}

export function CameraInspeccionDialog({
  open,
  onOpenChange,
  onFotosCapturadas,
  puntoNombre,
  fotosExistentes = [],
}: CameraInspeccionDialogProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [fotosCapturadas, setFotosCapturadas] = useState<FotoInspeccion[]>(fotosExistentes)
  const [cameraActive, setCameraActive] = useState(false)
  const [isCapturing, setIsCapturing] = useState(false)
  const [fotoSeleccionadaRetomar, setFotoSeleccionadaRetomar] = useState<number | null>(null)

  const fotosRestantes = MAX_FOTOS_INSPECCION - fotosCapturadas.length
  const puedeConfirmar = fotosCapturadas.length >= MIN_FOTOS_INSPECCION

  // Sincronizar con fotos existentes cuando se abre el diálogo
  useEffect(() => {
    if (open) {
      setFotosCapturadas(fotosExistentes)
    }
  }, [open, fotosExistentes])

  const limpiarCamara = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      const tracks = stream.getTracks()
      tracks.forEach((track) => track.stop())
      videoRef.current.srcObject = null
    }
    setCameraActive(false)
  }, [])

  useEffect(() => {
    if (!open) {
      limpiarCamara()
      setIsCapturing(false)
      setFotoSeleccionadaRetomar(null)
    }

    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        const tracks = stream.getTracks()
        tracks.forEach((track) => track.stop())
        videoRef.current.srcObject = null
      }
    }
  }, [open, limpiarCamara])

  const iniciarCamara = useCallback(async () => {
    setCameraActive(true)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        try {
          await videoRef.current.play()
        } catch (playError) {
          console.error("Error al reproducir video:", playError)
        }
      }
    } catch (error) {
      console.error("Error al acceder a la cámara:", error)
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
            const file = new File([blob], `inspeccion-${Date.now()}.jpg`, {
              type: "image/jpeg",
            })
            const preview = canvasRef.current?.toDataURL() || ""

            const nuevaFoto: FotoInspeccion = {
              archivo: file,
              preview,
              orden: fotoSeleccionadaRetomar !== null ? fotoSeleccionadaRetomar + 1 : fotosCapturadas.length + 1,
            }

            if (fotoSeleccionadaRetomar !== null) {
              setFotosCapturadas((prev) => {
                const nuevasFotos = [...prev]
                nuevasFotos[fotoSeleccionadaRetomar] = nuevaFoto
                return nuevasFotos
              })
              setFotoSeleccionadaRetomar(null)
              setCameraActive(false)
              limpiarCamara()
            } else {
              setFotosCapturadas((prev) => [...prev, nuevaFoto])

              if (fotosCapturadas.length + 1 >= MAX_FOTOS_INSPECCION) {
                setCameraActive(false)
                limpiarCamara()
              }
            }
          }
        }, "image/jpeg", 0.95)
      }
    } finally {
      setIsCapturing(false)
    }
  }, [fotosCapturadas.length, fotoSeleccionadaRetomar, limpiarCamara])

  const retomar = () => {
    if (fotoSeleccionadaRetomar !== null) {
      iniciarCamara()
    } else {
      reiniciarFlujo()
    }
  }

  const reiniciarFlujo = () => {
    setFotosCapturadas([])
    setFotoSeleccionadaRetomar(null)
    iniciarCamara()
  }

  const seleccionarFotoParaRetomar = (index: number) => {
    setFotoSeleccionadaRetomar(index)
  }

  const confirmar = () => {
    if (puedeConfirmar) {
      onFotosCapturadas(fotosCapturadas)
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

            const nuevaFoto: FotoInspeccion = {
              archivo: file,
              preview,
              orden: fotoSeleccionadaRetomar !== null ? fotoSeleccionadaRetomar + 1 : fotosCapturadas.length + 1,
            }

            if (fotoSeleccionadaRetomar !== null) {
              setFotosCapturadas((prev) => {
                const nuevasFotos = [...prev]
                nuevasFotos[fotoSeleccionadaRetomar] = nuevaFoto
                return nuevasFotos
              })
              setFotoSeleccionadaRetomar(null)
              setCameraActive(false)
            } else {
              setFotosCapturadas((prev) => [...prev, nuevaFoto])

              if (fotosCapturadas.length + 1 >= MAX_FOTOS_INSPECCION) {
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
      <DialogContent className="p-4 md:p-6 sm:max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby="dialog-description">
        <DialogHeader className="text-left">
          <DialogTitle className="text-left">Fotografías de Evidencia</DialogTitle>
          {puntoNombre && (
            <p className="text-sm text-muted-foreground font-normal">{puntoNombre}</p>
          )}
        </DialogHeader>

        <p id="dialog-description" className="sr-only">
          Captura entre {MIN_FOTOS_INSPECCION} y {MAX_FOTOS_INSPECCION} fotos como evidencia del punto de inspección
        </p>

        <div className="space-y-4">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">
                {cameraActive
                  ? `Capturando foto ${fotosCapturadas.length + 1}/${MAX_FOTOS_INSPECCION}`
                  : `Fotos capturadas: ${fotosCapturadas.length}/${MAX_FOTOS_INSPECCION}`}
              </span>
              <Badge
                className={
                  puedeConfirmar
                    ? "bg-green-500/10 text-green-600 border-green-500/20"
                    : "bg-orange-500/10 text-orange-600 border-orange-500/20"
                }
              >
                {puedeConfirmar ? "Listo para confirmar" : `Mínimo ${MIN_FOTOS_INSPECCION} fotos`}
              </Badge>
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <motion.div
                className={puedeConfirmar ? "bg-green-500" : "bg-[#ED1C24]"}
                initial={{ width: 0 }}
                animate={{
                  width: `${(fotosCapturadas.length / MAX_FOTOS_INSPECCION) * 100}%`,
                }}
                transition={{ duration: 0.3 }}
                style={{ height: "100%" }}
              />
            </div>
          </div>

          {/* Alert */}
          {!puedeConfirmar && fotosCapturadas.length < MIN_FOTOS_INSPECCION && !cameraActive && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Debes capturar al menos {MIN_FOTOS_INSPECCION} fotos. Puedes capturar hasta {MAX_FOTOS_INSPECCION}{" "}
                fotos en total.
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
                    size="sm"
                    className="flex-1 bg-transparent"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isCapturing}
                  >
                    <ImagePlus className="mr-2 h-4 w-4" />
                    Elegir Archivo
                  </Button>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
                  <Button
                    onClick={capturarFoto}
                    disabled={isCapturing}
                    size="sm"
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
                        Capturar ({fotosCapturadas.length + 1}/{MAX_FOTOS_INSPECCION})
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
                <div className="space-y-3">
                  {puedeConfirmar && (
                    <Alert className="bg-blue-50 border-blue-200">
                      <Check className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-blue-900 font-medium">
                        ¿Deseas retomar alguna foto? Selecciona la imagen y presiona el botón de repetir
                      </AlertDescription>
                    </Alert>
                  )}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <AnimatePresence>
                      {fotosCapturadas.map((foto, idx) => (
                        <motion.div
                          key={`foto-${idx}`}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="relative"
                        >
                          <button
                            onClick={() => {
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
                            type="button"
                          >
                            <img
                              src={foto.preview || "/placeholder.svg?height=120&width=120"}
                              alt={`Foto ${idx + 1}`}
                              className="w-full aspect-video object-cover rounded-lg"
                            />
                          </button>
                          <Badge className="absolute top-2 right-2 bg-[#ED1C24] rounded-md">{idx + 1}</Badge>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2">
                {fotosCapturadas.length < MAX_FOTOS_INSPECCION && (
                  <Button onClick={iniciarCamara} size="lg" className="w-full sm:flex-1 bg-[#ED1C24] hover:bg-[#c41820]">
                    <Camera className="mr-2 h-4 w-4" />
                    {fotosCapturadas.length === 0 ? "Comenzar a Capturar" : "Continuar Capturando"}
                  </Button>
                )}

                {fotosCapturadas.length >= MIN_FOTOS_INSPECCION && (
                  <>
                    {fotoSeleccionadaRetomar !== null ? (
                      <Button onClick={retomar} size="lg" className="w-full sm:flex-1 bg-orange-500 hover:bg-orange-600 text-white">
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Retomar Foto
                      </Button>
                    ) : (
                      <Button onClick={reiniciarFlujo} variant="outline" size="lg" className="w-full sm:flex-1">
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Retomar Todas
                      </Button>
                    )}
                    <Button onClick={confirmar} size="lg" className="w-full sm:flex-1 bg-green-600 hover:bg-green-700">
                      <Check className="mr-2 h-4 w-4" />
                      Confirmar Fotos
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
