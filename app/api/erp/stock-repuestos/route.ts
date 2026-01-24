import { NextRequest, NextResponse } from "next/server"

const ERP_BASE_URL = process.env.AMBACAR_ERP_API_URL || "https://ambysoftapitest.ambacar.ec:8443"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const idAgencia = searchParams.get("idAgencia")
  const descripcion = searchParams.get("descripcion")
  const page = searchParams.get("page") || "1"
  const pageSize = searchParams.get("pageSize") || "50"

  if (!idAgencia || !descripcion) {
    return NextResponse.json(
      { error: "idAgencia and descripcion are required" },
      { status: 400 }
    )
  }

  try {
    const url = new URL(`${ERP_BASE_URL}/Apis/Taller/ObtenerStockRepuestos`)
    url.searchParams.set("idAgencia", idAgencia)
    url.searchParams.set("descripcion", descripcion.toUpperCase())
    url.searchParams.set("page", page)
    url.searchParams.set("pageSize", pageSize)

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: `ERP API error: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching stock from ERP:", error)
    return NextResponse.json(
      { error: "Failed to fetch stock" },
      { status: 502 }
    )
  }
}
