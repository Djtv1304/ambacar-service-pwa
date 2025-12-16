"use client"

import { useState } from "react"
import { Package, ChevronDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
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
              className="w-full justify-between p-0 h-auto hover:bg-transparent"
            >
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
            </Button>
          </CollapsibleTrigger>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="pt-0">
            <ScrollArea className="h-64">
              <div className="space-y-1">
                {/* Table header */}
                <div className="grid grid-cols-12 gap-2 px-2 py-1.5 bg-muted/50 rounded-md text-xs font-medium text-muted-foreground">
                  <div className="col-span-1">Cant.</div>
                  <div className="col-span-7">Descripción</div>
                  <div className="col-span-4 text-right">Código</div>
                </div>

                {/* Table rows */}
                {parts.map((part) => (
                  <div
                    key={part.id}
                    className="grid grid-cols-12 gap-2 px-2 py-2 text-sm border-b border-border/50 last:border-0"
                  >
                    <div className="col-span-1 font-medium">
                      {part.cantidad}
                    </div>
                    <div className="col-span-7 truncate" title={part.descripcion}>
                      {part.descripcion}
                    </div>
                    <div className="col-span-4 text-right font-mono text-xs text-muted-foreground truncate">
                      {part.codigo}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Summary footer */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t">
              <span className="text-sm text-muted-foreground">
                Total ({totalParts} items)
              </span>
              <span className="text-lg font-bold">
                ${totalCost.toFixed(2)}
              </span>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}

