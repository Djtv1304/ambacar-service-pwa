"use client"

import { useState } from "react"
import { Loader2, MessageSquarePlus, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { useAuthToken } from "@/hooks/use-auth-token"
import { createTextNote } from "@/lib/api/anotaciones"
import type { MediaType } from "@/lib/types"
import { toast } from "sonner"

interface AddTextNoteProps {
  mediaType: MediaType
  mediaId: number
  onSuccess?: () => void
}

export function AddTextNote({ mediaType, mediaId, onSuccess }: AddTextNoteProps) {
  const { getToken } = useAuthToken()
  const [isOpen, setIsOpen] = useState(false)
  const [noteText, setNoteText] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!noteText.trim()) {
      toast.error("Error", {
        description: "Por favor ingresa una nota",
      })
      return
    }

    setLoading(true)
    try {
      const token = await getToken()
      if (!token) {
        toast.error("Error de autenticación")
        return
      }

      await createTextNote(
        {
          media_type: mediaType,
          media_id: mediaId,
          tipo_anotacion: "TEXT_NOTE",
          content_text: noteText.trim(),
        },
        token
      )

      toast.success("Nota agregada", {
        description: "La nota se ha guardado correctamente",
      })

      setNoteText("")
      setIsOpen(false)
      onSuccess?.()
    } catch (error: any) {
      console.error("Error al guardar nota:", error)
      toast.error("Error", {
        description: error?.message || "No se pudo guardar la nota",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)} variant="outline" className="w-full h-auto py-3">
        <MessageSquarePlus className="h-4 w-4 mr-2" />
        Agregar Nota de Texto
      </Button>
    )
  }

  return (
    <Card className="border-2">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b">
            <div className="flex items-center gap-2">
              <MessageSquarePlus className="h-5 w-5 text-[#ED1C24]" />
              <span className="font-semibold text-[#202020]">Nueva Nota</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsOpen(false)
                setNoteText("")
              }}
              disabled={loading}
              className="text-gray-600 hover:text-gray-900"
            >
              Cancelar
            </Button>
          </div>

          {/* Textarea */}
          <Textarea
            placeholder="Escribe tu observación aquí..."
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            rows={4}
            className="resize-none border-gray-300 focus:border-[#ED1C24] focus:ring-[#ED1C24]"
            disabled={loading}
          />

          {/* Footer */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-gray-500">
              {noteText.length} {noteText.length === 1 ? "carácter" : "caracteres"}
            </span>
            <Button
              onClick={handleSubmit}
              disabled={loading || !noteText.trim()}
              className="bg-[#ED1C24] hover:bg-[#c41820] text-white font-medium"
              size="sm"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Guardar Nota
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
