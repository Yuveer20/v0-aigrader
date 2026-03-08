"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

export type ThemeVariant = "ocean" | "sunset" | "midnight"

interface ThemeContextType {
  theme: ThemeVariant
  setTheme: (theme: ThemeVariant) => void
  isThemeUnlocked: (theme: ThemeVariant, points: number) => boolean
  getThemeUnlockPoints: (theme: ThemeVariant) => number
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const themeUnlockPoints: Record<ThemeVariant, number> = {
  midnight: 0,    // Default, always unlocked
  ocean: 100,     // Unlock at 100 points
  sunset: 150,    // Unlock at 150 points
}

export const themeConfig = {
  midnight: {
    name: "Midnight",
    background: "linear-gradient(135deg, #0A0A0A 0%, #171717 50%, #262626 100%)",
    primary: "#71717A",
    accent: "#E4E4E7",
    gradient: "linear-gradient(90deg, #52525B, #E4E4E7)",
    orbColor1: "rgba(113, 113, 122, 0.12)",
    orbColor2: "rgba(228, 228, 231, 0.06)",
    textGradient: "linear-gradient(90deg, #A1A1AA, #E4E4E7)",
    glowColor: "rgba(113, 113, 122, 0.35)",
    scrollbarGradient: "linear-gradient(180deg, #52525B, #A1A1AA)",
  },
  ocean: {
    name: "Ocean",
    background: "linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #312E81 100%)",
    primary: "#3B82F6",
    accent: "#22D3EE",
    gradient: "linear-gradient(90deg, #3B82F6, #22D3EE)",
    orbColor1: "rgba(59, 130, 246, 0.15)",
    orbColor2: "rgba(34, 211, 238, 0.1)",
    textGradient: "linear-gradient(90deg, #3B82F6, #22D3EE)",
    glowColor: "rgba(59, 130, 246, 0.4)",
    scrollbarGradient: "linear-gradient(180deg, #3B82F6, #22D3EE)",
  },
  sunset: {
    name: "Sunset",
    background: "linear-gradient(135deg, #18181B 0%, #7C2D12 50%, #DC2626 100%)",
    primary: "#F97316",
    accent: "#FCD34D",
    gradient: "linear-gradient(90deg, #EA580C, #FACC15)",
    orbColor1: "rgba(234, 88, 12, 0.2)",
    orbColor2: "rgba(250, 204, 21, 0.15)",
    textGradient: "linear-gradient(90deg, #F97316, #FCD34D)",
    glowColor: "rgba(249, 115, 22, 0.5)",
    scrollbarGradient: "linear-gradient(180deg, #EA580C, #FACC15)",
  },
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeVariant>("midnight")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem("aigrader-theme") as ThemeVariant | null
    if (saved && themeConfig[saved]) {
      setThemeState(saved)
    }
  }, [])

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("aigrader-theme", theme)
      document.documentElement.setAttribute("data-theme", theme)
    }
  }, [theme, mounted])

  const isThemeUnlocked = (themeId: ThemeVariant, points: number): boolean => {
    return points >= themeUnlockPoints[themeId]
  }

  const getThemeUnlockPoints = (themeId: ThemeVariant): number => {
    return themeUnlockPoints[themeId]
  }

  const setTheme = (newTheme: ThemeVariant) => {
    setThemeState(newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isThemeUnlocked, getThemeUnlockPoints }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
