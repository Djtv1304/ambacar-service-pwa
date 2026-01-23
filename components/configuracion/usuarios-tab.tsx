"use client"

import { useState, useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
    Search,
    Plus,
    RefreshCw,
    Loader2,
    Eye,
    EyeOff,
    UserCheck,
    UserX,
    Calendar,
    Clock,
    Users,
    Trash2,
    Key,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth/auth-provider"
import {
    obtenerUsuarios,
    obtenerUsuariosStaff,
    crearUsuario,
    editarUsuario,
    eliminarUsuario,
    cambiarPasswordPropio,
    resetearPasswordUsuario,
    activarUsuario,
    desactivarUsuario,
    type Usuario,
} from "@/lib/api/usuarios"
import {
    crearUsuarioSchema,
    editarUsuarioSchema,
    cambiarPasswordPropioSchema,
    resetearPasswordAdminSchema,
    type CrearUsuarioFormData,
    type EditarUsuarioFormData,
    type CambiarPasswordPropioFormData,
    type ResetearPasswordAdminFormData,
} from "@/lib/validations/usuarios"

const ROLE_LABELS: Record<string, string> = {
    admin: "Administrador",
    operator: "Operador",
    technician: "Técnico",
    manager: "Jefe de Taller",
    customer: "Cliente",
}

const ROLE_OPTIONS = [
    { value: "admin", label: "Administrador" },
    { value: "operator", label: "Operador" },
    { value: "technician", label: "Técnico" },
    { value: "manager", label: "Jefe de Taller" },
]

function UsuarioCardSkeleton() {
    return (
        <div className="rounded-lg border p-4">
            <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-12" />
            </div>
        </div>
    )
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("es-EC", {
        year: "numeric",
        month: "long",
        day: "numeric",
    })
}

function formatDateTime(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("es-EC", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    })
}

interface DetalleUsuarioDialogProps {
    usuario: Usuario | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onEdit: () => void
    onChangePassword: () => void
    onResetPassword: () => void
    currentUserRole: string
    currentUserId: number
}

