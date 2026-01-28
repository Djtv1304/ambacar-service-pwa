"use client"

import { LogOut, User, Sun, Moon } from "lucide-react"
import { useTransition, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/components/auth/auth-provider"
import { logoutAction } from "@/lib/auth/actions"
import { useToast } from "@/hooks/use-toast"
import { useTheme } from "next-themes"
import { NotificationPopover } from "@/components/notifications/notification-popover"
import type { UserRole } from "@/lib/types"

const roleLabels: Record<UserRole, string> = {
  admin: "Administrador",
  operator: "Operador de Servicio",
  technician: "Técnico",
  manager: "Jefe de Taller",
  customer: "Cliente",
}

export function Topbar() {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleGoToProfile = () => {
    router.push("/dashboard/configuracion?tab=perfil")
  }

  const handleToggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const handleLogout = () => {
    startTransition(async () => {
      try {
        await logoutAction()

        // This line only executes if logout succeeds but doesn't redirect
        // In normal cases, redirect() throws NEXT_REDIRECT and this never runs
        toast({
          title: "Sesión cerrada",
          description: "Has cerrado sesión correctamente",
        })
      } catch (error: any) {
        // Filter out NEXT_REDIRECT - it's not an error, it's Next.js redirecting
        if (error?.digest?.startsWith('NEXT_REDIRECT')) {
          // Success! Logout worked and is redirecting
          // Show success toast BEFORE re-throwing
          toast({
            title: "Sesión cerrada",
            description: "Has cerrado sesión correctamente",
          })

          // Re-throw to let Next.js handle the redirect
          throw error
        }

        // Only handle real errors (network issues, server errors, etc.)
        console.error('Logout error:', error)
        toast({
          variant: "destructive",
          title: "Error al cerrar sesión",
          description: error instanceof Error ? error.message : "No se pudo cerrar la sesión. Por favor, intenta de nuevo.",
        })
      }
    })
  }

  if (!user) return null

  const initials = `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 px-6">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold">
          <span className="text-muted-foreground">Ambacar</span>
        </h2>
      </div>

      <div className="flex items-center gap-3">
        {/* Notifications */}
        <NotificationPopover />

        {/* Theme Toggle */}
        {mounted && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="relative"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />
            ) : (
              <Moon className="h-5 w-5 text-slate-700 dark:text-slate-300" />
            )}
            <span className="sr-only">
              {theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            </span>
          </Button>
        )}

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 px-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">{initials}</AvatarFallback>
              </Avatar>
              <div className="hidden text-left md:block">
                <p className="text-sm font-medium">
                  {user.first_name} {user.last_name}
                </p>
                <p className="text-xs text-muted-foreground">{roleLabels[user.role]}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleGoToProfile}>
              <User className="mr-2 h-4 w-4" />
              Perfil
            </DropdownMenuItem>
            {mounted && (
              <DropdownMenuItem onClick={handleToggleTheme}>
                {theme === "dark" ? (
                  <>
                    <Sun className="mr-2 h-4 w-4 text-yellow-500" />
                    Modo Claro
                  </>
                ) : (
                  <>
                    <Moon className="mr-2 h-4 w-4 text-slate-700" />
                    Modo Oscuro
                  </>
                )}
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} disabled={isPending} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              {isPending ? "Cerrando sesión..." : "Cerrar Sesión"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
