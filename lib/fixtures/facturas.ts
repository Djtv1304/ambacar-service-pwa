import type { Factura } from "@/lib/types"

export const mockFacturas: Factura[] = [
  {
    id: "f1",
    numero: "FAC-2025-001",
    ordenTrabajoId: "ot1",
    clienteId: "c1",
    fecha: new Date("2025-01-13"),
    subtotal: 137.0,
    iva: 16.44,
    descuento: 0,
    total: 153.44,
    estado: "pendiente",
    createdAt: new Date("2025-01-13"),
    updatedAt: new Date("2025-01-13"),
  },
  {
    id: "f2",
    numero: "FAC-2025-002",
    ordenTrabajoId: "ot2",
    clienteId: "c3",
    fecha: new Date("2025-01-12"),
    subtotal: 250.0,
    iva: 30.0,
    descuento: 25.0,
    total: 255.0,
    estado: "pagada",
    metodoPago: "tarjeta",
    createdAt: new Date("2025-01-12"),
    updatedAt: new Date("2025-01-12"),
  },
]
