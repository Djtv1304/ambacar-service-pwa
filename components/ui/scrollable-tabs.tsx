"use client"

import { useEffect, useRef, type ReactNode } from "react"
import { animate } from "framer-motion"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

interface TabItem {
  value: string
  label: string
  icon?: ReactNode
  badge?: ReactNode
}

interface ScrollableTabsProps {
  tabs: TabItem[]
  defaultValue: string
  children: ReactNode
  className?: string
  /** Enable bounce animation on mount to hint scroll capability */
  showScrollHint?: boolean
  /** Delay before bounce animation starts (ms) */
  scrollHintDelay?: number
}

/**
 * Scrollable tabs component with horizontal scroll on mobile
 * and optional bounce animation to hint scroll capability.
 */
export function ScrollableTabs({
  tabs,
  defaultValue,
  children,
  className,
  showScrollHint = true,
  scrollHintDelay = 500,
}: ScrollableTabsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const hasAnimatedRef = useRef(false)

  // Bounce animation to hint horizontal scroll capability
  useEffect(() => {
    if (!showScrollHint || hasAnimatedRef.current) return

    const runBounceAnimation = async () => {
      const container = scrollContainerRef.current
      if (!container) return

      const isScrollable = container.scrollWidth > container.clientWidth
      if (!isScrollable) return

      hasAnimatedRef.current = true

      const animateScroll = (to: number, duration: number) =>
        new Promise<void>((resolve) => {
          animate(container.scrollLeft, to, {
            duration,
            ease: [0.4, 0, 0.2, 1],
            onUpdate: (value) => {
              container.scrollLeft = value
            },
            onComplete: resolve,
          })
        })

      // Smooth bounce sequence
      await animateScroll(55, 0.45)
      await animateScroll(0, 0.4)
      await animateScroll(22, 0.35)
      await animateScroll(0, 0.3)
    }

    const timeoutId = setTimeout(runBounceAnimation, scrollHintDelay)
    return () => clearTimeout(timeoutId)
  }, [showScrollHint, scrollHintDelay])

  return (
    <Tabs defaultValue={defaultValue} className={cn("space-y-6", className)}>
      <TabsList className="h-auto p-1 w-full sm:w-auto sm:inline-flex">
        <div
          ref={scrollContainerRef}
          className="flex w-full overflow-x-auto scrollbar-hide touch-pan-x gap-1"
        >
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="flex-shrink-0 gap-2 whitespace-nowrap px-3 py-1.5 data-[state=active]:shadow-none"
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge}
            </TabsTrigger>
          ))}
        </div>
      </TabsList>
      {children}
    </Tabs>
  )
}

// Re-export TabsContent for convenience
export { TabsContent }

