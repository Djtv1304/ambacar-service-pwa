"use client"

import * as React from "react"
import {
  Mail,
  Bell,
  MessageCircle,
  Save,
  Copy,
  Check,
  Info,
  Type,
  Hash,
  Variable,
  Sparkles,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import {
  TEMPLATE_VARIABLES,
  previewTemplate,
  getTemplateStats,
  type NotificationTemplate,
  type TemplateVariable,
} from "@/lib/fixtures/notification-orchestration"

interface TemplateEditorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  template: NotificationTemplate | null
  onSave: (template: NotificationTemplate) => void
}

// Variable Chip Component - Enhanced visual style
function VariableChip({
  variable,
  onClick,
}: {
  variable: TemplateVariable
  onClick: () => void
}) {
  const [copied, setCopied] = React.useState(false)

  const handleClick = () => {
    onClick()
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handleClick}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-blue-600 dark:text-blue-400 text-xs font-medium hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-300 dark:hover:border-blue-700 transition-all shadow-sm"
          >
            {copied ? (
              <Check className="h-3 w-3 text-green-500" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
            {variable.label}
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">{variable.description}</p>
          <p className="text-xs text-muted-foreground mt-1">Ej: {variable.example}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// WhatsApp Preview Component - Enhanced realism
function WhatsAppPreview({ content }: { content: string }) {
  const previewContent = previewTemplate(content)

  return (
    <div className="mx-auto max-w-[280px]">
      {/* Phone Frame */}
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
            {/* Message Bubble */}
            <div className="flex justify-end">
              <div className="bg-[#005c4b] text-white rounded-lg rounded-tr-none p-3 max-w-[90%] shadow-md">
                <p className="text-[13px] whitespace-pre-wrap leading-relaxed">
                  {previewContent || "Escribe un mensaje..."}
                </p>
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

// Push Notification Preview - Enhanced
function PushPreview({ content, title }: { content: string; title?: string }) {
  const previewContent = previewTemplate(content)

  return (
    <div className="mx-auto max-w-[320px]">
      <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-start gap-3">
          {/* App Icon */}
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-bold text-xl shrink-0 shadow-md">
            A
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                Ambacar Service
              </p>
              <p className="text-[10px] text-muted-foreground">ahora</p>
            </div>
            {title && (
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                {previewTemplate(title)}
              </p>
            )}
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-3 leading-relaxed">
              {previewContent || "Vista previa del mensaje..."}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Email Preview Component - Enhanced card style
function EmailPreview({ content, subject }: { content: string; subject?: string }) {
  const previewContent = previewTemplate(content)
  const previewSubject = subject ? previewTemplate(subject) : "Sin asunto"

  return (
    <div className="mx-auto max-w-[360px]">
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
            {previewSubject}
          </p>
        </div>

        {/* Email Body */}
        <div className="p-5 min-h-[150px]">
          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
            {previewContent || "Escribe el contenido del email..."}
          </p>
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

// Stats Card Component - Full width matching preview container
function TemplateStatsCard({ body }: { body: string }) {
  const stats = getTemplateStats(body)

  return (
    <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm w-full">
      <CardContent className="p-4">
        <h4 className="text-xs font-medium text-muted-foreground mb-3">Estadísticas</h4>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center justify-center gap-1 text-blue-600 dark:text-blue-400 mb-1">
              <Type className="h-4 w-4" />
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{stats.characters}</p>
            <p className="text-[10px] text-muted-foreground">Caracteres</p>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center justify-center gap-1 text-green-600 dark:text-green-400 mb-1">
              <Hash className="h-4 w-4" />
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{stats.words}</p>
            <p className="text-[10px] text-muted-foreground">Palabras</p>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center justify-center gap-1 text-purple-600 dark:text-purple-400 mb-1">
              <Variable className="h-4 w-4" />
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{stats.variables}</p>
            <p className="text-[10px] text-muted-foreground">Variables</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Main Editor Dialog Component
export function TemplateEditorDialog({
  open,
  onOpenChange,
  template,
  onSave,
}: TemplateEditorDialogProps) {
  const [name, setName] = React.useState("")
  const [subject, setSubject] = React.useState("")
  const [body, setBody] = React.useState("")
  const [isSaving, setIsSaving] = React.useState(false)
  const [previewTab, setPreviewTab] = React.useState<"email" | "push" | "whatsapp">("whatsapp")
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  // Initialize form when template changes
  React.useEffect(() => {
    if (template) {
      setName(template.name)
      setSubject(template.subject || "")
      setBody(template.body)
      setPreviewTab(template.channel)
    } else {
      setName("")
      setSubject("")
      setBody("")
      setPreviewTab("whatsapp")
    }
  }, [template])

  const handleInsertVariable = (variable: TemplateVariable) => {
    const textarea = textareaRef.current
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newBody = body.substring(0, start) + variable.label + body.substring(end)
      setBody(newBody)

      // Reset cursor position after variable
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + variable.label.length, start + variable.label.length)
      }, 0)
    } else {
      setBody(body + variable.label)
    }

    toast.success("Variable insertada", {
      description: `${variable.label} añadida al mensaje.`,
    })
  }

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Nombre requerido", {
        description: "Por favor ingresa un nombre para la plantilla.",
      })
      return
    }

    if (!body.trim()) {
      toast.error("Contenido requerido", {
        description: "Por favor escribe el contenido del mensaje.",
      })
      return
    }

    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const updatedTemplate: NotificationTemplate = {
      id: template?.id || `tpl-${Date.now()}`,
      name: name.trim(),
      subject: subject.trim() || undefined,
      body: body.trim(),
      channel: template?.channel || "email",
      target: template?.target || "clients",
      isDefault: template?.isDefault || false,
      createdAt: template?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    onSave(updatedTemplate)
    setIsSaving(false)
    onOpenChange(false)

    toast.success("Plantilla guardada", {
      description: "Los cambios se han guardado correctamente.",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] md:max-w-[90vw] lg:max-w-6xl xl:max-w-7xl p-0 gap-0 overflow-hidden">
        {/* Header - Fixed */}
        <DialogHeader className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-800 shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
              {template ? "Editar Plantilla" : "Nueva Plantilla"}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} className="hidden sm:flex">
                Cancelar
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  "Guardando..."
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Guardar</span>
                    <span className="sm:hidden">OK</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Body - SINGLE scrollable container */}
        <div className="overflow-y-auto max-h-[85vh] md:max-h-[80vh]">
          {/* Content Grid - Desktop: 2 cols (55/45 split), Tablet: 2 cols, Mobile: stacked */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_450px] xl:grid-cols-[1fr_500px]">
            {/* Left Column - Editor (No individual scroll) */}
            <div className="p-4 sm:p-6 md:border-r border-gray-200 dark:border-gray-800">
              <div className="space-y-6">
                {/* Metadata */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="template-name">Nombre de Plantilla</Label>
                    <Input
                      id="template-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ej: Confirmación de Cita"
                      className="dark:bg-gray-900"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="template-subject">Asunto (para Email)</Label>
                    <Input
                      id="template-subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Ej: ✅ Tu cita ha sido confirmada"
                      className="dark:bg-gray-900"
                    />
                  </div>
                </div>

                {/* Variables Toolbar - Enhanced visual style */}
                <div className="rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="h-4 w-4 text-blue-500" />
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Variables Dinámicas
                    </h3>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs max-w-xs">
                            Haz clic en una variable para insertarla en el mensaje. Se reemplazará automáticamente con los datos reales.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {TEMPLATE_VARIABLES.map((variable) => (
                      <VariableChip
                        key={variable.id}
                        variable={variable}
                        onClick={() => handleInsertVariable(variable)}
                      />
                    ))}
                  </div>
                </div>

                {/* Content Editor */}
                <div className="space-y-2">
                  <Label htmlFor="template-body">Contenido del Mensaje</Label>
                  <Textarea
                    ref={textareaRef}
                    id="template-body"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Escribe tu mensaje aquí. Puedes usar las variables de arriba para personalizar el contenido..."
                    rows={8}
                    className="resize-none dark:bg-gray-900 font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Soporta emojis y saltos de línea. Las variables se reemplazarán automáticamente.
                  </p>
                </div>

                {/* Fallback Note */}
                <Card className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900">
                  <CardContent className="p-3 flex items-start gap-2">
                    <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                      <strong>Lógica de Fallback:</strong> El sistema aplicará automáticamente Email → WhatsApp → Push si falla el canal principal.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Right Column - Preview (No individual scroll) */}
            <div className="p-4 sm:p-6 bg-gray-100 dark:bg-gray-950">
              <div className="space-y-6">
                {/* Preview Tabs */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                    Vista Previa
                  </h3>
                  <Tabs value={previewTab} onValueChange={(v) => setPreviewTab(v as typeof previewTab)}>
                    <TabsList className="grid w-full grid-cols-3 mb-6">
                      <TabsTrigger value="whatsapp" className="gap-2">
                        <MessageCircle className="h-4 w-4" />
                        <span className="hidden sm:inline">WhatsApp</span>
                      </TabsTrigger>
                      <TabsTrigger value="push" className="gap-2">
                        <Bell className="h-4 w-4" />
                        <span className="hidden sm:inline">Push</span>
                      </TabsTrigger>
                      <TabsTrigger value="email" className="gap-2">
                        <Mail className="h-4 w-4" />
                        <span className="hidden sm:inline">Email</span>
                      </TabsTrigger>
                    </TabsList>

                    <div className="py-4">
                      <TabsContent value="whatsapp" className="mt-0">
                        <WhatsAppPreview content={body} />
                      </TabsContent>
                      <TabsContent value="push" className="mt-0">
                        <PushPreview content={body} title={subject} />
                      </TabsContent>
                      <TabsContent value="email" className="mt-0">
                        <EmailPreview content={body} subject={subject} />
                      </TabsContent>
                    </div>
                  </Tabs>
                </div>

                {/* Stats - Full width */}
                <TemplateStatsCard body={body} />

                {/* Channel Badge */}
                {template && (
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <span className="text-xs text-muted-foreground">Canal principal:</span>
                    <Badge
                      variant="secondary"
                      className={
                        template.channel === "email"
                          ? "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300"
                          : template.channel === "whatsapp"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                          : "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                      }
                    >
                      {template.channel === "email" && <Mail className="h-3 w-3 mr-1" />}
                      {template.channel === "push" && <Bell className="h-3 w-3 mr-1" />}
                      {template.channel === "whatsapp" && <MessageCircle className="h-3 w-3 mr-1" />}
                      {template.channel.charAt(0).toUpperCase() + template.channel.slice(1)}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

