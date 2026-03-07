"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { BookOpen, CheckCircle, Clock, ExternalLink } from "lucide-react"
import type { CourseWithDetails } from "@/types/classroom"
import { getGradeLabel } from "@/lib/classroom"

interface CourseCardProps {
  course: CourseWithDetails
}

export function CourseCard({ course }: CourseCardProps) {
  const completionRate = course.totalAssignments 
    ? Math.round((course.completedAssignments || 0) / course.totalAssignments * 100)
    : 0

  const gradePercentage = course.averageGrade !== undefined ? Math.round(course.averageGrade) : null
  const gradeLabel = gradePercentage !== null ? getGradeLabel(gradePercentage) : null

  return (
    <Card className="group hover:border-primary/50 transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold truncate text-card-foreground">
              {course.name}
            </CardTitle>
            {course.section && (
              <p className="text-sm text-muted-foreground truncate mt-1">
                {course.section}
              </p>
            )}
          </div>
          {gradeLabel && (
            <Badge 
              variant={gradePercentage && gradePercentage >= 70 ? "default" : "destructive"}
              className="ml-2 shrink-0"
            >
              {gradeLabel} ({gradePercentage}%)
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Completion</span>
            <span className="font-medium text-card-foreground">{completionRate}%</span>
          </div>
          <Progress value={completionRate} className="h-2" />
        </div>

        {/* Stats Row */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <BookOpen className="h-4 w-4" />
            <span>{course.totalAssignments || 0} assignments</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <CheckCircle className="h-4 w-4" />
            <span>{course.completedAssignments || 0} completed</span>
          </div>
        </div>

        {/* Recent Assignments Preview */}
        {course.courseWork && course.courseWork.length > 0 && (
          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2">Recent Assignments</p>
            <div className="space-y-1">
              {course.courseWork.slice(0, 2).map((work) => {
                const submission = course.submissions?.find(
                  (s) => s.courseWorkId === work.id
                )
                const isCompleted = submission?.state === "TURNED_IN" || submission?.state === "RETURNED"
                
                return (
                  <div 
                    key={work.id} 
                    className="flex items-center justify-between text-sm"
                  >
                    <span className={`truncate flex-1 ${isCompleted ? "text-muted-foreground" : "text-card-foreground"}`}>
                      {work.title}
                    </span>
                    {isCompleted ? (
                      <CheckCircle className="h-4 w-4 text-primary shrink-0 ml-2" />
                    ) : (
                      <Clock className="h-4 w-4 text-muted-foreground shrink-0 ml-2" />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* View in Classroom Link */}
        {course.alternateLink && (
          <a
            href={course.alternateLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors pt-2"
          >
            <span>View in Classroom</span>
            <ExternalLink className="h-4 w-4" />
          </a>
        )}
      </CardContent>
    </Card>
  )
}
