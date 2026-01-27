"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Package,
  Plus,
  Search,
  Loader2,
  Building2,
  Info,
  ChevronLeft,
  ChevronRight,
  PackageSearch,
  CheckCircle2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  getAgencias,
  getStockRepuestos,
  asignarRepuesto,
  type Agencia,
  type RepuestoStock,
} from "@/lib/api/erp-ambacar"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

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
  sucursalOT?: string
}

/** Converts "QUICENTRO SUR" to "Quicentro Sur" */
function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

export function RepuestosList({ repuestos, onAddRepuesto, readOnly = false, sucursalOT }: RepuestosListProps) {
  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedStockItem, setSelectedStockItem] = useState<RepuestoStock | null>(null)
  const [cantidad, setCantidad] = useState("1")
  const [assignSuccess, setAssignSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  // Sucursales state
  const [agencias, setAgencias] = useState<Agencia[]>([])
  const [selectedAgencia, setSelectedAgencia] = useState<string>("")
  const [loadingAgencias, setLoadingAgencias] = useState(false)

  // Stock search state
  const [stockQuery, setStockQuery] = useState("")
  const [stockResults, setStockResults] = useState<RepuestoStock[]>([])
  const [stockLoading, setStockLoading] = useState(false)
  const [stockPage, setStockPage] = useState(1)
  const [stockTotalPages, setStockTotalPages] = useState(0)
  const [hasSearched, setHasSearched] = useState(false)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const stockViewportRef = useRef<HTMLDivElement>(null)
  const prevResultsLengthRef = useRef(0)

  // Siempre cargar agencias cuando se puede agregar repuestos
  useEffect(() => {
    // Si no hay función onAddRepuesto, no necesitamos las agencias
    if (!onAddRepuesto) return

    const fetchAgencias = async () => {
      setLoadingAgencias(true)
      try {
        const data = await getAgencias()
        setAgencias(data)

        // Si tenemos sucursalOT, pre-seleccionar esa sucursal
        if (sucursalOT) {
          const match = data.find(
            (a) => a.nombreAgencia.toLowerCase().trim() === sucursalOT.toLowerCase().trim()
          )
          if (match) {
            setSelectedAgencia(match.idAgencia)
          }
        } else if (data.length > 0) {
          // Si no hay sucursalOT, seleccionar la primera agencia por defecto
          setSelectedAgencia(data[0].idAgencia)
        }
      } catch (error) {
        console.error("Error loading agencias:", error)
      } finally {
        setLoadingAgencias(false)
      }
    }

    fetchAgencias()
  }, [sucursalOT, onAddRepuesto])

  // Reset stock when agency changes
  useEffect(() => {
    setStockResults([])
    setStockPage(1)
    setStockTotalPages(0)
    setHasSearched(false)
    setStockQuery("")
  }, [selectedAgencia])

  // Onboarding scroll bounce when results first appear
  useEffect(() => {
    if (stockResults.length > 0 && prevResultsLengthRef.current === 0) {
      // Poll until the viewport ref is available (AnimatePresence may delay mount)
      const attemptBounce = (retries = 0) => {
        const viewport = stockViewportRef.current
        if (!viewport) {
          if (retries < 15) setTimeout(() => attemptBounce(retries + 1), 100)
          return
        }
        if (viewport.scrollHeight <= viewport.clientHeight) return

        // Eased scroll animation for a truly smooth feel
        const smoothScrollTo = (target: number, duration: number): Promise<void> => {
          return new Promise((resolve) => {
            const start = viewport.scrollTop
            const distance = target - start
            const startTime = performance.now()

            const easeInOutCubic = (t: number) =>
              t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

            const step = (currentTime: number) => {
              const elapsed = currentTime - startTime
              const progress = Math.min(elapsed / duration, 1)
              viewport.scrollTop = start + distance * easeInOutCubic(progress)
              if (progress < 1) {
                requestAnimationFrame(step)
              } else {
                resolve()
              }
            }
            requestAnimationFrame(step)
          })
        }

        // First bounce - slow and smooth
        setTimeout(async () => {
          await smoothScrollTo(100, 700)
          await smoothScrollTo(0, 700)
          // Second bounce - quicker
          await smoothScrollTo(40, 450)
          await smoothScrollTo(0, 450)
        }, 400)
      }
      attemptBounce()
    }
    prevResultsLengthRef.current = stockResults.length
  }, [stockResults])

  const isOTSucursalSelected = (() => {
    if (!sucursalOT) return true
    if (!selectedAgencia) return false
    const selected = agencias.find((a) => a.idAgencia === selectedAgencia)
    if (!selected) return false
    return selected.nombreAgencia.toLowerCase().trim() === sucursalOT.toLowerCase().trim()
  })()

  const canAdd = !readOnly && !!onAddRepuesto && isOTSucursalSelected

  const totalRepuestos = repuestos.length
  const totalCost = repuestos.reduce((acc, r) => acc + (r.cantidad * r.precioUnitario), 0)

  const searchStock = useCallback(async (query: string, page: number, options?: { scrollToTop?: boolean }) => {
    if (!selectedAgencia || !query.trim()) {
      setStockResults([])
      setStockTotalPages(0)
      setHasSearched(false)
      return
    }

    setStockLoading(true)
    setHasSearched(true)
    try {
      const data = await getStockRepuestos(selectedAgencia, query.trim(), page, 20)
      setStockResults(data.repuestos)
      setStockTotalPages(data.totalPages)
      setStockPage(data.page)

      // Reset scroll after fetch completes and DOM updates
      if (options?.scrollToTop) {
        requestAnimationFrame(() => {
          if (stockViewportRef.current) {
            stockViewportRef.current.scrollTop = 0
          }
        })
      }
    } catch (error) {
      console.error("Error searching stock:", error)
      setStockResults([])
      setStockTotalPages(0)
    } finally {
      setStockLoading(false)
    }
  }, [selectedAgencia])

  const handleSearchInput = (value: string) => {
    setStockQuery(value)
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)

    if (!value.trim()) {
      setStockResults([])
      setStockTotalPages(0)
      setHasSearched(false)
      return
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchStock(value, 1)
    }, 500)
  }

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > stockTotalPages) return
    searchStock(stockQuery, newPage, { scrollToTop: true })
  }

  const handleScrollToSearch = () => {
    searchInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
    setTimeout(() => searchInputRef.current?.focus(), 300)
  }

  const handleSelectForAdd = (item: RepuestoStock) => {
    setSelectedStockItem(item)
    setCantidad("1")
    setAssignSuccess(false)
    setSuccessMessage("")
    setIsDialogOpen(true)
  }

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setIsDialogOpen(false)
      // Reset success state after dialog closes
      setTimeout(() => {
        setAssignSuccess(false)
        setSuccessMessage("")
        setSelectedStockItem(null)
        setCantidad("1")
      }, 200)
    }
  }

  const handleAdd = async () => {
    if (!selectedStockItem || !onAddRepuesto) return

    const cantidadNum = parseInt(cantidad) || 1
    setIsSubmitting(true)

    try {
      // Call the ERP API to assign the repuesto
      const result = await asignarRepuesto(
        selectedAgencia,
        selectedStockItem.codigo,
        cantidadNum
      )

      // Show success state in dialog
      setAssignSuccess(true)
      setSuccessMessage(result.mensaje)

      // Update parent state
      await onAddRepuesto({
        codigo: selectedStockItem.codigo,
        descripcion: toTitleCase(selectedStockItem.descripcion),
        cantidad: cantidadNum,
        unidad: "Unidad",
        precioUnitario: selectedStockItem.precio,
      })

      toast.success("Repuesto asignado", {
        description: result.mensaje,
      })

      // Refresh stock list to show updated quantities (preserve scroll position)
      const savedScrollTop = stockViewportRef.current?.scrollTop || 0
      try {
        const data = await getStockRepuestos(selectedAgencia, stockQuery.trim(), stockPage, 20)
        setStockResults(data.repuestos)
        setStockTotalPages(data.totalPages)
        // Restore scroll position after state update
        requestAnimationFrame(() => {
          if (stockViewportRef.current) {
            stockViewportRef.current.scrollTop = savedScrollTop
          }
        })
      } catch {
        // Silently fail - stock refresh is non-critical
      }

      // Auto-close dialog after showing success
      setTimeout(() => {
        setIsDialogOpen(false)
        setTimeout(() => {
          setAssignSuccess(false)
          setSuccessMessage("")
          setSelectedStockItem(null)
          setCantidad("1")
        }, 200)
      }, 1800)
    } catch (error: any) {
      console.error("Error assigning repuesto:", error)
      toast.error("Error al asignar repuesto", {
        description: error.message || "Intente nuevamente",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedAgenciaName = agencias.find((a) => a.idAgencia === selectedAgencia)?.nombreAgencia

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Repuestos Utilizados</CardTitle>
              <Badge variant="secondary" className="font-normal">
                {totalRepuestos}
              </Badge>
            </div>
            <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
              {/* Mostrar selector cuando hay agencias y se puede agregar */}
              {!readOnly && onAddRepuesto && agencias.length > 0 && (
                <Select value={selectedAgencia} onValueChange={setSelectedAgencia}>
                  <SelectTrigger className="w-full sm:w-[180px] h-8 text-xs">
                    <Building2 className="h-3.5 w-3.5 mr-1.5 text-muted-foreground shrink-0" />
                    <SelectValue placeholder={loadingAgencias ? "Cargando..." : "Sucursal"} />
                  </SelectTrigger>
                  <SelectContent>
                    {agencias.map((agencia) => (
                      <SelectItem key={agencia.idAgencia} value={agencia.idAgencia}>
                        {toTitleCase(agencia.nombreAgencia)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <AnimatePresence mode="wait">
                {canAdd && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    className="w-full sm:w-auto"
                  >
                    <Button size="sm" className="w-full sm:w-auto" onClick={handleScrollToSearch}>
                      <Plus className="h-4 w-4 mr-1" />
                      Agregar
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0 space-y-4">
          {/* Info banner when viewing different sucursal */}
          <AnimatePresence>
            {sucursalOT && !isOTSucursalSelected && selectedAgencia && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20">
                  <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-blue-700 dark:text-blue-300">
                    <p className="font-medium">Consultando stock de {toTitleCase(selectedAgenciaName || "")}</p>
                    <p className="mt-0.5 text-blue-600/80 dark:text-blue-400/80">
                      Solo puedes agregar repuestos desde la sucursal de esta OT ({toTitleCase(sucursalOT)}).
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Current OT repuestos */}
          {repuestos.length > 0 ? (
            <>
              <ScrollArea className="h-48">
                <div className="space-y-1">
                  <div className="grid grid-cols-12 gap-2 px-2 py-1.5 bg-muted/50 rounded-md text-xs font-medium text-muted-foreground sticky top-0">
                    <div className="col-span-1">Cant.</div>
                    <div className="col-span-5">Descripcion</div>
                    <div className="col-span-3">Codigo</div>
                    <div className="col-span-3 text-right">P. Unit.</div>
                  </div>
                  {repuestos.map((part) => (
                    <div
                      key={part.id}
                      className="grid grid-cols-12 gap-2 px-2 py-2.5 text-sm border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <div className="col-span-1 font-medium">{part.cantidad}</div>
                      <div className="col-span-5 truncate" title={part.descripcion}>{part.descripcion}</div>
                      <div className="col-span-3 font-mono text-xs text-muted-foreground truncate">{part.codigo}</div>
                      <div className="col-span-3 text-right font-medium">${part.precioUnitario.toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm text-muted-foreground">Total ({totalRepuestos} items)</span>
                <span className="text-lg font-bold">${totalCost.toFixed(2)}</span>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-2">
                <Package className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">No hay repuestos registrados</p>
              <AnimatePresence>
                {canAdd && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={handleScrollToSearch}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Agregar Repuesto
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Stock Browser Section */}
          {selectedAgencia && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <PackageSearch className="h-4 w-4 text-muted-foreground" />
                  <h4 className="text-sm font-semibold">
                    Buscar en Stock
                    {selectedAgenciaName && (
                      <span className="font-normal text-muted-foreground ml-1">
                        - {toTitleCase(selectedAgenciaName)}
                      </span>
                    )}
                  </h4>
                </div>

                {/* Search input */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    ref={searchInputRef}
                    placeholder="Buscar repuesto por descripcion..."
                    value={stockQuery}
                    onChange={(e) => handleSearchInput(e.target.value)}
                    className="pl-9 h-9 text-sm"
                  />
                  {stockLoading && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>

                {/* Stock Results */}
                <AnimatePresence mode="wait">
                  {stockLoading && !stockResults.length ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-center py-8"
                    >
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </motion.div>
                  ) : hasSearched && stockResults.length === 0 ? (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center py-8 text-center"
                    >
                      <PackageSearch className="h-8 w-8 text-muted-foreground/50 mb-2" />
                      <p className="text-sm text-muted-foreground">No se encontraron repuestos</p>
                    </motion.div>
                  ) : stockResults.length > 0 ? (
                    <motion.div
                      key="results"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ScrollArea className="h-72" viewportRef={stockViewportRef}>
                          <div className="space-y-1.5">
                            {stockResults.map((item, idx) => (
                              <motion.div
                                key={`${item.codigo}-${idx}`}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.15, delay: idx * 0.02 }}
                                className={cn(
                                  "group flex flex-col sm:flex-row sm:items-center gap-2 p-3 rounded-lg border transition-colors",
                                  item.stockActual > 0
                                    ? "border-border hover:border-primary/30 hover:bg-primary/5 dark:hover:bg-primary/5"
                                    : "border-border/50 opacity-60"
                                )}
                              >
                                <div className="flex-1 min-w-0 space-y-1">
                                  <p className="text-sm font-medium truncate" title={item.descripcion}>
                                    {toTitleCase(item.descripcion)}
                                  </p>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-mono text-[11px] text-muted-foreground">
                                      {item.codigo}
                                    </span>
                                    <Badge variant="outline" className="text-[10px] h-5 px-1.5">
                                      {item.linea}
                                    </Badge>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                                  <div className="text-right">
                                    <p className="text-sm font-bold">${item.precio.toFixed(2)}</p>
                                    <p className={cn(
                                      "text-[11px] font-medium",
                                      item.stockActual > 0
                                        ? "text-green-600 dark:text-green-400"
                                        : "text-red-500 dark:text-red-400"
                                    )}>
                                      Stock: {item.stockActual}
                                    </p>
                                  </div>
                                  {canAdd && item.stockActual > 0 && (
                                    <div className="overflow-hidden transition-all duration-200 ease-out max-w-0 group-hover:max-w-[40px] opacity-0 group-hover:opacity-100">
                                      <Button
                                        size="icon"
                                        variant="outline"
                                        className="h-8 w-8 shrink-0 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground"
                                        onClick={() => handleSelectForAdd(item)}
                                      >
                                        <Plus className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            ))}
                          </div>
                      </ScrollArea>

                      {/* Pagination */}
                      {stockTotalPages > 1 && (
                        <div className="flex items-center justify-between pt-3 border-t mt-3">
                          <p className="text-xs text-muted-foreground">
                            Pagina {stockPage} de {stockTotalPages}
                          </p>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              disabled={stockPage <= 1 || stockLoading}
                              onClick={() => handlePageChange(stockPage - 1)}
                            >
                              <ChevronLeft className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              disabled={stockPage >= stockTotalPages || stockLoading}
                              onClick={() => handlePageChange(stockPage + 1)}
                            >
                              <ChevronRight className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ) : !hasSearched ? (
                    <motion.div
                      key="hint"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center py-6 text-center"
                    >
                      <Search className="h-6 w-6 text-muted-foreground/40 mb-2" />
                      <p className="text-xs text-muted-foreground">
                        Escribe para buscar repuestos en el inventario de la sucursal seleccionada
                      </p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Add Repuesto Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-md">
          <AnimatePresence mode="wait">
            {assignSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="flex flex-col items-center justify-center py-8 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 15 }}
                >
                  <CheckCircle2 className="h-14 w-14 text-green-500 mb-4" />
                </motion.div>
                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-lg font-semibold text-green-700 dark:text-green-400"
                >
                  Repuesto Asignado
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-sm text-muted-foreground mt-2"
                >
                  {successMessage}
                </motion.p>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <DialogHeader>
                  <DialogTitle>Confirmar Asignacion</DialogTitle>
                  <DialogDescription>
                    Revisa los detalles y confirma la cantidad antes de asignar el repuesto a la OT.
                  </DialogDescription>
                </DialogHeader>

                {selectedStockItem && (
                  <div className="space-y-4 py-4">
                    <div className="p-3 rounded-lg bg-muted/50 border space-y-1.5">
                      <p className="text-sm font-medium">{toTitleCase(selectedStockItem.descripcion)}</p>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-muted-foreground">{selectedStockItem.codigo}</span>
                        <Badge variant="outline" className="text-[10px] h-5 px-1.5">{selectedStockItem.linea}</Badge>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm font-bold">${selectedStockItem.precio.toFixed(2)}</span>
                        <span className="text-xs text-green-600 dark:text-green-400">
                          Disponible: {selectedStockItem.stockActual}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="text-sm font-medium">Cantidad:</label>
                      <Input
                        type="number"
                        min="1"
                        max={selectedStockItem.stockActual}
                        value={cantidad}
                        onChange={(e) => setCantidad(e.target.value)}
                        className="w-24"
                      />
                      <span className="text-xs text-muted-foreground">
                        Max: {selectedStockItem.stockActual}
                      </span>
                    </div>
                  </div>
                )}

                <DialogFooter>
                  <Button variant="outline" onClick={() => handleDialogClose(false)} disabled={isSubmitting}>
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleAdd}
                    disabled={!selectedStockItem || isSubmitting || parseInt(cantidad) < 1}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Asignando...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Asignar Repuesto
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </>
  )
}
