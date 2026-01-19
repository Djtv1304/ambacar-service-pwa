"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Mail,
  Bell,
  MessageCircle,
  User,
  CreditCard,
  Car,
  Layers,
  Calendar,
  Clock,
  Sparkles,
} from "lucide-react"
import { NotificationTemplateAPI, NotificationChannel } from "@/lib/api/notifications"

interface TemplatePreviewDialogProps {
  template: NotificationTemplateAPI | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Mapeo de iconos por canal
const channelIcons: Record<NotificationChannel, any> = {
  email: Mail,
  push: Bell,
  whatsapp: MessageCircle,
}

// Mapeo de colores por canal
const channelColors: Record<NotificationChannel, string> = {
  push: "text-blue-600 dark:text-blue-400",
  email: "text-purple-600 dark:text-purple-400",
  whatsapp: "text-green-600 dark:text-green-400",
}

// Estilos de variables (para badges)
const VARIABLE_STYLES: Record<string, { icon: any; color: string }> = {
  nombre: { icon: User, color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  placa: { icon: CreditCard, color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
  vehiculo: { icon: Car, color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  fase: { icon: Layers, color: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400" },
  fecha: { icon: Calendar, color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
  hora: { icon: Clock, color: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400" },
}

// Función para renderizar texto con variables resaltadas
function renderWithHighlightedVariables(text: string): React.ReactNode {
  // Split por variables {{Variable}}
  const parts = text.split(/(\{\{[^}]+\}\})/)

  return parts.map((part, index) => {
    // Si es una variable (empieza con {{ y termina con }})
    if (part.match(/^\{\{[^}]+\}\}$/)) {
      const variableName = part.replace(/^\{\{|\}\}$/g, "").toLowerCase()

      // Obtener estilo de la variable
      const style = VARIABLE_STYLES[variableName] || {
        icon: Sparkles,
        color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
      }
      const Icon = style.icon

      return (
        <span
          key={index}
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${style.color}`}
        >
          <Icon className="h-3 w-3" />
          {part}
        </span>
      )
    }

    // Texto normal
    return <span key={index}>{part}</span>
  })
}

// WhatsApp Preview Component
function WhatsAppPreview({ template }: { template: NotificationTemplateAPI }) {
  return (
    <div className="mx-auto max-w-[280px]">
      <div className="bg-gray-900 rounded-[2rem] p-2 shadow-xl">
        <div className="bg-[#0b141a] rounded-[1.5rem] overflow-hidden">
          {/* Status Bar */}
          <div className="bg-[#1f2c34] px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-gray-500" />
              <div className="w-2 h-2 rounded-full bg-gray-500" />
              <div className="w-2 h-2 rounded-full bg-gray-500" />
            </div>
            <p className="text-[10px] text-gray-400">12:30</p>
            <div className="flex items-center gap-1">
              <div className="w-3 h-2 rounded-sm bg-gray-500" />
            </div>
          </div>

          {/* Chat Header */}
          <div className="bg-[#1f2c34] px-3 py-2 flex items-center gap-3 border-b border-gray-800">
            <div className="w-9 h-9 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-sm">
              A
            </div>
            <div className="flex-1">
              <p className="text-white text-sm font-medium">Ambacar Service</p>
              <p className="text-gray-400 text-[10px]">En línea</p>
            </div>
          </div>

          {/* Chat Area */}
          <div className="min-h-[200px] p-3 bg-[#0b141a] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIvPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjEiIGZpbGw9IiMxYTI1MmYiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjYSkiLz48L3N2Zz4=')]">
            <div className="flex justify-end">
              <div className="bg-[#005c4b] text-white rounded-lg rounded-tr-none p-3 max-w-[90%] shadow-md">
                <div className="text-[13px] whitespace-pre-wrap leading-relaxed">
                  {renderWithHighlightedVariables(template.body || "Vista previa...")}
                </div>
                <div className="flex items-center justify-end gap-1 mt-1">
                  <p className="text-[10px] text-gray-300">12:30</p>
                  <span className="text-[10px] text-blue-300">✓✓</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Push Notification Preview
function PushPreview({ template }: { template: NotificationTemplateAPI }) {
  return (
    <div className="mx-auto max-w-[320px]">
      <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-bold text-xl shrink-0 shadow-md">
            A
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                Ambacar Service
              </p>
              <p className="text-[10px] text-muted-foreground">ahora</p>
            </div>
            {template.subject && (
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate mb-1">
                {template.subject}
              </p>
            )}
            <div className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed">
              {renderWithHighlightedVariables(template.body || "Vista previa...")}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Email Preview Component
function EmailPreview({ template }: { template: NotificationTemplateAPI }) {
  return (
    <div className="mx-auto max-w-[360px] sm:max-w-md">
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-lg">
        {/* Email Header */}
        <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
              A
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Ambacar Service
              </p>
              <p className="text-xs text-muted-foreground truncate">
                noreply@ambacar.com
              </p>
            </div>
            <p className="text-xs text-muted-foreground">Hoy</p>
          </div>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {template.subject || "Sin asunto"}
          </p>
        </div>

        {/* Email Body */}
        <div className="p-5 min-h-[150px]">
          <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
            {renderWithHighlightedVariables(template.body || "Vista previa...")}
          </div>
        </div>

        {/* Email Footer */}
        <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-[10px] text-center text-muted-foreground">
            © 2025 Ambacar Service. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  )
}

export function TemplatePreviewDialog({
  template,
  open,
  onOpenChange,
}: TemplatePreviewDialogProps) {
  if (!template) return null

  const ChannelIcon = channelIcons[template.channel]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-md md:max-w-lg max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ChannelIcon className={`h-5 w-5 ${channelColors[template.channel]}`} />
            <span className="truncate">{template.name}</span>
            {template.is_default && (
              <Badge variant="secondary" className="text-xs shrink-0">
                Default
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>Vista previa de la plantilla</DialogDescription>
        </DialogHeader>

        {/* Preview Area - Scrollable */}
        <div className="max-h-[60vh] overflow-y-auto px-1">
          {template.channel === "whatsapp" && <WhatsAppPreview template={template} />}
          {template.channel === "push" && <PushPreview template={template} />}
          {template.channel === "email" && <EmailPreview template={template} />}
        </div>

        {/* Template Details */}
        <div className="border-t border-gray-200 dark:border-gray-800 pt-4 space-y-3">
          {template.subject && template.channel === "email" && (
            <div>
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Asunto:
              </p>
              <p className="text-xs text-muted-foreground">{template.subject}</p>
            </div>
          )}

          {template.variables && template.variables.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                Variables disponibles:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {template.variables.map((varName) => {
                  const style =
                    VARIABLE_STYLES[varName.toLowerCase()] || {
                      icon: Sparkles,
                      color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
                    }
                  const Icon = style.icon

                  return (
                    <Badge
                      key={varName}
                      variant="outline"
                      className={`text-xs gap-1 ${style.color} border-0`}
                    >
                      <Icon className="h-3 w-3" />
                      {`{{${varName}}}`}
                    </Badge>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
