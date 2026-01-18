"use client"

import { useState, useTransition, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Lock, Mail, UserIcon, Phone, Loader2, AlertCircle, Eye, EyeOff, ArrowRight, Shield, Car, Wrench } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { registerAction, getClientAccessToken } from "@/lib/auth/actions"
import { useAuth } from "@/components/auth/auth-provider"
import { registerSchema, type RegisterFormData } from "@/lib/validations/auth"
import { dispatchNotificationEvent, buildRegistrationContext } from "@/lib/api/notifications"
import { syncCustomer } from "@/lib/api/sync"

const VIDEO_PATH = "/media/video/ambacar-video-2k.webm"
const FALLBACK_IMAGE = "/media/image/portada-ambacar-video-h6.webp"

export default function RegistroPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { refreshUser } = useAuth()
  const [isPending, startTransition] = useTransition()
  const [serverError, setServerError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Forzar reproducción del video en hard reload
  useEffect(() => {
    const video = videoRef.current
    if (video) {
      video.play().then(() => {
        setVideoLoaded(true)
      }).catch((error) => {
        console.warn("Autoplay prevented:", error)
      })
    }
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
      password_confirm: "",
      first_name: "",
      last_name: "",
      phone: "",
    },
  })

  const goToNextStep = async () => {
    const fieldsToValidate: (keyof RegisterFormData)[] = currentStep === 1
      ? ["first_name", "last_name", "email", "phone"]
      : ["username", "password", "password_confirm"]

    const isValid = await trigger(fieldsToValidate)
    if (isValid) {
      setCurrentStep(2)
    }
  }

  const goToPrevStep = () => {
    setCurrentStep(1)
  }

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null)
    setFieldErrors({})

    startTransition(async () => {
      const formData = new FormData()
      formData.append("email", data.email)
      formData.append("username", data.username)
      formData.append("password", data.password)
      formData.append("password_confirm", data.password_confirm)
      formData.append("first_name", data.first_name)
      formData.append("last_name", data.last_name)
      formData.append("phone", data.phone.replace(/\s+/g, ""))

      const result = await registerAction(formData)

      if (result.success) {
        await refreshUser()

        try {
          if (result.user) {
            const clienteParaSync = {
              id: result.user.id,
              email: result.user.email,
              first_name: result.user.first_name,
              last_name: result.user.last_name,
              phone: data.phone.replace(/\s+/g, ""),
            }

            const syncResult = await syncCustomer(clienteParaSync, result.user.id.toString())

            if (!syncResult.success) {
              console.warn("Error sincronizando cliente:", syncResult.error)
            }
          }
        } catch (syncError) {
          console.error("Error en sincronización:", syncError)
        }

        try {
          const authToken = await getClientAccessToken()

          if (authToken && result.user) {
            const customerName = `${result.user.first_name} ${result.user.last_name}`

            await dispatchNotificationEvent(
              {
                event_type: "custom",
                service_type_id: null,
                phase_id: null,
                customer_id: result.user.id.toString(),
                target: "clients",
                context: buildRegistrationContext({ customerName }),
              },
              authToken,
            )
          }
        } catch (notifError) {
          console.error("Error enviando notificación de registro:", notifError)
        }

        toast({
          title: "¡Registro exitoso!",
          description: `Bienvenido ${result.user?.first_name || ""} ${result.user?.last_name || ""}`,
        })

        router.push("/dashboard")
      } else {
        if (result.errors) {
          setFieldErrors(result.errors)
        }
        setServerError(result.error || "Error al crear la cuenta")
      }
    })
  }

  const watchedFields = watch()

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Fallback Image */}
        <Image
          src={FALLBACK_IMAGE}
          alt="Ambacar Background"
          fill
          className={`object-cover transition-opacity duration-1000 ${videoLoaded ? "opacity-0" : "opacity-100"}`}
        />

        {/* Video - usando el mismo patrón de Astro + scale para ocultar letterbox */}
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          onCanPlay={() => setVideoLoaded(true)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 scale-[1.5] ${videoLoaded ? "opacity-100" : "opacity-0"}`}
        >
          <source src={VIDEO_PATH} type="video/webm" />
          <source src="/media/video/ambacar-video-1080p.mp4" type="video/mp4" />
        </video>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex">
        {/* Left Side - Branding (Hidden on mobile) */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 text-white"
        >
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#ED1C24] shadow-lg shadow-red-500/30">
              <span className="text-2xl font-bold text-white">A</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Ambacar</h1>
              <p className="text-sm text-white/70">Sistema de Gestión de Taller</p>
            </div>
          </div>

          {/* Hero Text */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <h2 className="text-5xl font-bold leading-tight">
                Únete a la<br />
                <span className="text-[#ED1C24]">experiencia</span><br />
                Ambacar
              </h2>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-lg text-white/80 max-w-md"
            >
              Crea tu cuenta y accede a todas las herramientas para gestionar
              tu vehículo de manera inteligente
            </motion.p>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="space-y-4 pt-4"
            >
              <div className="flex items-center gap-3 text-white/80">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm">
                  <Car className="h-5 w-5" />
                </div>
                <span>Seguimiento de tu vehículo en tiempo real</span>
              </div>
              <div className="flex items-center gap-3 text-white/80">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm">
                  <Wrench className="h-5 w-5" />
                </div>
                <span>Historial completo de servicios</span>
              </div>
              <div className="flex items-center gap-3 text-white/80">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm">
                  <Shield className="h-5 w-5" />
                </div>
                <span>Notificaciones personalizadas</span>
              </div>
            </motion.div>
          </div>

          {/* Bottom Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="flex items-center gap-2 text-white/60"
          >
            <Shield className="h-5 w-5" />
            <span className="text-sm">Tus datos están protegidos con nosotros</span>
          </motion.div>
        </motion.div>

        {/* Right Side - Registration Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 lg:p-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full max-w-md"
          >
            {/* Mobile Logo */}
            <div className="lg:hidden mb-6 text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="flex justify-center mb-3"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#ED1C24] shadow-lg shadow-red-500/30">
                  <span className="text-2xl font-bold text-white">A</span>
                </div>
              </motion.div>
              <h1 className="text-xl font-bold text-white">Ambacar</h1>
              <p className="text-xs text-white/70">Sistema de Gestión de Taller</p>
            </div>

            {/* Form Card */}
            <div className="backdrop-blur-xl bg-white/95 rounded-3xl shadow-2xl p-6 sm:p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Crear Cuenta</h2>
                <p className="text-gray-600 mt-1 text-sm">Completa el formulario para registrarte</p>
              </div>

              {/* Step Indicator */}
              <div className="flex items-center justify-center gap-2 mb-6">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold transition-colors ${currentStep === 1 ? "bg-[#ED1C24] text-white" : "bg-gray-200 text-gray-600"}`}>
                  1
                </div>
                <div className={`w-12 h-1 rounded-full transition-colors ${currentStep === 2 ? "bg-[#ED1C24]" : "bg-gray-200"}`} />
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold transition-colors ${currentStep === 2 ? "bg-[#ED1C24] text-white" : "bg-gray-200 text-gray-600"}`}>
                  2
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <AnimatePresence>
                  {serverError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <Alert variant="destructive" className="bg-red-50 border-red-200">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{serverError}</AlertDescription>
                      </Alert>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Step 1: Personal Info */}
                <AnimatePresence mode="wait">
                  {currentStep === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label htmlFor="first_name" className="text-gray-700 font-medium text-sm">
                            Nombre
                          </Label>
                          <div className="relative">
                            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              id="first_name"
                              placeholder="Juan"
                              className="pl-10 h-11 bg-gray-50 border-gray-200 rounded-xl focus:bg-white focus:border-[#ED1C24] focus:ring-[#ED1C24] text-sm"
                              {...register("first_name")}
                              disabled={isPending}
                            />
                          </div>
                          {errors.first_name && (
                            <p className="text-xs text-red-600">{errors.first_name.message}</p>
                          )}
                          {fieldErrors.first_name && (
                            <p className="text-xs text-red-600">{fieldErrors.first_name[0]}</p>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="last_name" className="text-gray-700 font-medium text-sm">
                            Apellido
                          </Label>
                          <Input
                            id="last_name"
                            placeholder="Pérez"
                            className="h-11 bg-gray-50 border-gray-200 rounded-xl focus:bg-white focus:border-[#ED1C24] focus:ring-[#ED1C24] text-sm"
                            {...register("last_name")}
                            disabled={isPending}
                          />
                          {errors.last_name && (
                            <p className="text-xs text-red-600">{errors.last_name.message}</p>
                          )}
                          {fieldErrors.last_name && (
                            <p className="text-xs text-red-600">{fieldErrors.last_name[0]}</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="email" className="text-gray-700 font-medium text-sm">
                          Correo Electrónico
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="tu@email.com"
                            className="pl-10 h-11 bg-gray-50 border-gray-200 rounded-xl focus:bg-white focus:border-[#ED1C24] focus:ring-[#ED1C24] text-sm"
                            {...register("email")}
                            disabled={isPending}
                          />
                        </div>
                        {errors.email && (
                          <p className="text-xs text-red-600">{errors.email.message}</p>
                        )}
                        {fieldErrors.email && (
                          <p className="text-xs text-red-600">{fieldErrors.email[0]}</p>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="phone" className="text-gray-700 font-medium text-sm">
                          Teléfono
                        </Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="+593 099 123 4567"
                            className="pl-10 h-11 bg-gray-50 border-gray-200 rounded-xl focus:bg-white focus:border-[#ED1C24] focus:ring-[#ED1C24] text-sm"
                            {...register("phone")}
                            disabled={isPending}
                            onFocus={(e) => {
                              if (!e.target.value || e.target.value === "") {
                                e.target.value = "+593 0"
                                setTimeout(() => {
                                  e.target.setSelectionRange(e.target.value.length, e.target.value.length)
                                }, 0)
                              }
                            }}
                            onChange={(e) => {
                              let value = e.target.value
                              const prefix = "+593 0"

                              if (!value.startsWith(prefix)) {
                                value = prefix
                              }

                              let numberPart = value.slice(prefix.length)
                              numberPart = numberPart.replace(/\D/g, "")
                              numberPart = numberPart.slice(0, 9)

                              let formattedNumber = ""
                              if (numberPart.length > 0) {
                                formattedNumber = numberPart.slice(0, 2)
                              }
                              if (numberPart.length > 2) {
                                formattedNumber += " " + numberPart.slice(2, 5)
                              }
                              if (numberPart.length > 5) {
                                formattedNumber += " " + numberPart.slice(5, 9)
                              }

                              e.target.value = prefix + formattedNumber
                            }}
                            onKeyDown={(e) => {
                              const input = e.currentTarget
                              const cursorPosition = input.selectionStart || 0
                              const prefix = "+593 0"

                              if (
                                (e.key === "Backspace" || e.key === "Delete") &&
                                cursorPosition <= prefix.length
                              ) {
                                e.preventDefault()
                              }

                              const allowedKeys = ["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"]
                              if (!allowedKeys.includes(e.key) && !/^\d$/.test(e.key)) {
                                e.preventDefault()
                              }
                            }}
                          />
                        </div>
                        {errors.phone && (
                          <p className="text-xs text-red-600">{errors.phone.message}</p>
                        )}
                      </div>

                      <Button
                        type="button"
                        onClick={goToNextStep}
                        className="w-full h-11 bg-[#ED1C24] hover:bg-[#c41820] text-white rounded-xl font-semibold shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-all duration-300"
                      >
                        Continuar
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </motion.div>
                  )}

                  {/* Step 2: Account Info */}
                  {currentStep === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      <div className="space-y-1.5">
                        <Label htmlFor="username" className="text-gray-700 font-medium text-sm">
                          Nombre de Usuario
                        </Label>
                        <div className="relative">
                          <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            id="username"
                            placeholder="juanperez"
                            className="pl-10 h-11 bg-gray-50 border-gray-200 rounded-xl focus:bg-white focus:border-[#ED1C24] focus:ring-[#ED1C24] text-sm"
                            {...register("username")}
                            disabled={isPending}
                          />
                        </div>
                        {errors.username && (
                          <p className="text-xs text-red-600">{errors.username.message}</p>
                        )}
                        {fieldErrors.username && (
                          <p className="text-xs text-red-600">{fieldErrors.username[0]}</p>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="password" className="text-gray-700 font-medium text-sm">
                          Contraseña
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="pl-10 pr-10 h-11 bg-gray-50 border-gray-200 rounded-xl focus:bg-white focus:border-[#ED1C24] focus:ring-[#ED1C24] text-sm"
                            {...register("password")}
                            disabled={isPending}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                            disabled={isPending}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        {errors.password && (
                          <p className="text-xs text-red-600">{errors.password.message}</p>
                        )}
                        {fieldErrors.password && (
                          <p className="text-xs text-red-600">{fieldErrors.password[0]}</p>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="password_confirm" className="text-gray-700 font-medium text-sm">
                          Confirmar Contraseña
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            id="password_confirm"
                            type={showPasswordConfirm ? "text" : "password"}
                            placeholder="••••••••"
                            className="pl-10 pr-10 h-11 bg-gray-50 border-gray-200 rounded-xl focus:bg-white focus:border-[#ED1C24] focus:ring-[#ED1C24] text-sm"
                            {...register("password_confirm")}
                            disabled={isPending}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                            disabled={isPending}
                          >
                            {showPasswordConfirm ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        {errors.password_confirm && (
                          <p className="text-xs text-red-600">{errors.password_confirm.message}</p>
                        )}
                      </div>

                      <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                        <p className="text-xs text-gray-600">
                          La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas y números.
                        </p>
                      </div>

                      <div className="flex gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={goToPrevStep}
                          className="flex-1 h-11 rounded-xl font-semibold"
                          disabled={isPending}
                        >
                          Atrás
                        </Button>
                        <Button
                          type="submit"
                          className="flex-1 h-11 bg-[#ED1C24] hover:bg-[#c41820] text-white rounded-xl font-semibold shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-all duration-300"
                          disabled={isPending}
                        >
                          {isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Creando...
                            </>
                          ) : (
                            "Crear Cuenta"
                          )}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>

              <div className="mt-6 pt-5 border-t border-gray-200">
                <p className="text-center text-gray-600 text-sm">
                  ¿Ya tienes una cuenta?{" "}
                  <Link
                    href="/login"
                    className="text-[#ED1C24] hover:text-[#c41820] font-semibold transition-colors"
                  >
                    Inicia sesión aquí
                  </Link>
                </p>
              </div>
            </div>

            {/* Footer */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-center text-white/60 text-xs mt-4"
            >
              © {new Date().getFullYear()} Ambacar. Todos los derechos reservados.
            </motion.p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
