"use client"

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react"

interface PointsContextType {
  points: number
  bonusPoints: number
  addBonusPoints: (amount: number, reason: string) => void
  history: PointEntry[]
  pointsChange: { amount: number; timestamp: number } | null
  syncAssignmentPoints: (assignments: { id: string; title: string; maxPoints?: number; isSubmitted: boolean }[]) => void
}

interface PointEntry {
  amount: number
  reason: string
  timestamp: Date
}

const PointsContext = createContext<PointsContextType | undefined>(undefined)

const calculatePointsForAssignment = (maxPoints?: number) => {
  return maxPoints ? Math.min(50, Math.max(10, Math.round(maxPoints / 2))) : 15
}

export function PointsProvider({ children }: { children: ReactNode }) {
  // bonusPoints = pomodoro points + AI awarded points (stored separately)
  const [bonusPoints, setBonusPoints] = useState(0)
  const [history, setHistory] = useState<PointEntry[]>([])
  const [pointsChange, setPointsChange] = useState<{ amount: number; timestamp: number } | null>(null)
  const [mounted, setMounted] = useState(false)
  
  // Track submitted assignment IDs and their point values for comparison
  const [previousSubmissions, setPreviousSubmissions] = useState<Map<string, number>>(new Map())
  // Assignment points are calculated live based on current submissions
  const [assignmentPoints, setAssignmentPoints] = useState(0)

  // Total points = assignment points + bonus points
  const points = assignmentPoints + bonusPoints

  // Load bonus points from localStorage on mount
  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem("thorium-points-v2")
    console.log("[v0] Loading from localStorage:", saved)
    if (saved) {
      const data = JSON.parse(saved)
      console.log("[v0] Parsed data:", data)
      setBonusPoints(data.bonusPoints || 0)
      setHistory(data.history || [])
      // Restore previous submissions map
      if (data.previousSubmissions) {
        const restored = new Map(Object.entries(data.previousSubmissions))
        console.log("[v0] Restored previousSubmissions size:", restored.size)
        setPreviousSubmissions(restored)
      }
    }
  }, [])

  // Save to localStorage on change
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("thorium-points-v2", JSON.stringify({ 
        bonusPoints,
        history,
        // Convert Map to object for storage
        previousSubmissions: Object.fromEntries(previousSubmissions)
      }))
    }
  }, [bonusPoints, history, previousSubmissions, mounted])

  // Clear points change animation after delay
  useEffect(() => {
    if (pointsChange) {
      const timer = setTimeout(() => setPointsChange(null), 2000)
      return () => clearTimeout(timer)
    }
  }, [pointsChange])

  // Add bonus points (from Pomodoro or AI)
  const addBonusPoints = useCallback((amount: number, reason: string) => {
    setBonusPoints((prev) => prev + amount)
    setHistory((prev) => [
      { amount, reason, timestamp: new Date() },
      ...prev.slice(0, 49),
    ])
    setPointsChange({ amount, timestamp: Date.now() })
  }, [])

  // Sync assignment points based on current submission state
  // Points are calculated fresh each time based on submitted assignments
  const syncAssignmentPoints = useCallback((
    assignments: { id: string; title: string; maxPoints?: number; isSubmitted: boolean }[]
  ) => {
    console.log("[v0] syncAssignmentPoints called with", assignments.length, "assignments")
    
    // Calculate total points from currently submitted assignments
    const submittedAssignments = assignments.filter(a => a.isSubmitted)
    console.log("[v0] Submitted assignments:", submittedAssignments.length)
    
    const newAssignmentPoints = submittedAssignments.reduce((total, assignment) => {
      return total + calculatePointsForAssignment(assignment.maxPoints)
    }, 0)
    console.log("[v0] Calculated assignment points:", newAssignmentPoints)
    
    // Build map of current submissions
    const currentSubmissions = new Map<string, number>()
    submittedAssignments.forEach(a => {
      currentSubmissions.set(a.id, calculatePointsForAssignment(a.maxPoints))
    })
    
    console.log("[v0] Previous submissions size:", previousSubmissions.size)
    console.log("[v0] Current submissions size:", currentSubmissions.size)
    
    // Compare with previous state to detect changes
    const changes: { amount: number; reason: string }[] = []
    
    // Check for new submissions
    currentSubmissions.forEach((pts, id) => {
      if (!previousSubmissions.has(id)) {
        const assignment = assignments.find(a => a.id === id)
        console.log("[v0] New submission detected:", assignment?.title, "pts:", pts)
        changes.push({ amount: pts, reason: `Submitted: ${assignment?.title || 'Assignment'}` })
      }
    })
    
    // Check for unsubmissions
    previousSubmissions.forEach((pts, id) => {
      if (!currentSubmissions.has(id)) {
        const assignment = assignments.find(a => a.id === id)
        console.log("[v0] Unsubmission detected:", assignment?.title, "pts:", pts)
        changes.push({ amount: -pts, reason: `Unsubmitted: ${assignment?.title || 'Assignment'}` })
      }
    })
    
    console.log("[v0] Changes detected:", changes.length)
    
    // Update state
    setAssignmentPoints(newAssignmentPoints)
    setPreviousSubmissions(currentSubmissions)
    
    // Log changes to history and trigger animation
    if (changes.length > 0) {
      const netChange = changes.reduce((sum, c) => sum + c.amount, 0)
      console.log("[v0] Net point change:", netChange)
      setHistory((prev) => [
        ...changes.map(c => ({ amount: c.amount, reason: c.reason, timestamp: new Date() })),
        ...prev.slice(0, 49 - changes.length)
      ])
      setPointsChange({ amount: netChange, timestamp: Date.now() })
    }
  }, [previousSubmissions])

  return (
    <PointsContext.Provider value={{ 
      points,
      bonusPoints,
      addBonusPoints,
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
