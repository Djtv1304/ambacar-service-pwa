"use client"

import { useState } from "react"
import { Search, Package, AlertTriangle, TrendingUp } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { mockRepuestos } from "@/lib/fixtures/ordenes-trabajo"
import { cn } from "@/lib/utils"

export default function InventarioPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterCategoria, setFilterCategoria] = useState<string>("todas")
  const [filterSucursal, setFilterSucursal] = useState<string>("todas")

  const categorias = Array.from(new Set(mockRepuestos.map((r) => r.categoria)))

  const filteredRepuestos = mockRepuestos.filter((repuesto) => {
    const matchesSearch =
      searchQuery === "" ||
      repuesto.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repuesto.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repuesto.marca.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategoria = filterCategoria === "todas" || repuesto.categoria === filterCategoria

    return matchesSearch && matchesCategoria
  })

  const getStockForSucursal = (repuesto: (typeof mockRepuestos)[0]) => {
    if (filterSucursal === "todas") {
      return repuesto.stock.reduce((sum, s) => sum + s.cantidad, 0)
    }
    return repuesto.stock.find((s) => s.sucursal === filterSucursal)?.cantidad || 0
  }

  const getStockStatus = (repuesto: (typeof mockRepuestos)[0]) => {
    const stock = getStockForSucursal(repuesto)
    if (stock === 0) return { label: "Sin stock", color: "text-red-500" }
    if (stock <= repuesto.umbralMinimo) return { label: "Stock bajo", color: "text-orange-500" }
    return { label: "Stock normal", color: "text-green-500" }
  }

  const totalInventario = filteredRepuestos.reduce((sum, r) => sum + getStockForSucursal(r) * r.precioCompra, 0)
  const repuestosBajoStock = filteredRepuestos.filter((r) => getStockForSucursal(r) <= r.umbralMinimo).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventario</h1>
          <p className="text-muted-foreground mt-1">Gestiona el inventario de repuestos</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Repuestos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredRepuestos.length}</div>
            <p className="text-xs text-muted-foreground">En {categorias.length} categorías</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Valor Inventario</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalInventario.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Costo de adquisición</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Alertas de Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{repuestosBajoStock}</div>
            <p className="text-xs text-muted-foreground">Repuestos bajo umbral</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, SKU o marca..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterCategoria} onValueChange={setFilterCategoria}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas las categorías</SelectItem>
                {categorias.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterSucursal} onValueChange={setFilterSucursal}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas las sucursales</SelectItem>
                <SelectItem value="Quito Norte">Quito Norte</SelectItem>
                <SelectItem value="Quito Sur">Quito Sur</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Repuesto</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Marca</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="text-right">Precio Compra</TableHead>
                <TableHead className="text-right">Precio Venta</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRepuestos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <Package className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">No se encontraron repuestos</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredRepuestos.map((repuesto) => {
                  const stock = getStockForSucursal(repuesto)
                  const status = getStockStatus(repuesto)

                  return (
                    <TableRow key={repuesto.id} className="hover:bg-accent/50">
                      <TableCell className="font-mono text-sm">{repuesto.sku}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{repuesto.nombre}</p>
                          {repuesto.descripcion && (
                            <p className="text-xs text-muted-foreground">{repuesto.descripcion}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{repuesto.categoria}</Badge>
                      </TableCell>
                      <TableCell>{repuesto.marca}</TableCell>
                      <TableCell className="text-right">
                        <span className={cn("font-medium", stock <= repuesto.umbralMinimo && "text-orange-500")}>
                          {stock}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">${repuesto.precioCompra.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-medium">${repuesto.precioVenta.toFixed(2)}</TableCell>
                      <TableCell>
                        <span className={cn("text-sm", status.color)}>{status.label}</span>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
