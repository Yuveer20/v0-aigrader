"use client"

import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ListTodo, Calendar, Clock, BookOpen, Trophy } from "lucide-react"
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
  maxPoints?: number
}

export function AssignmentTodo({ classroomData }: AssignmentTodoProps) {
  const { syncAssignmentPoints } = usePoints()

  // Get all assignments from all courses
  const allAssignments: { id: string; title: string; maxPoints?: number; isSubmitted: boolean }[] = []
  const todoItems: TodoItem[] = []
  
  if (classroomData?.courses) {
    classroomData.courses.forEach((course) => {
      course.courseWork?.forEach((work: CourseWork) => {
        // Find submission for this work
        const submission = course.submissions?.find(
          (s: StudentSubmission) => s.courseWorkId === work.id
        )
        
        const isSubmitted = submission?.state === "TURNED_IN" || submission?.state === "RETURNED"
        
        // Track all published assignments for points calculation
        if (work.state === "PUBLISHED") {
          allAssignments.push({
            id: work.id,
            title: work.title,
            maxPoints: work.maxPoints,
            isSubmitted
          })
        }

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

        // Only include published, NOT submitted assignments in todo
        if (work.state === "PUBLISHED" && !isSubmitted) {
          todoItems.push({
            id: work.id,
            title: work.title,
            courseName: course.name,
            courseId: work.courseId,
            dueDate,
            maxPoints: work.maxPoints,
          })
        }
      })
    })
  }

  // Sync assignment points whenever classroom data changes
  const assignmentsKey = JSON.stringify(allAssignments.map(a => ({ id: a.id, isSubmitted: a.isSubmitted })))
  useEffect(() => {
    if (allAssignments.length > 0) {
      syncAssignmentPoints(allAssignments)
    }
  // syncAssignmentPoints is stable (empty deps), allAssignments changes trigger via assignmentsKey
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignmentsKey, syncAssignmentPoints])

  // Sort by due date (soonest first), items without due dates at the end
  const sortedTodos = todoItems
    .sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0
      if (!a.dueDate) return 1
      if (!b.dueDate) return -1
      return a.dueDate.getTime() - b.dueDate.getTime()
    })
    .slice(0, 10)

  const completedCount = allAssignments.filter(a => a.isSubmitted).length

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
      return <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">{diffDays} days</Badge>
    } else if (diffDays <= 7) {
      return <Badge className="bg-accent/20 text-accent border-accent/30 text-xs">This week</Badge>
    }
    return <Badge className="bg-muted text-muted-foreground border-border text-xs">{diffDays} days</Badge>
  }

  const formatDueDate = (dueDate?: Date) => {
    if (!dueDate) return "No due date"
    return dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  const getPointsForAssignment = (maxPoints?: number) => {
    return maxPoints ? Math.min(50, Math.max(10, Math.round(maxPoints / 2))) : 15
  }

  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur-sm h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
          <ListTodo className="h-5 w-5 text-primary" />
          Upcoming Work
          <Badge className="ml-auto bg-primary/20 text-primary border-primary/30 text-xs">
            {sortedTodos.length} pending
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sortedTodos.length === 0 ? (
          <div className="text-center py-6">
            <Trophy className="h-8 w-8 text-primary/50 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">All caught up!</p>
            <p className="text-xs text-muted-foreground/60 mt-1">No pending assignments</p>
          </div>
        ) : (
          <ScrollArea className="h-[250px] pr-2">
            <div className="space-y-2">
              {sortedTodos.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    <BookOpen className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-foreground truncate">
                        {item.title}
                      </p>
                      {getDueBadge(item.dueDate)}
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs text-muted-foreground truncate">
                        {item.courseName}
                      </span>
                      <span className="text-muted-foreground/30">|</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDueDate(item.dueDate)}
                      </span>
                      <span className="text-muted-foreground/30">|</span>
                      <span className="text-xs text-yellow-400 flex items-center gap-1">
                        <Trophy className="h-3 w-3" />
                        +{getPointsForAssignment(item.maxPoints)} pts
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
        
        <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {completedCount} assignments submitted
          </span>
          <div className="flex items-center gap-1 text-xs text-muted-foreground/60">
            <Clock className="h-3 w-3" />
            Auto-synced with Classroom
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
