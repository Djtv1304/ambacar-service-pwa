"use client"
import { Check, X, Minus } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { ChecklistItem } from "@/lib/types"

interface VehicleChecklistProps {
  title: string
  items: string[]
  value: ChecklistItem[]
  onChange: (items: ChecklistItem[]) => void
}

const estadoOptions = [
  { value: "bueno", label: "Bueno", icon: Check, color: "text-green-500 bg-green-500/10 border-green-500/20" },
  { value: "regular", label: "Regular", icon: Minus, color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20" },
  { value: "malo", label: "Malo", icon: X, color: "text-red-500 bg-red-500/10 border-red-500/20" },
  { value: "no_aplica", label: "N/A", icon: Minus, color: "text-gray-500 bg-gray-500/10 border-gray-500/20" },
] as const

export function VehicleChecklist({ title, items, value, onChange }: VehicleChecklistProps) {
  const getItemState = (itemName: string) => {
    return value.find((v) => v.item === itemName) || { item: itemName, estado: "bueno" as const, observacion: "" }
  }

  const updateItem = (itemName: string, updates: Partial<ChecklistItem>) => {
    const newValue = value.filter((v) => v.item !== itemName)
    newValue.push({ ...getItemState(itemName), ...updates })
    onChange(newValue)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>Marca el estado de cada elemento</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => {
          const itemState = getItemState(item)

          return (
            <div key={item} className="space-y-2 rounded-lg border border-border p-4">
              <Label className="text-sm font-medium">{item}</Label>
              <div className="flex flex-wrap gap-2">
                {estadoOptions.map((option) => {
                  const Icon = option.icon
                  const isSelected = itemState.estado === option.value

                  return (
                    <Button
                      key={option.value}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => updateItem(item, { estado: option.value })}
                      className={cn("gap-2", isSelected && option.color)}
                    >
                      <Icon className="h-4 w-4" />
                      {option.label}
                    </Button>
                  )
                })}
              </div>
              {(itemState.estado === "regular" || itemState.estado === "malo") && (
                <Textarea
                  placeholder="Observaciones adicionales..."
                  value={itemState.observacion || ""}
                  onChange={(e) => updateItem(item, { observacion: e.target.value })}
                  rows={2}
                  className="mt-2"
                />
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
