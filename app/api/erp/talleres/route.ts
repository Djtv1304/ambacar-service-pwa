import { NextResponse } from "next/server"

const ERP_BASE_URL = process.env.AMBACAR_ERP_API_URL || "https://ambysoftapitest.ambacar.ec:8443"

interface TallerERP {
  idTaller: number
  nombreTaller: string
  idAgencia: string
}

export async function GET() {
  try {
    const response = await fetch(`${ERP_BASE_URL}/Apis/Taller/ObtenerTalleres`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: `ERP API error: ${response.status}` },
        { status: response.status }
      )
    }

    const talleres: TallerERP[] = await response.json()
    return NextResponse.json(talleres)
  } catch (error) {
    console.error("Error fetching talleres from ERP:", error)
    return NextResponse.json(
      { error: "Failed to fetch talleres" },
      { status: 502 }
    )
  }
}
