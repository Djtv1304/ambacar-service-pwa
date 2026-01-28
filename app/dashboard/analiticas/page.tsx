"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  BarChart3,
  RefreshCw,
  AlertCircle,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  Zap,
  Mail,
  MessageCircle,
  Bell,
  Activity,
  Filter,
  ChevronDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { useNotificationAnalytics } from "@/hooks/use-notification-analytics"
import {
  formatNumber,
  formatPercent,
  formatDeliveryTime,
  formatDateTime,
  formatShortDate,
  eventTypeLabels,
  statusLabels,
  channelLabels,
  type NotificationChannel,
  type NotificationStatus,
  type EventType,
  type DailyBreakdown,
} from "@/lib/api/notification-analytics"

// ============================================
// Period Selector
// ============================================

const PERIOD_OPTIONS = [
  { value: 1, label: "24h" },
  { value: 7, label: "7d" },
  { value: 30, label: "30d" },
  { value: 90, label: "90d" },
]

function PeriodSelector({
  value,
  onChange,
}: {
  value: number
  onChange: (days: number) => void
}) {
  return (
    <div className="flex items-center gap-1 p-1 rounded-xl bg-gray-100 dark:bg-gray-800/60">
      {PERIOD_OPTIONS.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200",
            value === option.value
              ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

// ============================================
// Metric Card Component
// ============================================

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  trend?: "up" | "down" | "neutral"
  accentColor: string
  isLoading?: boolean
}

function MetricCard({
  title,
  value,
  subtitle,
  icon,
  accentColor,
  isLoading,
}: MetricCardProps) {
  if (isLoading) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-gray-200/60 dark:border-gray-700/50 bg-white dark:bg-gray-800/50 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-3 flex-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-10 w-10 rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative overflow-hidden rounded-2xl border border-gray-200/60 dark:border-gray-700/50 bg-white dark:bg-gray-800/50 p-5 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300"
    >
      {/* Subtle gradient overlay on hover */}
      <div
        className={cn(
          "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
          accentColor
        )}
        style={{
          background: `linear-gradient(135deg, var(--accent-color, transparent) 0%, transparent 60%)`,
        }}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white font-mono tabular-nums">
            {typeof value === "number" ? formatNumber(value) : value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {subtitle}
            </p>
          )}
        </div>
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
            accentColor
          )}
        >
          {icon}
        </div>
      </div>
    </motion.div>
  )
}

// ============================================
// Channel Health Card
// ============================================

function ChannelHealthCard({
  channel,
  health,
  isLoading,
}: {
  channel: NotificationChannel
  health: { total: number; success: number; failed: number; success_rate: number; is_healthy: boolean } | undefined
  isLoading: boolean
}) {
  const icons: Record<NotificationChannel, React.ReactNode> = {
    email: <Mail className="h-4 w-4" />,
    whatsapp: <MessageCircle className="h-4 w-4" />,
    push: <Bell className="h-4 w-4" />,
  }

  const colors: Record<NotificationChannel, { bg: string; text: string; ring: string }> = {
    email: {
      bg: "bg-amber-100 dark:bg-amber-900/30",
      text: "text-amber-600 dark:text-amber-400",
      ring: "ring-amber-500/20"
    },
    whatsapp: {
      bg: "bg-emerald-100 dark:bg-emerald-900/30",
      text: "text-emerald-600 dark:text-emerald-400",
      ring: "ring-emerald-500/20"
    },
    push: {
      bg: "bg-violet-100 dark:bg-violet-900/30",
      text: "text-violet-600 dark:text-violet-400",
      ring: "ring-violet-500/20"
    },
  }

  if (isLoading || !health) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/30">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-5 w-12 rounded-full" />
      </div>
    )
  }

  const color = colors[channel]

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/30 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
    >
      <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", color.bg, color.text)}>
        {icons[channel]}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">
          {channelLabels[channel]}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {formatNumber(health.success)}/{formatNumber(health.total)} exitosas
        </p>
      </div>

      <div className="flex items-center gap-2">
        <div className={cn(
          "h-2 w-2 rounded-full",
          health.is_healthy ? "bg-emerald-500" : "bg-red-500"
        )} />
        <span className={cn(
          "text-sm font-bold font-mono",
          health.is_healthy ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
        )}>
          {formatPercent(health.success_rate)}
        </span>
      </div>
    </motion.div>
  )
}

// ============================================
// Daily Trend Chart (CSS-based)
// ============================================

