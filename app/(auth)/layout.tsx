"use client"

import type React from "react"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Auth checks are now handled in individual pages
  return <div className="min-h-screen bg-background">{children}</div>
}
