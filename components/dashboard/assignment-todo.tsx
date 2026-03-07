"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ListTodo, Calendar, AlertCircle, Zap } from "lucide-react"
import { usePoints } from "@/lib/points-context"
import type { ClassroomData, CourseWork, StudentSubmission } from "@/types/classroom"

interface AssignmentTodoProps {
  classroomData?: ClassroomData
}

interface TodoItem {
  id: string
  title: string
  courseName: string
  courseId: string
  dueDate?: Date
  isSubmitted: boolean
  maxPoints?: number
}

export function AssignmentTodo({ classroomData }: AssignmentTodoProps) {
  const [completedLocal, setCompletedLocal] = useState<Set<string>>(() => {
    // Load from localStorage
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("aigrader-completed-todos")
      return saved ? new Set(JSON.parse(saved)) : new Set()
    }
    return new Set()
  })
  const [showPointsPopup, setShowPointsPopup] = useState<string | null>(null)
  const { addPoints } = usePoints()

  // Save to localStorage when completed items change
  useEffect(() => {
    localStorage.setItem("aigrader-completed-todos", JSON.stringify([...completedLocal]))
  }, [completedLocal])

  // Get all assignments from all courses with due dates
  const todoItems: TodoItem[] = []
  
  if (classroomData?.courses) {
    classroomData.courses.forEach((course) => {
      course.courseWork?.forEach((work: CourseWork) => {
        // Find submission for this work
        const submission = course.submissions?.find(
          (s: StudentSubmission) => s.courseWorkId === work.id
        )
        
        // Parse due date
        let dueDate: Date | undefined
        if (work.dueDate) {
          dueDate = new Date(
            work.dueDate.year,
            work.dueDate.month - 1,
            work.dueDate.day,
            work.dueTime?.hours || 23,
            work.dueTime?.minutes || 59
          )
        }

        // Only include published assignments
        if (work.state === "PUBLISHED") {
          todoItems.push({
            id: work.id,
            title: work.title,
            courseName: course.name,
            courseId: work.courseId,
            dueDate,
            isSubmitted: submission?.state === "TURNED_IN" || submission?.state === "RETURNED",
            maxPoints: work.maxPoints,
          })
        }
      })
    })
  }

  // Sort: incomplete first, then by due date (soonest first)
  const sortedTodos = todoItems
    .filter((item) => !item.isSubmitted) // Only show items not yet submitted on Classroom
    .sort((a, b) => {
      // Items with due dates come first
      if (!a.dueDate && !b.dueDate) return 0
      if (!a.dueDate) return 1
      if (!b.dueDate) return -1
      return a.dueDate.getTime() - b.dueDate.getTime()
    })
    .slice(0, 10) // Show top 10

  const toggleComplete = (id: string, title: string) => {
    setCompletedLocal((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
        // Award points for completing a todo item locally
        addPoints(5, `Completed: ${title}`)
        setShowPointsPopup(id)
        setTimeout(() => setShowPointsPopup(null), 1500)
      }
      return next
    })
  }

  const getDueBadge = (dueDate?: Date) => {
    if (!dueDate) return null
    
    const now = new Date()
    const diffMs = dueDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) {
      return <Badge variant="destructive" className="text-xs">Overdue</Badge>
    } else if (diffDays === 0) {
      return <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30 text-xs">Due Today</Badge>
    } else if (diffDays === 1) {
      return <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 text-xs">Tomorrow</Badge>
    } else if (diffDays <= 3) {
      return <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">{diffDays} days</Badge>
    } else if (diffDays <= 7) {
      return <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 text-xs">This week</Badge>
    }
    return null
  }

  const formatDueDate = (dueDate?: Date) => {
    if (!dueDate) return "No due date"
    return dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur-sm relative">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
          <ListTodo className="h-5 w-5 text-cyan-400" />
          Assignment Todo
          <Badge className="ml-auto bg-cyan-500/20 text-cyan-300 border-cyan-500/30 text-xs">
            +5 pts each
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sortedTodos.length === 0 ? (
          <div className="text-center py-6">
            <ListTodo className="h-8 w-8 text-cyan-400/50 mx-auto mb-2" />
            <p className="text-sm text-cyan-200/60">No pending assignments</p>
            <p className="text-xs text-cyan-200/40 mt-1">You&apos;re all caught up!</p>
          </div>
        ) : (
          <ScrollArea className="h-[280px] pr-2">
            <div className="space-y-2">
              {sortedTodos.map((item) => {
                const isCompleted = completedLocal.has(item.id)
                return (
                  <div
                    key={item.id}
                    className={`relative flex items-start gap-3 p-3 rounded-lg transition-all ${
                      isCompleted 
                        ? "bg-green-500/10 border border-green-500/20" 
                        : "bg-white/5 border border-white/10 hover:bg-white/10"
                    }`}
                  >
                    {/* Points popup */}
                    {showPointsPopup === item.id && (
                      <div className="absolute -top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold animate-bounce z-10">
                        <Zap className="h-3 w-3" />
                        +5
                      </div>
                    )}
                    <Checkbox
                      checked={isCompleted}
                      onCheckedChange={() => toggleComplete(item.id, item.title)}
                      className="mt-1 border-cyan-400 data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={`text-sm font-medium truncate ${
                          isCompleted ? "text-green-300 line-through" : "text-white"
                        }`}>
                          {item.title}
                        </p>
                        {getDueBadge(item.dueDate)}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-cyan-200/60 truncate">
                          {item.courseName}
                        </span>
                        <span className="text-cyan-200/30">|</span>
                        <span className="text-xs text-cyan-200/40 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDueDate(item.dueDate)}
                        </span>
                        {item.maxPoints && (
                          <>
                            <span className="text-cyan-200/30">|</span>
                            <span className="text-xs text-cyan-200/40">
                              {item.maxPoints} pts
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        )}
        
        {sortedTodos.length > 0 && (
          <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs text-cyan-200/40">
              {completedLocal.size} of {sortedTodos.length} checked off
            </span>
            <div className="flex items-center gap-1 text-xs text-cyan-200/40">
              <AlertCircle className="h-3 w-3" />
              Submit on Classroom to sync
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
