"use client"

import { useState } from "react"
import { Package, Plus, Search, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

export interface Repuesto {
  id: string
  codigo: string
  descripcion: string
  cantidad: number
  unidad: string
  precioUnitario: number
}

interface RepuestosListProps {
  repuestos: Repuesto[]
  onAddRepuesto?: (repuesto: Omit<Repuesto, "id">) => Promise<void>
  readOnly?: boolean
}

// Mock inventory for selection
const MOCK_INVENTORY = [
  { id: "inv-1", codigo: "TOY-BP-HLX22", descripcion: "Pastillas de freno Toyota Hilux OEM", precio: 85.00, unidad: "Juego" },
  { id: "inv-2", codigo: "TOY-FA-001", descripcion: "Filtro de aire motor Toyota", precio: 28.00, unidad: "Unidad" },
  { id: "inv-3", codigo: "GEN-LF-5W30", descripcion: "Aceite sintético 5W-30 (Litro)", precio: 12.50, unidad: "Litros" },
  { id: "inv-4", codigo: "TOY-OF-HLX", descripcion: "Filtro de aceite Toyota Hilux", precio: 18.00, unidad: "Unidad" },
  { id: "inv-5", codigo: "GEN-BUJ-IR", descripcion: "Bujía de iridio universal", precio: 15.00, unidad: "Unidad" },
  { id: "inv-6", codigo: "CHE-BAT-70", descripcion: "Batería 70Ah Chevrolet", precio: 145.00, unidad: "Unidad" },
]

export function RepuestosList({ repuestos, onAddRepuesto, readOnly = false }: RepuestosListProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [cantidad, setCantidad] = useState("1")

  const totalRepuestos = repuestos.length
  const totalCost = repuestos.reduce((acc, r) => acc + (r.cantidad * r.precioUnitario), 0)

  const filteredInventory = MOCK_INVENTORY.filter(item =>
    item.descripcion.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.codigo.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAdd = async () => {
    if (!selectedItem || !onAddRepuesto) return

    const item = MOCK_INVENTORY.find(i => i.id === selectedItem)
    if (!item) return

    setIsSubmitting(true)
    try {
      await onAddRepuesto({
        codigo: item.codigo,
        descripcion: item.descripcion,
        cantidad: parseInt(cantidad) || 1,
        unidad: item.unidad,
        precioUnitario: item.precio,
      })
      setIsDialogOpen(false)
      setSelectedItem(null)
      setCantidad("1")
      setSearchQuery("")
    } catch (error) {
      console.error("Error adding part:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Repuestos Utilizados</CardTitle>
              <Badge variant="secondary" className="font-normal">
                {totalRepuestos}
              </Badge>
            </div>
            {!readOnly && onAddRepuesto && (
              <Button size="sm" onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Agregar
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {repuestos.length > 0 ? (
            <>
              <ScrollArea className="h-64">
                <div className="space-y-1">
                  {/* Table header */}
                  <div className="grid grid-cols-12 gap-2 px-2 py-1.5 bg-muted/50 rounded-md text-xs font-medium text-muted-foreground sticky top-0">
                    <div className="col-span-1">Cant.</div>
                    <div className="col-span-5">Descripción</div>
                    <div className="col-span-3">Código</div>
                    <div className="col-span-3 text-right">P. Unit.</div>
                  </div>

                  {/* Table rows */}
                  {repuestos.map((part) => (
                    <div
                      key={part.id}
                      className="grid grid-cols-12 gap-2 px-2 py-2.5 text-sm border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <div className="col-span-1 font-medium">
                        {part.cantidad}
                      </div>
                      <div className="col-span-5 truncate" title={part.descripcion}>
                        {part.descripcion}
                      </div>
                      <div className="col-span-3 font-mono text-xs text-muted-foreground truncate">
                        {part.codigo}
                      </div>
                      <div className="col-span-3 text-right font-medium">
                        ${part.precioUnitario.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Summary footer */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t">
                <span className="text-sm text-muted-foreground">
                  Total ({totalRepuestos} items)
                </span>
                <span className="text-lg font-bold">
                  ${totalCost.toFixed(2)}
                </span>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <Package className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">No hay repuestos registrados</p>
              {!readOnly && onAddRepuesto && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => setIsDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Agregar Repuesto
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Repuesto Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Agregar Repuesto</DialogTitle>
            <DialogDescription>
              Busca y selecciona un repuesto del inventario.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Search input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por código o descripción..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Inventory list */}
            <ScrollArea className="h-48 border rounded-lg">
              <div className="p-2 space-y-1">
                {filteredInventory.length > 0 ? (
                  filteredInventory.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setSelectedItem(item.id)}
                      className={cn(
                        "w-full text-left p-2 rounded-md transition-colors",
                        selectedItem === item.id
                          ? "bg-primary/10 border border-primary/30"
                          : "hover:bg-muted"
                      )}
                    >
                      <p className="text-sm font-medium truncate">{item.descripcion}</p>
                      <div className="flex justify-between text-xs text-muted-foreground mt-0.5">
                        <span className="font-mono">{item.codigo}</span>
                        <span className="font-medium text-foreground">${item.precio.toFixed(2)}</span>
                      </div>
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No se encontraron repuestos
                  </p>
                )}
              </div>
            </ScrollArea>

            {/* Quantity selector */}
            {selectedItem && (
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium">Cantidad:</label>
                <Input
                  type="number"
                  min="1"
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">
                  {MOCK_INVENTORY.find(i => i.id === selectedItem)?.unidad}
                </span>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleAdd}
              disabled={!selectedItem || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Agregando...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Repuesto
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

