"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Car, ScanLine, AlertCircle } from "lucide-react"
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
  const [showOCRVerificationAlert, setShowOCRVerificationAlert] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

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
      color: "",
      vin: "",
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
        color: "",
        vin: "",
      })
      setSelectedMarca("")
      setSelectedModelo("")
      setDatosOCRNoEncontrados(null)
      setApiError(null)
    }
  }, [open, reset, kilometrajeInicial])

  const handleDatosMatriculaExtraidos = (response: any) => {
    // Resetear datos no encontrados
    setDatosOCRNoEncontrados(null)

    const datos = response.datos_extraidos || response
    const sugerenciaIA = response.sugerencia_ia

    // Autocompletar los campos con los datos extraídos
    if (datos.PLACA_ACTUAL) {
      const placaFormatted = datos.PLACA_ACTUAL.toUpperCase().replace(/[^A-Z0-9]/g, "")
      setValue("placa", placaFormatted)
    }
    if (datos.ANIO_MODELO) {
      setValue("anio", parseInt(datos.ANIO_MODELO))
    }
    // Usar COLOR_1 de la respuesta de la API
    if (datos.COLOR_1) {
      // Capitalizar primera letra, resto minúsculas
      const colorFormatted = datos.COLOR_1.charAt(0).toUpperCase() + datos.COLOR_1.slice(1).toLowerCase()
      setValue("color", colorFormatted)
    }
    // Usar NUMERO_VIN_CHASIS de la respuesta de la API
    if (datos.NUMERO_VIN_CHASIS) {
      // VIN en mayúsculas, sin caracteres I, O, Q
      const vinValue = datos.NUMERO_VIN_CHASIS.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, "").slice(0, 17)
      setValue("vin", vinValue)
    }

    // Función helper para normalizar strings (sin espacios, minúsculas)
    const normalizar = (str: string) => str.toLowerCase().replace(/\s+/g, "")

    let modeloEncontrado = false
    let marcaNoEncontrada = false
    let modeloNoEncontrado = false
    const datosNoEncontrados: { marca?: string; modelo?: string } = {}

    // Buscar marca y modelo en el catálogo
    if (catalogoMarcas.length > 0) {
      // Primero intentar match exacto del MODELO del OCR (sin considerar espacios)
      if (datos.MODELO) {
        const modeloNormalizado = normalizar(datos.MODELO)

        // Buscar en todas las marcas
        for (const marca of catalogoMarcas) {
          const modeloMatch = marca.modelos.find(
            (mod) => normalizar(mod.nombre) === modeloNormalizado
          )

          if (modeloMatch) {
            setSelectedMarca(marca.id.toString())
            setValue("marca", marca.id.toString())
            setSelectedModelo(modeloMatch.id.toString())
            setValue("modelo", modeloMatch.id.toString())
            modeloEncontrado = true
            break
          }
        }
      }

      // Si no se encontró match exacto, usar sugerencia de IA
      if (!modeloEncontrado && sugerenciaIA) {
        if (sugerenciaIA.MARCA_OTRO) {
          const marcaNormalizadaIA = normalizar(sugerenciaIA.MARCA_OTRO)

          // Buscar marca de IA
          const marcaIA = catalogoMarcas.find(
            (m) => normalizar(m.nombre) === marcaNormalizadaIA
          )

          if (marcaIA) {
            setSelectedMarca(marcaIA.id.toString())
            setValue("marca", marcaIA.id.toString())

            if (sugerenciaIA.MODELO_OTRO) {
              const modeloNormalizadoIA = normalizar(sugerenciaIA.MODELO_OTRO)

              // Buscar modelo de IA en esa marca (match exacto)
              let modeloIA = marcaIA.modelos.find(
                (mod) => normalizar(mod.nombre) === modeloNormalizadoIA
              )

              // Si no hay match exacto, buscar match parcial (el modelo del catálogo está contenido en la sugerencia)
              if (!modeloIA) {
                modeloIA = marcaIA.modelos.find(
                  (mod) => {
                    const modNormalizado = normalizar(mod.nombre)
                    return modeloNormalizadoIA.includes(modNormalizado) || modNormalizado.includes(modeloNormalizadoIA)
                  }
                )
              }

              if (modeloIA) {
                setSelectedModelo(modeloIA.id.toString())
                setValue("modelo", modeloIA.id.toString())
                modeloEncontrado = true
              } else {
                // Marca encontrada pero modelo no, buscar "Otro" en modelos de esa marca
                const otroModelo = marcaIA.modelos.find(
                  (mod) => mod.nombre.toLowerCase() === "otro"
                )
                if (otroModelo) {
                  setSelectedModelo(otroModelo.id.toString())
                  setValue("modelo", otroModelo.id.toString())
                  modeloEncontrado = true
                }
              }
            }
          }
        }
      }

      // Si aún no se encontró, buscar marca original del OCR
      if (!modeloEncontrado && datos.MARCA) {
        const marcaNormalizada = normalizar(datos.MARCA)
        const marcaEncontrada = catalogoMarcas.find(
          (m) => normalizar(m.nombre) === marcaNormalizada
        )

        if (marcaEncontrada) {
          setSelectedMarca(marcaEncontrada.id.toString())
          setValue("marca", marcaEncontrada.id.toString())

          // Buscar opción "Otro" en modelos
          modeloNoEncontrado = true
          datosNoEncontrados.modelo = datos.MODELO
          const otroModelo = marcaEncontrada.modelos.find(
            (mod) => mod.nombre.toLowerCase() === "otro"
          )
          if (otroModelo) {
            setSelectedModelo(otroModelo.id.toString())
            setValue("modelo", otroModelo.id.toString())
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
    }

    // Guardar datos no encontrados para mostrar mensaje
    if (marcaNoEncontrada || modeloNoEncontrado) {
      setDatosOCRNoEncontrados(datosNoEncontrados)
    }

    toast.success("Datos extraídos exitosamente")

    // Mostrar alerta de verificación OCR/IA
    setShowOCRVerificationAlert(true)
  }

  const onSubmit = async (data: VehiculoFormData) => {
    if (!selectedMarca || !selectedModelo) {
      toast.error("Por favor selecciona la marca y el modelo del vehículo")
      return
    }

    setLoading(true)
    setApiError(null)

    try {
      const token = await getToken()
      if (!token) {
        toast.error("No se encontró token de autenticación")
        return
      }

      const vehiculoData = {
        cliente: clienteId,
        placa: data.placa.toUpperCase(),
        marca: parseInt(selectedMarca),
        modelo: parseInt(selectedModelo),
        anio_fabricacion: data.anio,
        kilometraje_actual: data.kilometraje,
        color: data.color.trim(),
        vin: data.vin.trim().toUpperCase(),
      }

      const vehiculoResponse = await registrarVehiculoAPI(vehiculoData, token)

      toast.success("Vehículo registrado exitosamente")
      onVehiculoRegistrado(vehiculoResponse)
      reset()
      onClose()
    } catch (error: any) {
      console.error("Error registrando vehículo:", error)

      // Extraer mensaje de error de la API
      let errorMessage = "No se pudo registrar el vehículo"

      if (error?.errors?.placa) {
        // Error de placa duplicada u otro error relacionado con placa
        errorMessage = Array.isArray(error.errors.placa)
          ? error.errors.placa[0]
          : error.errors.placa
      } else if (error?.errors?.vin) {
        // Error de VIN duplicado
        errorMessage = Array.isArray(error.errors.vin)
          ? error.errors.vin[0]
          : error.errors.vin
      } else if (error?.message) {
        errorMessage = error.message
      }

      setApiError(errorMessage)
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
                    <SelectTrigger className="mt-1 border-gray-300 focus:border-[#ED1C24] focus:ring-[#ED1C24] w-full">
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
                    <SelectTrigger className="mt-1 border-gray-300 w-full">
                      <SelectValue placeholder="Primero selecciona una marca" />
                    </SelectTrigger>
                  </Select>
                ) : (
                  <Select value={selectedModelo} onValueChange={setSelectedModelo}>
                    <SelectTrigger className="mt-1 border-gray-300 focus:border-[#ED1C24] focus:ring-[#ED1C24] w-full">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Color */}
              <div>
                <Label htmlFor="color">
                  Color <span className="text-[#ED1C24]">*</span>
                </Label>
                <Input
                  id="color"
                  {...register("color")}
                  placeholder="Ej: Blanco, Negro, Rojo"
                  maxLength={30}
                  className="mt-1 border-gray-300 focus:border-[#ED1C24] focus:ring-[#ED1C24] w-full"
                  onChange={(e) => {
                    let value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '')
                    if (value.length > 0) {
                      value = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
                    }
                    setValue("color", value)
                    e.target.value = value
                  }}
                />
                {errors.color && (
                  <p className="text-sm text-[#ED1C24] mt-1">{errors.color.message}</p>
                )}
              </div>

              {/* VIN */}
              <div>
                <Label htmlFor="vin">
                  VIN (Número de Chasis) <span className="text-[#ED1C24]">*</span>
                </Label>
                <Input
                  id="vin"
                  {...register("vin")}
                  placeholder="Ej: 1HGCM82633A004352"
                  className="mt-1 border-gray-300 focus:border-[#ED1C24] focus:ring-[#ED1C24] w-full uppercase"
                  maxLength={17}
                  onChange={(e) => {
                    const value = e.target.value
                      .toUpperCase()
                      .replace(/[^A-HJ-NPR-Z0-9]/g, '')
                      .slice(0, 17)

                    setValue("vin", value)
                    e.target.value = value
                  }}
                />
                {errors.vin && (
                  <p className="text-sm text-[#ED1C24] mt-1">{errors.vin.message}</p>
                )}
              </div>
            </div>

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

            {/* Alerta de verificación OCR/IA */}
            {showOCRVerificationAlert && (
              <Alert className="border-amber-200 bg-amber-50">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-900 text-sm">
                  <strong>Información extraída con OCR e IA.</strong> Los datos han sido autocompletados automáticamente. Por favor, verifica que toda la información sea correcta antes de continuar.
                </AlertDescription>
              </Alert>
            )}

            {/* Alerta de error de API */}
            {apiError && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-900 text-sm">
                  {apiError}
                </AlertDescription>
              </Alert>
            )}

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

