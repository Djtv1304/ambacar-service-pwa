"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Loader2, XCircle, Calendar, Car, MapPin, Search, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth/auth-provider"
import {
  getCitasCancelables,
  cancelarCitaAPI,
  type CitaCancelable,
  type CitasCancelablesResponse,
} from "@/lib/api/agendamiento"

export default function CancelarCitaPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, isLoading: authLoading } = useAuth()

  const [cedula, setCedula] = useState("")
  const [loading, setLoading] = useState(false)
  const [canceling, setCanceling] = useState(false)
  const [data, setData] = useState<CitasCancelablesResponse | null>(null)
  const [canceledIds, setCanceledIds] = useState<number[]>([])
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [selectedCita, setSelectedCita] = useState<CitaCancelable | null>(null)

  // If user is logged in, fetch cancelable citas automatically.
  // If user logs out, reset all state.
  useEffect(() => {
    if (authLoading) return
    if (user?.cedula) {
      fetchCitas(user.cedula)
    } else {
      setData(null)
      setCanceledIds([])
      setCedula("")
    }
  }, [user, authLoading])

  const fetchCitas = async (cedulaValue: string) => {
    setLoading(true)
    setData(null)
    try {
      const result = await getCitasCancelables(cedulaValue)
      setData(result)
      if (result.citasCancelables.length === 0) {
        toast({
          title: "Sin citas cancelables",
          description: "No se encontraron citas que puedan ser canceladas.",
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudieron obtener las citas. Verifica la cédula e intenta nuevamente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault()
    if (cedula.trim().length < 10) {
      toast({
        title: "Cédula inválida",
        description: "La cédula debe tener al menos 10 caracteres.",
        variant: "destructive",
      })
      return
    }
    fetchCitas(cedula.trim())
  }

  const handleCancelClick = (cita: CitaCancelable) => {
    setSelectedCita(cita)
    setShowConfirmDialog(true)
  }

  const handleConfirmCancel = async () => {
    if (!selectedCita || !data) return

    setCanceling(true)
    setShowConfirmDialog(false)

    try {
      await cancelarCitaAPI(selectedCita.id, data.cliente.cedula)
      setCanceledIds((prev) => [...prev, selectedCita.id])
      toast({
        title: "Cita cancelada",
        description: `La cita ${selectedCita.numeroCita} ha sido cancelada exitosamente.`,
      })
    } catch (error: any) {
      toast({
        title: "Error al cancelar",
        description: error.message || "No se pudo cancelar la cita. Intenta nuevamente.",
        variant: "destructive",
      })
    } finally {
      setCanceling(false)
      setSelectedCita(null)
    }
  }

  const activeCitas = data?.citasCancelables.filter((c) => !canceledIds.includes(c.id)) ?? []

  const isLoggedIn = !!user?.cedula
  const showSearchForm = !authLoading && !isLoggedIn && !data
  const showResults = !!data

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white dark:from-background dark:via-background dark:to-background">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-border bg-white/80 dark:bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                <XCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Ambacar</h1>
                <p className="text-xs text-gray-600 dark:text-muted-foreground">Cancelar Cita</p>
              </div>
            </div>
            <Button variant="ghost" onClick={() => router.push("/agendamiento")} className="text-gray-600 dark:text-muted-foreground">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-10 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto space-y-6"
        >
          {/* Loading auth state */}
          {authLoading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {/* Cedula Search Form (only for non-authenticated users) */}
          {showSearchForm && (
            <Card className="border-gray-200 dark:border-border shadow-lg dark:bg-card">
              <CardHeader>
                <CardTitle className="text-2xl text-foreground">Cancelar Cita</CardTitle>
                <CardDescription>Ingresa tu número de cédula para buscar tus citas activas</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleBuscar} className="space-y-6">
                  <div>
                    <Label htmlFor="cedula" className="text-foreground">
                      Número de Cédula <span className="text-primary">*</span>
                    </Label>
                    <Input
                      id="cedula"
                      value={cedula}
                      onChange={(e) => setCedula(e.target.value)}
                      placeholder="1234567890"
                      className="mt-2 border-gray-300 dark:border-border"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary hover:bg-primary/90 text-white py-6"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Buscando...
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" />
                        Buscar Citas
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Loading citas for authenticated user */}
          {isLoggedIn && loading && !data && (
            <Card className="border-gray-200 dark:border-border shadow-lg dark:bg-card">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Buscando tus citas cancelables...</p>
              </CardContent>
            </Card>
          )}

          {/* Results */}
          {showResults && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Client info header */}
              <Card className="border-gray-200 dark:border-border dark:bg-card">
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Cliente</p>
                      <p className="font-semibold text-foreground">
                        {data.cliente.nombre} {data.cliente.apellido}
                      </p>
                      <p className="text-sm text-muted-foreground">C.I. {data.cliente.cedula}</p>
                    </div>
                    {!isLoggedIn && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { setData(null); setCanceledIds([]) }}
                      >
                        Nueva búsqueda
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Citas List */}
              {activeCitas.length === 0 ? (
                <Card className="border-gray-200 dark:border-border shadow-lg dark:bg-card">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
                    <p className="text-lg font-medium text-foreground">No hay citas pendientes</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {canceledIds.length > 0
                        ? "Todas tus citas han sido canceladas exitosamente."
                        : "No tienes citas que puedan ser canceladas en este momento."}
                    </p>
                    <Button
                      onClick={() => router.push("/agendamiento")}
                      className="mt-6 bg-primary hover:bg-primary/90 text-white"
                    >
                      Volver al Inicio
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-foreground">
                    Citas Cancelables ({activeCitas.length})
                  </h2>

                  <AnimatePresence mode="popLayout">
                    {activeCitas.map((cita) => (
                      <motion.div
                        key={cita.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95, height: 0, marginBottom: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Card className="border-gray-200 dark:border-border shadow-sm dark:bg-card">
                          <CardContent className="p-4 md:p-6">
                            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                              <div className="flex-1 space-y-3">
                                {/* Reference number */}
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3 className="font-semibold text-foreground">{cita.numeroCita}</h3>
                                  <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                                    {cita.servicio}
                                  </Badge>
                                </div>

                                {/* Details grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <span>
                                      {new Date(cita.fechaCita + "T00:00:00").toLocaleDateString("es-EC", {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                      })} - {cita.horaCita}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Car className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <span>{cita.vehiculo.marca} {cita.vehiculo.modelo} - {cita.vehiculo.placa}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <span>{cita.sucursal}</span>
                                  </div>
                                </div>

                                {cita.subtipoServicio && (
                                  <p className="text-xs text-muted-foreground">
                                    Subtipo: {cita.subtipoServicio}
                                  </p>
                                )}
                              </div>

                              {/* Cancel button */}
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleCancelClick(cita)}
                                disabled={canceling}
                                className="w-full md:w-auto shrink-0"
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                Cancelar Cita
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Cancelación</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Si deseas agendar un nuevo servicio, deberás crear una nueva cita.
            </AlertDialogDescription>
            {selectedCita && (
              <div className="mt-4 space-y-2 rounded-lg border border-border bg-muted/50 p-4">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-semibold">Cita:</span>
                  <span>{selectedCita.numeroCita}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-semibold">Fecha:</span>
                  <span>
                    {new Date(selectedCita.fechaCita + "T00:00:00").toLocaleDateString("es-EC", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })} - {selectedCita.horaCita}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-semibold">Vehículo:</span>
                  <span>{selectedCita.vehiculo.marca} {selectedCita.vehiculo.modelo} - {selectedCita.vehiculo.placa}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-semibold">Servicio:</span>
                  <span>{selectedCita.servicio}</span>
                </div>
              </div>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Volver</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCancel}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Sí, Cancelar Cita
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
