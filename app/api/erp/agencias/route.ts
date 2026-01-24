import { NextResponse } from "next/server"

const ERP_BASE_URL = process.env.AMBACAR_ERP_API_URL || "https://ambysoftapitest.ambacar.ec:8443"

/** Agency IDs relevant to workshop operations */
const ALLOWED_AGENCY_IDS = [
  "CU", "FC", "FI", "GR", "IN", "MA", "MS",
  "QA", "QC", "QL", "QN", "QP", "QS", "QT", "SR",
] as const

interface AgenciaERP {
  idAgencia: string
  nombreAgencia: string
  ciudadAgencia: string
  direccion: string
  urlComoLlegar: string | null
}

export async function GET() {
  try {
    const response = await fetch(`${ERP_BASE_URL}/Apis/Taller/ObtenerAgencias`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: `ERP API error: ${response.status}` },
        { status: response.status }
      )
    }

    const allAgencias: AgenciaERP[] = await response.json()

    const filtered = allAgencias.filter((a) =>
      (ALLOWED_AGENCY_IDS as readonly string[]).includes(a.idAgencia)
    )

    return NextResponse.json(filtered)
  } catch (error) {
    console.error("Error fetching agencies from ERP:", error)
    return NextResponse.json(
      { error: "Failed to fetch agencies" },
      { status: 502 }
    )
  }
}
