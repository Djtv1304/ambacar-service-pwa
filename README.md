# Ambacar Service PWA

Sistema de gestión de talleres automotrices para Ambacar. PWA diseñada para la administración integral de órdenes de trabajo, citas, inspecciones, y comunicación con clientes.

## Tabla de Contenidos

- [Descripción General](#descripción-general)
- [Tech Stack](#tech-stack)
- [Arquitectura](#arquitectura)
- [Módulos Funcionales](#módulos-funcionales)
- [Roles y Permisos](#roles-y-permisos)
- [Flujos de Usuario](#flujos-de-usuario)
- [Integraciones Externas](#integraciones-externas)
- [Configuración del Entorno](#configuración-del-entorno)
- [Comandos de Desarrollo](#comandos-de-desarrollo)
- [Testing](#testing)
- [Estructura para Plan de Pruebas](#estructura-para-plan-de-pruebas)

---

## Descripción General

Ambacar Service es una Progressive Web Application (PWA) para la gestión completa de talleres de servicio automotriz. Permite:

- **Clientes:** Agendar citas, ver historial de servicios, recibir notificaciones
- **Operadores:** Gestionar recepción de vehículos, crear órdenes de trabajo
- **Técnicos:** Ejecutar reparaciones, llenar checklists de inspección
- **Jefes de Taller:** Configurar flujos de trabajo, gestionar notificaciones, ver reportes

### Objetivos del Sistema

1. Digitalizar el flujo completo de un vehículo en el taller
2. Mejorar la comunicación cliente-taller mediante notificaciones multicanal
3. Optimizar la asignación de recursos (técnicos, repuestos)
4. Garantizar trazabilidad de todas las operaciones

---

## Tech Stack

| Categoría | Tecnología |
|-----------|------------|
| Framework | Next.js 15 (App Router) |
| Lenguaje | TypeScript (Strict mode) |
| Estilos | Tailwind CSS v4 + Shadcn/UI |
| Iconos | Lucide React |
| Animaciones | Framer Motion |
| Formularios | React Hook Form + Zod |
| Estado Global | React Context + Custom Hooks |
| Testing Unitario | Vitest |
| Testing E2E | Playwright |
| HTTP Client | Fetch API nativo |

---

## Arquitectura

### Estructura de Directorios

```
ambacar-service-pwa/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Rutas de autenticación
│   │   ├── login/               # Inicio de sesión
│   │   └── registro/            # Registro de usuarios
│   ├── agendamiento/            # Flujo público de citas
│   │   ├── nueva/               # Nueva cita (multi-step)
│   │   └── cancelar/            # Cancelación de citas
│   ├── dashboard/               # Área protegida
│   │   ├── page.tsx             # Dashboard principal
│   │   ├── recepcion/           # Recepción de vehículos
│   │   ├── taller/              # Tablero Kanban
│   │   ├── ot/                  # Gestión de OTs
│   │   ├── inspecciones/        # Inspecciones de calidad
│   │   ├── multimedia/          # Galería de fotos/videos
│   │   ├── notificaciones/      # Configuración de notificaciones
│   │   ├── mis-servicios/       # Historial del cliente
│   │   ├── inventario/          # Gestión de repuestos
│   │   ├── configuracion/       # Ajustes del sistema
│   │   ├── clientes/            # Gestión de clientes
│   │   └── facturacion/         # Facturación
│   └── api/                     # API Routes (proxy)
│       ├── erp/                 # Proxy al ERP Ambacar
│       └── sync/                # Sincronización con microservicios
├── components/                   # Componentes React
│   ├── ui/                      # Shadcn/UI base components
│   ├── auth/                    # Autenticación
│   ├── dashboard/               # Dashboard específicos
│   ├── agendamiento/            # Flujo de citas
│   ├── recepcion/               # Recepción
│   ├── taller/                  # Kanban y asignaciones
│   ├── ot/                      # Órdenes de trabajo
│   ├── inspeccion/              # Inspecciones
│   ├── multimedia/              # Galería y anotaciones
│   ├── notificaciones/          # Templates y preferencias
│   └── inventario/              # Stock y repuestos
├── lib/                          # Lógica de negocio
│   ├── api/                     # Módulos de API
│   ├── auth/                    # Autenticación
│   ├── validations/             # Schemas Zod
│   ├── fixtures/                # Datos mock
│   ├── hooks/                   # Custom hooks
│   ├── constants/               # Constantes
│   └── types.ts                 # Tipos globales
├── hooks/                        # Hooks compartidos
└── tests/                        # Configuración de tests
```

### Patrones Arquitectónicos

1. **API Route Proxy:** Todas las llamadas a APIs externas pasan por `/api/*` para ocultar URLs y manejar CORS
2. **Fixture-First Development:** Uso de datos mock en `/lib/fixtures` durante desarrollo
3. **Server Actions:** Operaciones de autenticación usan server actions de Next.js
4. **Hook-Based Data Fetching:** Custom hooks encapsulan lógica de fetching y cache

---

## Módulos Funcionales

### 1. Autenticación (`/login`, `/registro`)

| Funcionalidad | Descripción |
|--------------|-------------|
| Login | Autenticación con email/password contra API Django |
| Registro | Creación de cuenta con selección de rol |
| JWT Tokens | Access token (15 min) + Refresh token (httpOnly cookie) |
| Middleware | Auto-refresh de tokens expirados |
| Sync | Sincronización de cliente al microservicio de notificaciones |

**Credenciales de prueba:**
- Cliente: `cliente@test.com` / `cliente123`
- Operador: `operador@test.com` / `operador123`
- Técnico: `tecnico@test.com` / `tecnico123`
- Manager: `manager@test.com` / `manager123`

### 2. Agendamiento de Citas (`/agendamiento/nueva`)

| Paso | Funcionalidad |
|------|--------------|
| 1. Vehículo | Selección de vehículo existente o registro de nuevo |
| 2. Servicio | Selección de tipo de servicio y subtipo |
| 3. Fecha/Hora | Calendario con slots disponibles por sucursal |
| 4. Confirmación | Resumen y confirmación de cita |

**Características:**
- OCR para escaneo de placas
- Sincronización de vehículo nuevo al microservicio
- Notificación de confirmación multicanal

### 3. Recepción de Vehículos (`/dashboard/recepcion`)

| Funcionalidad | Descripción |
|--------------|-------------|
| Lista de citas | Citas del día con filtros por estado |
| Check-in | Registro de kilometraje y nivel de combustible |
| Estados | A tiempo, Retrasado, Expirado |
| Búsqueda | Por placa, cliente, o número de cita |

### 4. Tablero Kanban (`/dashboard/taller`)

| Columna | Descripción |
|---------|-------------|
| Citas | Citas pendientes de recepción |
| Recepción | Vehículos en proceso de check-in |
| Diagnóstico | En evaluación técnica |
| Reparación | En ejecución de servicio |
| Calidad | Inspección final |
| Entrega | Listo para entrega al cliente |

**Características:**
- Drag & drop con dnd-kit
- Asignación de asesores/técnicos desde ERP
- Indicadores de prioridad y tiempo
- Vista de perspectiva (Técnico vs OT)

### 5. Órdenes de Trabajo (`/dashboard/ot/[id]`)

| Estado | Descripción |
|--------|-------------|
| Creada | OT recién generada |
| En Diagnóstico | Evaluación técnica en curso |
| Presupuestada | Costos calculados |
| Aprobada | Cliente aprobó presupuesto |
| En Proceso | Reparación en ejecución |
| En Prueba | Verificación de calidad |
| Completada | Servicio finalizado |
| Entregada | Vehículo devuelto |

**Funcionalidades:**
- Costos (mano de obra + repuestos)
- Hallazgos con fotos
- Asignación de repuestos desde stock ERP
- Generación de proforma

### 6. Inspecciones (`/dashboard/inspecciones/[id]`)

| Característica | Descripción |
|----------------|-------------|
| Catálogo | Puntos de inspección por categoría |
| Estados | Verde (OK), Amarillo (Atención), Rojo (Crítico), N/A |
| Mediciones | Valores numéricos opcionales con validación |
| Fotos | Captura de evidencia por punto |
| Progreso | Porcentaje de completitud |

### 7. Galería Multimedia (`/dashboard/multimedia/[otId]`)

| Fase | Contenido |
|------|-----------|
| Recepción | Estado inicial del vehículo |
| Diagnóstico | Hallazgos encontrados |
| Reparación | Proceso de reparación |
| Entrega | Estado final |
| Inspecciones | Evidencia de inspección |
| Hallazgos | Fotos de problemas detectados |

**Características:**
- Anotaciones en fotos (texto + voz)
- Editor de marcas
- Metadata de imagen

### 8. Notificaciones (`/dashboard/notificaciones`)

#### Vista Manager
| Funcionalidad | Descripción |
|--------------|-------------|
| Matriz de Orquestación | Configuración evento → canal → destinatario |
| Templates | Gestión de plantillas (push, email, WhatsApp) |
| Variables | Sustitución dinámica en mensajes |

#### Vista Cliente
| Funcionalidad | Descripción |
|--------------|-------------|
| Preferencias | Canales preferidos por tipo de notificación |
| Recordatorios | Configuración de avisos de mantenimiento |

### 9. Inventario/Repuestos (`/dashboard/inventario`)

| Funcionalidad | Descripción |
|--------------|-------------|
| Búsqueda | Por descripción con paginación |
| Stock | Cantidad disponible por agencia |
| Precios | Precio unitario desde ERP |
| Tendencias | Gráficos de consumo |
| Alertas | Riesgo de desabastecimiento |

### 10. Configuración (`/dashboard/configuracion`)

| Tab | Funcionalidad |
|-----|--------------|
| General | Info del taller, tema |
| Fases | Configuración de fases de servicio |
| Usuarios | CRUD de usuarios del sistema |
| Perfil | Datos personales |
| Seguridad | Cambio de contraseña |

---

## Roles y Permisos

| Rol | Permisos |
|-----|----------|
| **Cliente** | Ver sus vehículos, citas, servicios. Configurar preferencias de notificación |
| **Técnico** | Ejecutar servicios, llenar checklists, subir fotos |
| **Operador** | Gestionar recepción, crear OTs, asignar repuestos |
| **Manager** | Configuración completa, orquestación de notificaciones, reportes |
| **Admin** | Administración del sistema |

### Matriz de Acceso por Módulo

| Módulo | Cliente | Técnico | Operador | Manager |
|--------|---------|---------|----------|---------|
| Dashboard | ✅ (limitado) | ✅ | ✅ | ✅ |
| Mis Servicios | ✅ | ❌ | ❌ | ❌ |
| Agendamiento | ✅ | ❌ | ✅ | ✅ |
| Recepción | ❌ | ❌ | ✅ | ✅ |
| Taller (Kanban) | ❌ | ✅ | ✅ | ✅ |
| OTs | ❌ | ✅ (solo asignadas) | ✅ | ✅ |
| Inspecciones | ❌ | ✅ | ✅ | ✅ |
| Multimedia | ❌ | ✅ | ✅ | ✅ |
| Inventario | ❌ | ❌ | ✅ | ✅ |
| Notificaciones (Config) | ❌ | ❌ | ❌ | ✅ |
| Notificaciones (Pref) | ✅ | ❌ | ❌ | ❌ |
| Configuración | ❌ | ❌ | 👁️ (solo lectura) | ✅ |

---

## Flujos de Usuario

### Flujo 1: Cliente - Agendar Cita

```
1. Accede a /agendamiento/nueva (sin login requerido)
2. Selecciona vehículo existente o registra nuevo
3. Elige tipo de servicio
4. Selecciona sucursal, fecha y hora
5. Confirma cita
6. Recibe notificación de confirmación
```

### Flujo 2: Operador - Recepción de Vehículo

```
1. Login como operador
2. Accede a /dashboard/recepcion
3. Busca cita por placa o cliente
4. Realiza check-in (km, combustible, fotos)
5. Crea OT automáticamente
6. Vehículo pasa al Kanban (columna Recepción)
```

### Flujo 3: Técnico - Ejecutar Servicio

```
1. Login como técnico
2. Accede a /dashboard/taller
3. Ve órdenes asignadas
4. Abre OT en vista técnico
5. Registra diagnóstico y hallazgos
6. Ejecuta reparaciones
7. Marca puntos de inspección
8. Sube fotos de evidencia
9. Completa servicio
```

### Flujo 4: Manager - Configurar Notificaciones

```
1. Login como manager
2. Accede a /dashboard/notificaciones
3. Configura matriz de orquestación
4. Crea/edita templates
5. Define variables de contexto
6. Prueba envío de notificaciones
```

### Flujo 5: Cliente - Seguimiento de Servicio

```
1. Login como cliente
2. Accede a /dashboard/mis-servicios
3. Ve historial de servicios
4. Consulta estado actual de OT
5. Descarga proforma
6. Recibe notificaciones de progreso
```

---

## Integraciones Externas

### 1. API de Autenticación (Django)

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/auth/login/` | POST | Autenticación |
| `/api/auth/register/` | POST | Registro |
| `/api/auth/token/refresh/` | POST | Refresh token |
| `/api/users/me/` | GET | Datos del usuario actual |

### 2. Microservicio de Notificaciones

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/v1/notifications/events/dispatch/` | POST | Disparar notificación |
| `/api/v1/notifications/templates/` | GET | Listar templates |
| `/api/internal/v1/customers/sync/` | POST | Sincronizar cliente |
| `/api/internal/v1/vehicles/sync/` | POST | Sincronizar vehículo |

**Canales soportados:** Push, Email, WhatsApp

### 3. ERP Ambacar (Zeus)

| Endpoint Proxy | ERP Endpoint | Descripción |
|----------------|--------------|-------------|
| `/api/erp/agencias` | `ObtenerAgencias` | Lista de agencias |
| `/api/erp/talleres` | `ObtenerTalleres` | Lista de talleres |
| `/api/erp/stock-repuestos` | `ObtenerStockRepuestos` | Stock de repuestos |
| `/api/erp/asesores-servicio` | `ObtenerAsesoresServicio` | Asesores |
| `/api/erp/asesores-tecnicos` | `ObtenerAsesoresTecnico` | Técnicos |

---

## Configuración del Entorno

### Variables de Entorno

```env
# API Principal
NEXT_PUBLIC_API_URL=http://localhost:8000

# Microservicio de Notificaciones
NEXT_PUBLIC_NOTIFICATIONS_API_URL=http://localhost:8001

# ERP Ambacar (solo servidor)
AMBACAR_ERP_API_URL=https://ambysoftapitest.ambacar.ec:8443

# API Key interna (solo servidor)
INTERNAL_API_SECRET_KEY=your-secret-key
```

### Requisitos

- Node.js 20+
- pnpm 8+

---

## Comandos de Desarrollo

```bash
# Instalar dependencias
pnpm install

# Servidor de desarrollo
pnpm dev

# Linting
pnpm lint

# Build de producción
pnpm build

# Tests unitarios
pnpm test

# Tests E2E
pnpm test:e2e
```

---

## Testing

### Configuración Actual

| Tipo | Framework | Configuración |
|------|-----------|---------------|
| Unit/Integration | Vitest | `vitest.config.ts` |
| E2E | Playwright | `playwright.config.ts` |

### Vitest (Unit/Integration)

```typescript
// vitest.config.ts
{
  environment: 'jsdom',
  setupFiles: ['./tests/setup.ts'],
  coverage: {
    provider: 'v8',
    reporter: ['html', 'lcov']
  }
}
```

### Playwright (E2E)

```typescript
// playwright.config.ts
{
  testDir: './e2e',
  baseURL: 'http://localhost:3000',
  use: {
    browserName: 'chromium',
    screenshot: 'only-on-failure',
    trace: 'on-first-retry'
  }
}
```

---

## Estructura para Plan de Pruebas

### Cuadrante Q1: Pruebas Tecnológicas (Soporte al Equipo)

**Pruebas Unitarias - Componentes**

| Componente | Casos de Prueba |
|------------|-----------------|
| `AuthProvider` | Manejo de estado de autenticación, refresh de tokens |
| `SidebarContext` | Estado del sidebar, toggle mobile/desktop |
| `useKanbanBoard` | Fetching, cache, movimiento de cards |
| `useNotificationTemplates` | Paginación, cache por target |
| Zod Schemas | Validación de todos los schemas |

**Pruebas Unitarias - Utilidades**

| Módulo | Casos de Prueba |
|--------|-----------------|
| `lib/auth/roles.ts` | `isCustomer`, `isInternalUser`, `hasRole` |
| `lib/utils.ts` | Funciones de formateo (fecha, moneda, título) |
| `lib/api/client.ts` | Manejo de errores, headers, token injection |

**Pruebas de Integración - API Routes**

| Route | Casos de Prueba |
|-------|-----------------|
| `/api/erp/agencias` | Filtrado de agencias permitidas |
| `/api/erp/stock-repuestos` | Paginación, uppercase de descripción |
| `/api/sync/customer` | Payload formatting, error handling |
| `/api/sync/vehicle` | Payload formatting, error handling |

### Cuadrante Q2: Pruebas de Negocio (Soporte al Equipo)

**Pruebas Funcionales - Flujos Críticos**

| Flujo | Escenarios |
|-------|------------|
| Registro de Usuario | Happy path, validación de campos, sync a microservicio |
| Login | Credenciales válidas/inválidas, refresh token |
| Agendamiento | Nuevo vehículo, vehículo existente, slots disponibles |
| Creación de OT | Desde cita, manual, campos requeridos |
| Inspección | Evaluación de puntos, mediciones, fotos |

**Pruebas de Aceptación - Historias de Usuario**

| Historia | Criterios de Aceptación |
|----------|------------------------|
| Como cliente, quiero agendar una cita | Flujo completo sin login, confirmación recibida |
| Como operador, quiero hacer check-in | Registro de km/combustible, creación de OT |
| Como técnico, quiero ver mis órdenes | Solo órdenes asignadas, progreso visible |
| Como manager, quiero configurar notificaciones | Matriz editable, templates con preview |

### Cuadrante Q3: Pruebas de Negocio (Crítica al Producto)

**Pruebas Exploratorias**

| Área | Enfoque |
|------|---------|
| Flujo de agendamiento | Edge cases, manejo de errores |
| Kanban board | Drag & drop, estados inválidos |
| Galería multimedia | Upload de imágenes grandes, formatos |
| Notificaciones | Delivery multicanal, fallbacks |

**Pruebas de Usabilidad**

| Área | Enfoque |
|------|---------|
| Mobile UX | Thumb zones, gestos, scroll |
| Forms | Validación en tiempo real, mensajes de error |
| Dark mode | Contraste, legibilidad |
| Accesibilidad | Navegación por teclado, screen readers |

**UAT - Por Rol**

| Rol | Escenarios Clave |
|-----|------------------|
| Cliente | Flujo completo de cita a entrega |
| Técnico | Día típico de trabajo |
| Operador | Manejo de recepción peak |
| Manager | Configuración y reportes |

### Cuadrante Q4: Pruebas Tecnológicas (Crítica al Producto)

**Pruebas de Rendimiento**

| Área | Métricas |
|------|----------|
| First Contentful Paint | < 1.5s |
| Time to Interactive | < 3s |
| Largest Contentful Paint | < 2.5s |
| Kanban con 100+ cards | Smooth drag & drop |
| Galería con 50+ imágenes | Lazy loading efectivo |

**Pruebas de Seguridad**

| Área | Verificaciones |
|------|----------------|
| Autenticación | JWT expiration, refresh flow |
| Autorización | Acceso por rol a rutas |
| API Routes | Rate limiting, input validation |
| CORS | Solo orígenes permitidos |
| Cookies | httpOnly, secure, sameSite |

**Pruebas de Carga**

| Escenario | Objetivo |
|-----------|----------|
| 50 usuarios concurrentes | Sin degradación |
| 100 citas/hora | Manejo de slots |
| 1000 OTs activas | Kanban responsive |

**Pruebas de Compatibilidad**

| Plataforma | Navegadores |
|------------|-------------|
| Desktop | Chrome, Firefox, Safari, Edge |
| Mobile | Chrome Android, Safari iOS |
| Tablet | Chrome, Safari |

---

## Métricas de Calidad Objetivo

| Métrica | Objetivo |
|---------|----------|
| Cobertura de código (Unit) | > 70% |
| Cobertura de flujos críticos (E2E) | 100% |
| Bugs críticos en producción | 0 |
| Tiempo de respuesta API | < 500ms p95 |
| Disponibilidad | > 99.5% |

---

## Contacto

Para dudas sobre el proyecto, contactar al equipo de desarrollo de Ambacar.
