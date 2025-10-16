"use client"

import { useState, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Lock, Mail, Loader2, AlertCircle } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { loginAction } from "@/lib/auth/actions"
import { useAuth } from "@/components/auth/auth-provider"
import { loginSchema, type LoginFormData } from "@/lib/validations/auth"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { refreshUser } = useAuth()
  const [isPending, startTransition] = useTransition()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  })

  const rememberMe = watch("rememberMe")

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null)

    startTransition(async () => {
      const formData = new FormData()
      formData.append("email", data.email)
      formData.append("password", data.password)
      formData.append("rememberMe", String(data.rememberMe))

      const result = await loginAction(formData)

      if (result.success) {
        // Refresh user in context
        await refreshUser()

        toast({
          title: "¡Bienvenido!",
          description: `Has iniciado sesión como ${result.user.first_name} ${result.user.last_name}`,
        })

        // Redirect to dashboard or original destination
        const redirect = searchParams.get("redirect") || "/dashboard"
        router.push(redirect)
      } else {
        setServerError(result.error || "Error al iniciar sesión")
      }
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#ED1C24]">
              <span className="text-2xl font-bold text-white">A</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#202020]">Ambacar</h1>
          <p className="mt-2 text-sm text-gray-600">Sistema de Gestión de Taller</p>
        </div>

        <Card className="border-gray-200 bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-[#202020]">Iniciar Sesión</CardTitle>
            <CardDescription className="text-gray-600">
              Ingresa tus credenciales para acceder al sistema
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              {serverError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{serverError}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#202020]">
                  Correo Electrónico
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="juan.perez@example.com"
                    className="pl-10 border-gray-300 focus:border-[#ED1C24] focus:ring-[#ED1C24]"
                    {...register("email")}
                    disabled={isPending}
                  />
                </div>
                {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-[#202020]">
                    Contraseña
                  </Label>
                  <Link href="/recuperar-clave" className="text-sm text-[#ED1C24] hover:underline">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10 border-gray-300 focus:border-[#ED1C24] focus:ring-[#ED1C24]"
                    {...register("password")}
                    disabled={isPending}
                  />
                </div>
                {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rememberMe"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setValue("rememberMe", checked as boolean)}
                  disabled={isPending}
                  className="border-gray-300 data-[state=checked]:bg-[#ED1C24] data-[state=checked]:border-[#ED1C24]"
                />
                <Label htmlFor="rememberMe" className="text-sm font-normal text-[#202020] cursor-pointer">
                  Recordarme por 30 días
                </Label>
              </div>

              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                <p className="text-xs text-gray-600 mb-2">Credenciales de prueba:</p>
                <div className="space-y-1 text-xs font-mono text-gray-700">
                  <p>juan.perez@example.com</p>
                  <p>MiPassword123!</p>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full bg-[#ED1C24] hover:bg-[#c41820] text-white" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  "Iniciar Sesión"
                )}
              </Button>

              <p className="text-center text-sm text-gray-600">
                ¿No tienes una cuenta?{" "}
                <Link href="/registro" className="text-[#ED1C24] hover:underline font-medium">
                  Regístrate aquí
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  )
}
