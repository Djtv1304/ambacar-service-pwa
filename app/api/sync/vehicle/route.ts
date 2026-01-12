import { NextRequest, NextResponse } from "next/server"

export interface SyncVehiclePayload {
  vehicle_id: string
  customer_id: string
  plate: string
  brand: string
  model: string
  year: number
  current_kilometers: number
  last_service_date?: string | null
  next_service_kilometers?: number | null
  sync_version: number
}

export async function POST(request: NextRequest) {
  try {
    const body: SyncVehiclePayload = await request.json()

    const notificationsApiUrl =
      process.env.NEXT_PUBLIC_NOTIFICATIONS_API_URL || "http://localhost:8001"
    const internalApiKey = process.env.INTERNAL_API_SECRET_KEY

    if (!internalApiKey) {
      return NextResponse.json({ error: "Internal API key not configured" }, { status: 500 })
    }

    const response = await fetch(`${notificationsApiUrl}/api/internal/v1/vehicles/sync/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-secret": internalApiKey,
      },
      body: JSON.stringify({
        ...body,
        sync_version: 1,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      return NextResponse.json(
        { error: "Failed to sync vehicle", details: error },
        { status: response.status }
      )
    }

    return NextResponse.json({ success: true, status: response.status }, { status: 202 })
  } catch (error) {
    console.error("Error syncing vehicle:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
