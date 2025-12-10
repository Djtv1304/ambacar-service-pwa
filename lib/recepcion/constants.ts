export const TIPOS_FOTO = [
    { id: "FRONTAL", label: "Foto Frontal", orden: 1 },
    { id: "TRASERA", label: "Foto Trasera", orden: 2 },
    { id: "LATERAL_IZQ", label: "Lateral Izquierdo", orden: 3 },
    { id: "LATERAL_DER", label: "Lateral Derecho", orden: 4 },
] as const

export const NIVELES_COMBUSTIBLE = [
    { value: "1/4", label: "1/4 Tanque" },
    { value: "1/2", label: "1/2 Tanque" },
    { value: "3/4", label: "3/4 Tanque" },
    { value: "lleno", label: "Tanque Lleno" },
] as const

export const FOTOS_REQUERIDAS = 4