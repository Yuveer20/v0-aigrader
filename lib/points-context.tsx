"use client"

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from "react"

interface PointsContextType {
  points: number
  addPoints: (amount: number, reason: string) => void
  removePoints: (amount: number, reason: string) => void
  history: PointEntry[]
  pointsChange: { amount: number; timestamp: number } | null
  syncAssignmentPoints: (assignments: { id: string; title: string; maxPoints?: number; isSubmitted: boolean }[]) => void
}

interface PointEntry {
  amount: number
  reason: string
  timestamp: Date
}

interface TrackedAssignment {
  id: string
  title: string
  pointsAwarded: number
  isSubmitted: boolean
}

const PointsContext = createContext<PointsContextType | undefined>(undefined)

export function PointsProvider({ children }: { children: ReactNode }) {
  const [points, setPoints] = useState(0)
  const [history, setHistory] = useState<PointEntry[]>([])
  const [trackedAssignments, setTrackedAssignments] = useState<TrackedAssignment[]>([])
  const [pointsChange, setPointsChange] = useState<{ amount: number; timestamp: number } | null>(null)
  const [mounted, setMounted] = useState(false)
  const isInitialSync = useRef(true)

  // Load from localStorage on mount
  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem("thorium-points")
    if (saved) {
      const data = JSON.parse(saved)
      setPoints(data.points || 0)
      setHistory(data.history || [])
      setTrackedAssignments(data.trackedAssignments || [])
    }
  }, [])

  // Save to localStorage on change
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("thorium-points", JSON.stringify({ 
        points, 
        history,
        trackedAssignments
      }))
    }
  }, [points, history, trackedAssignments, mounted])

  // Clear points change animation after delay
  useEffect(() => {
    if (pointsChange) {
      const timer = setTimeout(() => setPointsChange(null), 2000)
      return () => clearTimeout(timer)
    }
  }, [pointsChange])

  const calculatePoints = (maxPoints?: number) => {
    return maxPoints ? Math.min(50, Math.max(10, Math.round(maxPoints / 2))) : 15
  }

  const addPoints = useCallback((amount: number, reason: string) => {
    setPoints((prev) => prev + amount)
    setHistory((prev) => [
      { amount, reason, timestamp: new Date() },
      ...prev.slice(0, 49),
    ])
    setPointsChange({ amount, timestamp: Date.now() })
  }, [])

  const removePoints = useCallback((amount: number, reason: string) => {
    setPoints((prev) => Math.max(0, prev - amount))
    setHistory((prev) => [
      { amount: -amount, reason, timestamp: new Date() },
      ...prev.slice(0, 49),
    ])
    setPointsChange({ amount: -amount, timestamp: Date.now() })
  }, [])

  // Sync assignment points based on current submission state
  const syncAssignmentPoints = useCallback((
    assignments: { id: string; title: string; maxPoints?: number; isSubmitted: boolean }[]
  ) => {
    setTrackedAssignments(prev => {
      const newTracked = [...prev]
      let totalPointsChange = 0
      const changes: { amount: number; reason: string }[] = []

      assignments.forEach(assignment => {
        const existingIndex = newTracked.findIndex(t => t.id === assignment.id)
        const pointsValue = calculatePoints(assignment.maxPoints)

        if (assignment.isSubmitted) {
          // Assignment is submitted
          if (existingIndex === -1) {
            // New submission - add points
            newTracked.push({
              id: assignment.id,
              title: assignment.title,
              pointsAwarded: pointsValue,
              isSubmitted: true
            })
            if (!isInitialSync.current) {
              totalPointsChange += pointsValue
              changes.push({ amount: pointsValue, reason: `Submitted: ${assignment.title}` })
            }
          } else if (!newTracked[existingIndex].isSubmitted) {
            // Was unsubmitted, now submitted again - add points back
            newTracked[existingIndex].isSubmitted = true
            totalPointsChange += pointsValue
            changes.push({ amount: pointsValue, reason: `Re-submitted: ${assignment.title}` })
          }
        } else {
          // Assignment is not submitted
          if (existingIndex !== -1 && newTracked[existingIndex].isSubmitted) {
            // Was submitted, now unsubmitted - remove points
            const previousPoints = newTracked[existingIndex].pointsAwarded
            newTracked[existingIndex].isSubmitted = false
            totalPointsChange -= previousPoints
            changes.push({ amount: -previousPoints, reason: `Unsubmitted: ${assignment.title}` })
          }
        }
      })

      // Apply all point changes
      if (changes.length > 0) {
        changes.forEach(change => {
          if (change.amount > 0) {
            setPoints(p => p + change.amount)
            setHistory(h => [{ amount: change.amount, reason: change.reason, timestamp: new Date() }, ...h.slice(0, 49)])
          } else {
            setPoints(p => Math.max(0, p + change.amount))
            setHistory(h => [{ amount: change.amount, reason: change.reason, timestamp: new Date() }, ...h.slice(0, 49)])
          }
        })
        setPointsChange({ amount: totalPointsChange, timestamp: Date.now() })
      }

      isInitialSync.current = false
      return newTracked
    })
  }, [])

  return (
    <PointsContext.Provider value={{ 
      points, 
      addPoints,
      removePoints,
      history,
      pointsChange,
      syncAssignmentPoints
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
