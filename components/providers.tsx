"use client"

import { SessionProvider } from "next-auth/react"
import { PointsProvider } from "@/lib/points-context"
import { ChatProvider } from "@/lib/chat-context"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <PointsProvider>
        <ChatProvider>
          {children}
        </ChatProvider>
      </PointsProvider>
    </SessionProvider>
  )
}
