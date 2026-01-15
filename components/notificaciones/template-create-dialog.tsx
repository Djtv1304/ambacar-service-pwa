"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion, AnimatePresence } from "framer-motion"
import {
  Mail,
  Bell,
  MessageCircle,
  X,
  Check,
  ChevronsUpDown,
  Globe,
  Users,
  UserCog,
  FileText,
  Settings,
  Sparkles,
  User,
  Car,
  CreditCard,
  Calendar,
  Clock,
  Building2,
  Wrench,
  Hash,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

import { cn } from "@/lib/utils"
import { notificationTemplateSchema, type NotificationTemplateFormData } from "@/lib/validations/notification-template"
import { useNotificationMetadata } from "@/hooks/use-notification-metadata"
import type { ServiceTypeAPI } from "@/lib/api/notifications"
import { toast } from "sonner"

interface TemplateCreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  preselectedTarget?: "clients" | "staff"
}

// Variable definitions with icons
const DYNAMIC_VARIABLES = [
  { key: "Nombre", icon: User, color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", description: "Nombre del cliente" },
  { key: "Placa", icon: CreditCard, color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400", description: "Placa del vehículo" },
  { key: "Vehículo", icon: Car, color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", description: "Marca y modelo del vehículo" },
  { key: "Fecha", icon: Calendar, color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400", description: "Fecha del servicio" },
  { key: "Hora", icon: Clock, color: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400", description: "Hora del servicio" },
  { key: "Taller", icon: Building2, color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400", description: "Nombre del taller" },
  { key: "Técnico", icon: Wrench, color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400", description: "Nombre del técnico" },
  { key: "Orden", icon: Hash, color: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400", description: "Número de orden" },
]

export function TemplateCreateDialog({
  open,
  onOpenChange,
  preselectedTarget,
}: TemplateCreateDialogProps) {
  const { serviceTypes, phases, talleres, isLoading: metadataLoading } = useNotificationMetadata()

  const [serviceTypeOpen, setServiceTypeOpen] = React.useState(false)
  const [phaseOpen, setPhaseOpen] = React.useState(false)
  const [tallerOpen, setTallerOpen] = React.useState(false)
  const [subtypeOpen, setSubtypeOpen] = React.useState(false)
  const [selectedServiceType, setSelectedServiceType] = React.useState<ServiceTypeAPI | null>(null)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  const form = useForm<NotificationTemplateFormData>({
    resolver: zodResolver(notificationTemplateSchema),
    defaultValues: {
      name: "",
      subject: null,
      body: "",
      channel: "email",
      target: preselectedTarget || "clients",
      is_default: false,
      is_active: true,
      taller_id: null,
      service_type: "",
      phase: "",
      subtype: null,
    },
    mode: "onChange",
  })

  const channelValue = form.watch("channel")
  const serviceTypeValue = form.watch("service_type")

  // Actualizar service type seleccionado y resetear subtype si cambia
  React.useEffect(() => {
    if (serviceTypeValue) {
      const st = serviceTypes.find((st) => st.id === serviceTypeValue)
      setSelectedServiceType(st || null)
      if (!st || st.subtypes.length === 0) {
        form.setValue("subtype", null)
      }
    } else {
      setSelectedServiceType(null)
      form.setValue("subtype", null)
    }
  }, [serviceTypeValue, serviceTypes, form])

  const availableSubtypes = selectedServiceType?.subtypes || []

  // Function to insert variable at cursor position
  const insertVariable = (variableKey: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const cursorPosition = textarea.selectionStart
    const currentValue = form.getValues("body")
    const variableText = `{{${variableKey}}}`

    // Insert variable at cursor position
    const newValue =
      currentValue.slice(0, cursorPosition) +
      variableText +
      currentValue.slice(cursorPosition)

    form.setValue("body", newValue)

    // Move cursor after inserted variable
    setTimeout(() => {
      textarea.focus()
      const newCursorPosition = cursorPosition + variableText.length
      textarea.setSelectionRange(newCursorPosition, newCursorPosition)
    }, 0)

    toast.success(`Variable insertada: ${variableText}`)
  }

  const handleSubmit = (data: NotificationTemplateFormData) => {
    // TODO: Implementar guardado con POST
    console.log("Crear plantilla con data:", data)
    toast.info("Guardado pendiente", {
      description: "La funcionalidad de guardado se implementará próximamente",
    })
  }

  const channelIcons = {
    email: <Mail className="h-4 w-4" />,
    whatsapp: <MessageCircle className="h-4 w-4" />,
    push: <Bell className="h-4 w-4" />,
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <DialogTitle className="text-xl">Nueva Plantilla de Notificación</DialogTitle>
          <DialogDescription>
            Crea una nueva plantilla para notificaciones automáticas
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-100px)]">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 px-6 py-6">
              {/* Información Básica */}
              <Card className="border-gray-200 dark:border-gray-800">
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-medium">Información Básica</h3>
                  </div>

                  {/* Nombre */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre de la Plantilla *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ej: Notificación de Recepción"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    {/* Canal */}
                    <FormField
                      control={form.control}
                      name="channel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Canal *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona el canal" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="email">
                                <div className="flex items-center gap-2">
                                  {channelIcons.email}
                                  Email
                                </div>
                              </SelectItem>
                              <SelectItem value="whatsapp">
                                <div className="flex items-center gap-2">
                                  {channelIcons.whatsapp}
                                  WhatsApp
                                </div>
                              </SelectItem>
                              <SelectItem value="push">
                                <div className="flex items-center gap-2">
                                  {channelIcons.push}
                                  Push
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Target */}
                    <FormField
                      control={form.control}
                      name="target"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Audiencia *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona la audiencia" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="clients">
                                <div className="flex items-center gap-2">
                                  <Users className="h-4 w-4" />
                                  Clientes
                                </div>
                              </SelectItem>
                              <SelectItem value="staff">
                                <div className="flex items-center gap-2">
                                  <UserCog className="h-4 w-4" />
                                  Personal
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Subject - Solo para email */}
                  <AnimatePresence mode="wait">
                    {channelValue === "email" && (
                      <motion.div
                        key="subject-field"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <FormField
                          control={form.control}
                          name="subject"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Asunto del Email</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Ej: Tu vehículo está listo - {{Placa}}"
                                  {...field}
                                  value={field.value || ""}
                                />
                              </FormControl>
                              <FormDescription className="text-xs">
                                Puedes usar variables como {`{{Nombre}}`}, {`{{Placa}}`}, etc.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>

              {/* Contexto de Aplicación */}
              <Card className="border-gray-200 dark:border-gray-800">
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-medium">Contexto de Aplicación</h3>
                  </div>

                  {/* Service Type + Phase Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Service Type */}
                    <FormField
                    control={form.control}
                    name="service_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Servicio *</FormLabel>
                        <Popover open={serviceTypeOpen} onOpenChange={setServiceTypeOpen}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={serviceTypeOpen}
                                className="w-full justify-between"
                                disabled={metadataLoading}
                              >
                                {field.value
                                  ? serviceTypes.find((st) => st.id === field.value)?.name
                                  : "Selecciona el tipo de servicio"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0">
                            <Command>
                              <CommandInput placeholder="Buscar tipo de servicio..." />
                              <CommandList>
                                <CommandEmpty>No se encontraron tipos de servicio.</CommandEmpty>
                                <CommandGroup>
                                  {serviceTypes.map((st) => (
                                    <CommandItem
                                      key={st.id}
                                      value={st.name}
                                      onSelect={() => {
                                        field.onChange(st.id)
                                        setServiceTypeOpen(false)
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          field.value === st.id ? "opacity-100" : "opacity-0"
                                        )}
                                      />
                                      {st.name}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Phase */}
                  <FormField
                    control={form.control}
                    name="phase"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fase *</FormLabel>
                        <Popover open={phaseOpen} onOpenChange={setPhaseOpen}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={phaseOpen}
                                className="w-full justify-between"
                                disabled={metadataLoading}
                              >
                                {field.value
                                  ? phases.find((p) => p.id === field.value)?.name
                                  : "Selecciona la fase"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0">
                            <Command>
                              <CommandInput placeholder="Buscar fase..." />
                              <CommandList>
                                <CommandEmpty>No se encontraron fases.</CommandEmpty>
                                <CommandGroup>
                                  {phases.map((phase) => (
                                    <CommandItem
                                      key={phase.id}
                                      value={phase.name}
                                      onSelect={() => {
                                        field.onChange(phase.id)
                                        setPhaseOpen(false)
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          field.value === phase.id ? "opacity-100" : "opacity-0"
                                        )}
                                      />
                                      {phase.name}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                    />
                  </div>

                  {/* Taller */}
                  <FormField
                    control={form.control}
                    name="taller_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Taller (Opcional)</FormLabel>
                        <Popover open={tallerOpen} onOpenChange={setTallerOpen}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={tallerOpen}
                                className="w-full justify-between"
                                disabled={metadataLoading}
                              >
                                {field.value === null
                                  ? "🌐 Global (Todos los talleres)"
                                  : field.value
                                    ? (() => {
                                        const taller = talleres.find((t) => t.id.toString() === field.value)
                                        return taller
                                          ? `${taller.nombre} - ${taller.ciudad}`
                                          : "Selecciona el taller"
                                      })()
                                    : "Selecciona el taller"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0">
                            <Command>
                              <CommandInput placeholder="Buscar taller..." />
                              <CommandList>
                                <CommandEmpty>No se encontraron talleres.</CommandEmpty>
                                <CommandGroup>
                                  <CommandItem
                                    value="global"
                                    onSelect={() => {
                                      field.onChange(null)
                                      setTallerOpen(false)
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        field.value === null ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    <Globe className="mr-2 h-4 w-4" />
                                    Global (Todos los talleres)
                                  </CommandItem>
                                  {talleres.map((taller) => (
                                    <CommandItem
                                      key={taller.id}
                                      value={`${taller.nombre} ${taller.ciudad}`}
                                      onSelect={() => {
                                        field.onChange(taller.id.toString())
                                        setTallerOpen(false)
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          field.value === taller.id.toString()
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                      {taller.nombre} - {taller.ciudad}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormDescription className="text-xs">
                          Deja en "Global" para aplicar a todos los talleres
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Subtype - Solo si service_type tiene subtypes */}
                  <AnimatePresence mode="wait">
                    {availableSubtypes.length > 0 && (
                      <motion.div
                        key="subtype-field"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <FormField
                          control={form.control}
                          name="subtype"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Subtipo (Opcional)</FormLabel>
                              <Popover open={subtypeOpen} onOpenChange={setSubtypeOpen}>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      role="combobox"
                                      aria-expanded={subtypeOpen}
                                      className="w-full justify-between"
                                    >
                                      {field.value
                                        ? availableSubtypes.find((st) => st.id === field.value)?.name
                                        : "Selecciona el subtipo"}
                                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-full p-0">
                                  <Command>
                                    <CommandInput placeholder="Buscar subtipo..." />
                                    <CommandList>
                                      <CommandEmpty>No se encontraron subtipos.</CommandEmpty>
                                      <CommandGroup>
                                        {availableSubtypes.map((subtype) => (
                                          <CommandItem
                                            key={subtype.id}
                                            value={subtype.name}
                                            onSelect={() => {
                                              field.onChange(subtype.id)
                                              setSubtypeOpen(false)
                                            }}
                                          >
                                            <Check
                                              className={cn(
                                                "mr-2 h-4 w-4",
                                                field.value === subtype.id ? "opacity-100" : "opacity-0"
                                              )}
                                            />
                                            {subtype.name}
                                          </CommandItem>
                                        ))}
                                      </CommandGroup>
                                    </CommandList>
                                  </Command>
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>

              {/* Contenido */}
              <Card className="border-gray-200 dark:border-gray-800">
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageCircle className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-medium">Contenido del Mensaje</h3>
                  </div>

                  {/* Dynamic Variables Section */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Variables Dinámicas
                      </Label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Haz clic en una variable para insertarla en el mensaje
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {DYNAMIC_VARIABLES.map((variable) => {
                        const Icon = variable.icon
                        return (
                          <Button
                            key={variable.key}
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => insertVariable(variable.key)}
                            className={cn(
                              "gap-1.5 px-3 py-1.5 h-auto text-xs font-medium transition-all hover:scale-105",
                              variable.color,
                              "border-0 shadow-sm hover:shadow-md"
                            )}
                            title={variable.description}
                          >
                            <Icon className="h-3.5 w-3.5" />
                            {`{{${variable.key}}}`}
                          </Button>
                        )
                      })}
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="body"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cuerpo del Mensaje *</FormLabel>
                        <FormControl>
                          <Textarea
                            ref={textareaRef}
                            placeholder="Ej: Hola {{Nombre}}, tu {{Vehículo}} con placa {{Placa}} está listo para recoger..."
                            className="min-h-[200px] font-mono text-sm"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-xs text-muted-foreground">
                          Usa las variables de arriba haciendo clic en ellas, o escríbelas manualmente con doble llave: {`{{Variable}}`}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Configuración */}
              <Card className="border-gray-200 dark:border-gray-800">
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-medium">Configuración</h3>
                  </div>

                  <div className="space-y-4">
                    {/* is_default */}
                    <FormField
                      control={form.control}
                      name="is_default"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Template por defecto</FormLabel>
                            <FormDescription className="text-xs">
                              Este template se usará automáticamente si no hay uno específico
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {/* is_active */}
                    <FormField
                      control={form.control}
                      name="is_active"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Activo</FormLabel>
                            <FormDescription className="text-xs">
                              Solo los templates activos se usarán en notificaciones
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={metadataLoading}
                >
                  Crear Plantilla
                </Button>
              </div>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
