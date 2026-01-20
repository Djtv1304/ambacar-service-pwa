"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { tallerOptions, marcaOptions, modeloOptions } from "@/lib/fixtures/predictive-data"
import { Building2, Car, Wrench } from "lucide-react"

interface PredictiveFiltersProps {
  taller: string
  marca: string
  modelo: string
  onTallerChange: (value: string) => void
  onMarcaChange: (value: string) => void
  onModeloChange: (value: string) => void
}

export function PredictiveFilters({
  taller,
  marca,
  modelo,
  onTallerChange,
  onMarcaChange,
  onModeloChange,
}: PredictiveFiltersProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-3">
      {/* Taller Filter */}
      <div className="flex items-center gap-2 flex-1">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 dark:bg-blue-500/20">
          <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        </div>
        <Select value={taller} onValueChange={onTallerChange}>
          <SelectTrigger className="w-full bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800">
            <SelectValue placeholder="Seleccionar taller" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800">
            {tallerOptions.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-800"
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Marca Filter */}
      <div className="flex items-center gap-2 flex-1">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-500/10 dark:bg-green-500/20">
          <Car className="h-4 w-4 text-green-600 dark:text-green-400" />
        </div>
        <Select value={marca} onValueChange={onMarcaChange}>
          <SelectTrigger className="w-full bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800">
            <SelectValue placeholder="Seleccionar marca" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800">
            {marcaOptions.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-800"
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Modelo Filter */}
      <div className="flex items-center gap-2 flex-1">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 dark:bg-purple-500/20">
          <Wrench className="h-4 w-4 text-purple-600 dark:text-purple-400" />
        </div>
        <Select value={modelo} onValueChange={onModeloChange}>
          <SelectTrigger className="w-full bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800">
            <SelectValue placeholder="Seleccionar modelo" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800">
            {modeloOptions.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-800"
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
