"use client"

import { useState, useRef, useEffect } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X, Send, Brain, User, Loader2, Sparkles } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import type { ClassroomData } from "@/types/classroom"

interface AIChatPanelProps {
  classroomData?: ClassroomData
  onClose: () => void
}

export function AIChatPanel({ classroomData, onClose }: AIChatPanelProps) {
  const [input, setInput] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

  const classroomContext = classroomData ? summarizeClassroomData(classroomData) : null

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: {
        classroomContext,
      },
    }),
    onError: (err) => {
      console.error("Chat error:", err)
    },
  })

  const isLoading = status === "streaming" || status === "submitted"

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    sendMessage({ text: input })
    setInput("")
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const suggestedPrompts = [
    "Analyze my grades and identify areas for improvement",
    "Create a study plan for my upcoming assignments",
    "Help me understand a difficult concept",
    "What subjects need the most attention?",
  ]

  return (
    <div className="fixed right-0 top-0 h-screen w-full max-w-md bg-card border-l border-border flex flex-col z-50 lg:w-96">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-card-foreground">AI Tutor</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-destructive/10 border-b border-destructive/20 text-destructive text-sm">
          Error: {error.message || "Something went wrong"}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="space-y-4">
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-card-foreground mb-2">
                Your AI Learning Assistant
              </h3>
              <p className="text-sm text-muted-foreground">
                I can help you understand your grades, create study plans, and explain difficult concepts.
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Try asking:
              </p>
              {suggestedPrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setInput(prompt)
                  }}
                  className="w-full text-left p-3 rounded-lg bg-muted/50 hover:bg-muted text-sm text-card-foreground transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === "user" ? "flex-row-reverse" : ""
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {message.role === "user" ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Brain className="h-4 w-4" />
                  )}
                </div>
                <div
                  className={`flex-1 rounded-lg p-3 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-card-foreground"
                  }`}
                >
                  <div className={`prose prose-sm max-w-none ${message.role === "user" ? "prose-invert" : "dark:prose-invert"}`}>
                    {message.parts.map((part, index) => {
                      if (part.type === "text") {
                        return (
                          <ReactMarkdown 
                            key={index} 
                            remarkPlugins={[remarkGfm]}
                            components={{
                              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                              ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
                              ol: ({ children }) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
                              li: ({ children }) => <li className="mb-1">{children}</li>,
                              code: ({ children }) => <code className="bg-black/20 px-1 py-0.5 rounded text-xs">{children}</code>,
                              pre: ({ children }) => <pre className="bg-black/20 p-2 rounded overflow-x-auto mb-2">{children}</pre>,
                              h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
                              h2: ({ children }) => <h2 className="text-base font-bold mb-2">{children}</h2>,
                              h3: ({ children }) => <h3 className="text-sm font-bold mb-1">{children}</h3>,
                              strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                            }}
                          >
                            {part.text}
                          </ReactMarkdown>
                        )
                      }
                      return null
                    })}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-muted text-muted-foreground">
                  <Brain className="h-4 w-4" />
                </div>
                <div className="flex-1 rounded-lg p-3 bg-muted">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything about your studies..."
            className="min-h-[44px] max-h-32 resize-none"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={!input.trim() || isLoading}
            className="shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Press Enter to send, Shift+Enter for new line
        </p>
      </form>
    </div>
  )
}

function summarizeClassroomData(data: ClassroomData): string {
  const courseSummaries = data.courses.map((course) => {
    const grade = course.averageGrade !== undefined 
      ? `Average grade: ${Math.round(course.averageGrade)}%` 
      : "No grades yet"
    
    const assignments = course.courseWork?.slice(0, 5).map((work) => {
      const submission = course.submissions?.find((s) => s.courseWorkId === work.id)
      const status = submission?.state === "TURNED_IN" || submission?.state === "RETURNED" 
        ? "completed" 
        : "pending"
      const gradeInfo = submission?.assignedGrade !== undefined 
        ? ` (${submission.assignedGrade}/${work.maxPoints || 100})` 
        : ""
      return `  - ${work.title}: ${status}${gradeInfo}`
    }).join("\n") || "  No assignments"

    return `Course: ${course.name}
${grade}
Completed: ${course.completedAssignments || 0}/${course.totalAssignments || 0} assignments
Recent assignments:
${assignments}`
  }).join("\n\n")

  return `Student's Google Classroom Data:
Total courses: ${data.totalCourses}
Overall average: ${data.overallAverage !== undefined ? Math.round(data.overallAverage) + "%" : "N/A"}

${courseSummaries}`
}
