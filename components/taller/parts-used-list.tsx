"use client"

import { useState } from "react"
import { Package, ChevronDown } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import type { PartUsed } from "@/lib/fixtures/technical-progress"
import { cn } from "@/lib/utils"

interface PartsUsedListProps {
  parts: PartUsed[]
}

export function PartsUsedList({ parts }: PartsUsedListProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const totalParts = parts.length
  const totalCost = parts.reduce((acc, p) => acc + (p.cantidad * p.precioUnitario), 0)

  if (parts.length === 0) {
    return null
  }

  return (
    <Card>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CardHeader className="pb-3">
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="w-full p-0 h-auto hover:bg-transparent"
            >
              {/* Mobile: Single row - No price (shown in footer) */}
              <div className="flex items-center justify-between w-full sm:hidden">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-base">Repuestos Utilizados</CardTitle>
                  <Badge variant="secondary" className="font-normal">
                    {totalParts}
                  </Badge>
                </div>
                <ChevronDown className={cn(
                  "h-4 w-4 transition-transform text-muted-foreground shrink-0",
                  isExpanded && "rotate-180"
                )} />
              </div>

              {/* Desktop: Single row layout */}
              <div className="hidden sm:flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-base">Repuestos Utilizados</CardTitle>
                  <Badge variant="secondary" className="font-normal">
                    {totalParts}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">${totalCost.toFixed(2)}</span>
                  <ChevronDown className={cn(
                    "h-4 w-4 transition-transform text-muted-foreground",
                    isExpanded && "rotate-180"
                  )} />
                </div>
              </div>
            </Button>
          </CollapsibleTrigger>
        </CardHeader>

        <CollapsibleContent forceMount>
          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{
                  height: "auto",
                  opacity: 1,
                  transition: {
                    height: {
                      duration: 0.3,
                      ease: [0.4, 0.0, 0.2, 1] // ease-out curve
                    },
                    opacity: {
                      duration: 0.25,
                      ease: "easeOut"
                    }
                  }
                }}
                exit={{
                  height: 0,
                  opacity: 0,
                  transition: {
                    height: {
                      duration: 0.25,
                      ease: [0.4, 0.0, 0.2, 1]
                    },
                    opacity: {
                      duration: 0.2,
                      ease: "easeIn"
                    }
                  }
                }}
                style={{ overflow: "hidden" }}
              >
                <CardContent className="pt-0">
                  <motion.div
                    initial={{ y: -10 }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    {/* Scrollable container - both vertical and horizontal */}
                    <div className="overflow-x-auto overflow-y-auto max-h-64 -mx-6 px-6 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                      <div className="space-y-1 min-w-[500px]">
                        {/* Table header */}
                        <div className="grid grid-cols-12 gap-3 px-2 py-1.5 bg-muted/50 dark:bg-muted/30 rounded-md text-xs font-medium text-muted-foreground sticky top-0 z-10">
                          <div className="col-span-2">Cant.</div>
                          <div className="col-span-6">Descripción</div>
                          <div className="col-span-4 text-right">Código</div>
                        </div>

                        {/* Table rows */}
                        {parts.map((part, index) => (
                          <motion.div
                            key={part.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{
                              duration: 0.3,
                              delay: index * 0.03, // Stagger effect
                              ease: "easeOut"
                            }}
                            className="grid grid-cols-12 gap-3 px-2 py-2 text-sm border-b border-border/50 last:border-0"
                          >
                            <div className="col-span-2 font-medium">
                              {part.cantidad}
                            </div>
                            <div className="col-span-6" title={part.descripcion}>
                              <div className="line-clamp-2 sm:line-clamp-1">
                                {part.descripcion}
                              </div>
                            </div>
                            <div className="col-span-4 text-right font-mono text-xs text-muted-foreground">
                              <div className="break-all sm:truncate" title={part.codigo}>
                                {part.codigo}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Summary footer */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.15 }}
                      className="flex items-center justify-between mt-3 pt-3 border-t"
                    >
                      <span className="text-sm text-muted-foreground">
                        Total ({totalParts} items)
                      </span>
                      <span className="text-lg font-bold">
                        ${totalCost.toFixed(2)}
                      </span>
                    </motion.div>
                  </motion.div>
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}

