"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Camera, Upload, CheckCircle, AlertCircle, Trash2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MIN_FOTOS_INSPECCION, MAX_FOTOS_INSPECCION } from "@/lib/inspeccion/constants"
import type { FotoInspeccion } from "@/lib/types"
import { CameraInspeccionDialog } from "./camera-inspeccion-dialog"
import { useAuthToken } from "@/hooks/use-auth-token"
import { toast } from "sonner"

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
  const [mostrarAdvertencia, setMostrarAdvertencia] = useState(false)

  const handleEliminarFoto = (index: number) => {
    setFotos((prev) => prev.filter((_, idx) => idx !== index))
  }

  const handleSubirFotos = async () => {
    if (fotos.length < MIN_FOTOS_INSPECCION) {
      setMostrarAdvertencia(true)
      setTimeout(() => setMostrarAdvertencia(false), 4000)
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
      toast.success("Fotos subidas correctamente", {
        description: `Se han subido ${fotos.length} fotografía${fotos.length > 1 ? 's' : ''} de evidencia`,
      })
      onFotosSubidas()
      onOpenChange(false)

      // Resetear estado
      setFotos([])
      setProgreso(null)
    } catch (error) {
      console.error("Error al subir fotos:", error)
      toast.error("Error al subir las fotos", {
        description: error instanceof Error ? error.message : "Por favor intenta de nuevo",
      })
    } finally {
      setIsSubiendo(false)
      setProgreso(null)
    }
  }

  const puedeSubir = fotos.length >= MIN_FOTOS_INSPECCION && !isSubiendo

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Fotografías de Evidencia</DialogTitle>
            <p className="text-sm text-muted-foreground mt-2">{puntoNombre}</p>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <Alert className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30">
              <Camera className="h-4 w-4 text-red-600 dark:text-red-400" />
              <AlertDescription className="text-red-900 dark:text-red-300">
                Este punto tiene estado crítico (ROJO). Debes agregar entre {MIN_FOTOS_INSPECCION} y {MAX_FOTOS_INSPECCION} fotografías como evidencia.
              </AlertDescription>
            </Alert>

            {mostrarAdvertencia && (
              <Alert className="border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950/30 animate-in fade-in-0 slide-in-from-top-2">
                <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                <AlertDescription className="text-orange-900 dark:text-orange-300">
                  ⚠️ Debes capturar al menos {MIN_FOTOS_INSPECCION} fotografías antes de continuar. Actualmente tienes {fotos.length} de {MAX_FOTOS_INSPECCION} posibles.
                </AlertDescription>
              </Alert>
            )}

            {fotos.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">
                    Fotos capturadas: {fotos.length} de {MAX_FOTOS_INSPECCION}
                  </p>
                  {fotos.length >= MIN_FOTOS_INSPECCION && fotos.length < MAX_FOTOS_INSPECCION && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-900">
                      ✓ Mínimo cumplido
                    </Badge>
                  )}
                  {fotos.length === MAX_FOTOS_INSPECCION && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900">
                      Máximo alcanzado
                    </Badge>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {fotos.map((foto, idx) => (
                    <div key={`foto-preview-${idx}`} className="relative group">
                      <img
                        src={foto.preview}
                        alt={`Foto ${idx + 1}`}
                        className="w-full aspect-video object-cover rounded-lg border-2 border-gray-200 dark:border-gray-700"
                      />
                      <Badge className="absolute bottom-2 left-2 bg-black/70">{idx + 1}</Badge>
                      <button
                        type="button"
                        onClick={() => handleEliminarFoto(idx)}
                        disabled={isSubiendo}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Eliminar foto"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {progreso && (
              <Alert className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30">
                <Upload className="h-4 w-4 text-green-600 dark:text-green-400 animate-pulse" />
                <AlertDescription className="text-green-900 dark:text-green-300">
                  Subiendo fotos: {progreso.actual} de {progreso.total}
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setCameraOpen(true)}
              disabled={isSubiendo || fotos.length >= MAX_FOTOS_INSPECCION}
            >
              <Camera className="mr-2 h-4 w-4" />
              {fotos.length === 0 && "Capturar Fotografías"}
              {fotos.length > 0 && fotos.length < MIN_FOTOS_INSPECCION && `Agregar Fotografías (${fotos.length} de ${MIN_FOTOS_INSPECCION} mínimas)`}
              {fotos.length >= MIN_FOTOS_INSPECCION && fotos.length < MAX_FOTOS_INSPECCION && "Agregar más fotos (opcional)"}
              {fotos.length === MAX_FOTOS_INSPECCION && "Máximo de fotos alcanzado"}
            </Button>

            {fotos.length >= MIN_FOTOS_INSPECCION && fotos.length < MAX_FOTOS_INSPECCION && (
              <p className="text-xs text-muted-foreground dark:text-gray-500 text-center">
                Ya puedes subir las fotos o agregar hasta {MAX_FOTOS_INSPECCION - fotos.length} más
              </p>
            )}
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
                  Subir {fotos.length} Fotografía{fotos.length !== 1 ? 's' : ''}
                  {fotos.length >= MIN_FOTOS_INSPECCION && fotos.length < MAX_FOTOS_INSPECCION && ' (finalizar)'}
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
