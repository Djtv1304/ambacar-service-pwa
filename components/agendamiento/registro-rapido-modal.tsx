"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { clienteSchema, type ClienteFormData } from "@/lib/validations/agendamiento"
import { registrarCliente } from "@/lib/api/agendamiento"
import type { Cliente } from "@/lib/types"

interface RegistroRapidoModalProps {
  open: boolean
  onClose: () => void
  cedula: string
  onComplete: (cliente: Cliente) => void
}

export function RegistroRapidoModal({ open, onClose, cedula, onComplete }: RegistroRapidoModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ClienteFormData>({
    resolver: zodResolver(clienteSchema),
    defaultValues: {
      cedula,
      nombre: "",
      apellido: "",
      telefono: "",
      email: "",
      ciudad: "",
    },
  })

  const onSubmit = async (data: ClienteFormData) => {
    setLoading(true)
    try {
      const nuevoCliente = await registrarCliente(data)

      toast({
        title: "¡Registro exitoso!",
        description: "Tu información ha sido guardada correctamente.",
      })

      onComplete(nuevoCliente)
      reset()
    } catch (error) {
      toast({
        title: "Error al registrar",
        description: "No se pudo completar el registro. Intenta nuevamente.",
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
            <Input id="telefono" {...register("telefono")} placeholder="0999999999" className="mt-1" />
            {errors.telefono && <p className="text-sm text-[#ED1C24] mt-1">{errors.telefono.message}</p>}
          </div>

          <div>
            <Label htmlFor="email" className="text-[#202020]">
              Email <span className="text-[#ED1C24]">*</span>
            </Label>
            <Input id="email" type="email" {...register("email")} placeholder="juan.perez@email.com" className="mt-1" />
            {errors.email && <p className="text-sm text-[#ED1C24] mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <Label htmlFor="ciudad" className="text-[#202020]">
              Ciudad <span className="text-[#ED1C24]">*</span>
            </Label>
            <Input id="ciudad" {...register("ciudad")} placeholder="Quito" className="mt-1" />
            {errors.ciudad && <p className="text-sm text-[#ED1C24] mt-1">{errors.ciudad.message}</p>}
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
