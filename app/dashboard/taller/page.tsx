"use client"

import { useAuth } from "@/components/auth/auth-provider"
import { isTechnician, isInternalUser } from "@/lib/auth/roles"
import { TechnicianOrdersList } from "@/components/taller/technician-orders-list"
import { KanbanBoardView } from "@/components/taller/kanban-board"
import {
  mockTechnicianOrder,
  getMockKanbanBoard,
  type TechnicianOrder,
} from "@/lib/fixtures/technical-progress"
import { Skeleton } from "@/components/ui/skeleton"

export default function TallerPage() {
  const { user, isLoading } = useAuth()

  // Loading state
  if (isLoading) {
    return <TallerPageSkeleton />
  }

  // Determine which view to show based on role
  const userIsTechnician = isTechnician(user)
  const userIsAdmin = isInternalUser(user) && !userIsTechnician

  // Technician View - Show their assigned orders
  if (userIsTechnician) {
    // TODO: Fetch real orders from API
    const technicianOrders: TechnicianOrder[] = [mockTechnicianOrder]

    return (
      <div className="p-4 md:p-6">
        <TechnicianOrdersList orders={technicianOrders} />
      </div>
    )
  }

  // Admin/Manager/Operator View - Show Kanban Board
  if (userIsAdmin) {
    const board = getMockKanbanBoard()

    return (
      <div className="p-4 md:p-6">
        <KanbanBoardView board={board} />
      </div>
    )
  }

  // Default fallback - Show Kanban for demo purposes
  const board = getMockKanbanBoard()
  return (
    <div className="p-4 md:p-6">
      <KanbanBoardView board={board} />
    </div>
  )
}

function TallerPageSkeleton() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-6 w-24" />
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="w-72 shrink-0 space-y-3">
            <Skeleton className="h-10 w-full rounded-t-lg" />
            <div className="space-y-2 p-2 border rounded-b-lg">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
