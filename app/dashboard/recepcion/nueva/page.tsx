"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { NuevaRecepcionForm } from "@/components/recepcion/nueva-recepcion-form"
import { CameraDialog } from "@/components/recepcion/camera-dialog"
import { RecepcionCompletada } from "@/components/recepcion/recepcion-completada"
import { completarRecepcion, subirFoto, RecepcionCompletadaResponse } from "@/lib/recepcion/api"
import { useToast } from "@/hooks/use-toast"

interface FotoCapturada {
  tipo: string
  archivo: File
  preview: string
  orden: number
}

export default function NuevaRecepcionPage() {
  const { toast } = useToast()

  const [step, setStep] = useState(0)
  const [recepcion, setRecepcion] = useState<any>(null)
  const [fotosCapturadas, setFotosCapturadas] = useState<FotoCapturada[]>([])
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false)
  const [recepcionCompletada, setRecepcionCompletada] = useState<RecepcionCompletadaResponse | null>(null)
  const [showCamera, setShowCamera] = useState(false)

  const handleRecepcionInitiated = (recepcionData: any) => {
    setRecepcion(recepcionData)
    setStep(1)
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
        title: "¡Fotos subidas!",
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
        title: "¡Recepción completada!",
        description: response.mensaje || "La Orden de Trabajo ha sido generada automáticamente.",
      })
      setStep(2)
    } catch (error: any) {
      toast({
        title: "Error al completar recepción",
        description:
          error.message || "Hubo un problema al completar la recepción. Verifica que todas las fotos estén subidas.",
        variant: "destructive",
      })
    } finally {
      setIsUploadingPhotos(false)
    }
  }

  const stepLabels = ["Datos del Cliente", "Fotos del Vehículo", "Completada"]

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
          <h1 className="text-3xl font-bold tracking-tight">Nueva Recepción</h1>
          <p className="text-muted-foreground mt-1">
            {step === 0 && "Registra los datos del cliente y vehículo"}
            {step === 1 && "Captura las fotos del vehículo"}
            {step === 2 && "Recepción completada"}
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-center">
        {stepLabels.map((label, idx) => (
          <motion.div
            key={idx}
            className="flex items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
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
              <div className={`w-12 md:w-20 lg:w-24 h-1 mx-2 transition-colors ${idx < step ? "bg-[#ED1C24]" : "bg-muted"}`} />
            )}
          </motion.div>
        ))}
      </div>

      {/* Content */}
      <motion.div key={step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
        {step === 0 && (
          <Card>
            <CardContent className="p-4 md:p-6">
              <NuevaRecepcionForm onRecepcionInitiated={handleRecepcionInitiated} />
            </CardContent>
          </Card>
        )}

        {step === 1 && recepcion && (
          <Card>
            <CardContent className="pt-6 space-y-6">
              <div className="text-center space-y-4">
                <h2 className="text-xl font-semibold">Captura de Fotografías</h2>
                <p className="text-muted-foreground">
                  Número de recepción:{" "}
                  <span className="font-semibold text-[#ED1C24]">{recepcion.numero_recepcion}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Por favor, captura las fotografías requeridas del vehículo para completar la recepción.
                </p>
              </div>

              {fotosCapturadas.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-3">Fotos capturadas: {fotosCapturadas.length}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {fotosCapturadas.map((foto, idx) => (
                      <div key={`foto-${idx}`} className="relative">
                        <img
                          src={foto.preview}
                          alt={`Foto ${idx + 1}`}
                          className="w-full aspect-video object-cover rounded-lg border-2 border-gray-200"
                        />
                        <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                          {foto.tipo}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3">
                <Button onClick={() => setShowCamera(true)} disabled={isUploadingPhotos} className="w-full">
                  {fotosCapturadas.length === 0 ? "Capturar Fotografías" : "Modificar Fotografías"}
                </Button>

                {fotosCapturadas.length > 0 && (
                  <Button
                    onClick={handleCompletarRecepcion}
                    disabled={isUploadingPhotos}
                    className="w-full bg-[#ED1C24] hover:bg-[#c41820]"
                  >
                    {isUploadingPhotos ? "Completando..." : "Completar Recepción"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && recepcionCompletada && (
          <RecepcionCompletada data={recepcionCompletada} />
        )}
      </motion.div>

      {/* Camera Dialog */}
      {showCamera && recepcion && (
        <CameraDialog
          open={showCamera}
          onOpenChange={setShowCamera}
          onFotosCapturadas={handleFotosCapturadas}
        />
      )}
    </div>
  )
}