function DailyTrendChart({
  data,
  isLoading,
}: {
  data: DailyBreakdown[]
  isLoading: boolean
}) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="h-40 flex items-end gap-1">
          {Array.from({ length: 14 }).map((_, i) => (
            <Skeleton key={i} className="flex-1 rounded-t" style={{ height: `${Math.random() * 80 + 20}%` }} />
          ))}
        </div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-gray-400 dark:text-gray-500">
        <BarChart3 className="h-8 w-8 mb-2 opacity-50" />
        <p className="text-sm">Sin datos en este período</p>
      </div>
    )
  }

  const maxTotal = Math.max(...data.map((d) => d.total), 1)
  const lastData = data.slice(-14) // Show last 14 days max

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
          <span className="text-gray-600 dark:text-gray-400">Entregadas</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-sm bg-gray-300 dark:bg-gray-600" />
          <span className="text-gray-600 dark:text-gray-400">Enviadas</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-sm bg-red-400" />
          <span className="text-gray-600 dark:text-gray-400">Fallidas</span>
        </div>
      </div>

      {/* Chart */}
      <div className="relative h-36">
        <div className="absolute inset-0 flex items-end gap-1">
          {lastData.map((day, index) => {
            const totalHeight = (day.total / maxTotal) * 100
            // Calculate percentages relative to the day's total (for stacking)
            const deliveredPercent = day.total > 0 ? (day.delivered / day.total) * 100 : 0
            const failedPercent = day.total > 0 ? (day.failed / day.total) * 100 : 0
            const otherPercent = Math.max(0, 100 - deliveredPercent - failedPercent)

            return (
              <motion.div
                key={day.date}
                initial={{ height: 0 }}
                animate={{ height: `${totalHeight}%` }}
                transition={{ delay: index * 0.03, duration: 0.4, ease: "easeOut" }}
                className="group flex-1 relative cursor-pointer min-h-[4px]"
              >
                {/* Stacked bar - fills the entire animated height */}
                <div className="absolute inset-0 flex flex-col rounded-t overflow-hidden">
                  {/* Failed (red) - top */}
                  {failedPercent > 0 && (
                    <div
                      className="bg-red-400 dark:bg-red-500 shrink-0"
                      style={{ height: `${failedPercent}%` }}
                    />
                  )}
                  {/* Other/Pending (gray) - middle */}
                  {otherPercent > 0 && (
                    <div
                      className="bg-gray-300 dark:bg-gray-600 shrink-0"
                      style={{ height: `${otherPercent}%` }}
                    />
                  )}
                  {/* Delivered (green) - bottom */}
                  {deliveredPercent > 0 && (
                    <div
                      className="bg-emerald-500 dark:bg-emerald-400 transition-colors group-hover:bg-emerald-600 dark:group-hover:bg-emerald-300 flex-1"
                      style={{ minHeight: `${deliveredPercent}%` }}
                    />
                  )}
                </div>

                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  <div className="bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg px-2 py-1.5 whitespace-nowrap shadow-lg">
                    <p className="font-semibold">{formatShortDate(day.date)}</p>
                    <p className="text-emerald-300">Entregadas: {day.delivered}</p>
                    <p className="text-red-300">Fallidas: {day.failed}</p>
                    <p className="text-gray-300">Total: {day.total}</p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Y-axis guides */}
        <div className="absolute inset-y-0 left-0 w-full flex flex-col justify-between pointer-events-none">
          <div className="border-t border-dashed border-gray-200 dark:border-gray-700" />
          <div className="border-t border-dashed border-gray-200 dark:border-gray-700" />
          <div className="border-t border-dashed border-gray-200 dark:border-gray-700" />
        </div>
      </div>

      {/* X-axis labels */}
      <div className="flex justify-between text-[10px] text-gray-400 dark:text-gray-500 font-mono">
        <span>{lastData[0] ? formatShortDate(lastData[0].date) : ""}</span>
        <span>{lastData[lastData.length - 1] ? formatShortDate(lastData[lastData.length - 1].date) : ""}</span>
      </div>
    </div>
  )
}

// ============================================
// Channel Distribution (Donut-style)
// ============================================

function ChannelDistribution({
  data,
  isLoading,
}: {
  data: Partial<Record<NotificationChannel, number>> | undefined
  isLoading: boolean
}) {
  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center h-32">
        <Skeleton className="h-24 w-24 rounded-full" />
      </div>
    )
  }

  const channels: NotificationChannel[] = ["email", "whatsapp", "push"]
  const total = channels.reduce((sum, ch) => sum + (data[ch] || 0), 0)

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-32 text-gray-400">
        <Activity className="h-6 w-6 mb-2 opacity-50" />
        <p className="text-xs">Sin actividad</p>
      </div>
    )
  }

  const colors: Record<NotificationChannel, { stroke: string; fill: string }> = {
    email: { stroke: "stroke-amber-500", fill: "bg-amber-500" },
    whatsapp: { stroke: "stroke-emerald-500", fill: "bg-emerald-500" },
    push: { stroke: "stroke-violet-500", fill: "bg-violet-500" },
  }

  // Calculate percentages
  const percentages = channels.map((ch) => ({
    channel: ch,
    value: data[ch] || 0,
    percent: total > 0 ? ((data[ch] || 0) / total) * 100 : 0,
  }))

  // SVG donut calculations
  const radius = 40
  const circumference = 2 * Math.PI * radius
  let offset = 0

  return (
    <div className="flex items-center gap-6">
      {/* Donut */}
      <div className="relative">
        <svg width="100" height="100" viewBox="0 0 100 100" className="-rotate-90">
          {percentages.map((item) => {
            const strokeDasharray = (item.percent / 100) * circumference
            const currentOffset = offset
            offset += strokeDasharray

            return (
              <motion.circle
                key={item.channel}
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                strokeWidth="12"
                className={colors[item.channel].stroke}
                strokeDasharray={`${strokeDasharray} ${circumference}`}
                strokeDashoffset={-currentOffset}
                initial={{ strokeDasharray: `0 ${circumference}` }}
                animate={{ strokeDasharray: `${strokeDasharray} ${circumference}` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            )
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-gray-900 dark:text-white font-mono">
            {formatNumber(total)}
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-2">
        {percentages.map((item) => (
          <div key={item.channel} className="flex items-center gap-2">
            <div className={cn("h-3 w-3 rounded-sm", colors[item.channel].fill)} />
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {channelLabels[item.channel]}
            </span>
            <span className="text-xs font-semibold text-gray-900 dark:text-white font-mono">
              {item.percent.toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================
// Recent Logs Table
// ============================================

function RecentLogsTable({
  logs,
  isLoading,
  channelFilter,
  statusFilter,
  onChannelChange,
  onStatusChange,
}: {
  logs: any[]
  isLoading: boolean
  channelFilter: NotificationChannel | undefined
  statusFilter: NotificationStatus | undefined
  onChannelChange: (ch: NotificationChannel | undefined) => void
  onStatusChange: (st: NotificationStatus | undefined) => void
}) {
  const channelIcons: Record<NotificationChannel, React.ReactNode> = {
    email: <Mail className="h-3.5 w-3.5" />,
    whatsapp: <MessageCircle className="h-3.5 w-3.5" />,
    push: <Bell className="h-3.5 w-3.5" />,
  }

  const statusStyles: Record<NotificationStatus, { bg: string; text: string }> = {
    pending: { bg: "bg-yellow-100 dark:bg-yellow-900/30", text: "text-yellow-700 dark:text-yellow-400" },
    queued: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-400" },
    sent: { bg: "bg-cyan-100 dark:bg-cyan-900/30", text: "text-cyan-700 dark:text-cyan-400" },
    delivered: { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-400" },
    read: { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-400" },
    bounced: { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-700 dark:text-orange-400" },
    failed: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-400" },
  }

  const channelColors: Record<NotificationChannel, string> = {
    email: "text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30",
    whatsapp: "text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30",
    push: "text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-900/30",
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
          <Filter className="h-3.5 w-3.5" />
          <span>Filtros:</span>
        </div>

        <Select
          value={channelFilter || "all"}
          onValueChange={(v) => onChannelChange(v === "all" ? undefined : v as NotificationChannel)}
        >
          <SelectTrigger className="h-7 w-28 text-xs">
            <SelectValue placeholder="Canal" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="whatsapp">WhatsApp</SelectItem>
            <SelectItem value="push">Push</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={statusFilter || "all"}
          onValueChange={(v) => onStatusChange(v === "all" ? undefined : v as NotificationStatus)}
        >
          <SelectTrigger className="h-7 w-28 text-xs">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="delivered">Entregado</SelectItem>
            <SelectItem value="sent">Enviado</SelectItem>
            <SelectItem value="pending">Pendiente</SelectItem>
            <SelectItem value="failed">Fallido</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Logs List */}
      <ScrollArea className="h-[320px] pr-3">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/30">
                <Skeleton className="h-6 w-6 rounded" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400">
            <Send className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm">Sin registros</p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {logs.map((log, index) => {
                const statusStyle = statusStyles[log.status as NotificationStatus] || statusStyles.pending
                const channelColor = channelColors[log.channel as NotificationChannel] || channelColors.email

                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.02 }}
                    className="group flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/30 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    {/* Channel Icon */}
                    <div className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-lg", channelColor)}>
                      {channelIcons[log.channel as NotificationChannel]}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {eventTypeLabels[log.event_type as EventType] || log.event_type}
                        </span>
                        <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", statusStyle.bg, statusStyle.text)}>
                          {statusLabels[log.status as NotificationStatus] || log.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                        <span className="font-mono">{log.recipient_id}</span>
                        <span>•</span>
                        <span>{formatDateTime(log.created_at)}</span>
                      </div>
                      {log.error_reason && (
                        <p className="mt-1 text-xs text-red-600 dark:text-red-400 truncate">
                          {log.error_reason}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </ScrollArea>
    </div>
  )
}

// ============================================
// Main Page Component
// ============================================

export default function AnaliticasPage() {
  const analytics = useNotificationAnalytics()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await analytics.refetchAll()
    setTimeout(() => setIsRefreshing(false), 500)
  }

  const summary = analytics.summary.data
  const isLoading = analytics.summary.isLoading
  const hasError = analytics.summary.error || analytics.health.error

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 -m-6">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="flex items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                Analíticas de Notificaciones
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Monitoreo en tiempo real
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <PeriodSelector
              value={analytics.period.days}
              onChange={analytics.period.setDays}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="gap-1.5"
            >
              <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
              <span className="hidden sm:inline">Actualizar</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {hasError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-6 mt-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800"
        >
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-900 dark:text-red-100">
                Error al cargar datos
              </p>
              <p className="text-xs text-red-700 dark:text-red-300">
                {analytics.summary.error || analytics.health.error}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30"
            >
              Reintentar
            </Button>
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <MetricCard
            title="Enviadas"
            value={summary?.total_sent || 0}
            subtitle="Total del período"
            icon={<Send className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
            accentColor="bg-blue-100 dark:bg-blue-900/30"
            isLoading={isLoading}
          />
          <MetricCard
            title="Entregadas"
            value={summary?.total_delivered || 0}
            subtitle="Confirmadas"
            icon={<CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
            accentColor="bg-emerald-100 dark:bg-emerald-900/30"
            isLoading={isLoading}
          />
          <MetricCard
            title="Fallidas"
            value={summary?.total_failed || 0}
            subtitle="Con error"
            icon={<XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />}
            accentColor="bg-red-100 dark:bg-red-900/30"
            isLoading={isLoading}
          />
          <MetricCard
            title="Pendientes"
            value={summary?.total_pending || 0}
            subtitle="En cola"
            icon={<Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />}
            accentColor="bg-amber-100 dark:bg-amber-900/30"
            isLoading={isLoading}
          />
          <MetricCard
            title="Tasa Entrega"
            value={summary ? formatPercent(summary.delivery_rate) : "0%"}
            subtitle="Eficiencia"
            icon={<TrendingUp className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />}
            accentColor="bg-cyan-100 dark:bg-cyan-900/30"
            isLoading={isLoading}
          />
          <MetricCard
            title="Tiempo Prom."
            value={formatDeliveryTime(summary?.avg_delivery_time_seconds || null)}
            subtitle="De entrega"
            icon={<Zap className="h-5 w-5 text-violet-600 dark:text-violet-400" />}
            accentColor="bg-violet-100 dark:bg-violet-900/30"
            isLoading={isLoading}
          />
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Daily Trend - Takes 2 columns */}
          <Card className="lg:col-span-2 border-gray-200/60 dark:border-gray-700/50 bg-white dark:bg-gray-800/50">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-gray-900 dark:text-white">
                  Tendencia Diaria
                </CardTitle>
                <Badge variant="outline" className="text-xs font-normal">
                  Últimos {analytics.period.days} días
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <DailyTrendChart
                data={summary?.daily_breakdown || []}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>

          {/* Channel Distribution */}
          <Card className="border-gray-200/60 dark:border-gray-700/50 bg-white dark:bg-gray-800/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-gray-900 dark:text-white">
                Distribución por Canal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChannelDistribution
                data={summary?.by_channel}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Channel Health */}
          <Card className="border-gray-200/60 dark:border-gray-700/50 bg-white dark:bg-gray-800/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-gray-900 dark:text-white">
                  Estado de Canales
                </CardTitle>
                <Badge variant="outline" className="text-xs font-normal">
                  Últimas 24h
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <ChannelHealthCard
                channel="email"
                health={analytics.health.data?.email}
                isLoading={analytics.health.isLoading}
              />
              <ChannelHealthCard
                channel="whatsapp"
                health={analytics.health.data?.whatsapp}
                isLoading={analytics.health.isLoading}
              />
              <ChannelHealthCard
                channel="push"
                health={analytics.health.data?.push}
                isLoading={analytics.health.isLoading}
              />
            </CardContent>
          </Card>

          {/* Recent Logs - Takes 2 columns */}
          <Card className="lg:col-span-2 border-gray-200/60 dark:border-gray-700/50 bg-white dark:bg-gray-800/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-gray-900 dark:text-white">
                Logs Recientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RecentLogsTable
                logs={analytics.logs.data}
                isLoading={analytics.logs.isLoading}
                channelFilter={analytics.logs.filters.channel}
                statusFilter={analytics.logs.filters.status}
                onChannelChange={analytics.logs.setChannel}
                onStatusChange={analytics.logs.setStatus}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
