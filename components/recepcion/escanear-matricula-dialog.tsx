"use client"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2, Camera, Upload, X } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuthToken } from "@/hooks/use-auth-token"
import { toast } from "sonner"

interface EscanearMatriculaDialogProps {
  open: boolean
  onClose: () => void
  onDatosExtraidos: (datos: any) => void
}

export function EscanearMatriculaDialog({ open, onClose, onDatosExtraidos }: EscanearMatriculaDialogProps) {
  const { getToken } = useAuthToken()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(false)
  const [cameraActive, setCameraActive] = useState(false)
  const [imagenCapturada, setImagenCapturada] = useState<string | null>(null)
  const [archivoImagen, setArchivoImagen] = useState<File | null>(null)

  const iniciarCamara = async () => {
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
      toast.error("No se pudo acceder a la cámara")
    }
  }

  const detenerCamara = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
      videoRef.current.srcObject = null
      setCameraActive(false)
    }
  }

  const capturarFoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.drawImage(video, 0, 0)
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "matricula.jpg", { type: "image/jpeg" })
            setArchivoImagen(file)
            setImagenCapturada(URL.createObjectURL(blob))
            detenerCamara()
          }
        }, "image/jpeg")
      }
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setArchivoImagen(file)
      setImagenCapturada(URL.createObjectURL(file))
    }
  }

  const procesarMatricula = async () => {
    if (!archivoImagen) {
      toast.error("Por favor captura o sube una imagen primero")
      return
    }

    setLoading(true)
    try {
      const token = await getToken()
      if (!token) {
        toast.error("No se encontró token de autenticación")
        return
      }

      const formData = new FormData()
      formData.append("imagen", archivoImagen)

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/recepciones/extraer-datos-matricula/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Error al procesar la matrícula")
      }

      const data = await response.json()

      if (data.success && data.datos_extraidos) {
        onDatosExtraidos(data.datos_extraidos)
        limpiarYCerrar()
      } else {
        toast.error("No se pudieron extraer los datos de la matrícula")
      }
    } catch (error: any) {
      console.error("Error procesando matrícula:", error)
      toast.error(error.message || "Error al procesar la matrícula")
    } finally {
      setLoading(false)
    }
  }

  const limpiarYCerrar = () => {
    detenerCamara()
    setImagenCapturada(null)
    setArchivoImagen(null)
    onClose()
  }

  const reiniciar = () => {
    setImagenCapturada(null)
    setArchivoImagen(null)
  }

  return (
    <Dialog open={open} onOpenChange={limpiarYCerrar}>
      <DialogContent className="sm:max-w-2xl bg-white border-gray-200">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#202020] flex items-center gap-2">
            <Camera className="h-6 w-6 text-[#ED1C24]" />
            Escanear Matrícula
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Info Alert */}
          <Alert className="border-blue-200 bg-blue-50">
            <AlertDescription className="text-blue-900 text-sm">
              Captura o sube una imagen clara de la matrícula del vehículo. El sistema extraerá automáticamente los datos.
            </AlertDescription>
          </Alert>

          {/* Camera/Image Area */}
          <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ minHeight: "300px" }}>
            {imagenCapturada ? (
              <div className="relative">
                <img src={imagenCapturada} alt="Matrícula capturada" className="w-full h-auto" />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={reiniciar}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : cameraActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-auto"
              />
            ) : (
              <div className="flex items-center justify-center h-[300px]">
                <p className="text-gray-500">Captura o sube una imagen de la matrícula</p>
              </div>
            )}
          </div>

          <canvas ref={canvasRef} className="hidden" />

          {/* Action Buttons */}
          {!imagenCapturada && (
            <div className="grid grid-cols-2 gap-3">
              {!cameraActive ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={iniciarCamara}
                    className="w-full"
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    Abrir Cámara
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Subir Imagen
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={detenerCamara}
                    className="w-full"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    onClick={capturarFoto}
                    className="w-full bg-[#ED1C24] hover:bg-[#c41820]"
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    Capturar
                  </Button>
                </>
              )}
            </div>
          )}

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* Process Button */}
          {imagenCapturada && (
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={limpiarYCerrar}
                disabled={loading}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={procesarMatricula}
                disabled={loading}
                className="flex-1 bg-[#ED1C24] hover:bg-[#c41820] text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  "Extraer Datos"
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

