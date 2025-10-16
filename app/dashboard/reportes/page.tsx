import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Download, TrendingUp, TrendingDown, DollarSign, Users, Wrench, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function ReportesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reportes</h1>
          <p className="text-muted-foreground">Análisis y métricas del taller</p>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="mes">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hoy">Hoy</SelectItem>
              <SelectItem value="semana">Esta Semana</SelectItem>
              <SelectItem value="mes">Este Mes</SelectItem>
              <SelectItem value="trimestre">Trimestre</SelectItem>
              <SelectItem value="año">Este Año</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231.89</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-green-500">+20.1%</span> vs mes anterior
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Órdenes Completadas</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+573</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-green-500">+12.5%</span> vs mes anterior
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Atendidos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+234</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-green-500">+8.2%</span> vs mes anterior
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiempo Promedio</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.4 días</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingDown className="h-3 w-3 text-green-500" />
              <span className="text-green-500">-15%</span> vs mes anterior
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="servicios" className="space-y-4">
        <TabsList>
          <TabsTrigger value="servicios">Servicios</TabsTrigger>
          <TabsTrigger value="tecnicos">Técnicos</TabsTrigger>
          <TabsTrigger value="inventario">Inventario</TabsTrigger>
          <TabsTrigger value="financiero">Financiero</TabsTrigger>
        </TabsList>

        <TabsContent value="servicios" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Servicios Más Solicitados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { servicio: "Cambio de Aceite", cantidad: 145, ingresos: "$7,250" },
                  { servicio: "Alineación y Balanceo", cantidad: 98, ingresos: "$4,900" },
                  { servicio: "Revisión General", cantidad: 87, ingresos: "$8,700" },
                  { servicio: "Cambio de Frenos", cantidad: 76, ingresos: "$11,400" },
                  { servicio: "Diagnóstico Electrónico", cantidad: 65, ingresos: "$3,250" },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">{item.servicio}</p>
                      <p className="text-sm text-muted-foreground">{item.cantidad} servicios realizados</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{item.ingresos}</p>
                      <Badge variant="secondary">{idx + 1}°</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tecnicos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rendimiento de Técnicos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { nombre: "Carlos Méndez", ots: 45, eficiencia: 95, satisfaccion: 4.8 },
                  { nombre: "Luis Torres", ots: 42, eficiencia: 92, satisfaccion: 4.7 },
                  { nombre: "Miguel Ángel", ots: 38, eficiencia: 88, satisfaccion: 4.6 },
                  { nombre: "Roberto Silva", ots: 35, eficiencia: 90, satisfaccion: 4.5 },
                ].map((tecnico, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">{tecnico.nombre}</p>
                      <p className="text-sm text-muted-foreground">{tecnico.ots} OTs completadas</p>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <div className="text-right">
                        <p className="text-muted-foreground">Eficiencia</p>
                        <p className="font-semibold">{tecnico.eficiencia}%</p>
                      </div>
                      <div className="text-right">
                        <p className="text-muted-foreground">Satisfacción</p>
                        <p className="font-semibold">{tecnico.satisfaccion}/5</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventario" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Movimiento de Inventario</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { producto: "Aceite 5W-30", usado: 145, stock: 89, estado: "bajo" },
                  { producto: "Filtro de Aceite", usado: 142, stock: 156, estado: "ok" },
                  { producto: "Pastillas de Freno", usado: 76, stock: 45, estado: "bajo" },
                  { producto: "Filtro de Aire", usado: 68, stock: 98, estado: "ok" },
                  { producto: "Bujías", usado: 54, stock: 120, estado: "ok" },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">{item.producto}</p>
                      <p className="text-sm text-muted-foreground">{item.usado} unidades usadas</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Stock</p>
                        <p className="font-semibold">{item.stock}</p>
                      </div>
                      <Badge variant={item.estado === "bajo" ? "destructive" : "secondary"}>
                        {item.estado === "bajo" ? "Stock Bajo" : "OK"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financiero" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Ingresos por Categoría</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { categoria: "Mano de Obra", monto: "$28,450", porcentaje: 63 },
                    { categoria: "Repuestos", monto: "$12,340", porcentaje: 27 },
                    { categoria: "Diagnósticos", monto: "$4,441", porcentaje: 10 },
                  ].map((item, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{item.categoria}</span>
                        <span className="font-semibold">{item.monto}</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                        <div className="h-full bg-primary" style={{ width: `${item.porcentaje}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estado de Pagos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { estado: "Pagado", cantidad: 523, monto: "$42,180", color: "bg-green-500" },
                    { estado: "Pendiente", cantidad: 45, monto: "$2,890", color: "bg-yellow-500" },
                    { estado: "Vencido", cantidad: 5, monto: "$161", color: "bg-red-500" },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`h-3 w-3 rounded-full ${item.color}`} />
                        <div>
                          <p className="font-medium">{item.estado}</p>
                          <p className="text-sm text-muted-foreground">{item.cantidad} facturas</p>
                        </div>
                      </div>
                      <p className="font-semibold">{item.monto}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
