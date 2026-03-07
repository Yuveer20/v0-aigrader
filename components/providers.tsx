"use client"

import { SessionProvider } from "next-auth/react"
import { PointsProvider } from "@/lib/points-context"
import { ChatProvider } from "@/lib/chat-context"
import { ThemeProvider } from "@/lib/theme-context"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <PointsProvider>
          <ChatProvider>
            {children}
          </ChatProvider>
        </PointsProvider>
      </ThemeProvider>
    </SessionProvider>
  )
}
