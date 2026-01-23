"use client"

import type React from "react"
import { useState, useRef, useCallback, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Camera, RotateCcw, Check, AlertCircle, ImagePlus, CheckCircle2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { MIN_FOTOS_INSPECCION, MAX_FOTOS_INSPECCION } from "@/lib/inspeccion/constants"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { FotoInspeccion } from "@/lib/types"
import { toast } from "sonner"

interface CameraInspeccionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onFotosCapturadas: (fotos: FotoInspeccion[]) => void
  puntoNombre?: string
  fotosExistentes?: FotoInspeccion[]
}

function AnimatedHelperText({ fotosRestantes }: { fotosRestantes: number }) {
  const text = `Puedes confirmar ahora o capturar hasta ${fotosRestantes} foto${fotosRestantes !== 1 ? 's' : ''} más`
  const characters = text.split('')
  const numBlocks = Math.ceil(characters.length / 4)
  const textAnimationDuration = numBlocks * 0.3 + 0.2
  const backgroundAnimDuration = 0.4

  return (
    <motion.div
      className="w-full px-2 py-2 md:px-3 md:py-2.5 rounded-lg flex items-center justify-center gap-1.5 md:gap-2"
      initial={{ backgroundColor: 'rgba(255, 255, 255, 0)' }}
      animate={{ backgroundColor: 'rgb(237, 28, 36)' }}
      transition={{
        duration: backgroundAnimDuration,
        delay: textAnimationDuration,
        ease: 'easeInOut',
      }}
    >
      <motion.div
        initial={{ color: 'rgb(107, 114, 128)' }}
        animate={{
          color: [
            'rgb(107, 114, 128)',
            'rgb(237, 28, 36)',
            'rgb(237, 28, 36)',
            'rgb(255, 255, 255)',
          ],
        }}
        transition={{
          duration: 0.2 + textAnimationDuration - 0.2 + backgroundAnimDuration,
          delay: 0,
          times: [
            0,
            0.2 / (0.2 + textAnimationDuration - 0.2 + backgroundAnimDuration),
            (textAnimationDuration) / (0.2 + textAnimationDuration - 0.2 + backgroundAnimDuration),
            1,
          ],
          ease: 'easeInOut',
        }}
      >
        <CheckCircle2 className="h-3.5 w-3.5 md:h-4 md:w-4 shrink-0" style={{ color: 'inherit' }} />
      </motion.div>

      <p className="text-[11px] leading-tight md:text-xs text-center">
        {characters.map((char, index) => {
          const blockDelay = Math.floor(index / 4) * 0.3
          const firstAnimDuration = 0.2
          const secondAnimDelay = textAnimationDuration - blockDelay

          return (
            <motion.span
              key={index}
              initial={{ color: 'rgb(107, 114, 128)' }}
              animate={{
                color: [
                  'rgb(107, 114, 128)',
                  'rgb(237, 28, 36)',
                  'rgb(237, 28, 36)',
                  'rgb(255, 255, 255)',
                ],
              }}
              transition={{
                duration: firstAnimDuration + secondAnimDelay + backgroundAnimDuration,
                delay: blockDelay,
                times: [
                  0,
                  firstAnimDuration / (firstAnimDuration + secondAnimDelay + backgroundAnimDuration),
                  (firstAnimDuration + secondAnimDelay) / (firstAnimDuration + secondAnimDelay + backgroundAnimDuration),
                  1,
                ],
                ease: 'easeInOut',
              }}
              style={{ display: 'inline-block' }}
            >
              {char === ' ' ? '\u00A0' : char}
            </motion.span>
          )
        })}
      </p>
    </motion.div>
  )
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
      toast.error("No se pudo acceder a la cámara", {
        description: "Por favor verifica los permisos de la cámara en tu navegador",
      })
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
              // No cerrar la cámara automáticamente - dejar que el overlay maneje la confirmación
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
              <span className="text-sm font-medium dark:text-gray-100">
                {cameraActive
                  ? `Capturando foto ${fotosCapturadas.length + 1} de ${MAX_FOTOS_INSPECCION}`
                  : `Fotos: ${fotosCapturadas.length} de ${MAX_FOTOS_INSPECCION}`}
              </span>
              <Badge
                variant="outline"
                className={
                  fotosCapturadas.length === MAX_FOTOS_INSPECCION
                    ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900"
                    : puedeConfirmar
                    ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-900"
                    : "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-900"
                }
              >
                {fotosCapturadas.length === MAX_FOTOS_INSPECCION && "Máximo alcanzado"}
                {fotosCapturadas.length < MAX_FOTOS_INSPECCION && puedeConfirmar && "✓ Listo para confirmar"}
                {!puedeConfirmar && `Mínimo ${MIN_FOTOS_INSPECCION} requeridas`}
              </Badge>
            </div>
            <div className="w-full bg-muted dark:bg-gray-800 rounded-full h-2 overflow-hidden">
              <motion.div
                className={
                  fotosCapturadas.length === MAX_FOTOS_INSPECCION
                    ? "bg-blue-500"
                    : puedeConfirmar
                    ? "bg-green-500"
                    : "bg-primary"
                }
                initial={{ width: 0 }}
                animate={{
                  width: `${(fotosCapturadas.length / MAX_FOTOS_INSPECCION) * 100}%`,
                }}
                transition={{ duration: 0.3 }}
                style={{ height: "100%" }}
              />
            </div>
            {puedeConfirmar && fotosCapturadas.length < MAX_FOTOS_INSPECCION && (
              <AnimatedHelperText fotosRestantes={MAX_FOTOS_INSPECCION - fotosCapturadas.length} />
            )}
          </div>

          {/* Alert */}
          {!puedeConfirmar && fotosCapturadas.length < MIN_FOTOS_INSPECCION && !cameraActive && (
            <Alert className="border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950/30">
              <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              <AlertDescription className="text-orange-900 dark:text-orange-300">
                Debes capturar entre {MIN_FOTOS_INSPECCION} y {MAX_FOTOS_INSPECCION} fotos.
                {fotosCapturadas.length > 0 && ` Llevas ${fotosCapturadas.length} de ${MIN_FOTOS_INSPECCION} mínimas.`}
              </AlertDescription>
            </Alert>
          )}

          {/* Camera o Preview */}
          {cameraActive ? (
            <div className="space-y-4">
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full rounded-lg bg-black aspect-video object-cover"
                />

                {/* Overlay de confirmación cuando se alcanza el mínimo */}
                {fotosCapturadas.length >= MIN_FOTOS_INSPECCION && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute bottom-0 left-0 right-0 rounded-b-lg overflow-hidden"
                  >
                    {/* Gradiente con blur progresivo */}
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                      <div
                        className="absolute inset-0"
                        style={{
                          backdropFilter: 'blur(0px)',
                          WebkitBackdropFilter: 'blur(0px)',
                          maskImage: 'linear-gradient(to bottom, transparent 0%, black 100%)',
                          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 100%)',
                        }}
                      />
                      <div
                        className="absolute inset-0"
                        style={{
                          backdropFilter: 'blur(8px)',
                          WebkitBackdropFilter: 'blur(8px)',
                          maskImage: 'linear-gradient(to bottom, transparent 0%, black 100%)',
                          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 100%)',
                        }}
                      />

                      {/* Contenido del overlay */}
                      <div className="relative p-3 flex items-center gap-2 justify-between md:justify-center">
                        <Badge className="bg-green-500 text-white border-0 shadow-lg text-xs shrink-0 h-7">
                          <Check className="h-3 w-3 mr-1" />
                          {fotosCapturadas.length} foto{fotosCapturadas.length !== 1 ? 's' : ''}
                        </Badge>
                        <Button
                          onClick={confirmar}
                          className="flex-1 md:flex-none bg-green-600 hover:bg-green-700 text-white shadow-xl h-7 text-xs px-3"
                        >
                          <Check className="mr-1.5 h-3 w-3" />
                          Confirmar
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
              <canvas ref={canvasRef} className="hidden" />

              <div className="space-y-3">
                <p className="text-xs text-center text-muted-foreground dark:text-gray-500">
                  También puedes elegir una foto desde tus archivos
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-transparent dark:border-gray-700 dark:hover:bg-gray-800"
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
                    className="flex-1 bg-primary hover:bg-primary/90"
                  >
                    {isCapturing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Capturando...
                      </>
                    ) : (
                      <>
                        <Camera className="mr-2 h-4 w-4" />
                        Capturar foto {fotosCapturadas.length + 1}
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
                    <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900">
                      <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <AlertDescription className="text-blue-900 dark:text-blue-300 font-medium">
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
                                ? "ring-[3px] ring-primary shadow-lg"
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
                          <Badge className="absolute top-2 right-2 bg-primary rounded-md">{idx + 1}</Badge>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2">
                {fotosCapturadas.length < MAX_FOTOS_INSPECCION && (
                  <Button onClick={iniciarCamara} size="lg" className="w-full sm:flex-1 bg-primary hover:bg-primary/90">
                    <Camera className="mr-2 h-4 w-4" />
                    {fotosCapturadas.length === 0 && "Comenzar a Capturar"}
                    {fotosCapturadas.length > 0 && fotosCapturadas.length < MIN_FOTOS_INSPECCION && `Capturar más (${fotosCapturadas.length}/${MIN_FOTOS_INSPECCION} mínimas)`}
                    {fotosCapturadas.length >= MIN_FOTOS_INSPECCION && "Agregar más fotos (opcional)"}
                  </Button>
                )}

                {fotosCapturadas.length >= MIN_FOTOS_INSPECCION && (
                  <>
                    {fotoSeleccionadaRetomar !== null ? (
                      <Button onClick={retomar} size="lg" className="w-full sm:flex-1 bg-orange-500 hover:bg-orange-600 text-white">
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Retomar Foto {fotoSeleccionadaRetomar + 1}
                      </Button>
                    ) : (
                      <Button onClick={reiniciarFlujo} variant="outline" size="lg" className="w-full sm:flex-1 dark:border-gray-700 dark:hover:bg-gray-800">
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Retomar Todas
                      </Button>
                    )}
                    <Button onClick={confirmar} size="lg" className="w-full sm:flex-1 bg-green-600 hover:bg-green-700">
                      <Check className="mr-2 h-4 w-4" />
                      Confirmar {fotosCapturadas.length} Foto{fotosCapturadas.length !== 1 ? 's' : ''}
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
