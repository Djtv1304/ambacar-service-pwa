"use client"

import { use } from "react"
import { notFound } from "next/navigation"
import { TechnicianOrderDetail } from "@/components/taller/technician-order-detail"
import { mockTechnicianOrder } from "@/lib/fixtures/technical-progress"

export default function TallerOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params)
  const orderId = resolvedParams.id

  // TODO: Fetch real order from API
  // For now, use mock data if ID matches
  const order = orderId === mockTechnicianOrder.id || orderId === "ot-001"
    ? mockTechnicianOrder
    : null

  if (!order) {
    notFound()
  }

  return <TechnicianOrderDetail order={order} />
}

