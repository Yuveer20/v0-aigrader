"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GraduationCap, LogOut, MessageSquare, RefreshCw, Timer, BookOpen } from "lucide-react"
import { CourseCard } from "@/components/dashboard/course-card"
import { StatsOverview } from "@/components/dashboard/stats-overview"
import { AIChatPanel } from "@/components/dashboard/ai-chat-panel"
import { PomodoroTimer } from "@/components/dashboard/pomodoro-timer"
import { AssignmentTodo } from "@/components/dashboard/assignment-todo"
import { usePoints } from "@/lib/points-context"
import type { ClassroomData } from "@/types/classroom"

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) throw new Error("Failed to fetch")
  return res.json()
})

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("courses")
  const { points } = usePoints()

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
    <div className="min-h-screen relative grid-pattern">
      {/* Header */}
      <header className="border-b border-white/10 sticky top-0 bg-[#0F172A]/80 backdrop-blur-md z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-400">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gradient">AIGrader</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30">
              <span className="text-sm font-bold text-yellow-300">{points}</span>
              <span className="text-xs text-yellow-400/60">pts</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="gap-2 text-white/70 hover:text-white hover:bg-white/10"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex relative">
        {/* Main Content */}
        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome back, <span className="text-gradient">{session.user?.name?.split(" ")[0] || "Student"}</span>
            </h1>
            <p className="text-cyan-200/60">
              Here&apos;s an overview of your academic progress
            </p>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-white/5 border border-white/10 p-1">
              <TabsTrigger 
                value="courses" 
                className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-400 data-[state=active]:text-white"
              >
                <BookOpen className="h-4 w-4" />
                Courses
              </TabsTrigger>
              <TabsTrigger 
                value="tutor"
                className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-400 data-[state=active]:text-white"
              >
                <MessageSquare className="h-4 w-4" />
                AI Tutor
              </TabsTrigger>
              <TabsTrigger 
                value="pomodoro"
                className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-400 data-[state=active]:text-white"
              >
                <Timer className="h-4 w-4" />
                Pomodoro Timer
              </TabsTrigger>
            </TabsList>

            {/* Courses Tab */}
            <TabsContent value="courses" className="space-y-8">
              {/* Stats and Todo Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  {/* Stats Overview */}
                  {isLoading ? (
                    <StatsOverviewSkeleton />
                  ) : classroomData ? (
                    <StatsOverview data={classroomData} />
                  ) : null}
                </div>
                <div className="lg:col-span-1">
                  <AssignmentTodo classroomData={classroomData} />
                </div>
              </div>

              {/* Error State */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                  <p className="text-red-300 font-medium">Failed to load classroom data</p>
                  <p className="text-sm text-red-300/70 mt-1">
                    Make sure you have granted access to Google Classroom and try again.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-3 border-red-500/30 text-red-300 hover:bg-red-500/10"
                    onClick={() => mutate()}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                  </Button>
                </div>
              )}

              {/* Courses Grid */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-white">Your Courses</h2>
                  {!isLoading && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => mutate()}
                      className="text-cyan-300 hover:text-cyan-200 hover:bg-cyan-500/10"
                    >
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
                  <div className="text-center py-12 bg-white/5 border border-white/10 rounded-xl">
                    <GraduationCap className="h-12 w-12 text-cyan-400/50 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">No courses found</h3>
                    <p className="text-cyan-200/60">
                      You don&apos;t have any active courses in Google Classroom.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* AI Tutor Tab */}
            <TabsContent value="tutor" className="h-[calc(100vh-280px)] min-h-[500px]">
              <AIChatPanel 
                classroomData={classroomData} 
                onClose={() => setActiveTab("courses")}
                onOpenPomodoro={() => setActiveTab("pomodoro")}
                isFullPage={true}
              />
            </TabsContent>

            {/* Pomodoro Tab */}
            <TabsContent value="pomodoro">
              <PomodoroTimer />
            </TabsContent>
          </Tabs>
          </div>
        </main>

      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen relative grid-pattern">
      <header className="border-b border-white/10 sticky top-0 bg-[#0F172A]/80 backdrop-blur-md z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg bg-white/10" />
            <Skeleton className="h-6 w-24 bg-white/10" />
          </div>
          <Skeleton className="h-9 w-24 bg-white/10" />
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Skeleton className="h-9 w-64 mb-2 bg-white/10" />
        <Skeleton className="h-5 w-96 mb-8 bg-white/10" />
        <StatsOverviewSkeleton />
        <div className="mt-8">
          <Skeleton className="h-7 w-32 mb-6 bg-white/10" />
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
        <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4">
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
        <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-6">
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
