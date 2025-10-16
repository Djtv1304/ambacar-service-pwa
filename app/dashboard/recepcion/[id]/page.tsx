"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { VehicleChecklist } from "@/components/reception/vehicle-checklist"
import { PhotoUpload } from "@/components/reception/photo-upload"
import { useToast } from "@/hooks/use-toast"
import type { ChecklistItem } from "@/lib/types"
import Link from "next/link"

const exteriorItems = [
  "Parachoques delantero",
  "Parachoques trasero",
  "Capó",
  "Techo",
  "Puertas",
  "Espejos laterales",
  "Luces delanteras",
  "Luces traseras",
  "Llantas y rines",
  "Parabrisas",
]

const interiorItems = [
  "Asientos",
  "Volante",
  "Tablero",
  "Consola central",
  "Alfombras",
  "Cinturones de seguridad",
  "Sistema de audio",
  "Aire acondicionado",
  "Limpieza general",
]

export default function RecepcionDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    kilometraje: "",
    nivelCombustible: [50],
    estadoExterior: [] as ChecklistItem[],
    estadoInterior: [] as ChecklistItem[],
    observaciones: "",
    fotos: [] as string[],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    toast({
      title: "Recepción completada",
      description: "El vehículo ha sido recepcionado y se ha generado la orden de trabajo",
    })

    router.push("/dashboard/ot")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/recepcion">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Recepción de Vehículo</h1>
          <p className="text-muted-foreground mt-1">Completa el checklist de recepción</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Información Básica</CardTitle>
            <CardDescription>Datos del vehículo al momento de la recepción</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="kilometraje">Kilometraje Actual *</Label>
                <Input
                  id="kilometraje"
                  type="number"
                  placeholder="45000"
                  value={formData.kilometraje}
                  onChange={(e) => setFormData({ ...formData, kilometraje: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="combustible">Nivel de Combustible: {formData.nivelCombustible[0]}%</Label>
                <Slider
                  id="combustible"
                  min={0}
                  max={100}
                  step={10}
                  value={formData.nivelCombustible}
                  onValueChange={(value) => setFormData({ ...formData, nivelCombustible: value })}
                  className="mt-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Vacío</span>
                  <span>Lleno</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Exterior Checklist */}
        <VehicleChecklist
          title="Estado Exterior"
          items={exteriorItems}
          value={formData.estadoExterior}
          onChange={(items) => setFormData({ ...formData, estadoExterior: items })}
        />

        {/* Interior Checklist */}
        <VehicleChecklist
          title="Estado Interior"
          items={interiorItems}
          value={formData.estadoInterior}
          onChange={(items) => setFormData({ ...formData, estadoInterior: items })}
        />

        {/* Photos */}
        <PhotoUpload photos={formData.fotos} onChange={(fotos) => setFormData({ ...formData, fotos })} />

        {/* Observations */}
        <Card>
          <CardHeader>
            <CardTitle>Observaciones Generales</CardTitle>
            <CardDescription>Notas adicionales sobre el estado del vehículo</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Describe cualquier detalle importante sobre el estado del vehículo..."
              value={formData.observaciones}
              onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
              rows={6}
            />
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? "Guardando..." : "Completar Recepción"}
          </Button>
        </div>
      </form>
    </div>
  )
}
