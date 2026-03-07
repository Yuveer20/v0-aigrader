"use client"

import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, CheckCircle, TrendingUp, Award } from "lucide-react"
import type { ClassroomData } from "@/types/classroom"
import { getGradeLabel } from "@/lib/classroom"

interface StatsOverviewProps {
  data: ClassroomData
}

export function StatsOverview({ data }: StatsOverviewProps) {
  const totalAssignments = data.courses.reduce(
    (sum, course) => sum + (course.totalAssignments || 0),
    0
  )

  const completedAssignments = data.courses.reduce(
    (sum, course) => sum + (course.completedAssignments || 0),
    0
  )

  const overallGrade = data.overallAverage !== undefined 
    ? Math.round(data.overallAverage) 
    : null

  const gradeLabel = overallGrade !== null ? getGradeLabel(overallGrade) : null

  const stats = [
    {
      label: "Total Courses",
      value: data.totalCourses,
      icon: BookOpen,
      color: "text-blue-400",
    },
    {
      label: "Assignments",
      value: totalAssignments,
      icon: CheckCircle,
      color: "text-green-400",
    },
    {
      label: "Completed",
      value: completedAssignments,
      icon: TrendingUp,
      color: "text-yellow-400",
    },
    {
      label: "Overall Grade",
      value: overallGrade !== null ? `${gradeLabel} (${overallGrade}%)` : "N/A",
      icon: Award,
      color: overallGrade !== null && overallGrade >= 70 ? "text-primary" : "text-orange-400",
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold text-card-foreground mt-1">
                  {stat.value}
                </p>
              </div>
              <stat.icon className={`h-8 w-8 ${stat.color} opacity-80`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
