"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

export type ThemeVariant = "ocean" | "sunset" | "midnight"

interface ThemeContextType {
  theme: ThemeVariant
  setTheme: (theme: ThemeVariant) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const themeConfig = {
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
    background: "linear-gradient(135deg, #1C1917 0%, #451A03 50%, #7C2D12 100%)",
    primary: "#F97316",
    accent: "#FBBF24",
    gradient: "linear-gradient(90deg, #F97316, #FBBF24)",
    orbColor1: "rgba(249, 115, 22, 0.15)",
    orbColor2: "rgba(251, 191, 36, 0.1)",
    textGradient: "linear-gradient(90deg, #F97316, #FBBF24)",
    glowColor: "rgba(249, 115, 22, 0.4)",
    scrollbarGradient: "linear-gradient(180deg, #F97316, #FBBF24)",
  },
  midnight: {
    name: "Midnight",
    background: "linear-gradient(135deg, #0A0A0A 0%, #171717 50%, #262626 100%)",
    primary: "#A1A1AA",
    accent: "#FAFAFA",
    gradient: "linear-gradient(90deg, #71717A, #FAFAFA)",
    orbColor1: "rgba(161, 161, 170, 0.1)",
    orbColor2: "rgba(250, 250, 250, 0.05)",
    textGradient: "linear-gradient(90deg, #A1A1AA, #FAFAFA)",
    glowColor: "rgba(161, 161, 170, 0.3)",
    scrollbarGradient: "linear-gradient(180deg, #71717A, #A1A1AA)",
  },
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeVariant>("ocean")
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
      // Apply theme to document
      document.documentElement.setAttribute("data-theme", theme)
    }
  }, [theme, mounted])

  const setTheme = (newTheme: ThemeVariant) => {
    setThemeState(newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
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
