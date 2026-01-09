"use client"

import { motion } from "framer-motion"
import { Search, Wrench, ArrowRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface ServiceModeSelectorProps {
  onSelectMode: (mode: "buscar-cliente" | "mis-servicios") => void
  userName?: string
}

export function ServiceModeSelector({ onSelectMode, userName }: ServiceModeSelectorProps) {
  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="w-full max-w-4xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Mis Servicios
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Selecciona una opción para continuar
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Buscar Cliente */}
          <motion.div
            whileHover={{ scale: 1.02, boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            <Card
              className="cursor-pointer h-full border-2 hover:border-primary/50 transition-colors bg-white dark:bg-gray-950"
              onClick={() => onSelectMode("buscar-cliente")}
            >
              <CardHeader className="text-center pb-4">
                <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-4">
                  <Search className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl text-gray-900 dark:text-white">Buscar Cliente</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Consulta los servicios de un cliente específico
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button
                  onClick={() => onSelectMode("buscar-cliente")}
                  className="w-full"
                  size="lg"
                >
                  Buscar Ahora
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Card 2: Mis Servicios */}
          <motion.div
            whileHover={{ scale: 1.02, boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            <Card
              className="cursor-pointer h-full border-2 hover:border-primary/50 transition-colors bg-white dark:bg-gray-950"
              onClick={() => onSelectMode("mis-servicios")}
            >
              <CardHeader className="text-center pb-4">
                <div className="mx-auto h-16 w-16 rounded-full bg-green-500/10 dark:bg-green-500/20 flex items-center justify-center mb-4">
                  <Wrench className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-xl text-gray-900 dark:text-white">Mis Servicios</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Revisa tus vehículos personales en el taller
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button
                  onClick={() => onSelectMode("mis-servicios")}
                  className="w-full"
                  size="lg"
                  variant="outline"
                >
                  Ver Mis Servicios
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
