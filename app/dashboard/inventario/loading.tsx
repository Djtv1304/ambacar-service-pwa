import { Brain, Package, Car, BarChart3, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

function SkeletonKpiCard({ variant = "default" }: { variant?: "default" | "success" | "warning" | "ai" }) {
  const variantStyles = {
    default: "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950",
    success: "border-green-500/30 bg-gradient-to-br from-green-50 to-white dark:from-green-500/10 dark:to-gray-950",
    warning: "border-orange-500/30 bg-gradient-to-br from-orange-50 to-white dark:from-orange-500/10 dark:to-gray-950",
    ai: "border-cyan-500/30 bg-gradient-to-br from-cyan-50 via-purple-50/50 to-white dark:from-cyan-500/10 dark:via-purple-500/5 dark:to-gray-950"
  }

  return (
    <div className={cn(
      "rounded-xl border p-4 shadow-sm",
      variantStyles[variant]
    )}>
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-lg bg-gray-200 dark:bg-gray-800 animate-pulse" />
        <div className="flex-1 min-w-0 space-y-2">
          <div className="h-3 w-20 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
          <div className="h-6 w-16 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
          <div className="h-2 w-24 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
        </div>
      </div>
    </div>
  )
}

export default function InventarioLoading() {
  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 -m-6">
      {/* Header Skeleton */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500 shadow-lg shadow-purple-500/20">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div className="space-y-2">
                <div className="h-6 w-40 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                <div className="h-3 w-56 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-24 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
              <div className="h-8 w-24 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 sm:p-6 space-y-6">
        {/* KPI Ribbon Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <SkeletonKpiCard variant="default" />
          <SkeletonKpiCard variant="success" />
          <SkeletonKpiCard variant="warning" />
          <SkeletonKpiCard variant="ai" />
        </div>

        {/* Tabs Skeleton */}
        <div className="h-10 bg-gray-100 dark:bg-gray-900 rounded-lg animate-pulse mb-6" />

        {/* Content Skeleton */}
        <div className="flex flex-wrap gap-6">
          {/* Left Column */}
          <div className="min-w-[300px] flex-[1_1_350px] xl:flex-[0_0_400px] space-y-4">
            {/* Vehicle Selector Skeleton */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden">
              <div className="border-b border-gray-200 dark:border-gray-800 px-4 py-3 bg-gradient-to-r from-emerald-50 via-cyan-50 to-blue-50 dark:from-emerald-900/20 dark:via-cyan-900/20 dark:to-blue-900/20">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500">
                    <Car className="h-4 w-4 text-white" />
                  </div>
                  <div className="space-y-1">
                    <div className="h-4 w-32 bg-gray-200/50 dark:bg-gray-800/50 rounded animate-pulse" />
                    <div className="h-2 w-48 bg-gray-200/50 dark:bg-gray-800/50 rounded animate-pulse" />
                  </div>
                </div>
              </div>
              <div className="p-4 space-y-4">
                {/* Form Fields Skeleton */}
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-3 w-24 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                    <div className="h-10 w-full bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                  </div>
                ))}
                <div className="h-11 w-full bg-gradient-to-r from-emerald-200 to-cyan-200 dark:from-emerald-800 dark:to-cyan-800 rounded animate-pulse" />
              </div>
            </div>

            {/* Model Info Skeleton */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-4 space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500" />
                <div className="space-y-1">
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                  <div className="h-2 w-16 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                </div>
              </div>
              <div className="h-2 w-full bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse" />
              <div className="grid grid-cols-2 gap-3">
                <div className="h-16 bg-gray-100 dark:bg-gray-900 rounded-lg animate-pulse" />
                <div className="h-16 bg-gray-100 dark:bg-gray-900 rounded-lg animate-pulse" />
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="min-w-[300px] flex-[1_1_600px]">
            <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30 p-12">
              <div className="flex flex-col items-center justify-center gap-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 animate-pulse">
                  <Car className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mx-auto" />
                  <div className="h-3 w-48 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mx-auto" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
