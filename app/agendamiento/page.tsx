"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, Clock, CheckCircle2, Car, Lock, ArrowLeft, User, Mail, IdCard, LogOut, ArrowRight, AlertTriangle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { verificarUsuarioPorCedula } from "@/lib/api/agendamiento"
import { loginAction, getCurrentUser, logoutClient, getClientAccessToken } from "@/lib/auth/actions"
import { RegistroRapidoModal } from "@/components/agendamiento/registro-rapido-modal"
import type { Cliente, VerificarUsuarioResponse, User as UserType } from "@/lib/types"
import { toast as sonnerToast } from "sonner"

export default function AgendamientoPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [cedula, setCedula] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [showRegistro, setShowRegistro] = useState(false)
  const [step, setStep] = useState<"cedula" | "password" | "registrando" | "logged-in">("cedula")
  const [usuarioVerificado, setUsuarioVerificado] = useState<VerificarUsuarioResponse["usuario"] | null>(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [loggedInUser, setLoggedInUser] = useState<UserType | null>(null)
  const [tokenExpiryWarning, setTokenExpiryWarning] = useState(false)

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

  const handleRegistroComplete = async (usuarioId: number, email: string) => {
    // Después del registro, crear objeto usuario verificado y avanzar al paso de contraseña
    setUsuarioVerificado({
      id: usuarioId,
      first_name: "",
      last_name: "",
      email: email,
      cedula: cedula,
      phone: "",
    })
    setShowRegistro(false)
    setStep("password")
    sonnerToast.success("Registro exitoso", {
      description: "Revisa tu correo para obtener la contraseña temporal y luego ingrésala aquí.",
    })
  }

  // Check for existing authentication on mount
  useEffect(() => {
    const checkExistingAuth = async () => {
      try {
        const user = await getCurrentUser()
        if (user) {
          setLoggedInUser(user)
          // Also check if we have client data in sessionStorage
          const clienteData = sessionStorage.getItem("agendamiento_cliente")
          if (clienteData) {
            // User is fully authenticated
            setStep("logged-in")
          }

          // Check token expiry time periodically
          const expiryCheckInterval = setInterval(async () => {
            const accessToken = await getClientAccessToken()
            if (!accessToken) {
              // Token expired, show login form
              setLoggedInUser(null)
              setStep("cedula")
              clearInterval(expiryCheckInterval)
              return
            }

            // Decode JWT to check expiry (tokens expire in 15 minutes)
            // Check if less than 5 minutes remaining
            try {
              const tokenParts = accessToken.split('.')
              if (tokenParts.length === 3) {
                const payload = JSON.parse(atob(tokenParts[1]))
                const expiryTime = payload.exp * 1000 // Convert to milliseconds
                const timeRemaining = expiryTime - Date.now()
                const minutesRemaining = Math.floor(timeRemaining / 60000)

                if (minutesRemaining <= 5 && minutesRemaining > 0) {
                  setTokenExpiryWarning(true)
                } else if (minutesRemaining <= 0) {
                  // Token expired
                  setLoggedInUser(null)
                  setStep("cedula")
                  clearInterval(expiryCheckInterval)
                  sonnerToast.error("Tu sesión ha expirado", {
                    description: "Por favor inicia sesión nuevamente"
                  })
                }
              }
            } catch (error) {
              console.error("Error checking token expiry:", error)
            }
          }, 30000) // Check every 30 seconds

          // Cleanup interval on unmount
          return () => clearInterval(expiryCheckInterval)
        }
      } catch (error) {
        console.error("Error checking auth:", error)
      } finally {
        setIsCheckingAuth(false)
      }
    }

    checkExistingAuth()
  }, [])

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
        {isCheckingAuth ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#ED1C24] mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Verificando sesión...</p>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="max-w-md mx-auto"
          >
            <AnimatePresence mode="wait">
              {step === "logged-in" && loggedInUser ? (
                <motion.div
                  key="logged-in-step"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="w-full max-w-md mx-auto"
                >
                  <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-800">
                    {/* Success Icon */}
                    <div className="flex justify-center mb-6">
                      <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                      </div>
                    </div>

                    {/* Heading */}
                    <h2 className="text-2xl font-bold text-center text-[#202020] dark:text-white mb-2">
                      Bienvenido de Nuevo
                    </h2>
                    <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
                      Ya tienes una sesión activa
                    </p>

                    {/* Token Expiry Warning */}
                    {tokenExpiryWarning && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-start gap-2"
                      >
                        <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                            Tu sesión expirará pronto
                          </p>
                          <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                            Te recomendamos continuar con el agendamiento ahora o renovar tu sesión.
                          </p>
                        </div>
                      </motion.div>
                    )}

                    {/* User Info Card */}
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-6 space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <p className="text-sm text-gray-900 dark:text-gray-100">
                          <strong>Nombre:</strong> {loggedInUser.first_name} {loggedInUser.last_name}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <p className="text-sm text-gray-900 dark:text-gray-100">
                          <strong>Email:</strong> {loggedInUser.email}
                        </p>
                      </div>
                      {loggedInUser.cedula && (
                        <div className="flex items-center gap-2">
                          <IdCard className="h-4 w-4 text-gray-500" />
                          <p className="text-sm text-gray-900 dark:text-gray-100">
                            <strong>Cédula:</strong> {loggedInUser.cedula}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                      <Button
                        onClick={() => router.push("/agendamiento/nueva")}
                        className="w-full bg-[#ED1C24] hover:bg-[#c41820] text-white h-12 text-base"
                      >
                        Continuar al Agendamiento
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>

                      <Button
                        variant="outline"
                        onClick={async () => {
                          setLoading(true)
                          try {
                            sessionStorage.clear()
                            await logoutClient()
                            setLoggedInUser(null)
                            setStep("cedula")
                            sonnerToast.success("Sesión cerrada correctamente")
                          } catch (error) {
                            sonnerToast.error("Error al cerrar sesión")
                          } finally {
                            setLoading(false)
                          }
                        }}
                        className="w-full h-12 text-base"
                        disabled={loading}
                      >
                        <LogOut className="mr-2 h-5 w-5" />
                        Cerrar Sesión
                      </Button>
                    </div>

                    {/* Helper Text */}
                    <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
                      Si deseas iniciar sesión con otra cuenta, cierra esta sesión primero
                    </p>
                  </div>
                </motion.div>
              ) : step === "cedula" ? (
                <motion.div
                  key="cedula-step"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="w-full max-w-md mx-auto"
                >
                  <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-800">
                    <h3 className="text-2xl font-bold text-[#202020] dark:text-white mb-6 text-center">
                      Comienza Aquí
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="cedula" className="text-[#202020] dark:text-white font-medium">
                          Número de Cédula
                        </Label>
                        <Input
                          id="cedula"
                          type="text"
                          placeholder="Ej: 1234567890"
                          value={cedula}
                          onChange={(e) => setCedula(e.target.value.replace(/\D/g, ""))}
                          maxLength={13}
                          className="mt-2 border-gray-300 dark:border-gray-700 focus:border-[#ED1C24] focus:ring-[#ED1C24]"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleVerificarCedula()
                            }
                          }}
                          autoFocus
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Ingresa tu número de cédula para continuar
                        </p>
                      </div>

                      <Button
                        onClick={handleVerificarCedula}
                        disabled={loading || cedula.length < 10}
                        className="w-full bg-[#ED1C24] hover:bg-[#c41820] text-white font-semibold py-6 text-lg"
                      >
                        {loading ? "Verificando..." : "Continuar"}
                      </Button>

                      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                          ¿Primera vez? No te preocupes, te ayudaremos a registrarte, ingresa tu cédula.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="password-step"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="w-full max-w-md mx-auto"
                >
                  <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-800">
                    <h3 className="text-2xl font-bold text-[#202020] dark:text-white mb-6 text-center">
                      Ingresa tu Contraseña
                    </h3>

                    <div className="space-y-4">
                      {/* Usuario Info */}
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Ingresando como:</p>
                        <p className="font-semibold text-[#202020] dark:text-white">
                          {usuarioVerificado?.first_name} {usuarioVerificado?.last_name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{usuarioVerificado?.email}</p>
                      </div>

                      <div>
                        <Label htmlFor="password" className="text-[#202020] dark:text-white font-medium">
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
                            className="pl-10 border-gray-300 dark:border-gray-700 focus:border-[#ED1C24] focus:ring-[#ED1C24]"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleLogin()
                              }
                            }}
                            autoFocus
                          />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Ingresa tu contraseña para iniciar sesión
                        </p>
                      </div>

                      <div className="flex gap-3">
                        <Button
                          onClick={handleVolver}
                          variant="outline"
                          disabled={loading}
                          className="flex-1 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
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
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
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
