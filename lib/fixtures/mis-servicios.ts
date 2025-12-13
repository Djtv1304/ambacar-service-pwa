// Mock data for "Mis Servicios" module
import type {
  ClientService,
  ServiceDetail,
  TimelineEvent,
  AdditionalWork
} from "@/lib/mis-servicios/types"

// Mock active services for the client
export const mockClientServices: ClientService[] = [
  {
    id: "srv1",
    ordenTrabajoId: "ot1",
    numeroOrden: "OT-2025-001",
    vehiculo: {
      id: "v1",
      placa: "ABC-1234",
      marca: "Toyota",
      modelo: "Corolla",
      anio: 2020,
      color: "Blanco",
      imagen: "/placeholder.svg",
    },
    estado: "en_progreso",
    progreso: 65,
    fechaIngreso: new Date("2025-12-10T09:00:00"),
    fechaEstimadaEntrega: new Date("2025-12-13T17:00:00"),
    taller: {
      nombre: "Ambacar Quito Norte",
      direccion: "Av. 6 de Diciembre N50-30",
    },
    pendingApprovals: 2,
    totalEstimado: 485.50,
    servicioSolicitado: "Mantenimiento preventivo 45,000 km",
  },
  {
    id: "srv2",
    ordenTrabajoId: "ot2",
    numeroOrden: "OT-2025-002",
    vehiculo: {
      id: "v2",
      placa: "XYZ-5678",
      marca: "Chevrolet",
      modelo: "Sail",
      anio: 2019,
      color: "Gris",
      imagen: "/placeholder.svg",
    },
    estado: "diagnostico",
    progreso: 25,
    fechaIngreso: new Date("2025-12-11T11:00:00"),
    fechaEstimadaEntrega: new Date("2025-12-14T12:00:00"),
    taller: {
      nombre: "Ambacar Quito Norte",
      direccion: "Av. 6 de Diciembre N50-30",
    },
    pendingApprovals: 0,
    totalEstimado: 120.00,
    servicioSolicitado: "Cambio de aceite y filtros",
  },
]

// Mock completed services (history)
export const mockCompletedServices: ClientService[] = [
  {
    id: "srv3",
    ordenTrabajoId: "ot3",
    numeroOrden: "OT-2024-156",
    vehiculo: {
      id: "v1",
      placa: "ABC-1234",
      marca: "Toyota",
      modelo: "Corolla",
      anio: 2020,
      color: "Blanco",
      imagen: "/placeholder.svg",
    },
    estado: "entregado",
    progreso: 100,
    fechaIngreso: new Date("2024-11-15T09:00:00"),
    fechaEstimadaEntrega: new Date("2024-11-15T17:00:00"),
    taller: {
      nombre: "Ambacar Quito Norte",
      direccion: "Av. 6 de Diciembre N50-30",
    },
    pendingApprovals: 0,
    totalEstimado: 350.00,
    servicioSolicitado: "Mantenimiento 40,000 km",
  },
  {
    id: "srv4",
    ordenTrabajoId: "ot4",
    numeroOrden: "OT-2024-120",
    vehiculo: {
      id: "v1",
      placa: "ABC-1234",
      marca: "Toyota",
      modelo: "Corolla",
      anio: 2020,
      color: "Blanco",
      imagen: "/placeholder.svg",
    },
    estado: "entregado",
    progreso: 100,
    fechaIngreso: new Date("2024-08-20T10:00:00"),
    fechaEstimadaEntrega: new Date("2024-08-21T16:00:00"),
    taller: {
      nombre: "Ambacar Quito Norte",
      direccion: "Av. 6 de Diciembre N50-30",
    },
    pendingApprovals: 0,
    totalEstimado: 520.00,
    servicioSolicitado: "Cambio de pastillas de freno",
  },
]

// Mock timeline events
export const mockTimelineEvents: TimelineEvent[] = [
  {
    id: "evt1",
    fase: "Recepción",
    descripcion: "Vehículo ingresado al taller",
    fecha: new Date("2025-12-10T09:15:00"),
    completada: true,
    enProgreso: false,
    responsable: "Carlos Mendez",
    evidencia: [
      {
        id: "ev1",
        tipo: "foto",
        url: "/placeholder.svg",
        thumbnail: "/placeholder.svg",
        descripcion: "Estado del vehículo al ingreso - frontal",
        fecha: new Date("2025-12-10T09:20:00"),
      },
      {
        id: "ev2",
        tipo: "foto",
        url: "/placeholder.svg",
        thumbnail: "/placeholder.svg",
        descripcion: "Estado del vehículo al ingreso - lateral",
        fecha: new Date("2025-12-10T09:21:00"),
      },
    ],
    notas: "Vehículo recibido con rayón menor en puerta trasera derecha (existente)",
  },
  {
    id: "evt2",
    fase: "Diagnóstico",
    descripcion: "Inspección técnica completada",
    fecha: new Date("2025-12-10T11:30:00"),
    completada: true,
    enProgreso: false,
    responsable: "Miguel Torres",
    evidencia: [
      {
        id: "ev3",
        tipo: "foto",
        url: "/placeholder.svg",
        thumbnail: "/placeholder.svg",
        descripcion: "Estado de pastillas de freno - desgaste 60%",
        fecha: new Date("2025-12-10T11:00:00"),
      },
    ],
    notas: "Se detectaron hallazgos adicionales. Se requiere aprobación del cliente.",
  },
  {
    id: "evt3",
    fase: "En Progreso",
    descripcion: "Mantenimiento preventivo en ejecución",
    fecha: new Date("2025-12-11T08:00:00"),
    completada: false,
    enProgreso: true,
    responsable: "Miguel Torres",
    evidencia: [
      {
        id: "ev4",
        tipo: "foto",
        url: "/placeholder.svg",
        thumbnail: "/placeholder.svg",
        descripcion: "Cambio de aceite completado",
        fecha: new Date("2025-12-11T09:30:00"),
      },
    ],
    notas: "Cambio de aceite y filtro de aire completados. Pendiente: revisión de frenos.",
  },
  {
    id: "evt4",
    fase: "Pruebas",
    descripcion: "Prueba de ruta y verificación",
    fecha: new Date("2025-12-13T14:00:00"),
    completada: false,
    enProgreso: false,
  },
  {
    id: "evt5",
    fase: "Listo para Entrega",
    descripcion: "Vehículo listo para retiro",
    fecha: new Date("2025-12-13T16:00:00"),
    completada: false,
    enProgreso: false,
  },
]

