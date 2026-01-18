"use client"

import { useState, useTransition, useRef, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Lock, Mail, Loader2, AlertCircle, Eye, EyeOff, ArrowRight, Car } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { loginAction, getClientAccessToken } from "@/lib/auth/actions"
import { useAuth } from "@/components/auth/auth-provider"
import { loginSchema, type LoginFormData } from "@/lib/validations/auth"
import { dispatchNotificationEvent, buildLoginContext } from "@/lib/api/notifications"

const VIDEO_PATH = "/media/video/ambacar-video-2k.webm"
const FALLBACK_IMAGE = "/media/image/portada-ambacar-video-h6.webp"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { setUser } = useAuth()
  const [isPending, startTransition] = useTransition()
  const [serverError, setServerError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [showTestCredentials, setShowTestCredentials] = useState(false)
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
    setValue,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const fillTestCredentials = () => {
    setValue("email", "juan.perez@example.com")
    setValue("password", "MiPassword123!")
    setShowTestCredentials(false)
  }

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null)

    startTransition(async () => {
      const formData = new FormData()
      formData.append("email", data.email)
      formData.append("password", data.password)

      const result = await loginAction(formData)

      if (result.success) {
        if (result.user) {
          setUser(result.user)
        }

        try {
          const authToken = await getClientAccessToken()

          if (authToken && result.user) {
            const customerName = `${result.user.first_name} ${result.user.last_name}`
            const now = new Date()
            const fecha = now.toLocaleDateString("es-EC", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
            const hora = now.toLocaleTimeString("es-EC", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })

            await dispatchNotificationEvent(
              {
                event_type: "custom",
                service_type_id: null,
                phase_id: null,
                customer_id: result.user.id.toString(),
                target: "clients",
                context: buildLoginContext({ customerName, fecha, hora }),
              },
              authToken,
            )
          }
        } catch (notifError) {
          console.error("Error enviando notificación de login:", notifError)
        }

        toast({
          title: "¡Inicio de sesión exitoso!",
          description: `Bienvenido de nuevo, ${result.user?.first_name || ""} ${result.user?.last_name || ""}`,
        })

        const redirect = searchParams.get("redirect") || "/dashboard"
        router.push(redirect)
      } else {
        setServerError(result.error || "Error al iniciar sesión")
      }
    })
  }

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
                Donde la<br />
                <span className="text-[#ED1C24]">excelencia</span><br />
                se encuentra
              </h2>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-lg text-white/80 max-w-md"
            >
              Gestiona tu taller automotriz con las herramientas más avanzadas.
              Eficiencia, control y calidad en un solo lugar
            </motion.p>
          </div>

          {/* Bottom Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="flex items-center gap-6"
          >
            <div className="flex items-center gap-2 text-white/60">
              <Car className="h-5 w-5" />
              <span className="text-sm">Servicio automotriz de primera</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 lg:p-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full max-w-md"
          >
            {/* Mobile Logo */}
            <div className="lg:hidden mb-8 text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="flex justify-center mb-4"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#ED1C24] shadow-lg shadow-red-500/30">
                  <span className="text-3xl font-bold text-white">A</span>
                </div>
              </motion.div>
              <h1 className="text-2xl font-bold text-white">Ambacar</h1>
              <p className="text-sm text-white/70">Sistema de Gestión de Taller</p>
            </div>

            {/* Form Card */}
            <div className="backdrop-blur-xl bg-white/95 rounded-3xl shadow-2xl p-8 sm:p-10">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Bienvenido</h2>
                <p className="text-gray-600 mt-1">Ingresa tus credenciales para continuar</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 font-medium">
                    Correo Electrónico
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      className="pl-12 h-12 bg-gray-50 border-gray-200 rounded-xl focus:bg-white focus:border-[#ED1C24] focus:ring-[#ED1C24] transition-all"
                      {...register("email")}
                      disabled={isPending}
                    />
                  </div>
                  {errors.email && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm text-red-600"
                    >
                      {errors.email.message}
                    </motion.p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-gray-700 font-medium">
                      Contraseña
                    </Label>
                    <Link
                      href="/recuperar-clave"
                      className="text-sm text-[#ED1C24] hover:text-[#c41820] font-medium transition-colors"
                    >
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-12 pr-12 h-12 bg-gray-50 border-gray-200 rounded-xl focus:bg-white focus:border-[#ED1C24] focus:ring-[#ED1C24] transition-all"
                      {...register("password")}
                      disabled={isPending}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                      disabled={isPending}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm text-red-600"
                    >
                      {errors.password.message}
                    </motion.p>
                  )}
                </div>

                {/* Test Credentials Toggle */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowTestCredentials(!showTestCredentials)}
                    className="text-xs text-gray-500 hover:text-gray-700 underline transition-colors"
                  >
                    {showTestCredentials ? "Ocultar credenciales de prueba" : "Ver credenciales de prueba"}
                  </button>
                  <AnimatePresence>
                    {showTestCredentials && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2 overflow-hidden"
                      >
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                          <p className="text-xs text-gray-600 mb-2">Credenciales de prueba:</p>
                          <div className="space-y-1 text-xs font-mono text-gray-700">
                            <p>juan.perez@example.com</p>
                            <p>MiPassword123!</p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={fillTestCredentials}
                            className="mt-3 w-full text-xs h-8"
                          >
                            Usar credenciales de prueba
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-[#ED1C24] hover:bg-[#c41820] text-white rounded-xl font-semibold text-base shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-all duration-300"
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Iniciando sesión...
                    </>
                  ) : (
                    <>
                      Iniciar Sesión
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-center text-gray-600">
                  ¿No tienes una cuenta?{" "}
                  <Link
                    href="/registro"
                    className="text-[#ED1C24] hover:text-[#c41820] font-semibold transition-colors"
                  >
                    Regístrate aquí
                  </Link>
                </p>
              </div>
            </div>

            {/* Footer */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-center text-white/60 text-sm mt-6"
            >
              © {new Date().getFullYear()} Ambacar. Todos los derechos reservados.
            </motion.p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
