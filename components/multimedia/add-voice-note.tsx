"use client"

import { useState, useRef, useEffect } from "react"
import { Loader2, Mic, MicOff, Play, Pause, Trash2, Send, Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuthToken } from "@/hooks/use-auth-token"
import { createVoiceNote } from "@/lib/api/anotaciones"
import type { MediaType } from "@/lib/types"
import { toast } from "sonner"

interface AddVoiceNoteProps {
  mediaType: MediaType
  mediaId: number
  onSuccess?: () => void
}

export function AddVoiceNote({ mediaType, mediaId, onSuccess }: AddVoiceNoteProps) {
  const { getToken } = useAuthToken()
  const [isOpen, setIsOpen] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioURL, setAudioURL] = useState<string>("")
  const [isPlaying, setIsPlaying] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [loading, setLoading] = useState(false)
  const [permissionDenied, setPermissionDenied] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (audioURL) {
        URL.revokeObjectURL(audioURL)
      }
    }
  }, [audioURL])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      })

      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" })
        setAudioBlob(blob)
        const url = URL.createObjectURL(blob)
        setAudioURL(url)

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)
      setPermissionDenied(false)

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } catch (error) {
      console.error("Error al acceder al micrófono:", error)
      setPermissionDenied(true)
      toast.error("Error", {
        description: "No se pudo acceder al micrófono. Por favor verifica los permisos.",
      })
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)

      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }

  const togglePlayback = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  const deleteRecording = () => {
    if (audioURL) {
      URL.revokeObjectURL(audioURL)
    }
    setAudioBlob(null)
    setAudioURL("")
    setIsPlaying(false)
    setRecordingTime(0)
  }

  const handleSubmit = async () => {
    if (!audioBlob) {
      toast.error("Error", {
        description: "No hay grabación de audio",
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

      // Convert webm to a File object with .mp3 extension
      // Note: The actual format is webm, but we name it .mp3 for API compatibility
      const audioFile = new File([audioBlob], `voice-note-${Date.now()}.mp3`, {
        type: "audio/webm",
      })

      await createVoiceNote(
        {
          media_type: mediaType,
          media_id: mediaId,
          tipo_anotacion: "VOICE_NOTE",
          content_file: audioFile,
        },
        token
      )

      toast.success("Nota de voz agregada", {
        description: "La nota de voz se ha guardado correctamente",
      })

      deleteRecording()
      setIsOpen(false)
      onSuccess?.()
    } catch (error: any) {
      console.error("Error al guardar nota de voz:", error)
      toast.error("Error", {
        description: error?.message || "No se pudo guardar la nota de voz",
      })
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)} variant="outline" className="w-full h-auto py-3">
        <Volume2 className="h-4 w-4 mr-2" />
        Agregar Nota de Voz
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
              <Volume2 className="h-5 w-5 text-[#ED1C24]" />
              <span className="font-semibold text-[#202020]">Nueva Nota de Voz</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                deleteRecording()
                setIsOpen(false)
              }}
              disabled={loading || isRecording}
              className="text-gray-600 hover:text-gray-900"
            >
              Cancelar
            </Button>
          </div>

          {permissionDenied && (
            <Alert variant="destructive" className="mb-3">
              <AlertDescription>
                No se pudo acceder al micrófono. Verifica los permisos del navegador.
              </AlertDescription>
            </Alert>
          )}

          {/* Recording Controls */}
          {!audioBlob && (
            <div className="flex flex-col items-center justify-center py-6 space-y-4">
              <div className="relative">
                <Button
                  onClick={isRecording ? stopRecording : startRecording}
                  size="lg"
                  className={`h-16 w-16 rounded-full ${
                    isRecording
                      ? "bg-red-500 hover:bg-red-600 animate-pulse"
                      : "bg-[#ED1C24] hover:bg-[#c41820]"
                  }`}
                  disabled={loading}
                >
                  {isRecording ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                </Button>
                {isRecording && (
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                    <span className="text-sm font-mono text-red-500 font-semibold">{formatTime(recordingTime)}</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-600 text-center">
                {isRecording ? "Grabando... Presiona para detener" : "Presiona para comenzar a grabar"}
              </p>
            </div>
          )}

          {/* Playback Controls */}
          {audioBlob && audioURL && (
            <div className="space-y-3">
              <Alert className="bg-blue-50 border-blue-200">
                <AlertDescription className="text-blue-900 text-sm">
                  <strong>Grabación completada ({formatTime(recordingTime)}).</strong> Escucha antes de enviar para verificar.
                </AlertDescription>
              </Alert>

              <audio
                ref={audioRef}
                src={audioURL}
                onEnded={() => setIsPlaying(false)}
                className="hidden"
              />

              <div className="flex items-center justify-center gap-2">
                <Button onClick={togglePlayback} variant="outline" size="sm">
                  {isPlaying ? (
                    <>
                      <Pause className="h-4 w-4 mr-1" />
                      Pausar
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-1" />
                      Escuchar
                    </>
                  )}
                </Button>

                <Button onClick={deleteRecording} variant="outline" size="sm" disabled={loading}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Eliminar
                </Button>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-[#ED1C24] hover:bg-[#c41820] text-white font-medium"
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
                    Guardar Nota de Voz
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
