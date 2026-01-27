/**
 * Datos de prueba para E2E tests
 * Fixtures compartidos entre todos los tests de Playwright
 * CREDENCIALES REALES - NO COMMITEAR A REPOSITORIO PÚBLICO
 */

export const testUsers = {
  admin: {
    email: 'diegosebastian_t@hotmail.com',
    password: 'MiPassword123!',
    role: 'admin',
  },
  technician: {
    email: 'diegosebastia94@gmail.com',
    password: 'MiPassword123!',
    role: 'technician',
  },
  operator: {
    email: 'andresfesvip@gmail.com',
    password: 'Andres.1*',
    role: 'operator',
  },
  customer: {
    email: 'aetf2006@hotmail.com',
    password: 'MiPassword123!',
    role: 'customer',
  },
}

export const testVehicle = {
  placa: 'ABC1234',
  marca: 'Toyota',
  modelo: 'Corolla',
  anio: 2020,
  color: 'Blanco',
  kilometraje: 50000,
  vin: '1HGCM82633A004352',
}

export const testAppointment = {
  fecha: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
  hora: '09:00',
  servicio: 'Cambio de aceite y revisión general',
  sucursal: 'Quicentro Sur',
}

export const testInspectionPoints = {
  frenos: {
    nombre: 'Sistema de frenos',
    estado: 'verde',
  },
  aceite: {
    nombre: 'Nivel de aceite',
    estado: 'amarillo',
    observaciones: 'Nivel bajo, requiere atención',
  },
  neumaticos: {
    nombre: 'Estado de neumáticos',
    estado: 'rojo',
    observaciones: 'Desgaste crítico en neumático delantero derecho',
  },
}

export const ocrTestData = {
  matriculaResponse: {
    placa: 'PBC4521',
    marca: 'Chevrolet',
    modelo: 'Aveo',
    anio: 2018,
    color: 'Gris',
    propietario: 'Juan Pérez',
    sugerencia_ia: {
      confianza: 0.95,
      alternativas: ['PBC4520', 'PBC4522'],
    },
  },
}
