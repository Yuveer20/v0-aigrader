"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { GraduationCap, LogOut, MessageSquare, RefreshCw } from "lucide-react"
import { CourseCard } from "@/components/dashboard/course-card"
import { StatsOverview } from "@/components/dashboard/stats-overview"
import { AIChatPanel } from "@/components/dashboard/ai-chat-panel"
import type { ClassroomData } from "@/types/classroom"

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) throw new Error("Failed to fetch")
  return res.json()
})

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [showChat, setShowChat] = useState(false)

  const { data: classroomData, error, isLoading, mutate } = useSWR<ClassroomData>(
    session?.accessToken ? "/api/classroom" : null,
    fetcher,
    { revalidateOnFocus: false }
  )

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/")
    }
  }, [status, router])

  if (status === "loading" || !session) {
    return <DashboardSkeleton />
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="text-xl font-semibold text-foreground">AIGrader</span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowChat(!showChat)}
              className="gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">AI Tutor</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Main Content */}
        <main className={`flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-all ${showChat ? "lg:mr-96" : ""}`}>
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Welcome back, {session.user?.name?.split(" ")[0] || "Student"}
            </h1>
            <p className="text-muted-foreground">
              Here&apos;s an overview of your academic progress
            </p>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-8">
              <p className="text-destructive font-medium">Failed to load classroom data</p>
              <p className="text-sm text-muted-foreground mt-1">
                Make sure you have granted access to Google Classroom and try again.
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-3"
                onClick={() => mutate()}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          )}

          {/* Stats Overview */}
          {isLoading ? (
            <StatsOverviewSkeleton />
          ) : classroomData ? (
            <StatsOverview data={classroomData} />
          ) : null}

          {/* Courses Grid */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">Your Courses</h2>
              {!isLoading && (
                <Button variant="ghost" size="sm" onClick={() => mutate()}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              )}
            </div>

            {isLoading ? (
              <CoursesGridSkeleton />
            ) : classroomData?.courses && classroomData.courses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classroomData.courses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-card border border-border rounded-lg">
                <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No courses found</h3>
                <p className="text-muted-foreground">
                  You don&apos;t have any active courses in Google Classroom.
                </p>
              </div>
            )}
          </div>
        </main>

        {/* AI Chat Panel */}
        {showChat && (
          <AIChatPanel 
            classroomData={classroomData} 
            onClose={() => setShowChat(false)} 
          />
        )}
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-6 w-24" />
          </div>
          <Skeleton className="h-9 w-24" />
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Skeleton className="h-9 w-64 mb-2" />
        <Skeleton className="h-5 w-96 mb-8" />
        <StatsOverviewSkeleton />
        <div className="mt-8">
          <Skeleton className="h-7 w-32 mb-6" />
          <CoursesGridSkeleton />
        </div>
      </main>
    </div>
  )
}

function StatsOverviewSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-card border border-border rounded-lg p-4">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </div>
  )
}

function CoursesGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-card border border-border rounded-lg p-6">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2 mb-4" />
          <Skeleton className="h-20 w-full mb-4" />
          <div className="flex justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      ))}
    </div>
  )
}
