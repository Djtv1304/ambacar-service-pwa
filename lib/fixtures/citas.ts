import type { Cita } from "../types"

export const citas: Cita[] = [
  {
    id: "CITA-001",
    clienteId: "CLI-001",
    vehiculoPlaca: "ABC-1234",
    fecha: "2025-01-20",
    hora: "09:00",
    servicio: "Mantenimiento preventivo 10.000 km",
    estado: "confirmada",
    observaciones: "Cliente solicita revisión de frenos",
    tecnicoAsignado: "Carlos Méndez",
    createdAt: "2025-01-15T10:30:00Z",
    updatedAt: "2025-01-15T10:30:00Z",
  },
  {
    id: "CITA-002",
    clienteId: "CLI-002",
    vehiculoPlaca: "XYZ-5678",
    fecha: "2025-01-21",
    hora: "14:00",
    servicio: "Diagnóstico general",
    estado: "pendiente",
    observaciones: "Ruido en motor",
    createdAt: "2025-01-16T11:00:00Z",
    updatedAt: "2025-01-16T11:00:00Z",
  },
  {
    id: "CITA-003",
    clienteId: "CLI-003",
    vehiculoPlaca: "DEF-9012",
    fecha: "2025-01-22",
    hora: "10:30",
    servicio: "Cambio de aceite y filtros",
    estado: "confirmada",
    tecnicoAsignado: "Luis Torres",
    createdAt: "2025-01-17T09:15:00Z",
    updatedAt: "2025-01-17T09:15:00Z",
  },
]

// Disponibilidad del taller (mock data)
export const disponibilidadTaller = {
  capacidadDiaria: 12, // 12 citas por día
  horariosDisponibles: ["08:00", "09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00"],
  diasNoLaborables: ["2025-01-25", "2025-01-26"], // Sábados/Domingos ejemplo
}
