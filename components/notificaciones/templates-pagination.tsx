"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

interface TemplatesPaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  isLoading?: boolean
}

/**
 * Componente de paginación para plantillas de notificación
 *
 * Características:
 * - Muestra máximo 5 números de página con dots
 * - Botones anterior/siguiente
 * - Animación de entrada
 * - Soporte para dark mode
 */
export function TemplatesPagination({
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false,
}: TemplatesPaginationProps) {
  /**
   * Genera los números de página visibles con dots para rangos grandes
   * Ejemplo: [1, 2, 3, '...', 10] o [1, '...', 4, 5, 6, '...', 10]
   */
  const getVisiblePages = (): (number | string)[] => {
    const delta = 2
    const range: number[] = []
    const rangeWithDots: (number | string)[] = []
    let lastPage: number | undefined

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        range.push(i)
      }
    }

    for (const page of range) {
      if (lastPage !== undefined) {
        if (page - lastPage === 2) {
          rangeWithDots.push(lastPage + 1)
        } else if (page - lastPage !== 1) {
          rangeWithDots.push("...")
        }
      }
      rangeWithDots.push(page)
      lastPage = page
    }

    return rangeWithDots
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="flex items-center justify-center gap-2 mt-6"
    >
      {/* Botón Anterior */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1 || isLoading}
        className="h-9 w-9 dark:border-gray-700 dark:hover:bg-gray-800"
        aria-label="Página anterior"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* Números de página */}
      <div className="flex items-center gap-1">
        {getVisiblePages().map((page, index) =>
          page === "..." ? (
            <span
              key={`dots-${index}`}
              className="px-2 text-muted-foreground select-none"
            >
              ...
            </span>
          ) : (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="icon"
              onClick={() => onPageChange(page as number)}
              disabled={isLoading || currentPage === page}
              className={`h-9 w-9 ${
                currentPage === page
                  ? "bg-primary text-primary-foreground"
                  : "dark:border-gray-700 dark:hover:bg-gray-800"
              }`}
              aria-label={`Ir a página ${page}`}
              aria-current={currentPage === page ? "page" : undefined}
            >
              {page}
            </Button>
          )
        )}
      </div>

      {/* Botón Siguiente */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || isLoading}
        className="h-9 w-9 dark:border-gray-700 dark:hover:bg-gray-800"
        aria-label="Página siguiente"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </motion.div>
  )
}
