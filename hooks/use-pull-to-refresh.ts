"use client"

import { useState, useCallback, useRef, useEffect, type TouchEvent } from "react"

interface UsePullToRefreshOptions {
  /** Callback to execute when pull-to-refresh is triggered */
  onRefresh: () => Promise<void>
  /** Distance in pixels to trigger refresh */
  threshold?: number
  /** Disable pull-to-refresh */
  disabled?: boolean
}

interface UsePullToRefreshReturn {
  /** Props to spread on the container element */
  pullToRefreshProps: {
    onTouchStart: (e: TouchEvent) => void
    onTouchMove: (e: TouchEvent) => void
    onTouchEnd: () => void
  }
  /** Whether the user is currently pulling */
  isPulling: boolean
  /** Current pull distance */
  pullDistance: number
  /** Whether a refresh is in progress */
  isRefreshing: boolean
}

/**
 * Hook for implementing pull-to-refresh functionality on mobile devices
 * Only activates when:
 * - Page scroll is at the very top (scrollY === 0)
 * - User is pulling downward (not scrolling up from bottom)
 * - The pull gesture started at the top
 */
export function usePullToRefresh({
  onRefresh,
  threshold = 80,
  disabled = false,
}: UsePullToRefreshOptions): UsePullToRefreshReturn {
  const [isPulling, setIsPulling] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const startYRef = useRef(0)
  const startScrollYRef = useRef(0)
  const canPullRef = useRef(false)

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (disabled || isRefreshing) return

    // Store the initial scroll position and touch position
    startScrollYRef.current = window.scrollY
    startYRef.current = e.touches[0].clientY

    // Only allow pull-to-refresh if we start at the very top
    // Use a small tolerance (5px) for slight scroll imprecision
    canPullRef.current = window.scrollY <= 5
  }, [disabled, isRefreshing])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (disabled || isRefreshing) return

    const currentY = e.touches[0].clientY
    const deltaY = currentY - startYRef.current

    // If scroll has moved since touch start, cancel pull-to-refresh
    // This handles the case where user is scrolling up from bottom
    if (window.scrollY > 5) {
      canPullRef.current = false
      if (isPulling) {
        setIsPulling(false)
        setPullDistance(0)
      }
      return
    }

    // Only proceed if:
    // 1. We started at the top (canPullRef is true)
    // 2. We're pulling down (deltaY > 0)
    // 3. We're still at the top (scrollY <= 5)
    if (!canPullRef.current || deltaY <= 0) {
      if (isPulling) {
        setIsPulling(false)
        setPullDistance(0)
      }
      return
    }

    // Start pulling
    if (!isPulling) {
      setIsPulling(true)
    }

    // Apply resistance (diminishing returns as you pull further)
    const resistedDistance = Math.min(deltaY * 0.4, threshold * 1.5)
    setPullDistance(resistedDistance)
  }, [isPulling, disabled, isRefreshing, threshold])

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling || disabled) {
      canPullRef.current = false
      return
    }

    setIsPulling(false)
    canPullRef.current = false

    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true)
      try {
        await onRefresh()
      } finally {
        setIsRefreshing(false)
      }
    }

    setPullDistance(0)
  }, [isPulling, disabled, pullDistance, threshold, isRefreshing, onRefresh])

  // Reset state when disabled changes
  useEffect(() => {
    if (disabled) {
      setIsPulling(false)
      setPullDistance(0)
      canPullRef.current = false
    }
  }, [disabled])

  return {
    pullToRefreshProps: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
    isPulling,
    pullDistance,
    isRefreshing,
  }
}
