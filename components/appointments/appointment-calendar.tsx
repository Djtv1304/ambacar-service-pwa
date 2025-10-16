"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Cita } from "@/lib/types"
import { cn } from "@/lib/utils"

interface AppointmentCalendarProps {
  appointments: Cita[]
  onSelectDate?: (date: Date) => void
}

export function AppointmentCalendar({ appointments, onSelectDate }: AppointmentCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ]

  const daysOfWeek = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    return { daysInMonth, startingDayOfWeek }
  }

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter((apt) => {
      const aptDate = new Date(apt.fecha)
      return (
        aptDate.getDate() === date.getDate() &&
        aptDate.getMonth() === date.getMonth() &&
        aptDate.getFullYear() === date.getFullYear()
      )
    })
  }

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate)

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const handleDateClick = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    setSelectedDate(date)
    onSelectDate?.(date)
  }

  const isToday = (day: number) => {
    const today = new Date()
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    )
  }

  const isSelected = (day: number) => {
    if (!selectedDate) return false
    return (
      day === selectedDate.getDate() &&
      currentDate.getMonth() === selectedDate.getMonth() &&
      currentDate.getFullYear() === selectedDate.getFullYear()
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={previousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {daysOfWeek.map((day) => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}

          {Array.from({ length: startingDayOfWeek }).map((_, index) => (
            <div key={`empty-${index}`} />
          ))}

          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
            const dayAppointments = getAppointmentsForDate(date)
            const hasAppointments = dayAppointments.length > 0

            return (
              <button
                key={day}
                onClick={() => handleDateClick(day)}
                className={cn(
                  "relative aspect-square rounded-lg p-2 text-sm transition-colors hover:bg-accent",
                  isToday(day) && "bg-primary/10 font-bold text-primary",
                  isSelected(day) && "bg-primary text-primary-foreground hover:bg-primary/90",
                  !isToday(day) && !isSelected(day) && "text-foreground",
                )}
              >
                <span>{day}</span>
                {hasAppointments && (
                  <div className="absolute bottom-1 left-1/2 flex -translate-x-1/2 gap-0.5">
                    {dayAppointments.slice(0, 3).map((_, i) => (
                      <div key={i} className="h-1 w-1 rounded-full bg-primary" />
                    ))}
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {selectedDate && (
          <div className="mt-4 space-y-2 border-t border-border pt-4">
            <p className="text-sm font-medium">
              Citas para {selectedDate.toLocaleDateString("es-EC", { dateStyle: "long" })}
            </p>
            {getAppointmentsForDate(selectedDate).length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay citas programadas</p>
            ) : (
              <div className="space-y-2">
                {getAppointmentsForDate(selectedDate).map((apt) => (
                  <div key={apt.id} className="flex items-center justify-between rounded-lg border border-border p-2">
                    <div>
                      <p className="text-sm font-medium">{apt.hora}</p>
                      <p className="text-xs text-muted-foreground">{apt.servicioSolicitado}</p>
                    </div>
                    <Badge variant="outline">{apt.estado}</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
