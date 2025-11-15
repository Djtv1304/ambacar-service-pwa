"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, Clock, CheckCircle2, Car, Lock, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { verificarUsuarioPorCedula } from "@/lib/api/agendamiento"
import { loginAction } from "@/lib/auth/actions"
import { RegistroRapidoModal } from "@/components/agendamiento/registro-rapido-modal"
import type { Cliente, VerificarUsuarioResponse } from "@/lib/types"
import { toast as sonnerToast } from "sonner"

export default function AgendamientoPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [cedula, setCedula] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [showRegistro, setShowRegistro] = useState(false)
  const [step, setStep] = useState<"cedula" | "password">("cedula")
  const [usuarioVerificado, setUsuarioVerificado] = useState<VerificarUsuarioResponse["usuario"] | null>(null)

  const handleVerificarCedula = async () => {
    if (!cedula || cedula.length < 10) {
      toast({
        title: "Cédula inválida",
        description: "Por favor ingresa una cédula válida",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      // Paso 1: Verificar si el usuario existe
      const response = await verificarUsuarioPorCedula(cedula)

      if (response.existe && response.usuario) {
        // Usuario existe, guardar datos y mostrar paso de contraseña
        setUsuarioVerificado(response.usuario)
        setStep("password")
        sonnerToast.success("Usuario encontrado", {
          description: `Hola ${response.usuario.first_name}, ingresa tu contraseña para continuar.`,
        })
      } else {
        // Cliente no existe, mostrar modal de registro
        setShowRegistro(true)
      }
    } catch (error) {
      console.error("Error verificando usuario:", error)
      toast({
        title: "Error",
        description: "No se pudo verificar la cédula. Intenta nuevamente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async () => {
    if (!password || !usuarioVerificado) {
      toast({
        title: "Contraseña requerida",
        description: "Por favor ingresa tu contraseña",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      // Crear FormData para loginAction
      const formData = new FormData()
      formData.append("email", usuarioVerificado.email)
      formData.append("password", password)
      formData.append("rememberMe", "true")

      const loginResult = await loginAction(formData)

      if (!loginResult.success) {
        toast({
          title: "Error de autenticación",
          description: loginResult.error || "Contraseña incorrecta. Por favor intenta nuevamente.",
          variant: "destructive",
        })
        return
      }

      // Convertir el formato de la API al formato Cliente usado en el frontend
      const now = new Date()
      const cliente = {
        id: usuarioVerificado.id.toString(),
        cedula: usuarioVerificado.cedula,
        nombre: usuarioVerificado.first_name,
        apellido: usuarioVerificado.last_name,
        email: usuarioVerificado.email,
        telefono: usuarioVerificado.phone,
        direccion: "",
        ciudad: "",
        vehiculos: [],
        createdAt: now,
        updatedAt: now,
      }

      // Guardar cliente en sessionStorage
      sessionStorage.setItem("agendamiento_cliente", JSON.stringify(cliente))

      sonnerToast.success("Bienvenido", {
        description: `Hola ${cliente.nombre}, vamos a agendar tu cita.`,
      })

      router.push("/agendamiento/nueva")
    } catch (loginError) {
      console.error("Error en login:", loginError)
      toast({
        title: "Error de autenticación",
        description: "No se pudo iniciar sesión. Por favor intenta nuevamente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleVolver = () => {
    setStep("cedula")
    setPassword("")
    setUsuarioVerificado(null)
  }

  const handleRegistroComplete = async (cliente: Cliente) => {
    sessionStorage.setItem("agendamiento_cliente", JSON.stringify(cliente))
    setShowRegistro(false)
    router.push("/agendamiento/nueva")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-[#ED1C24] flex items-center justify-center">
                <Car className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#202020]">Ambacar</h1>
                <p className="text-xs text-gray-600">Servicio Automotriz</p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={() => router.push("/agendamiento/cancelar")}
              className="text-gray-600 hover:text-[#ED1C24]"
            >
              Cancelar Cita
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-[#202020] mb-4">Agenda tu Cita de Servicio</h2>
          <p className="text-lg text-gray-600 mb-8">
            Rápido, fácil y sin complicaciones. Elige el mejor horario para ti.
          </p>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16"
        >
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="h-12 w-12 rounded-lg bg-[#ED1C24]/10 flex items-center justify-center mb-4">
              <Calendar className="h-6 w-6 text-[#ED1C24]" />
            </div>
            <h3 className="font-semibold text-[#202020] mb-2">Elige tu Fecha</h3>
            <p className="text-sm text-gray-600">Selecciona el día y hora que mejor se ajuste a tu agenda</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="h-12 w-12 rounded-lg bg-[#ED1C24]/10 flex items-center justify-center mb-4">
              <Clock className="h-6 w-6 text-[#ED1C24]" />
            </div>
            <h3 className="font-semibold text-[#202020] mb-2">Confirmación Inmediata</h3>
            <p className="text-sm text-gray-600">Recibe tu confirmación al instante por email y WhatsApp</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="h-12 w-12 rounded-lg bg-[#ED1C24]/10 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-6 w-6 text-[#ED1C24]" />
            </div>
            <h3 className="font-semibold text-[#202020] mb-2">Servicio Garantizado</h3>
            <p className="text-sm text-gray-600">Técnicos certificados y repuestos originales</p>
          </div>
        </motion.div>

        {/* Main Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="max-w-md mx-auto"
        >
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <h3 className="text-2xl font-bold text-[#202020] mb-6 text-center">
              {step === "cedula" ? "Comienza Aquí" : "Ingresa tu Contraseña"}
            </h3>

            <AnimatePresence mode="wait">
              {step === "cedula" ? (
                <motion.div
                  key="cedula-step"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div>
                    <Label htmlFor="cedula" className="text-[#202020] font-medium">
                      Número de Cédula
                    </Label>
                    <Input
                      id="cedula"
                      type="text"
                      placeholder="Ej: 1234567890"
                      value={cedula}
                      onChange={(e) => setCedula(e.target.value.replace(/\D/g, ""))}
                      maxLength={13}
                      className="mt-2 border-gray-300 focus:border-[#ED1C24] focus:ring-[#ED1C24]"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleVerificarCedula()
                        }
                      }}
                      autoFocus
                    />
                    <p className="text-xs text-gray-500 mt-1">Ingresa tu número de cédula para continuar</p>
                  </div>

                  <Button
                    onClick={handleVerificarCedula}
                    disabled={loading || cedula.length < 10}
                    className="w-full bg-[#ED1C24] hover:bg-[#c41820] text-white font-semibold py-6 text-lg"
                  >
                    {loading ? "Verificando..." : "Continuar"}
                  </Button>

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-600 text-center">
                      ¿Primera vez? No te preocupes, te ayudaremos a registrarte.
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="password-step"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  {/* Usuario Info */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <p className="text-sm text-gray-600">Ingresando como:</p>
                    <p className="font-semibold text-[#202020]">
                      {usuarioVerificado?.first_name} {usuarioVerificado?.last_name}
                    </p>
                    <p className="text-sm text-gray-600">{usuarioVerificado?.email}</p>
                  </div>

                  <div>
                    <Label htmlFor="password" className="text-[#202020] font-medium">
                      Contraseña
                    </Label>
                    <div className="relative mt-2">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="Ingresa tu contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 border-gray-300 focus:border-[#ED1C24] focus:ring-[#ED1C24]"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleLogin()
                          }
                        }}
                        autoFocus
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Ingresa tu contraseña para iniciar sesión</p>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={handleVolver}
                      variant="outline"
                      disabled={loading}
                      className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Volver
                    </Button>
                    <Button
                      onClick={handleLogin}
                      disabled={loading || !password}
                      className="flex-1 bg-[#ED1C24] hover:bg-[#c41820] text-white font-semibold"
                    >
                      {loading ? "Iniciando..." : "Iniciar Sesión"}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Registration Modal */}
      <RegistroRapidoModal
        open={showRegistro}
        onClose={() => setShowRegistro(false)}
        cedula={cedula}
        onComplete={handleRegistroComplete}
      />
    </div>
  )
}
