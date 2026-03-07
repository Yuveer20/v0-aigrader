"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ListTodo, Calendar, AlertCircle } from "lucide-react"
import type { ClassroomData, Assignment } from "@/types/classroom"

interface AssignmentTodoProps {
  classroomData?: ClassroomData
}

export function AssignmentTodo({ classroomData }: AssignmentTodoProps) {
  const [completedLocal, setCompletedLocal] = useState<Set<string>>(new Set())

  // Get all assignments from all courses
  const allAssignments: (Assignment & { courseName: string })[] = []
  
  if (classroomData?.courses) {
    classroomData.courses.forEach((course) => {
      course.assignments?.forEach((assignment) => {
        allAssignments.push({
          ...assignment,
          courseName: course.name,
        })
      })
    })
  }

  // Sort by due date (soonest first), then by not submitted
  const sortedAssignments = allAssignments
    .filter((a) => a.state !== "TURNED_IN" && a.state !== "RETURNED")
    .sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0
      if (!a.dueDate) return 1
      if (!b.dueDate) return -1
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    })
    .slice(0, 10) // Show top 10

  const toggleComplete = (id: string) => {
    setCompletedLocal((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const getDueBadge = (dueDate?: string) => {
    if (!dueDate) return null
    
    const due = new Date(dueDate)
    const now = new Date()
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) {
      return <Badge variant="destructive" className="text-xs">Overdue</Badge>
    } else if (diffDays === 0) {
      return <Badge className="bg-orange-500/20 text-orange-300 text-xs">Due Today</Badge>
    } else if (diffDays === 1) {
      return <Badge className="bg-yellow-500/20 text-yellow-300 text-xs">Tomorrow</Badge>
    } else if (diffDays <= 3) {
      return <Badge className="bg-blue-500/20 text-blue-300 text-xs">{diffDays} days</Badge>
    }
    return null
  }

  const formatDueDate = (dueDate?: string) => {
    if (!dueDate) return "No due date"
    const date = new Date(dueDate)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
          <ListTodo className="h-5 w-5 text-cyan-400" />
          Assignment Todo
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sortedAssignments.length === 0 ? (
          <div className="text-center py-6">
            <ListTodo className="h-8 w-8 text-cyan-400/50 mx-auto mb-2" />
            <p className="text-sm text-cyan-200/60">No pending assignments</p>
            <p className="text-xs text-cyan-200/40 mt-1">You&apos;re all caught up!</p>
          </div>
        ) : (
          <ScrollArea className="h-[280px] pr-2">
            <div className="space-y-2">
              {sortedAssignments.map((assignment) => {
                const isCompleted = completedLocal.has(assignment.id)
                return (
                  <div
                    key={assignment.id}
                    className={`flex items-start gap-3 p-3 rounded-lg transition-all ${
                      isCompleted 
                        ? "bg-green-500/10 border border-green-500/20" 
                        : "bg-white/5 border border-white/10 hover:bg-white/10"
                    }`}
                  >
                    <Checkbox
                      checked={isCompleted}
                      onCheckedChange={() => toggleComplete(assignment.id)}
                      className="mt-1 border-cyan-400 data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={`text-sm font-medium truncate ${
                          isCompleted ? "text-green-300 line-through" : "text-white"
                        }`}>
                          {assignment.title}
                        </p>
                        {getDueBadge(assignment.dueDate)}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-cyan-200/60 truncate">
                          {assignment.courseName}
                        </span>
                        <span className="text-cyan-200/30">|</span>
                        <span className="text-xs text-cyan-200/40 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDueDate(assignment.dueDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        )}
        
        {sortedAssignments.length > 0 && (
          <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs text-cyan-200/40">
              {completedLocal.size} of {sortedAssignments.length} done locally
            </span>
            <div className="flex items-center gap-1 text-xs text-cyan-200/40">
              <AlertCircle className="h-3 w-3" />
              Submit on Classroom to update
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
