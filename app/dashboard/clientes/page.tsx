import { Search, Plus, Filter, Download, Mail, Phone, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { mockClientes } from "@/lib/fixtures/clientes"
import Link from "next/link"

export default function ClientesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">Gestiona la información de tus clientes</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Button size="sm" asChild>
            <Link href="/dashboard/clientes/nuevo">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Cliente
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Buscar por nombre, cédula, email o teléfono..." className="pl-9" />
            </div>
            <div className="flex gap-2">
              <Select defaultValue="todos">
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="persona">Persona</SelectItem>
                  <SelectItem value="empresa">Empresa</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockClientes.map((cliente) => (
              <Link key={cliente.id} href={`/dashboard/clientes/${cliente.id}`} className="block">
                <Card className="transition-colors hover:bg-accent/50">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {cliente.nombre.charAt(0)}
                          {cliente.apellido?.charAt(0) || ""}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold">
                              {cliente.nombre} {cliente.apellido && cliente.apellido}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {cliente.tipo === "persona" ? `CI: ${cliente.cedula}` : `RUC: ${cliente.ruc}`}
                            </p>
                          </div>
                          <Badge variant={cliente.tipo === "persona" ? "default" : "secondary"}>
                            {cliente.tipo === "persona" ? "Persona" : "Empresa"}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          {cliente.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="h-3.5 w-3.5" />
                              {cliente.email}
                            </div>
                          )}
                          {cliente.telefono && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3.5 w-3.5" />
                              {cliente.telefono}
                            </div>
                          )}
                          {cliente.direccion && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              {cliente.direccion}
                            </div>
                          )}
                        </div>
                        {cliente.vehiculos && cliente.vehiculos.length > 0 && (
                          <div className="flex gap-2 pt-2">
                            <span className="text-sm text-muted-foreground">Vehículos:</span>
                            {cliente.vehiculos.map((vehiculo, idx) => (
                              <Badge key={idx} variant="outline">
                                {vehiculo.placa}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
