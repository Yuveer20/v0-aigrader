"use client"

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react"

interface PointsContextType {
  points: number
  addPoints: (amount: number, reason: string) => void
  history: PointEntry[]
  completedAssignmentIds: Set<string>
  markAssignmentCompleted: (id: string, title: string, maxPoints?: number) => void
  checkAndAwardAssignmentPoints: (submittedIds: string[], assignments: { id: string; title: string; maxPoints?: number }[]) => void
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
  const [completedAssignmentIds, setCompletedAssignmentIds] = useState<Set<string>>(new Set())
  const [mounted, setMounted] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem("aigrader-points")
    if (saved) {
      const data = JSON.parse(saved)
      setPoints(data.points || 0)
      setHistory(data.history || [])
      setCompletedAssignmentIds(new Set(data.completedAssignmentIds || []))
    }
  }, [])

  // Save to localStorage on change
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("aigrader-points", JSON.stringify({ 
        points, 
        history,
        completedAssignmentIds: [...completedAssignmentIds]
      }))
    }
  }, [points, history, completedAssignmentIds, mounted])

  const addPoints = useCallback((amount: number, reason: string) => {
    setPoints((prev) => prev + amount)
    setHistory((prev) => [
      { amount, reason, timestamp: new Date() },
      ...prev.slice(0, 49), // Keep last 50 entries
    ])
  }, [])

  const markAssignmentCompleted = useCallback((id: string, title: string, maxPoints?: number) => {
    if (completedAssignmentIds.has(id)) return // Already awarded
    
    // Award points based on assignment max points (10-50 points)
    const pointsToAward = maxPoints ? Math.min(50, Math.max(10, Math.round(maxPoints / 2))) : 15
    
    setCompletedAssignmentIds(prev => new Set([...prev, id]))
    addPoints(pointsToAward, `Submitted: ${title}`)
  }, [completedAssignmentIds, addPoints])

  // Check for newly submitted assignments and award points
  const checkAndAwardAssignmentPoints = useCallback((
    submittedIds: string[], 
    assignments: { id: string; title: string; maxPoints?: number }[]
  ) => {
    submittedIds.forEach(id => {
      if (!completedAssignmentIds.has(id)) {
        const assignment = assignments.find(a => a.id === id)
        if (assignment) {
          markAssignmentCompleted(id, assignment.title, assignment.maxPoints)
        }
      }
    })
  }, [completedAssignmentIds, markAssignmentCompleted])

  return (
    <PointsContext.Provider value={{ 
      points, 
      addPoints, 
      history, 
      completedAssignmentIds,
      markAssignmentCompleted,
      checkAndAwardAssignmentPoints
    }}>
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