// Mock additional work items
export const mockAdditionalWork: AdditionalWork[] = [
  {
    id: "aw1",
    titulo: "Cambio de pastillas de freno delanteras",
    descripcion: "Las pastillas de freno delanteras presentan desgaste del 60%",
    justificacionTecnica: "El desgaste actual está por debajo del umbral de seguridad recomendado (30% restante). Se recomienda el reemplazo preventivo para evitar daños en los discos de freno y garantizar la seguridad del vehículo.",
    severidad: "importante",
    costoManoObra: 45.00,
    costoRepuestos: 85.00,
    costoTotal: 130.00,
    repuestos: [
      {
        id: "rep1",
        nombre: "Pastillas de freno delanteras Toyota OEM",
        cantidad: 1,
        precioUnitario: 85.00,
        subtotal: 85.00,
      },
    ],
    fotos: ["/placeholder.svg"],
    estado: "pendiente",
    fechaSolicitud: new Date("2025-12-10T11:45:00"),
  },
  {
    id: "aw2",
    titulo: "Cambio de filtro de cabina",
    descripcion: "El filtro de cabina está saturado y con olores",
    justificacionTecnica: "El filtro de aire de cabina presenta acumulación de polvo y humedad. Esto puede afectar la calidad del aire interior y el rendimiento del aire acondicionado.",
    severidad: "recomendado",
    costoManoObra: 15.00,
    costoRepuestos: 25.00,
    costoTotal: 40.00,
    repuestos: [
      {
        id: "rep2",
        nombre: "Filtro de cabina con carbón activado",
        cantidad: 1,
        precioUnitario: 25.00,
        subtotal: 25.00,
      },
    ],
    estado: "pendiente",
    fechaSolicitud: new Date("2025-12-10T11:50:00"),
  },
]

// Mock approved additional work
export const mockApprovedWork: AdditionalWork[] = [
  {
    id: "aw3",
    titulo: "Cambio de líquido refrigerante",
    descripcion: "El líquido refrigerante necesita reemplazo",
    justificacionTecnica: "El refrigerante ha perdido propiedades según los intervalos de mantenimiento.",
    severidad: "recomendado",
    costoManoObra: 20.00,
    costoRepuestos: 35.00,
    costoTotal: 55.00,
    repuestos: [
      {
        id: "rep3",
        nombre: "Refrigerante Toyota Long Life",
        cantidad: 2,
        precioUnitario: 17.50,
        subtotal: 35.00,
      },
    ],
    estado: "aprobado",
    fechaSolicitud: new Date("2025-12-10T12:00:00"),
    fechaRespuesta: new Date("2025-12-10T14:30:00"),
  },
]

// Mock rejected additional work
export const mockRejectedWork: AdditionalWork[] = [
  {
    id: "aw4",
    titulo: "Limpieza de inyectores",
    descripcion: "Servicio de limpieza preventiva de inyectores",
    justificacionTecnica: "Se recomienda limpieza para optimizar el consumo de combustible.",
    severidad: "opcional",
    costoManoObra: 60.00,
    costoRepuestos: 40.00,
    costoTotal: 100.00,
    repuestos: [
      {
        id: "rep4",
        nombre: "Aditivo limpiador de inyectores",
        cantidad: 1,
        precioUnitario: 40.00,
        subtotal: 40.00,
      },
    ],
    estado: "rechazado",
    fechaSolicitud: new Date("2025-12-10T12:05:00"),
    fechaRespuesta: new Date("2025-12-10T15:00:00"),
  },
]

// Complete service detail mock
export const mockServiceDetail: ServiceDetail = {
  ...mockClientServices[0],
  cliente: {
    id: "c1",
    nombre: "Pedro",
    apellido: "González",
    email: "pedro.gonzalez@email.com",
    telefono: "0991234567",
  },
  recepcion: {
    kilometraje: 45000,
    nivelCombustible: 75,
    observaciones: "Cliente solicita revisión de frenos. Menciona leve vibración al frenar.",
    fotosIngreso: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
  },
  timeline: mockTimelineEvents,
  trabajosAdicionales: mockAdditionalWork,
  trabajosAprobados: mockApprovedWork,
  trabajosRechazados: mockRejectedWork,
  subtotal: 433.48,
  descuento: 0,
  iva: 52.02,
  total: 485.50,
  tecnicoAsignado: {
    id: "t1",
    nombre: "Miguel Torres",
    especialidad: "Mecánica General",
  },
}

// Helper to get service by ID
export function getMockServiceById(id: string): ServiceDetail | null {
  if (id === "srv1" || id === "ot1") {
    return mockServiceDetail
  }
  return null
}

// Helper to get all services for current client
export function getMockClientServices() {
  return {
    active: mockClientServices,
    completed: mockCompletedServices,
  }
}

