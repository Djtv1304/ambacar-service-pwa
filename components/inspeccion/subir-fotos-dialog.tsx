"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Camera, Upload, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MIN_FOTOS_INSPECCION } from "@/lib/inspeccion/constants"
import type { FotoInspeccion } from "@/lib/types"
import { CameraInspeccionDialog } from "./camera-inspeccion-dialog"
import { useAuthToken } from "@/hooks/use-auth-token"

interface SubirFotosDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  itemInspeccionId: number
  puntoNombre: string
  onFotosSubidas: () => void
}

export function SubirFotosDialog({
  open,
  onOpenChange,
  itemInspeccionId,
  puntoNombre,
  onFotosSubidas,
}: SubirFotosDialogProps) {
  const { getToken } = useAuthToken()
  const [fotos, setFotos] = useState<FotoInspeccion[]>([])
  const [cameraOpen, setCameraOpen] = useState(false)
  const [isSubiendo, setIsSubiendo] = useState(false)
  const [progreso, setProgreso] = useState<{ actual: number; total: number } | null>(null)

  const handleSubirFotos = async () => {
    if (fotos.length < MIN_FOTOS_INSPECCION) {
      alert(`Debes capturar al menos ${MIN_FOTOS_INSPECCION} fotos`)
      return
    }

    setIsSubiendo(true)
    setProgreso({ actual: 0, total: fotos.length })

    try {
      // Obtener el token de autenticación
      const token = await getToken()
      if (!token) {
        throw new Error("No se encontró token de autenticación")
      }

      // Subir cada foto individualmente
      for (let i = 0; i < fotos.length; i++) {
        const foto = fotos[i]

        if (!foto.archivo) {
          console.warn(`Foto ${i + 1} no tiene archivo, se omite`)
          continue
        }

        const formData = new FormData()
        formData.append("item_inspeccion", itemInspeccionId.toString())
        formData.append("imagen", foto.archivo)
        formData.append("descripcion", `Evidencia ${i + 1}`)

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/fotos-inspeccion/`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.detail || `Error al subir foto ${i + 1}`)
        }

        setProgreso({ actual: i + 1, total: fotos.length })
      }

      // Notificar éxito y cerrar
      alert(`${fotos.length} fotos subidas correctamente`)
      onFotosSubidas()
      onOpenChange(false)

      // Resetear estado
      setFotos([])
      setProgreso(null)
    } catch (error) {
      console.error("Error al subir fotos:", error)
      alert(error instanceof Error ? error.message : "Error al subir las fotos. Por favor intenta de nuevo.")
    } finally {
      setIsSubiendo(false)
      setProgreso(null)
    }
  }

  const puedeSubir = fotos.length >= MIN_FOTOS_INSPECCION && !isSubiendo

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Fotografías de Evidencia</DialogTitle>
            <p className="text-sm text-muted-foreground mt-2">{puntoNombre}</p>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Alert className="border-red-200 bg-red-50">
              <Camera className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-900">
                Este punto tiene estado crítico (ROJO). Debes agregar al menos {MIN_FOTOS_INSPECCION} fotografías como
                evidencia.
              </AlertDescription>
            </Alert>

            {fotos.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">
                  Fotos capturadas: {fotos.length}/{MIN_FOTOS_INSPECCION}
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {fotos.map((foto, idx) => (
                    <div key={`foto-preview-${idx}`} className="relative">
                      <img
                        src={foto.preview}
                        alt={`Foto ${idx + 1}`}
                        className="w-full aspect-video object-cover rounded-lg border-2 border-gray-200"
                      />
                      <Badge className="absolute bottom-2 left-2 bg-black/70">{idx + 1}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {progreso && (
              <Alert className="border-green-200 bg-green-50">
                <Upload className="h-4 w-4 text-green-600 animate-pulse" />
                <AlertDescription className="text-green-900">
                  Subiendo fotos: {progreso.actual} de {progreso.total}
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setCameraOpen(true)}
              disabled={isSubiendo}
            >
              <Camera className="mr-2 h-4 w-4" />
              {fotos.length === 0 ? "Capturar Fotografías" : "Modificar Fotografías"}
            </Button>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubiendo}>
              Cancelar
            </Button>
            <Button onClick={handleSubirFotos} disabled={!puedeSubir} className="bg-[#ED1C24] hover:bg-[#c41820]">
              {isSubiendo ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Subiendo...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Subir {fotos.length} Foto(s)
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CameraInspeccionDialog
        open={cameraOpen}
        onOpenChange={setCameraOpen}
        onFotosCapturadas={setFotos}
        puntoNombre={puntoNombre}
        fotosExistentes={fotos}
      />
    </>
  )
}
