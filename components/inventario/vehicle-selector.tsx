"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Car,
  Calendar,
  Gauge,
  Search,
  Loader2,
  ChevronDown,
  Sparkles,
  AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useBrands, useModels } from "@/lib/hooks/use-recommender"
import { PREDICTION_METHODS, type PredictionMethod } from "@/lib/api/recommender"

interface VehicleSelectorProps {
  onPredict: (params: {
    marca: string
    modelo: string
    anio: number
    kilometraje: number
    metodo: PredictionMethod
    n_recomendaciones: number
  }) => void
  isLoading?: boolean
}

export function VehicleSelector({ onPredict, isLoading = false }: VehicleSelectorProps) {
  // Form state
  const [selectedBrand, setSelectedBrand] = useState<string>("")
  const [selectedModel, setSelectedModel] = useState<string>("")
  const [year, setYear] = useState<string>("")
  const [mileage, setMileage] = useState<string>("")
  const [method, setMethod] = useState<PredictionMethod>("knn")
  const [numRecommendations, setNumRecommendations] = useState<string>("10")

  // Popover states
  const [brandOpen, setBrandOpen] = useState(false)
  const [modelOpen, setModelOpen] = useState(false)

  // API hooks
  const { brands, isLoading: brandsLoading, error: brandsError } = useBrands()
  const { models, isLoading: modelsLoading, error: modelsError } = useModels(selectedBrand || null)

  // Reset model when brand changes
  useEffect(() => {
    setSelectedModel("")
  }, [selectedBrand])

  // Generate year options (current year down to 1990)
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: currentYear - 1989 }, (_, i) => currentYear - i)

  // Validation
  const isFormValid =
    selectedBrand &&
    selectedModel &&
    year &&
    mileage &&
    parseInt(mileage) >= 0 &&
    parseInt(year) >= 1990 &&
    parseInt(year) <= currentYear

  const handleSubmit = () => {
    if (!isFormValid) return

    onPredict({
      marca: selectedBrand,
      modelo: selectedModel,
      anio: parseInt(year),
      kilometraje: parseInt(mileage),
      metodo: method,
      n_recomendaciones: parseInt(numRecommendations) || 10,
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-lg overflow-hidden"
    >
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 px-4 py-3 bg-gradient-to-r from-emerald-50 via-cyan-50 to-blue-50 dark:from-emerald-900/20 dark:via-cyan-900/20 dark:to-blue-900/20">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500">
            <Car className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
              Selector de Vehiculo
            </h3>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">
              Selecciona marca, modelo y kilometraje para obtener recomendaciones
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="p-4 space-y-4">
        {/* Brand Selector */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">
            Marca del Vehiculo
          </Label>
          <Popover open={brandOpen} onOpenChange={setBrandOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={brandOpen}
                className="w-full justify-between h-10"
                disabled={brandsLoading}
              >
                {brandsLoading ? (
                  <span className="flex items-center gap-2 text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Cargando marcas...
                  </span>
                ) : selectedBrand ? (
                  <span className="flex items-center gap-2">
                    <Car className="h-4 w-4 text-emerald-500" />
                    {selectedBrand}
                  </span>
                ) : (
                  <span className="text-gray-500">Seleccionar marca...</span>
                )}
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
              <Command>
                <CommandInput placeholder="Buscar marca..." />
                <CommandList>
                  <CommandEmpty>No se encontro la marca.</CommandEmpty>
                  <CommandGroup>
                    {brands.map((brand) => (
                      <CommandItem
                        key={brand}
                        value={brand}
                        onSelect={(value) => {
                          setSelectedBrand(value.toUpperCase())
                          setBrandOpen(false)
                        }}
                      >
                        <Car className={cn(
                          "mr-2 h-4 w-4",
                          selectedBrand === brand ? "text-emerald-500" : "text-gray-400"
                        )} />
                        {brand}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {brandsError && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {brandsError}
            </p>
          )}
        </div>

        {/* Model Selector */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">
            Modelo
          </Label>
          <Popover open={modelOpen} onOpenChange={setModelOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={modelOpen}
                className="w-full justify-between h-10"
                disabled={!selectedBrand || modelsLoading}
              >
                {modelsLoading ? (
                  <span className="flex items-center gap-2 text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Cargando modelos...
                  </span>
                ) : selectedModel ? (
                  <span className="truncate">{selectedModel}</span>
                ) : (
                  <span className="text-gray-500">
                    {selectedBrand ? "Seleccionar modelo..." : "Primero selecciona una marca"}
                  </span>
                )}
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0" align="start">
              <Command>
                <CommandInput placeholder="Buscar modelo..." />
                <CommandList className="max-h-[300px]">
                  <CommandEmpty>No se encontro el modelo.</CommandEmpty>
                  <CommandGroup>
                    {models.map((model) => (
                      <CommandItem
                        key={model}
                        value={model}
                        onSelect={(value) => {
                          // Preserve original case from the model list
                          const originalModel = models.find(
                            m => m.toLowerCase() === value.toLowerCase()
                          )
                          setSelectedModel(originalModel || value)
                          setModelOpen(false)
                        }}
                      >
                        {model}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {modelsError && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {modelsError}
            </p>
          )}
          {selectedBrand && models.length > 0 && (
            <p className="text-[10px] text-gray-500 dark:text-gray-400">
              {models.length} modelos disponibles para {selectedBrand}
            </p>
          )}
        </div>

        {/* Year and Mileage Row */}
        <div className="grid grid-cols-2 gap-3">
          {/* Year */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Anio
            </Label>
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px]">
                {years.map((y) => (
                  <SelectItem key={y} value={y.toString()}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Mileage */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
              <Gauge className="h-3 w-3" />
              Kilometraje
            </Label>
            <Input
              type="number"
              placeholder="ej. 30000"
              value={mileage}
              onChange={(e) => setMileage(e.target.value)}
              className="h-10"
              min={0}
              max={1000000}
            />
          </div>
        </div>

        {/* Advanced Options */}
        <div className="grid grid-cols-2 gap-3">
          {/* Method */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Metodo IA
            </Label>
            <Select value={method} onValueChange={(v) => setMethod(v as PredictionMethod)}>
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PREDICTION_METHODS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Number of Recommendations */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">
              N. Recomendaciones
            </Label>
            <Select value={numRecommendations} onValueChange={setNumRecommendations}>
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 repuestos</SelectItem>
                <SelectItem value="10">10 repuestos</SelectItem>
                <SelectItem value="15">15 repuestos</SelectItem>
                <SelectItem value="20">20 repuestos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={!isFormValid || isLoading}
          className="w-full h-11 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analizando vehiculo...
            </>
          ) : (
            <>
              <Search className="h-4 w-4" />
              Obtener Recomendaciones IA
            </>
          )}
        </Button>
      </div>
    </motion.div>
  )
}
