import { NextRequest, NextResponse } from "next/server"

const ERP_BASE_URL = process.env.AMBACAR_ERP_API_URL || "https://ambysoftapitest.ambacar.ec:8443"

export async function PATCH(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const idAgencia = searchParams.get("IdAgencia")
  const codigoRepuesto = searchParams.get("codigoRepuesto")
  const cantidad = searchParams.get("cantidad")

  if (!idAgencia || !codigoRepuesto || !cantidad) {
    return NextResponse.json(
      { error: "IdAgencia, codigoRepuesto, and cantidad are required" },
      { status: 400 }
    )
  }

  try {
    const url = new URL(`${ERP_BASE_URL}/Apis/Taller/AsignarRepuesto`)
    url.searchParams.set("IdAgencia", idAgencia)
    url.searchParams.set("codigoRepuesto", codigoRepuesto)
    url.searchParams.set("cantidad", cantidad)

    const response = await fetch(url.toString(), {
      method: "PATCH",
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
    console.error("Error assigning repuesto in ERP:", error)
    return NextResponse.json(
      { error: "Failed to assign repuesto" },
      { status: 502 }
    )
  }
}
