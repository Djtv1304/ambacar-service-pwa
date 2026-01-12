import { NextRequest, NextResponse } from "next/server"

export interface SyncCustomerPayload {
  customer_id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  whatsapp?: string
  sync_version: number
}

export async function POST(request: NextRequest) {
  try {
    const body: SyncCustomerPayload = await request.json()

    const notificationsApiUrl =
      process.env.NEXT_PUBLIC_NOTIFICATIONS_API_URL || "http://localhost:8001"
    const internalApiKey = process.env.INTERNAL_API_SECRET_KEY

    if (!internalApiKey) {
      return NextResponse.json({ error: "Internal API key not configured" }, { status: 500 })
    }

    const response = await fetch(`${notificationsApiUrl}/api/internal/v1/customers/sync/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-secret": internalApiKey,
      },
      body: JSON.stringify({
        ...body,
        whatsapp: body.whatsapp || body.phone, // Fallback: usar phone si no hay whatsapp
        sync_version: 1,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      return NextResponse.json(
        { error: "Failed to sync customer", details: error },
        { status: response.status }
      )
    }

    return NextResponse.json({ success: true, status: response.status }, { status: 202 })
  } catch (error) {
    console.error("Error syncing customer:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
