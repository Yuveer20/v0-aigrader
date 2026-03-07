"use client"

import { SessionProvider } from "next-auth/react"
import { PointsProvider } from "@/lib/points-context"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <PointsProvider>
        {children}
      </PointsProvider>
    </SessionProvider>
  )
}
