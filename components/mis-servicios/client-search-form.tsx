"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Search, User, Loader2, X, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

interface ClientSearchFormProps {
  onClientFound: (clientId: string, clientName: string) => void
  isLoading?: boolean
}

interface ClientInfo {
  id: string
  nombre: string
  apellido: string
  cedula: string
  email: string
  telefono: string
}

export function ClientSearchForm({ onClientFound, isLoading = false }: ClientSearchFormProps) {
  const [searchValue, setSearchValue] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!searchValue.trim()) {
      setError("Ingrese una cédula o RUC válido")
      return
    }

    // Validate format (Ecuador: 10 digits for cédula, 13 for RUC)
    const cleanValue = searchValue.replace(/\D/g, "")
    if (cleanValue.length < 10) {
      setError("La cédula debe tener al menos 10 dígitos")
      return
    }

    setError(null)
    setIsSearching(true)

    try {
      // TODO: Replace with actual API call
      // const response = await searchClientByCedula(cleanValue, token)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800))

      // Mock response - In production, this would come from the API
      // Simulating found client for demo
      if (cleanValue === "1712345678" || cleanValue.startsWith("17")) {
        const mockClient: ClientInfo = {
          id: "c1",
          nombre: "Pedro",
          apellido: "González",
          cedula: cleanValue,
          email: "pedro.gonzalez@email.com",
          telefono: "0991234567",
        }

        toast.success("Cliente encontrado", {
          description: `${mockClient.nombre} ${mockClient.apellido}`,
        })

        onClientFound(mockClient.id, `${mockClient.nombre} ${mockClient.apellido}`)
      } else {
        setError("No se encontró un cliente con esa cédula o RUC")
        toast.error("Cliente no encontrado", {
          description: "Verifique el número ingresado",
        })
      }
    } catch (err) {
      console.error("Error searching client:", err)
      setError("Error al buscar el cliente. Intente nuevamente.")
      toast.error("Error de búsqueda")
    } finally {
      setIsSearching(false)
    }
  }

  const handleClear = () => {
    setSearchValue("")
    setError(null)
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <Card className="border-2">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <User className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-xl">Consultar Cliente</CardTitle>
            <CardDescription>
              Ingrese la cédula o RUC del cliente para ver sus servicios
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              {/* Search Input */}
              <div className="relative">
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder="Cédula o RUC (ej: 1712345678)"
                  value={searchValue}
                  onChange={(e) => {
                    setSearchValue(e.target.value)
                    setError(null)
                  }}
                  className={`h-12 text-base pr-10 ${error ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  disabled={isSearching || isLoading}
                  autoComplete="off"
                />
                {searchValue && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleClear}
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                    disabled={isSearching}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Error message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="flex items-center gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-950/30 rounded-lg p-3"
                >
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 text-base"
                disabled={isSearching || isLoading || !searchValue.trim()}
              >
                {isSearching ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Buscando...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-5 w-5" />
                    Buscar Servicios
                  </>
                )}
              </Button>
            </form>

            {/* Helper text */}
            <p className="text-xs text-muted-foreground text-center mt-4">
              La cédula debe tener 10 dígitos. El RUC debe tener 13 dígitos.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

