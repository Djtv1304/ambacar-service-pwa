"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Lock, Mail, UserIcon, Phone, Loader2, AlertCircle, Eye, EyeOff } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { registerAction } from "@/lib/auth/actions"
import { useAuth } from "@/components/auth/auth-provider"
import { registerSchema, type RegisterFormData } from "@/lib/validations/auth"

export default function RegistroPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { refreshUser } = useAuth()
  const [isPending, startTransition] = useTransition()
  const [serverError, setServerError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
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
      formData.append("phone", data.phone)

      const result = await registerAction(formData)

      if (result.success) {
        // Refresh user in context
        await refreshUser()

        toast({
          title: "¡Registro exitoso!",
          description: `Bienvenido ${result.user?.first_name || ''} ${result.user?.last_name || ''}`,
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
          <h1 className="text-3xl font-bold tracking-tight text-[#202020]">Crear Cuenta</h1>
          <p className="mt-2 text-sm text-gray-600">Regístrate para acceder al sistema Ambacar</p>
        </div>

        <Card className="border-gray-200 bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-[#202020]">Registro</CardTitle>
            <CardDescription className="text-gray-600">Completa el formulario para crear tu cuenta</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              {serverError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{serverError}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name" className="text-[#202020]">
                    Nombre
                  </Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input
                      id="first_name"
                      placeholder="Juan"
                      className="pl-10 border-gray-300 focus:border-[#ED1C24] focus:ring-[#ED1C24]"
                      {...register("first_name")}
                      disabled={isPending}
                    />
                  </div>
                  {errors.first_name && <p className="text-sm text-red-600">{errors.first_name.message}</p>}
                  {fieldErrors.first_name && <p className="text-sm text-red-600">{fieldErrors.first_name[0]}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="last_name" className="text-[#202020]">
                    Apellido
                  </Label>
                  <Input
                    id="last_name"
                    placeholder="Pérez"
                    className="border-gray-300 focus:border-[#ED1C24] focus:ring-[#ED1C24]"
                    {...register("last_name")}
                    disabled={isPending}
                  />
                  {errors.last_name && <p className="text-sm text-red-600">{errors.last_name.message}</p>}
                  {fieldErrors.last_name && <p className="text-sm text-red-600">{fieldErrors.last_name[0]}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#202020]">
                  Correo Electrónico
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="usuario@example.com"
                    className="pl-10 border-gray-300 focus:border-[#ED1C24] focus:ring-[#ED1C24]"
                    {...register("email")}
                    disabled={isPending}
                  />
                </div>
                {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
                {fieldErrors.email && <p className="text-sm text-red-600">{fieldErrors.email[0]}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="username" className="text-[#202020]">
                  Nombre de Usuario
                </Label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <Input
                    id="username"
                    placeholder="Juanperez"
                    className="pl-10 border-gray-300 focus:border-[#ED1C24] focus:ring-[#ED1C24]"
                    {...register("username")}
                    disabled={isPending}
                  />
                </div>
                {errors.username && <p className="text-sm text-red-600">{errors.username.message}</p>}
                {fieldErrors.username && <p className="text-sm text-red-600">{fieldErrors.username[0]}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-[#202020]">
                  Teléfono
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+593 099 123 4567"
                    className="pl-10 border-gray-300 focus:border-[#ED1C24] focus:ring-[#ED1C24]"
                    {...register("phone")}
                    disabled={isPending}
                    onFocus={(e) => {
                      if (!e.target.value || e.target.value === "") {
                        e.target.value = "+593 0"
                        // Posicionar cursor al final
                        setTimeout(() => {
                          e.target.setSelectionRange(e.target.value.length, e.target.value.length)
                        }, 0)
                      }
                    }}
                    onChange={(e) => {
                      let value = e.target.value
                      const prefix = "+593 0"

                      // Si el valor no comienza con el prefijo, restaurarlo
                      if (!value.startsWith(prefix)) {
                        value = prefix
                      }

                      // Obtener solo la parte después del prefijo
                      let numberPart = value.slice(prefix.length)

                      // Remover todo lo que no sea dígito (espacios, letras, etc.)
                      numberPart = numberPart.replace(/\D/g, '')

                      // Limitar a 9 dígitos
                      numberPart = numberPart.slice(0, 9)

                      // Formatear con espacios: XX XXX XXXX
                      let formattedNumber = ""
                      if (numberPart.length > 0) {
                        formattedNumber = numberPart.slice(0, 2) // Primeros 2 dígitos
                      }
                      if (numberPart.length > 2) {
                        formattedNumber += " " + numberPart.slice(2, 5) // Siguientes 3 dígitos
                      }
                      if (numberPart.length > 5) {
                        formattedNumber += " " + numberPart.slice(5, 9) // Últimos 4 dígitos
                      }

                      // Actualizar el valor del input: +593 0XX XXX XXXX
                      e.target.value = prefix + formattedNumber
                    }}
                    onKeyDown={(e) => {
                      // Prevenir borrar el prefijo
                      const input = e.currentTarget
                      const cursorPosition = input.selectionStart || 0
                      const prefix = "+593 0"

                      if (
                        (e.key === "Backspace" || e.key === "Delete") &&
                        cursorPosition <= prefix.length
                      ) {
                        e.preventDefault()
                      }

                      // Solo permitir números, backspace, delete, tab, flechas
                      const allowedKeys = ["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"]
                      if (!allowedKeys.includes(e.key) && !/^\d$/.test(e.key)) {
                        e.preventDefault()
                      }
                    }}
                  />
                </div>
                {errors.phone && <p className="text-sm text-red-600">{errors.phone.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-[#202020]">
                  Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 pr-10 border-gray-300 focus:border-[#ED1C24] focus:ring-[#ED1C24]"
                    {...register("password")}
                    disabled={isPending}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                    disabled={isPending}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
                {fieldErrors.password && <p className="text-sm text-red-600">{fieldErrors.password[0]}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password_confirm" className="text-[#202020]">
                  Confirmar Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <Input
                    id="password_confirm"
                    type={showPasswordConfirm ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 pr-10 border-gray-300 focus:border-[#ED1C24] focus:ring-[#ED1C24]"
                    {...register("password_confirm")}
                    disabled={isPending}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                    className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                    disabled={isPending}
                  >
                    {showPasswordConfirm ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password_confirm && <p className="text-sm text-red-600">{errors.password_confirm.message}</p>}
              </div>

              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                <p className="text-xs text-gray-600">
                  La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas y números.
                </p>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4 mt-6">
              <Button type="submit" className="w-full bg-[#ED1C24] hover:bg-[#c41820] text-white" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando cuenta...
                  </>
                ) : (
                  "Crear Cuenta"
                )}
              </Button>

              <p className="text-center text-sm text-gray-600">
                ¿Ya tienes una cuenta?{" "}
                <Link href="/login" className="text-[#ED1C24] hover:underline font-medium">
                  Inicia sesión aquí
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  )
}
