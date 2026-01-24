import { NextRequest, NextResponse } from "next/server"

const ERP_BASE_URL = process.env.AMBACAR_ERP_API_URL || "https://ambysoftapitest.ambacar.ec:8443"

interface EmpleadoERP {
  idEmpleado: number
  nombreEmpleado: string
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const idTaller = searchParams.get("idTaller")

  if (!idTaller) {
    return NextResponse.json(
      { error: "idTaller is required" },
      { status: 400 }
    )
  }

  try {
    const response = await fetch(
      `${ERP_BASE_URL}/Apis/Taller/ObtenerAsesoresTecnico?idTaller=${idTaller}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    )

    if (!response.ok) {
      return NextResponse.json(
        { error: `ERP API error: ${response.status}` },
        { status: response.status }
      )
    }

    const tecnicos: EmpleadoERP[] = await response.json()
    return NextResponse.json(tecnicos)
  } catch (error) {
    console.error("Error fetching asesores tecnicos from ERP:", error)
    return NextResponse.json(
      { error: "Failed to fetch asesores tecnicos" },
      { status: 502 }
    )
  }
}
