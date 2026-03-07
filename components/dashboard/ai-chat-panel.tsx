"use client"

import { useState, useRef, useEffect } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { X, Send, Brain, User, Loader2, Sparkles, Timer } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import type { ClassroomData } from "@/types/classroom"

interface AIChatPanelProps {
  classroomData?: ClassroomData
  onClose: () => void
  onOpenPomodoro?: () => void
}

export function AIChatPanel({ classroomData, onClose, onOpenPomodoro }: AIChatPanelProps) {
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
    "How should I use the Pomodoro timer to study?",
  ]

  return (
    <div className="fixed right-0 top-0 h-screen w-full max-w-2xl bg-gradient-to-b from-[#1E1B4B] to-[#312E81] border-l border-border flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/50 bg-[#0F172A]/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-400">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-white">AI Tutor</h2>
            <p className="text-xs text-cyan-300">Your personal learning assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onOpenPomodoro && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onOpenPomodoro}
              className="gap-2 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10"
            >
              <Timer className="h-4 w-4" />
              Pomodoro
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/10">
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-500/10 border-b border-red-500/20 text-red-300 text-sm">
          Error: {error.message || "Something went wrong"}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6">
        {messages.length === 0 ? (
          <div className="space-y-6">
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan-500/20">
                <Sparkles className="h-10 w-10 text-white" />
              </div>
              <h3 className="font-bold text-xl text-white mb-2">
                Your AI Learning Assistant
              </h3>
              <p className="text-sm text-cyan-200/70 max-w-md mx-auto">
                I can help you understand your grades, create study plans, explain difficult concepts, and guide you on using the Pomodoro timer for effective studying.
              </p>
            </div>

            {/* Quick Actions */}
            {onOpenPomodoro && (
              <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-xl p-4 border border-cyan-500/20">
                <div className="flex items-center gap-3">
                  <Timer className="h-8 w-8 text-cyan-400" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-white">Need help focusing?</h4>
                    <p className="text-sm text-cyan-200/70">Use the Pomodoro timer to boost your productivity</p>
                  </div>
                  <Button onClick={onOpenPomodoro} size="sm" className="btn-gradient">
                    Open Timer
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-xs text-cyan-300/50 uppercase tracking-wider font-medium">
                Try asking:
              </p>
              {suggestedPrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setInput(prompt)
                  }}
                  className="w-full text-left p-4 rounded-xl bg-white/5 hover:bg-white/10 text-sm text-white transition-all border border-white/10 hover:border-cyan-500/30"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-4 ${
                  message.role === "user" ? "flex-row-reverse" : ""
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    message.role === "user"
                      ? "bg-gradient-to-r from-blue-500 to-cyan-400"
                      : "bg-white/10"
                  }`}
                >
                  {message.role === "user" ? (
                    <User className="h-5 w-5 text-white" />
                  ) : (
                    <Brain className="h-5 w-5 text-cyan-400" />
                  )}
                </div>
                <div
                  className={`flex-1 rounded-xl p-4 ${
                    message.role === "user"
                      ? "bg-gradient-to-r from-blue-500 to-cyan-400 text-white"
                      : "bg-white/5 text-white border border-white/10"
                  }`}
                >
                  <div className={`prose prose-sm max-w-none ${message.role === "user" ? "prose-invert" : "prose-invert"}`}>
                    {message.parts.map((part, index) => {
                      if (part.type === "text") {
                        return (
                          <ReactMarkdown 
                            key={index} 
                            remarkPlugins={[remarkGfm]}
                            components={{
                              p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>,
                              ul: ({ children }) => <ul className="list-disc pl-4 mb-3 space-y-1">{children}</ul>,
                              ol: ({ children }) => <ol className="list-decimal pl-4 mb-3 space-y-1">{children}</ol>,
                              li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                              code: ({ children }) => <code className="bg-black/30 px-1.5 py-0.5 rounded text-xs text-cyan-300">{children}</code>,
                              pre: ({ children }) => <pre className="bg-black/30 p-3 rounded-lg overflow-x-auto mb-3">{children}</pre>,
                              h1: ({ children }) => <h1 className="text-xl font-bold mb-3 text-cyan-300">{children}</h1>,
                              h2: ({ children }) => <h2 className="text-lg font-bold mb-2 text-cyan-300">{children}</h2>,
                              h3: ({ children }) => <h3 className="text-base font-bold mb-2 text-cyan-300">{children}</h3>,
                              strong: ({ children }) => <strong className="font-semibold text-cyan-200">{children}</strong>,
                              a: ({ href, children }) => <a href={href} className="text-cyan-400 hover:underline">{children}</a>,
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
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/10">
                  <Brain className="h-5 w-5 text-cyan-400" />
                </div>
                <div className="flex-1 rounded-xl p-4 bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
                    <span className="text-sm text-cyan-200/70">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-border/50 bg-[#0F172A]/50 backdrop-blur-sm">
        <div className="flex gap-3">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything about your studies..."
            className="min-h-[52px] max-h-40 resize-none bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-cyan-500/50"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={!input.trim() || isLoading}
            className="btn-gradient shrink-0 h-[52px] w-[52px]"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
        <p className="text-xs text-cyan-300/50 mt-2 text-center">
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

${courseSummaries}

Note: The student has access to a Pomodoro timer feature for focused study sessions. When giving study advice, suggest using the Pomodoro technique (25 min focus, 5 min break) to maximize productivity.`
}
