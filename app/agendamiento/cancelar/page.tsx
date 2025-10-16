"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion } from "framer-motion"
import { ArrowLeft, Loader2, XCircle, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { cancelacionSchema, type CancelacionFormData } from "@/lib/validations/agendamiento"
import { buscarCita, cancelarCita, sendEmailCancel, sendWhatsAppCancel } from "@/lib/api/agendamiento"
import { clientes } from "@/lib/fixtures/clientes"
import type { Cita } from "@/lib/types"

export default function CancelarCitaPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [citaEncontrada, setCitaEncontrada] = useState<Cita | null>(null)
  const [cancelada, setCancelada] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CancelacionFormData>({
    resolver: zodResolver(cancelacionSchema),
  })

  const onBuscar = async (data: CancelacionFormData) => {
    setLoading(true)
    try {
      const cita = await buscarCita(data.cedula, data.referencia)

      if (!cita) {
        toast({
          title: "Cita no encontrada",
          description: "No se encontró ninguna cita con los datos proporcionados.",
          variant: "destructive",
        })
        return
      }

      if (cita.estado === "cancelada") {
        toast({
          title: "Cita ya cancelada",
          description: "Esta cita ya fue cancelada anteriormente.",
          variant: "destructive",
        })
        return
      }

      setCitaEncontrada(cita)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo buscar la cita. Intenta nuevamente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const onCancelar = async () => {
    if (!citaEncontrada) return

    setLoading(true)
    try {
      await cancelarCita(citaEncontrada.id)

      // Buscar cliente para notificaciones
      const cliente = clientes.find((c) => c.id === citaEncontrada.clienteId)

      if (cliente) {
        await Promise.all([
          sendEmailCancel({ email: cliente.email, cita: citaEncontrada }),
          sendWhatsAppCancel({ telefono: cliente.telefono, cita: citaEncontrada }),
        ])
      }

      toast({
        title: "Cita cancelada",
        description: "Tu cita ha sido cancelada exitosamente.",
      })

      setCancelada(true)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cancelar la cita. Intenta nuevamente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-[#ED1C24] flex items-center justify-center">
                <XCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#202020]">Ambacar</h1>
                <p className="text-xs text-gray-600">Cancelar Cita</p>
              </div>
            </div>
            <Button variant="ghost" onClick={() => router.push("/agendamiento")} className="text-gray-600">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto"
        >
          {!citaEncontrada && !cancelada && (
            <Card className="border-gray-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl text-[#202020]">Cancelar Cita</CardTitle>
                <CardDescription>Ingresa los datos de tu cita para cancelarla</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onBuscar)} className="space-y-6">
                  <Alert className="border-amber-200 bg-amber-50">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-900">
                      Una vez cancelada, deberás agendar una nueva cita si deseas programar un servicio.
                    </AlertDescription>
                  </Alert>

                  <div>
                    <Label htmlFor="cedula" className="text-[#202020]">
                      Número de Cédula <span className="text-[#ED1C24]">*</span>
                    </Label>
                    <Input
                      id="cedula"
                      {...register("cedula")}
                      placeholder="1234567890"
                      className="mt-2 border-gray-300"
                    />
                    {errors.cedula && <p className="text-sm text-[#ED1C24] mt-1">{errors.cedula.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="referencia" className="text-[#202020]">
                      Número de Referencia <span className="text-[#ED1C24]">*</span>
                    </Label>
                    <Input
                      id="referencia"
                      {...register("referencia")}
                      placeholder="CITA-123456789"
                      className="mt-2 border-gray-300"
                    />
                    {errors.referencia && <p className="text-sm text-[#ED1C24] mt-1">{errors.referencia.message}</p>}
                    <p className="text-xs text-gray-500 mt-1">
                      Puedes encontrar este número en el email de confirmación
                    </p>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#ED1C24] hover:bg-[#c41820] text-white py-6"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Buscando...
                      </>
                    ) : (
                      "Buscar Cita"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {citaEncontrada && !cancelada && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
              <Card className="border-gray-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl text-[#202020]">Detalles de la Cita</CardTitle>
                  <CardDescription>Verifica que esta sea la cita que deseas cancelar</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                    <div>
                      <p className="text-sm text-gray-600">Referencia</p>
                      <p className="font-mono font-bold text-[#202020]">{citaEncontrada.id}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Fecha</p>
                        <p className="font-semibold text-[#202020]">{citaEncontrada.fecha}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Hora</p>
                        <p className="font-semibold text-[#202020]">{citaEncontrada.hora}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Vehículo</p>
                      <p className="font-semibold text-[#202020]">{citaEncontrada.vehiculoPlaca}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Servicio</p>
                      <p className="font-semibold text-[#202020]">{citaEncontrada.servicio}</p>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <Button
                      variant="outline"
                      onClick={() => setCitaEncontrada(null)}
                      disabled={loading}
                      className="flex-1"
                    >
                      Volver
                    </Button>
                    <Button
                      onClick={onCancelar}
                      disabled={loading}
                      className="flex-1 bg-[#ED1C24] hover:bg-[#c41820] text-white"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Cancelando...
                        </>
                      ) : (
                        <>
                          <XCircle className="mr-2 h-4 w-4" />
                          Confirmar Cancelación
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {cancelada && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <Card className="border-gray-200 shadow-lg">
                <CardContent className="pt-8 pb-8">
                  <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                    <XCircle className="h-8 w-8 text-green-600" />
                  </div>

                  <h2 className="text-3xl font-bold text-[#202020] mb-4">Cita Cancelada</h2>
                  <p className="text-gray-600 mb-8">
                    Tu cita ha sido cancelada exitosamente. Recibirás una confirmación por email y WhatsApp.
                  </p>

                  <Button
                    onClick={() => router.push("/agendamiento")}
                    className="bg-[#ED1C24] hover:bg-[#c41820] text-white px-8"
                  >
                    Volver al Inicio
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