function DetalleUsuarioDialog({
    usuario,
    open,
    onOpenChange,
    onEdit,
    onChangePassword,
    onResetPassword,
    currentUserRole,
    currentUserId,
}: DetalleUsuarioDialogProps) {
    if (!usuario) return null

    const isOwnProfile = usuario.id === currentUserId
    const canResetPassword = (currentUserRole === "admin" || currentUserRole === "manager") && !isOwnProfile

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-primary/10 text-primary text-lg">
                                {usuario.first_name.charAt(0)}
                                {usuario.last_name?.charAt(0) || ""}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <span>{usuario.first_name} {usuario.last_name}</span>
                            <Badge variant={usuario.is_active ? "default" : "secondary"} className="ml-2">
                                {usuario.is_active ? "Activo" : "Inactivo"}
                            </Badge>
                        </div>
                    </DialogTitle>
                    <DialogDescription>
                        Información detallada del usuario
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-muted-foreground">Cédula</p>
                            <p className="font-medium">{usuario.cedula}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Username</p>
                            <p className="font-medium">@{usuario.username}</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div>
                            <p className="text-xs text-muted-foreground">Correo Electrónico</p>
                            <p className="font-medium">{usuario.email}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Teléfono</p>
                            <p className="font-medium">{usuario.phone || "No registrado"}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Rol</p>
                            <Badge variant="outline">
                                {ROLE_LABELS[usuario.role] || usuario.role}
                            </Badge>
                        </div>
                    </div>

                    <div className="border-t pt-4 space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Fecha de registro:</span>
                            <span className="font-medium">{formatDate(usuario.created_at)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Última actualización:</span>
                            <span className="font-medium">{formatDateTime(usuario.updated_at)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            {usuario.is_active ? (
                                <UserCheck className="h-4 w-4 text-green-600" />
                            ) : (
                                <UserX className="h-4 w-4 text-red-600" />
                            )}
                            <span className="text-muted-foreground">Estado:</span>
                            <span className={`font-medium ${usuario.is_active ? "text-green-600" : "text-red-600"}`}>
                                {usuario.is_active ? "Cuenta activa" : "Cuenta inactiva"}
                            </span>
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                    {isOwnProfile && (
                        <Button variant="outline" onClick={onChangePassword}>
                            <Key className="mr-2 h-4 w-4" />
                            Cambiar Contraseña
                        </Button>
                    )}
                    {canResetPassword && (
                        <Button variant="outline" onClick={onResetPassword}>
                            <Key className="mr-2 h-4 w-4" />
                            Resetear Contraseña
                        </Button>
                    )}
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cerrar
                    </Button>
                    <Button onClick={onEdit}>
                        Editar Usuario
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

interface CrearUsuarioDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
}

function CrearUsuarioDialog({ open, onOpenChange, onSuccess }: CrearUsuarioDialogProps) {
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)

    const form = useForm<CrearUsuarioFormData>({
        resolver: zodResolver(crearUsuarioSchema),
        defaultValues: {
            email: "",
            password: "",
            password_confirm: "",
            first_name: "",
            last_name: "",
            cedula: "",
            phone: "",
            role: undefined,
        },
    })

    const onSubmit = async (data: CrearUsuarioFormData) => {
        setIsLoading(true)
        try {
            await crearUsuario({
                email: data.email,
                password: data.password,
                first_name: data.first_name,
                last_name: data.last_name,
                role: data.role,
                cedula: data.cedula,
                phone: data.phone.replace(/\s+/g, ""),
            })

            toast({
                title: "Usuario creado",
                description: `${data.first_name} ${data.last_name} ha sido registrado exitosamente.`,
            })

            form.reset()
            onOpenChange(false)
            onSuccess()
        } catch (error: any) {
            toast({
                title: "Error al crear usuario",
                description: error.message || "No se pudo crear el usuario",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Nuevo Usuario</DialogTitle>
                    <DialogDescription>
                        Completa el formulario para registrar un nuevo usuario del sistema
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="first_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nombre</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Juan" {...field} disabled={isLoading} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="last_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Apellido</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Pérez" {...field} disabled={isLoading} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Rol</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona un rol" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {ROLE_OPTIONS.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="cedula"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Cédula</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="1712345678"
                                            maxLength={10}
                                            {...field}
                                            disabled={isLoading}
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/\D/g, "")
                                                field.onChange(value)
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Correo Electrónico</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="usuario@email.com" {...field} disabled={isLoading} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Teléfono</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="tel"
                                            placeholder="+593 099 123 4567"
                                            {...field}
                                            disabled={isLoading}
                                            onFocus={(e) => {
                                                if (!e.target.value) {
                                                    field.onChange("+593 0")
                                                }
                                            }}
                                            onChange={(e) => {
                                                let value = e.target.value
                                                const prefix = "+593 0"
                                                if (!value.startsWith(prefix)) {
                                                    value = prefix
                                                }
                                                let numberPart = value.slice(prefix.length).replace(/\D/g, "").slice(0, 9)
                                                let formatted = ""
                                                if (numberPart.length > 0) formatted = numberPart.slice(0, 2)
                                                if (numberPart.length > 2) formatted += " " + numberPart.slice(2, 5)
                                                if (numberPart.length > 5) formatted += " " + numberPart.slice(5, 9)
                                                field.onChange(prefix + formatted)
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Contraseña</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                type={showPassword ? "text" : "password"}
                                                placeholder="********"
                                                {...field}
                                                disabled={isLoading}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="password_confirm"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirmar Contraseña</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                type={showPasswordConfirm ? "text" : "password"}
                                                placeholder="********"
                                                {...field}
                                                disabled={isLoading}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                            >
                                                {showPasswordConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
                            La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas y números.
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creando...
                                    </>
                                ) : (
                                    "Crear Usuario"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

interface EditarUsuarioDialogProps {
    usuario: Usuario | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
}

interface OriginalUsuarioValues {
    email: string
    username: string
    first_name: string
    last_name: string
    cedula: string
    phone: string
}

function EditarUsuarioDialog({ usuario, open, onOpenChange, onSuccess }: EditarUsuarioDialogProps) {
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(false)
    const [originalValues, setOriginalValues] = useState<OriginalUsuarioValues | null>(null)

    const form = useForm<EditarUsuarioFormData>({
        resolver: zodResolver(editarUsuarioSchema),
        defaultValues: {
            email: "",
            username: "",
            first_name: "",
            last_name: "",
            cedula: "",
            phone: "",
        },
    })

    // Watch all form values for change detection
    const watchedValues = form.watch()

    useEffect(() => {
        if (usuario && open) {
            const values = {
                email: usuario.email,
                username: usuario.username,
                first_name: usuario.first_name,
                last_name: usuario.last_name,
                cedula: usuario.cedula,
                phone: usuario.phone,
            }
            form.reset(values)
            setOriginalValues(values)
        }
    }, [usuario, open, form])

    // Check if there are any changes
    const hasChanges = useMemo(() => {
        if (!originalValues) return false

        // Normalize phone for comparison (remove spaces)
        const normalizePhone = (phone: string) => phone.replace(/\s+/g, "")

        return (
            watchedValues.email !== originalValues.email ||
            watchedValues.username !== originalValues.username ||
            watchedValues.first_name !== originalValues.first_name ||
            watchedValues.last_name !== originalValues.last_name ||
            watchedValues.cedula !== originalValues.cedula ||
            normalizePhone(watchedValues.phone) !== normalizePhone(originalValues.phone)
        )
    }, [watchedValues, originalValues])

    // Build partial payload with only changed fields
    const buildPayload = (data: EditarUsuarioFormData): Partial<EditarUsuarioFormData> => {
        if (!originalValues) return {}

        const payload: Partial<EditarUsuarioFormData> = {}
        const normalizePhone = (phone: string) => phone.replace(/\s+/g, "")

        if (data.email !== originalValues.email) {
            payload.email = data.email
        }
        if (data.username !== originalValues.username) {
            payload.username = data.username
        }
        if (data.first_name !== originalValues.first_name) {
            payload.first_name = data.first_name
        }
        if (data.last_name !== originalValues.last_name) {
            payload.last_name = data.last_name
        }
        if (data.cedula !== originalValues.cedula) {
            payload.cedula = data.cedula
        }
        if (normalizePhone(data.phone) !== normalizePhone(originalValues.phone)) {
            payload.phone = normalizePhone(data.phone)
        }

        return payload
    }

    const onSubmit = async (data: EditarUsuarioFormData) => {
        if (!usuario || !hasChanges) return

        const payload = buildPayload(data)
        if (Object.keys(payload).length === 0) return

        setIsLoading(true)
        try {
            await editarUsuario(usuario.id, payload)

            toast({
                title: "Usuario actualizado",
                description: `Los datos de ${data.first_name} ${data.last_name} han sido actualizados.`,
            })

            onOpenChange(false)
            onSuccess()
        } catch (error: any) {
            toast({
                title: "Error al actualizar",
                description: error.message || "No se pudo actualizar el usuario",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    if (!usuario) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Editar Usuario</DialogTitle>
                    <DialogDescription>
                        Modifica los datos del usuario
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="first_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nombre</FormLabel>
                                        <FormControl>
                                            <Input {...field} disabled={isLoading} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="last_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Apellido</FormLabel>
                                        <FormControl>
                                            <Input {...field} disabled={isLoading} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Username</FormLabel>
                                    <FormControl>
                                        <Input {...field} disabled={isLoading} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="cedula"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Cédula</FormLabel>
                                    <FormControl>
                                        <Input
                                            maxLength={10}
                                            {...field}
                                            disabled={isLoading}
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/\D/g, "")
                                                field.onChange(value)
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Correo Electrónico</FormLabel>
                                    <FormControl>
                                        <Input type="email" {...field} disabled={isLoading} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Teléfono</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="tel"
                                            {...field}
                                            disabled={isLoading}
                                            onChange={(e) => {
                                                let value = e.target.value
                                                const prefix = "+593 0"
                                                if (!value.startsWith(prefix) && value.length > 0) {
                                                    field.onChange(value)
                                                    return
                                                }
                                                if (!value.startsWith(prefix)) {
                                                    value = prefix
                                                }
                                                let numberPart = value.slice(prefix.length).replace(/\D/g, "").slice(0, 9)
                                                let formatted = ""
                                                if (numberPart.length > 0) formatted = numberPart.slice(0, 2)
                                                if (numberPart.length > 2) formatted += " " + numberPart.slice(2, 5)
                                                if (numberPart.length > 5) formatted += " " + numberPart.slice(5, 9)
                                                field.onChange(prefix + formatted)
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isLoading || !hasChanges}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Guardando...
                                    </>
                                ) : (
                                    "Guardar Cambios"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

interface CambiarPasswordDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
}

function CambiarPasswordDialog({ open, onOpenChange, onSuccess }: CambiarPasswordDialogProps) {
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(false)
    const [showPasswordActual, setShowPasswordActual] = useState(false)
    const [showPasswordNuevo, setShowPasswordNuevo] = useState(false)
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)

    const form = useForm<CambiarPasswordPropioFormData>({
        resolver: zodResolver(cambiarPasswordPropioSchema),
        defaultValues: {
            password_actual: "",
            password_nuevo: "",
            password_confirmacion: "",
        },
    })

    const onSubmit = async (data: CambiarPasswordPropioFormData) => {
        setIsLoading(true)
        try {
            await cambiarPasswordPropio({
                password_actual: data.password_actual,
                password_nuevo: data.password_nuevo,
                password_confirmacion: data.password_confirmacion,
            })

            toast({
                title: "Contraseña actualizada",
                description: "Tu contraseña ha sido cambiada exitosamente.",
            })

            form.reset()
            onOpenChange(false)
            onSuccess()
        } catch (error: any) {
            toast({
                title: "Error al cambiar contraseña",
                description: error.message || "No se pudo cambiar la contraseña",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle>Cambiar Contraseña</DialogTitle>
                    <DialogDescription>
                        Ingresa tu contraseña actual y la nueva contraseña
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="password_actual"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Contraseña Actual</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                type={showPasswordActual ? "text" : "password"}
                                                placeholder="********"
                                                {...field}
                                                disabled={isLoading}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPasswordActual(!showPasswordActual)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                            >
                                                {showPasswordActual ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="password_nuevo"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nueva Contraseña</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                type={showPasswordNuevo ? "text" : "password"}
                                                placeholder="********"
                                                {...field}
                                                disabled={isLoading}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPasswordNuevo(!showPasswordNuevo)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                            >
                                                {showPasswordNuevo ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="password_confirmacion"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirmar Nueva Contraseña</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                type={showPasswordConfirm ? "text" : "password"}
                                                placeholder="********"
                                                {...field}
                                                disabled={isLoading}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                            >
                                                {showPasswordConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
                            La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas y números.
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Cambiando...
                                    </>
                                ) : (
                                    "Cambiar Contraseña"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

interface ResetearPasswordDialogProps {
    usuario: Usuario | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
}

function ResetearPasswordDialog({ usuario, open, onOpenChange, onSuccess }: ResetearPasswordDialogProps) {
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(false)
    const [showPasswordNuevo, setShowPasswordNuevo] = useState(false)
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)

    const form = useForm<ResetearPasswordAdminFormData>({
        resolver: zodResolver(resetearPasswordAdminSchema),
        defaultValues: {
            password_nuevo: "",
            password_confirmacion: "",
        },
    })

    useEffect(() => {
        if (open) {
            form.reset()
        }
    }, [open, form])

    const onSubmit = async (data: ResetearPasswordAdminFormData) => {
        if (!usuario) return

        setIsLoading(true)
        try {
            await resetearPasswordUsuario(usuario.id, {
                password_nuevo: data.password_nuevo,
            })

            toast({
                title: "Contraseña reseteada",
                description: `La contraseña de ${usuario.first_name} ${usuario.last_name} ha sido reseteada exitosamente.`,
            })

            form.reset()
            onOpenChange(false)
            onSuccess()
        } catch (error: any) {
            toast({
                title: "Error al resetear contraseña",
                description: error.message || "No se pudo resetear la contraseña",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    if (!usuario) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle>Resetear Contraseña</DialogTitle>
                    <DialogDescription>
                        Establece una nueva contraseña para {usuario.first_name} {usuario.last_name}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="password_nuevo"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nueva Contraseña</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                type={showPasswordNuevo ? "text" : "password"}
                                                placeholder="********"
                                                {...field}
                                                disabled={isLoading}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPasswordNuevo(!showPasswordNuevo)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                            >
                                                {showPasswordNuevo ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="password_confirmacion"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirmar Nueva Contraseña</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                type={showPasswordConfirm ? "text" : "password"}
                                                placeholder="********"
                                                {...field}
                                                disabled={isLoading}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                            >
                                                {showPasswordConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
                            La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas y números.
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Reseteando...
                                    </>
                                ) : (
                                    "Resetear Contraseña"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

interface EliminarUsuarioDialogProps {
    usuario: Usuario | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
}

function EliminarUsuarioDialog({ usuario, open, onOpenChange, onSuccess }: EliminarUsuarioDialogProps) {
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(false)

    const handleDelete = async () => {
        if (!usuario) return

        setIsLoading(true)
        try {
            await eliminarUsuario(usuario.id)

            toast({
                title: "Usuario eliminado",
                description: `${usuario.first_name} ${usuario.last_name} ha sido eliminado permanentemente.`,
            })

            onOpenChange(false)
            onSuccess()
        } catch (error: any) {
            toast({
                title: "Error al eliminar",
                description: error.message || "No se pudo eliminar el usuario",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    if (!usuario) return null

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Eliminar Usuario</AlertDialogTitle>
                    <AlertDialogDescription>
                        ¿Estás seguro de que deseas eliminar permanentemente a {usuario.first_name} {usuario.last_name}?
                        Esta acción no se puede deshacer.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isLoading}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Eliminando...
                            </>
                        ) : (
                            "Eliminar"
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

interface UsuariosTabProps {
    userIdToView?: number
}

export function UsuariosTab({ userIdToView }: UsuariosTabProps = {}) {
    const { toast } = useToast()
    const { user: currentUser } = useAuth()
    const [usuarios, setUsuarios] = useState<Usuario[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [filterRol, setFilterRol] = useState<string>("todos")
    const [togglingUserId, setTogglingUserId] = useState<number | null>(null)

    // Dialog states
    const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null)
    const [showDetalleDialog, setShowDetalleDialog] = useState(false)
    const [showCrearDialog, setShowCrearDialog] = useState(false)
    const [showEditarDialog, setShowEditarDialog] = useState(false)
    const [showCambiarPasswordDialog, setShowCambiarPasswordDialog] = useState(false)
    const [showResetearPasswordDialog, setShowResetearPasswordDialog] = useState(false)
    const [showEliminarDialog, setShowEliminarDialog] = useState(false)

    const isCustomer = currentUser?.role === "customer"
    const isAdminOrManager = currentUser?.role === "admin" || currentUser?.role === "manager"

    const fetchUsuarios = async () => {
        setIsLoading(true)
        try {
            if (isCustomer && currentUser) {
                // Customer only sees themselves
                const allUsers = await obtenerUsuarios()
                const self = allUsers.find(u => u.id === currentUser.id)
                setUsuarios(self ? [self] : [])
            } else {
                // Staff sees all users (including customers)
                const data = await obtenerUsuarios()
                setUsuarios(data)
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "No se pudieron cargar los usuarios",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (currentUser) {
            fetchUsuarios()
        }
    }, [currentUser])

    // Auto-open detail dialog if userIdToView is provided
    useEffect(() => {
        if (userIdToView && usuarios.length > 0 && !isLoading) {
            const userToView = usuarios.find(u => u.id === userIdToView)
            if (userToView) {
                setSelectedUsuario(userToView)
                setShowDetalleDialog(true)
            }
        }
    }, [userIdToView, usuarios, isLoading])

    const filteredUsuarios = useMemo(() => {
        return usuarios.filter((usuario) => {
            const searchLower = searchQuery.toLowerCase()
            const matchesSearch =
                searchQuery === "" ||
                `${usuario.first_name} ${usuario.last_name}`.toLowerCase().includes(searchLower) ||
                usuario.cedula.toLowerCase().includes(searchLower) ||
                usuario.email.toLowerCase().includes(searchLower) ||
                usuario.phone?.toLowerCase().includes(searchLower)

            const matchesRol =
                filterRol === "todos" || usuario.role === filterRol

            return matchesSearch && matchesRol
        })
    }, [usuarios, searchQuery, filterRol])

    const handleUsuarioClick = (usuario: Usuario) => {
        setSelectedUsuario(usuario)
        setShowDetalleDialog(true)
    }

    const handleEditFromDetalle = () => {
        setShowDetalleDialog(false)
        setShowEditarDialog(true)
    }

    const handleChangePasswordFromDetalle = () => {
        setShowDetalleDialog(false)
        setShowCambiarPasswordDialog(true)
    }

    const handleResetPasswordFromDetalle = () => {
        setShowDetalleDialog(false)
        setShowResetearPasswordDialog(true)
    }

    const handleDeleteClick = (usuario: Usuario) => {
        setSelectedUsuario(usuario)
        setShowEliminarDialog(true)
    }

    const handleToggleActive = async (usuario: Usuario) => {
        setTogglingUserId(usuario.id)
        try {
            if (usuario.is_active) {
                await desactivarUsuario(usuario.id)
                toast({
                    title: "Usuario desactivado",
                    description: `${usuario.first_name} ${usuario.last_name} ha sido desactivado.`,
                })
            } else {
                await activarUsuario(usuario.id)
                toast({
                    title: "Usuario activado",
                    description: `${usuario.first_name} ${usuario.last_name} ha sido activado.`,
                })
            }
            fetchUsuarios()
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "No se pudo cambiar el estado del usuario",
                variant: "destructive",
            })
        } finally {
            setTogglingUserId(null)
        }
    }

    const handleSuccess = () => {
        fetchUsuarios()
        setSelectedUsuario(null)
    }

    if (!currentUser) {
        return null
    }

    return (
        <Card>
            <CardHeader>
                {/* Mobile: Stack vertical */}
                <div className="flex flex-col gap-3 sm:hidden">
                    <div className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        <CardTitle>Gestión de Usuarios</CardTitle>
                    </div>
                    <CardDescription>
                        {isCustomer
                            ? "Administra tu información de usuario"
                            : "Administra los usuarios del sistema y sus permisos"}
                    </CardDescription>
                    {!isCustomer && (
                        <Button size="sm" className="w-full" onClick={() => setShowCrearDialog(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Agregar Usuario
                        </Button>
                    )}
                </div>

                {/* Desktop: Horizontal layout */}
                <div className="hidden sm:flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        <CardTitle>Gestión de Usuarios</CardTitle>
                    </div>
                    {!isCustomer && (
                        <Button size="sm" onClick={() => setShowCrearDialog(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Agregar Usuario
                        </Button>
                    )}
                </div>
                <CardDescription className="hidden sm:block">
                    {isCustomer
                        ? "Administra tu información de usuario"
                        : "Administra los usuarios del sistema y sus permisos"}
                </CardDescription>

                {/* Filters - only for staff */}
                {!isCustomer && (
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center pt-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por nombre, cédula, email..."
                                className="pl-9"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Select value={filterRol} onValueChange={setFilterRol}>
                                <SelectTrigger className="w-[160px]">
                                    <SelectValue placeholder="Filtrar por rol" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="todos">Todos los roles</SelectItem>
                                    <SelectItem value="admin">Administrador</SelectItem>
                                    <SelectItem value="operator">Operador</SelectItem>
                                    <SelectItem value="technician">Técnico</SelectItem>
                                    <SelectItem value="manager">Jefe de Taller</SelectItem>
                                    <SelectItem value="customer">Cliente</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button variant="outline" size="icon" onClick={fetchUsuarios} disabled={isLoading}>
                                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                            </Button>
                        </div>
                    </div>
                )}
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="space-y-4">
                        <UsuarioCardSkeleton />
                        <UsuarioCardSkeleton />
                        <UsuarioCardSkeleton />
                    </div>
                ) : filteredUsuarios.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <p className="text-lg font-medium">No se encontraron usuarios</p>
                        <p className="text-sm text-muted-foreground">
                            {searchQuery || filterRol !== "todos"
                                ? "Intenta ajustar los filtros de búsqueda"
                                : "No hay usuarios registrados"}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredUsuarios.map((usuario) => (
                            <div key={usuario.id} className="rounded-lg border p-4">
                                {/* Mobile Layout: Vertical Stack */}
                                <div className="flex flex-col gap-3 sm:hidden">
                                    <div
                                        className="flex items-center gap-3 cursor-pointer"
                                        onClick={() => handleUsuarioClick(usuario)}
                                    >
                                        <Avatar className="h-12 w-12">
                                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                                {usuario.first_name.charAt(0)}
                                                {usuario.last_name.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">
                                                {usuario.first_name} {usuario.last_name}
                                            </p>
                                            <p className="text-sm text-muted-foreground truncate">{usuario.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-muted-foreground shrink-0">Rol:</span>
                                        <Badge variant={usuario.role === "admin" || usuario.role === "manager" ? "default" : "secondary"}>
                                            {ROLE_LABELS[usuario.role] || usuario.role}
                                        </Badge>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">
                                            {usuario.is_active ? "Usuario Activo" : "Usuario Inactivo"}
                                        </span>
                                        <Switch
                                            checked={usuario.is_active}
                                            onCheckedChange={() => handleToggleActive(usuario)}
                                            disabled={togglingUserId === usuario.id || usuario.id === currentUser?.id}
                                        />
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => handleUsuarioClick(usuario)}
                                        >
                                            Editar Usuario
                                        </Button>
                                        {isAdminOrManager && usuario.role === "manager" && usuario.id !== currentUser?.id && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                                onClick={() => handleDeleteClick(usuario)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                {/* Desktop Layout: Horizontal */}
                                <div className="hidden sm:flex items-center justify-between">
                                    <div
                                        className="flex items-center gap-4 flex-1 cursor-pointer"
                                        onClick={() => handleUsuarioClick(usuario)}
                                    >
                                        <Avatar>
                                            <AvatarFallback className="bg-primary/10 text-primary">
                                                {usuario.first_name.charAt(0)}
                                                {usuario.last_name.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium">
                                                {usuario.first_name} {usuario.last_name}
                                            </p>
                                            <p className="text-sm text-muted-foreground">{usuario.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <Badge variant={usuario.role === "admin" || usuario.role === "manager" ? "default" : "secondary"}>
                                            {ROLE_LABELS[usuario.role] || usuario.role}
                                        </Badge>
                                        <Switch
                                            checked={usuario.is_active}
                                            onCheckedChange={() => handleToggleActive(usuario)}
                                            disabled={togglingUserId === usuario.id || usuario.id === currentUser?.id}
                                        />
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleUsuarioClick(usuario)}
                                        >
                                            Editar
                                        </Button>
                                        {isAdminOrManager && usuario.id !== currentUser?.id && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                                onClick={() => handleDeleteClick(usuario)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>

            {/* Dialogs */}
            <DetalleUsuarioDialog
                usuario={selectedUsuario}
                open={showDetalleDialog}
                onOpenChange={setShowDetalleDialog}
                onEdit={handleEditFromDetalle}
                onChangePassword={handleChangePasswordFromDetalle}
                onResetPassword={handleResetPasswordFromDetalle}
                currentUserRole={currentUser?.role || ""}
                currentUserId={currentUser?.id || 0}
            />

            <CrearUsuarioDialog
                open={showCrearDialog}
                onOpenChange={setShowCrearDialog}
                onSuccess={handleSuccess}
            />

            <EditarUsuarioDialog
                usuario={selectedUsuario}
                open={showEditarDialog}
                onOpenChange={setShowEditarDialog}
                onSuccess={handleSuccess}
            />

            <CambiarPasswordDialog
                open={showCambiarPasswordDialog}
                onOpenChange={setShowCambiarPasswordDialog}
                onSuccess={handleSuccess}
            />

            <ResetearPasswordDialog
                usuario={selectedUsuario}
                open={showResetearPasswordDialog}
                onOpenChange={setShowResetearPasswordDialog}
                onSuccess={handleSuccess}
            />

            <EliminarUsuarioDialog
                usuario={selectedUsuario}
                open={showEliminarDialog}
                onOpenChange={setShowEliminarDialog}
                onSuccess={handleSuccess}
            />
        </Card>
    )
}
