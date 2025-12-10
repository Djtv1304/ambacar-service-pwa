"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, AlertCircle, Mail } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { clienteSchema, type ClienteFormData } from "@/lib/validations/agendamiento"
import { registroRapido } from "@/lib/api/agendamiento"

interface RegistroRapidoModalProps {
  open: boolean
  onClose: () => void
  cedula: string
  onComplete: (usuarioId: number, email: string) => void
}

export function RegistroRapidoModal({ open, onClose, cedula, onComplete }: RegistroRapidoModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<ClienteFormData>({
    resolver: zodResolver(clienteSchema),
    defaultValues: {
      cedula: "",
      nombre: "",
      apellido: "",
      telefono: "",
      email: "",
    },
  })

  // Actualizar cédula cuando el modal se abre
  useEffect(() => {
    if (open && cedula) {
      setValue("cedula", cedula)
    }
  }, [open, cedula, setValue])

  const onSubmit = async (data: ClienteFormData) => {
    setLoading(true)
    try {
      const response = await registroRapido({
        cedula: data.cedula,
        first_name: data.nombre,
        last_name: data.apellido,
        email: data.email,
        phone: data.telefono,
      })

      toast({
        title: "¡Registro exitoso!",
        description: response.email_enviado
          ? `Se ha enviado una contraseña temporal a ${data.email}`
          : "Tu cuenta ha sido creada exitosamente",
      })

      // Pasar el ID del usuario y el email al componente padre
      onComplete(response.usuario.id, response.usuario.email)
      reset()
      onClose()
    } catch (error: any) {
      toast({
        title: "Error al registrar",
        description: error?.message || "No se pudo completar el registro. Intenta nuevamente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white border-gray-200">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#202020]">Registro Rápido</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          {/* Alert sobre el correo */}
          <Alert className="border-blue-200 bg-blue-50">
            <Mail className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-900 text-sm">
              <strong>Importante:</strong> Asegúrate de ingresar correctamente tu correo electrónico. Se enviará una
              contraseña temporal a esta dirección.
            </AlertDescription>
          </Alert>

          <div>
            <Label htmlFor="cedula" className="text-[#202020]">
              Cédula
            </Label>
            <Input id="cedula" {...register("cedula")} disabled className="mt-1 bg-gray-50" />
            {errors.cedula && <p className="text-sm text-[#ED1C24] mt-1">{errors.cedula.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nombre" className="text-[#202020]">
                Nombre <span className="text-[#ED1C24]">*</span>
              </Label>
              <Input id="nombre" {...register("nombre")} placeholder="Juan" className="mt-1" />
              {errors.nombre && <p className="text-sm text-[#ED1C24] mt-1">{errors.nombre.message}</p>}
            </div>

            <div>
              <Label htmlFor="apellido" className="text-[#202020]">
                Apellido <span className="text-[#ED1C24]">*</span>
              </Label>
              <Input id="apellido" {...register("apellido")} placeholder="Pérez" className="mt-1" />
              {errors.apellido && <p className="text-sm text-[#ED1C24] mt-1">{errors.apellido.message}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="telefono" className="text-[#202020]">
              Teléfono <span className="text-[#ED1C24]">*</span>
            </Label>
            <Input id="telefono" {...register("telefono")} placeholder="+593987654321" className="mt-1" />
            {errors.telefono && <p className="text-sm text-[#ED1C24] mt-1">{errors.telefono.message}</p>}
          </div>

          <div>
            <Label htmlFor="email" className="text-[#202020]">
              Email <span className="text-[#ED1C24]">*</span>
            </Label>
            <Input id="email" type="email" {...register("email")} placeholder="juan.perez@email.com" className="mt-1" />
            {errors.email && <p className="text-sm text-[#ED1C24] mt-1">{errors.email.message}</p>}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1 bg-transparent"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="flex-1 bg-[#ED1C24] hover:bg-[#c41820] text-white">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registrando...
                </>
              ) : (
                "Registrar"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
