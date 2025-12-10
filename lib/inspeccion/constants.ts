export const PUNTOS_INSPECCION = [
  {
    id: "sistema-frenos",
    nombre: "Sistema de Frenos",
    descripcion: "Se revisa el estado de las pastillas, discos, tambores, líquido de frenos y funcionamiento general del sistema.",
    orden: 1,
  },
  {
    id: "sistema-direccion",
    nombre: "Sistema de Dirección",
    descripcion: "Se evalúa el estado de la dirección, incluyendo la columna, rótulas, terminales y caja de dirección.",
    orden: 2,
  },
  {
    id: "sistema-suspension",
    nombre: "Sistema de Suspensión",
    descripcion: "Se revisan los amortiguadores, resortes, rótulas, bujes y otros componentes de la suspensión.",
    orden: 3,
  },
  {
    id: "neumaticos",
    nombre: "Neumáticos",
    descripcion: "Se verifica la profundidad del dibujo, la presión, el estado general y la compatibilidad con el vehículo.",
    orden: 4,
  },
  {
    id: "luces",
    nombre: "Luces",
    descripcion: "Se revisan todas las luces (delanteras, traseras, direccionales, de freno, etc.) para asegurar su correcto funcionamiento y estado.",
    orden: 5,
  },
  {
    id: "sistema-electrico",
    nombre: "Sistema Eléctrico",
    descripcion: "Se verifica el estado de la batería, alternador, cables y otros componentes eléctricos.",
    orden: 6,
  },
  {
    id: "motor-transmision",
    nombre: "Motor y Transmisión",
    descripcion: "Se revisa el nivel de aceite, fugas, estado de correas y mangueras, y funcionamiento general del motor y la transmisión.",
    orden: 7,
  },
  {
    id: "emisiones",
    nombre: "Emisiones",
    descripcion: "Se realiza una prueba de gases para verificar que las emisiones del vehículo cumplan con los límites permitidos.",
    orden: 8,
  },
  {
    id: "chasis-carroceria",
    nombre: "Chasis y Carrocería",
    descripcion: "Se revisa el estado general del chasis, puertas, capó, etc., buscando corrosión, daños o modificaciones no autorizadas.",
    orden: 9,
  },
  {
    id: "sistema-escape",
    nombre: "Sistema de Escape",
    descripcion: "Se verifica el estado del silenciador, catalizador y tuberías, buscando fugas o daños.",
    orden: 10,
  },
  {
    id: "espejos-parabrisas",
    nombre: "Espejos y Parabrisas",
    descripcion: "Se revisa el estado y ajuste de los espejos retrovisores y el parabrisas.",
    orden: 11,
  },
  {
    id: "limpiaparabrisas",
    nombre: "Limpiaparabrisas",
    descripcion: "Se verifica el estado de las plumillas y el funcionamiento del sistema.",
    orden: 12,
  },
  {
    id: "cinturones-seguridad",
    nombre: "Cinturones de Seguridad",
    descripcion: "Se revisa el estado y funcionamiento de los cinturones.",
    orden: 13,
  },
  {
    id: "claxon",
    nombre: "Claxon",
    descripcion: "Se verifica el funcionamiento del claxon.",
    orden: 14,
  },
  {
    id: "sistema-enfriamiento",
    nombre: "Sistema de Enfriamiento",
    descripcion: "Se revisa el nivel de líquido refrigerante y el estado de las mangueras.",
    orden: 15,
  },
  {
    id: "filtros",
    nombre: "Filtros",
    descripcion: "Se verifica el estado del filtro de aire y el filtro de combustible.",
    orden: 16,
  },
  {
    id: "bocinas-alarmas",
    nombre: "Bocinas y Alarmas",
    descripcion: "Se verifica el funcionamiento de las bocinas y alarmas.",
    orden: 17,
  },
  {
    id: "placas",
    nombre: "Placas",
    descripcion: "Se verifica la validez de las placas del vehículo.",
    orden: 18,
  },
  {
    id: "sistema-seguridad",
    nombre: "Sistema de Seguridad",
    descripcion: "Se verifica el funcionamiento de los sistemas de seguridad como airbags, etc.",
    orden: 19,
  },
  {
    id: "sistema-combustible",
    nombre: "Sistema de Combustible",
    descripcion: "Se revisa el estado de las mangueras y conexiones del sistema de combustible, buscando fugas.",
    orden: 20,
  },
  {
    id: "sistema-aire-acondicionado",
    nombre: "Sistema de Aire Acondicionado",
    descripcion: "Se revisa el funcionamiento del sistema de aire acondicionado.",
    orden: 21,
  },
  {
    id: "sistema-calefaccion",
    nombre: "Sistema de Calefacción",
    descripcion: "Se revisa el funcionamiento del sistema de calefacción.",
    orden: 22,
  },
  {
    id: "suspension-trasera",
    nombre: "Sistema de Suspensión Trasera",
    descripcion: "Se revisa el estado y funcionamiento de los componentes de la suspensión trasera.",
    orden: 23,
  },
] as const

export type EstadoInspeccion = "verde" | "amarillo" | "rojo" | "na"

export const ESTADOS_INSPECCION: { value: EstadoInspeccion; label: string; color: string }[] = [
  { value: "verde", label: "Verde - Óptimo", color: "bg-green-500" },
  { value: "amarillo", label: "Amarillo - Precaución", color: "bg-yellow-500" },
  { value: "rojo", label: "Rojo - Crítico", color: "bg-red-500" },
  { value: "na", label: "N/A - No Aplica", color: "bg-gray-500" },
]

export const MIN_FOTOS_INSPECCION = 2
export const MAX_FOTOS_INSPECCION = 5

export type UrgenciaHallazgo = "inmediato" | "puede-esperar" | "preventivo"

export const URGENCIAS_HALLAZGO: { value: UrgenciaHallazgo; label: string; description: string }[] = [
  {
    value: "inmediato",
    label: "Inmediato",
    description: "Requiere atención urgente antes de usar el vehículo",
  },
  {
    value: "puede-esperar",
    label: "Puede Esperar",
    description: "Debe atenderse pronto pero no es crítico",
  },
  {
    value: "preventivo",
    label: "Preventivo",
    description: "Recomendación de mantenimiento preventivo",
  },
]
