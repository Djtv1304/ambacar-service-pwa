"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Car, ScanLine } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { vehiculoSchema, type VehiculoFormData } from "@/lib/validations/agendamiento"
import { registrarVehiculoAPI, getCatalogo } from "@/lib/api/agendamiento"
import { useAuthToken } from "@/hooks/use-auth-token"
import { toast } from "sonner"
import { EscanearMatriculaDialog } from "./escanear-matricula-dialog"

interface RegistrarVehiculoModalProps {
  open: boolean
  onClose: () => void
  clienteId: number
  kilometrajeInicial: number
  onVehiculoRegistrado: (vehiculo: any) => void
}

export function RegistrarVehiculoModal({
  open,
  onClose,
  clienteId,
  kilometrajeInicial,
  onVehiculoRegistrado,
}: RegistrarVehiculoModalProps) {
  const { getToken } = useAuthToken()
  const [loading, setLoading] = useState(false)
  const [loadingCatalogo, setLoadingCatalogo] = useState(false)
  const [showEscanearMatricula, setShowEscanearMatricula] = useState(false)

  // Catalog state
  const [catalogoMarcas, setCatalogoMarcas] = useState<
    Array<{
      id: number | string
      nombre: string
      logo: string | null
      orden: number
      modelos: Array<{
        id: number | string
        nombre: string
        orden: number
      }>
    }>
  >([])
  const [selectedMarca, setSelectedMarca] = useState<string>("")
  const [selectedModelo, setSelectedModelo] = useState<string>("")

  // Estado para datos OCR no encontrados en catálogo
  const [datosOCRNoEncontrados, setDatosOCRNoEncontrados] = useState<{
    marca?: string
    modelo?: string
  } | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<VehiculoFormData>({
    resolver: zodResolver(vehiculoSchema),
    defaultValues: {
      placa: "",
      marca: "",
      modelo: "",
      anio: new Date().getFullYear(),
      kilometraje: kilometrajeInicial,
    },
  })

  // Load catalog
  useEffect(() => {
    const loadCatalogo = async () => {
      setLoadingCatalogo(true)
      try {
        const catalogoData = await getCatalogo()
        setCatalogoMarcas(catalogoData.marcas)
      } catch (error) {
        console.error("Error cargando catálogo:", error)
        toast.error("Error al cargar las marcas y modelos")
      } finally {
        setLoadingCatalogo(false)
      }
    }

    if (open) {
      loadCatalogo()
    }
  }, [open])

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      reset({
        placa: "",
        marca: "",
        modelo: "",
        anio: new Date().getFullYear(),
        kilometraje: kilometrajeInicial,
      })
      setSelectedMarca("")
      setSelectedModelo("")
      setDatosOCRNoEncontrados(null)
    }
  }, [open, reset, kilometrajeInicial])

  const handleDatosMatriculaExtraidos = (datos: any) => {
    // Resetear datos no encontrados
    setDatosOCRNoEncontrados(null)

    // Autocompletar los campos con los datos extraídos
    if (datos.PLACA_ACTUAL) {
      setValue("placa", datos.PLACA_ACTUAL)
    }
    if (datos.ANIO_MODELO) {
      setValue("anio", parseInt(datos.ANIO_MODELO))
    }

    let marcaNoEncontrada = false
    let modeloNoEncontrado = false
    const datosNoEncontrados: { marca?: string; modelo?: string } = {}

    // Buscar marca en el catálogo
    if (datos.MARCA && catalogoMarcas.length > 0) {
      const marcaEncontrada = catalogoMarcas.find(
        (m) => m.nombre.toLowerCase() === datos.MARCA.toLowerCase()
      )

      if (marcaEncontrada) {
        setSelectedMarca(marcaEncontrada.id.toString())
        setValue("marca", marcaEncontrada.id.toString())

        // Buscar modelo en el catálogo
        if (datos.MODELO) {
          const modeloEncontrado = marcaEncontrada.modelos.find(
            (mod) => mod.nombre.toLowerCase().includes(datos.MODELO.toLowerCase()) ||
                     datos.MODELO.toLowerCase().includes(mod.nombre.toLowerCase())
          )

          if (modeloEncontrado) {
            setSelectedModelo(modeloEncontrado.id.toString())
            setValue("modelo", modeloEncontrado.id.toString())
          } else {
            // Modelo no encontrado, buscar opción "Otro"
            modeloNoEncontrado = true
            datosNoEncontrados.modelo = datos.MODELO
            const otroModelo = marcaEncontrada.modelos.find(
              (mod) => mod.nombre.toLowerCase() === "otro"
            )
            if (otroModelo) {
              setSelectedModelo(otroModelo.id.toString())
              setValue("modelo", otroModelo.id.toString())
            }
          }
        }
      } else {
        // Marca no encontrada, buscar opción "Otro"
        marcaNoEncontrada = true
        datosNoEncontrados.marca = datos.MARCA
        if (datos.MODELO) {
          datosNoEncontrados.modelo = datos.MODELO
        }

        const otraMarca = catalogoMarcas.find(
          (m) => m.nombre.toLowerCase() === "otro"
        )
        if (otraMarca) {
          setSelectedMarca(otraMarca.id.toString())
          setValue("marca", otraMarca.id.toString())

          // Buscar opción "Otro" en modelos
          const otroModelo = otraMarca.modelos.find(
            (mod) => mod.nombre.toLowerCase() === "otro"
          )
          if (otroModelo) {
            setSelectedModelo(otroModelo.id.toString())
            setValue("modelo", otroModelo.id.toString())
          }
        }
      }
    }

    // Guardar datos no encontrados para mostrar mensaje
    if (marcaNoEncontrada || modeloNoEncontrado) {
      setDatosOCRNoEncontrados(datosNoEncontrados)
    }

    toast.success("Datos extraídos exitosamente")
  }

  const onSubmit = async (data: VehiculoFormData) => {
    if (!selectedMarca || !selectedModelo) {
      toast.error("Por favor selecciona la marca y el modelo del vehículo")
      return
    }

    setLoading(true)
    try {
      const token = await getToken()
      if (!token) {
        toast.error("No se encontró token de autenticación")
        return
      }

      const vehiculoData = {
        cliente: clienteId,
        placa: data.placa,
        marca: parseInt(selectedMarca),
        modelo: parseInt(selectedModelo),
        anio_fabricacion: data.anio,
        kilometraje_actual: data.kilometraje,
      }

      const vehiculoResponse = await registrarVehiculoAPI(vehiculoData, token)

      toast.success("Vehículo registrado exitosamente")
      onVehiculoRegistrado(vehiculoResponse)
      reset()
      onClose()
    } catch (error: any) {
      console.error("Error registrando vehículo:", error)
      toast.error(error?.message || "No se pudo registrar el vehículo")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl bg-white border-gray-200 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#202020] flex items-center gap-2">
              <Car className="h-6 w-6 text-[#ED1C24]" />
              Registrar Vehículo
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
            {/* Alert sobre escanear matrícula */}
            <Alert className="border-blue-200 bg-blue-50">
              <ScanLine className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-900 text-sm">
                <strong>¿Sabías que puedes escanear la matrícula?</strong>
                <br />
                Si subes o capturas una imagen de la matrícula del vehículo, los campos de placa, marca, modelo y año se autocompletarán.
              </AlertDescription>
            </Alert>

            {/* Botón de Escanear Matrícula */}
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowEscanearMatricula(true)}
              className="w-full border-[#ED1C24] text-[#ED1C24] hover:bg-[#ED1C24]/10"
            >
              <ScanLine className="mr-2 h-4 w-4" />
              Escanear Matrícula
            </Button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Placa */}
              <div>
                <Label htmlFor="placa">
                  Placa <span className="text-[#ED1C24]">*</span>
                </Label>
                <Input
                  id="placa"
                  {...register("placa")}
                  placeholder="ABC-1234"
                  className="mt-1 border-gray-300 focus:border-[#ED1C24] focus:ring-[#ED1C24]"
                />
                {errors.placa && (
                  <p className="text-sm text-[#ED1C24] mt-1">{errors.placa.message}</p>
                )}
              </div>

              {/* Año */}
              <div>
                <Label htmlFor="anio">
                  Año <span className="text-[#ED1C24]">*</span>
                </Label>
                <Input
                  id="anio"
                  type="number"
                  {...register("anio", { valueAsNumber: true })}
                  placeholder="2020"
                  className="mt-1 border-gray-300 focus:border-[#ED1C24] focus:ring-[#ED1C24]"
                />
                {errors.anio && (
                  <p className="text-sm text-[#ED1C24] mt-1">{errors.anio.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Marca */}
              <div>
                <Label htmlFor="marca">
                  Marca <span className="text-[#ED1C24]">*</span>
                </Label>
                {loadingCatalogo ? (
                  <div className="mt-1 p-3 border border-gray-200 rounded-lg flex items-center justify-center">
                    <Loader2 className="h-4 w-4 animate-spin text-[#ED1C24] mr-2" />
                    <span className="text-sm text-gray-600">Cargando marcas...</span>
                  </div>
                ) : (
                  <Select value={selectedMarca} onValueChange={setSelectedMarca}>
                    <SelectTrigger className="mt-1 border-gray-300 focus:border-[#ED1C24] focus:ring-[#ED1C24]">
                      <SelectValue placeholder="Selecciona una marca" />
                    </SelectTrigger>
                    <SelectContent>
                      {catalogoMarcas.map((marca) => (
                        <SelectItem key={marca.id} value={marca.id.toString()}>
                          {marca.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {errors.marca && (
                  <p className="text-sm text-[#ED1C24] mt-1">{errors.marca.message}</p>
                )}
              </div>

              {/* Modelo */}
              <div>
                <Label htmlFor="modelo">
                  Modelo <span className="text-[#ED1C24]">*</span>
                </Label>
                {loadingCatalogo ? (
                  <div className="mt-1 p-3 border border-gray-200 rounded-lg flex items-center justify-center">
                    <Loader2 className="h-4 w-4 animate-spin text-[#ED1C24] mr-2" />
                    <span className="text-sm text-gray-600">Cargando modelos...</span>
                  </div>
                ) : !selectedMarca ? (
                  <Select disabled>
                    <SelectTrigger className="mt-1 border-gray-300">
                      <SelectValue placeholder="Primero selecciona una marca" />
                    </SelectTrigger>
                  </Select>
                ) : (
                  <Select value={selectedModelo} onValueChange={setSelectedModelo}>
                    <SelectTrigger className="mt-1 border-gray-300 focus:border-[#ED1C24] focus:ring-[#ED1C24]">
                      <SelectValue placeholder="Selecciona un modelo" />
                    </SelectTrigger>
                    <SelectContent>
                      {catalogoMarcas
                        .find((m) => m.id.toString() === selectedMarca)
                        ?.modelos.map((modelo) => (
                          <SelectItem key={modelo.id} value={modelo.id.toString()}>
                            {modelo.nombre}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                )}
                {errors.modelo && (
                  <p className="text-sm text-[#ED1C24] mt-1">{errors.modelo.message}</p>
                )}
              </div>
            </div>

            {/* Mensaje informativo sobre datos OCR no encontrados */}
            {datosOCRNoEncontrados && (
              <Alert className="border-amber-200 bg-amber-50">
                <ScanLine className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-900 text-sm">
                  <strong>Información de la matrícula escaneada:</strong>
                  <div className="mt-2 space-y-1">
                    {datosOCRNoEncontrados.marca && (
                      <p>
                        • <strong>Marca detectada:</strong> {datosOCRNoEncontrados.marca}
                        <br />
                        <span className="text-xs italic">No se encontró en nuestro catálogo. Se ha seleccionado "Otro" automáticamente.</span>
                      </p>
                    )}
                    {datosOCRNoEncontrados.modelo && (
                      <p>
                        • <strong>Modelo detectado:</strong> {datosOCRNoEncontrados.modelo}
                        <br />
                        <span className="text-xs italic">No se encontró en nuestro catálogo. Se ha seleccionado "Otro" automáticamente.</span>
                      </p>
                    )}
                  </div>
                  <p className="mt-2 text-xs">
                    Por favor, verifica que la información sea correcta o ajusta manualmente los campos.
                  </p>
                </AlertDescription>
              </Alert>
            )}

            {/* Kilometraje */}
            <div>
              <Label htmlFor="kilometraje">
                Kilometraje <span className="text-[#ED1C24]">*</span>
              </Label>
              <Input
                id="kilometraje"
                type="number"
                {...register("kilometraje", { valueAsNumber: true })}
                placeholder="50000"
                className="mt-1 border-gray-300 focus:border-[#ED1C24] focus:ring-[#ED1C24]"
              />
              {errors.kilometraje && (
                <p className="text-sm text-[#ED1C24] mt-1">{errors.kilometraje.message}</p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading || !selectedMarca || !selectedModelo}
                className="flex-1 bg-[#ED1C24] hover:bg-[#c41820] text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registrando...
                  </>
                ) : (
                  "Registrar Vehículo"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Escanear Matrícula */}
      <EscanearMatriculaDialog
        open={showEscanearMatricula}
        onClose={() => setShowEscanearMatricula(false)}
        onDatosExtraidos={handleDatosMatriculaExtraidos}
      />
    </>
  )
}

