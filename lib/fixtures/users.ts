/**
 * Mock Users Fixture
 * Local user type for mock data (matches legacy Spanish field names)
 */

// Local user type for the mock data (matches legacy Spanish field names)
export interface MockUser {
  id: string
  email: string
  nombre: string
  apellido: string
  rol: "admin" | "technician" | "manager" | "customer" | "operator"
  telefono: string
  sucursal?: string
  activo: boolean
  createdAt: Date
  updatedAt: Date
}

export const mockUsers: MockUser[] = [
  {
    id: "1",
    email: "admin@ambacar.com",
    nombre: "Carlos",
    apellido: "Administrador",
    rol: "admin",
    telefono: "+593 99 123 4567",
    sucursal: "Quito Norte",
    activo: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "2",
    email: "recepcion@ambacar.com",
    nombre: "María",
    apellido: "Sanchez",
    rol: "operator",
    telefono: "+593 99 234 5678",
    sucursal: "Quito Norte",
    activo: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "3",
    email: "tecnico1@ambacar.com",
    nombre: "Juan",
    apellido: "Técnico",
    rol: "technician",
    telefono: "+593 99 345 6789",
    sucursal: "Quito Norte",
    activo: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "4",
    email: "jefe@ambacar.com",
    nombre: "Roberto",
    apellido: "Pérez",
    rol: "manager",
    telefono: "+593 99 456 7890",
    sucursal: "Quito Norte",
    activo: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "5",
    email: "cliente@example.com",
    nombre: "Ana",
    apellido: "Baglio",
    rol: "customer",
    telefono: "+593 99 567 8901",
    activo: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
]

// Mock credentials for testing
export const mockCredentials = {
  admin: { email: "admin@ambacar.com", password: "admin123" },
  recepcion: { email: "recepcion@ambacar.com", password: "recepcion123" },
  tecnico: { email: "tecnico1@ambacar.com", password: "tecnico123" },
  jefe: { email: "jefe@ambacar.com", password: "jefe123" },
  cliente: { email: "cliente@example.com", password: "cliente123" },
}
