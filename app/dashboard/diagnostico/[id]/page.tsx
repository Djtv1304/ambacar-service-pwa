"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, Save, Trash2, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface Hallazgo {
  id: string
  descripcion: string
  severidad: "critico" | "importante" | "recomendado" | "opcional"
  tiempoEstimado: number
  costoManoObra: number
}

const severidadColors = {
  critico: "bg-red-500/10 text-red-500 border-red-500/20",
  importante: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  recomendado: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  opcional: "bg-gray-500/10 text-gray-500 border-gray-500/20",
}

export default function DiagnosticoDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [hallazgos, setHallazgos] = useState<Hallazgo[]>([
    {
      id: "1",
      descripcion: "Pastillas de freno delanteras al 40% de vida útil",
      severidad: "importante",
      tiempoEstimado: 60,
      costoManoObra: 45,
    },
  ])

  const [recomendaciones, setRecomendaciones] = useState("")

  const addHallazgo = () => {
    const newHallazgo: Hallazgo = {
      id: Date.now().toString(),
      descripcion: "",
      severidad: "recomendado",
      tiempoEstimado: 0,
      costoManoObra: 0,
    }
    setHallazgos([...hallazgos, newHallazgo])
  }

  const updateHallazgo = (id: string, updates: Partial<Hallazgo>) => {
    setHallazgos(hallazgos.map((h) => (h.id === id ? { ...h, ...updates } : h)))
  }

  const removeHallazgo = (id: string) => {
    setHallazgos(hallazgos.filter((h) => h.id !== id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    toast({
      title: "Diagnóstico guardado",
      description: "El diagnóstico ha sido enviado al cliente para su aprobación",
    })

    router.push("/dashboard/diagnostico")
  }

  const totalCosto = hallazgos.reduce((sum, h) => sum + h.costoManoObra, 0)
  const totalTiempo = hallazgos.reduce((sum, h) => sum + h.tiempoEstimado, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/diagnostico">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Diagnóstico Técnico</h1>
          <p className="text-muted-foreground mt-1">OT-2025-002 - Mazda CX-5 (DEF-9012)</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Hallazgos */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Hallazgos del Diagnóstico</CardTitle>
                <CardDescription>Detalla los problemas encontrados y trabajos recomendados</CardDescription>
              </div>
              <Button type="button" onClick={addHallazgo} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Agregar Hallazgo
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {hallazgos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <AlertTriangle className="h-12 w-12 text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground">No hay hallazgos registrados</p>
              </div>
            ) : (
              hallazgos.map((hallazgo, index) => (
                <div key={hallazgo.id} className="space-y-4 rounded-lg border border-border p-4">
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium">Hallazgo #{index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeHallazgo(hallazgo.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label>Descripción *</Label>
                    <Textarea
                      placeholder="Describe el problema encontrado..."
                      value={hallazgo.descripcion}
                      onChange={(e) => updateHallazgo(hallazgo.id, { descripcion: e.target.value })}
                      rows={3}
                      required
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Severidad *</Label>
                      <Select
                        value={hallazgo.severidad}
                        onValueChange={(value: any) => updateHallazgo(hallazgo.id, { severidad: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="critico">Crítico</SelectItem>
                          <SelectItem value="importante">Importante</SelectItem>
                          <SelectItem value="recomendado">Recomendado</SelectItem>
                          <SelectItem value="opcional">Opcional</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Tiempo Estimado (min) *</Label>
                      <Input
                        type="number"
                        placeholder="60"
                        value={hallazgo.tiempoEstimado || ""}
                        onChange={(e) => updateHallazgo(hallazgo.id, { tiempoEstimado: Number(e.target.value) })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Costo Mano de Obra ($) *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="45.00"
                        value={hallazgo.costoManoObra || ""}
                        onChange={(e) => updateHallazgo(hallazgo.id, { costoManoObra: Number(e.target.value) })}
                        required
                      />
                    </div>
                  </div>

                  <Badge variant="outline" className={cn("w-fit", severidadColors[hallazgo.severidad])}>
                    {hallazgo.severidad}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recomendaciones */}
        <Card>
          <CardHeader>
            <CardTitle>Recomendaciones Generales</CardTitle>
            <CardDescription>Sugerencias adicionales para el cliente</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Recomendaciones de mantenimiento preventivo, próximos servicios, etc..."
              value={recomendaciones}
              onChange={(e) => setRecomendaciones(e.target.value)}
              rows={6}
            />
          </CardContent>
        </Card>

        {/* Summary */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle>Resumen del Presupuesto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">Total Hallazgos</p>
                <p className="text-2xl font-bold">{hallazgos.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tiempo Total Estimado</p>
                <p className="text-2xl font-bold">{totalTiempo} min</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Costo Mano de Obra</p>
                <p className="text-2xl font-bold">${totalCosto.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting || hallazgos.length === 0}>
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? "Guardando..." : "Enviar a Cliente"}
          </Button>
        </div>
      </form>
    </div>
  )
}
