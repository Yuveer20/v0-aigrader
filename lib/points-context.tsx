"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

interface PointsContextType {
  points: number
  addPoints: (amount: number, reason: string) => void
  history: PointEntry[]
}

interface PointEntry {
  amount: number
  reason: string
  timestamp: Date
}

const PointsContext = createContext<PointsContextType | undefined>(undefined)

export function PointsProvider({ children }: { children: ReactNode }) {
  const [points, setPoints] = useState(0)
  const [history, setHistory] = useState<PointEntry[]>([])

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("aigrader-points")
    if (saved) {
      const data = JSON.parse(saved)
      setPoints(data.points || 0)
      setHistory(data.history || [])
    }
  }, [])

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem("aigrader-points", JSON.stringify({ points, history }))
  }, [points, history])

  const addPoints = (amount: number, reason: string) => {
    setPoints((prev) => prev + amount)
    setHistory((prev) => [
      { amount, reason, timestamp: new Date() },
      ...prev.slice(0, 49), // Keep last 50 entries
    ])
  }

  return (
    <PointsContext.Provider value={{ points, addPoints, history }}>
      {children}
    </PointsContext.Provider>
  )
}

export function usePoints() {
  const context = useContext(PointsContext)
  if (!context) {
    throw new Error("usePoints must be used within a PointsProvider")
  }
  return context
}
