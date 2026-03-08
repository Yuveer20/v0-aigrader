"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, MessageSquare, CheckCircle2, Circle, Sparkles, ArrowRight, RefreshCw } from "lucide-react"
import { useChatContext } from "@/lib/chat-context"
import type { ClassroomData } from "@/types/classroom"

interface NextStepsProps {
  classroomData?: ClassroomData
  onOpenTutor: () => void
}

interface Step {
  id: string
  text: string
  completed: boolean
  priority: "high" | "medium" | "low"
}

export function NextSteps({ classroomData, onOpenTutor }: NextStepsProps) {
  const { messages } = useChatContext()
  const [steps, setSteps] = useState<Step[]>([])
  const [hasSpokenToAI, setHasSpokenToAI] = useState(false)

  // Check if user has talked to AI
  useEffect(() => {
    const userMessages = messages.filter(m => m.role === "user")
    setHasSpokenToAI(userMessages.length > 0)
    
    // Load saved steps
    const savedSteps = localStorage.getItem("aigrader-next-steps")
    if (savedSteps) {
      setSteps(JSON.parse(savedSteps))
    }
  }, [messages])

  // Extract steps from AI messages
  useEffect(() => {
    if (messages.length === 0) return

    const aiMessages = messages.filter(m => m.role === "assistant")
    if (aiMessages.length === 0) return

    // Get the last AI message
    const lastAiMessage = aiMessages[aiMessages.length - 1]
    const textParts = lastAiMessage.parts.filter(p => p.type === "text")
    const fullText = textParts.map(p => 'text' in p ? p.text : '').join("")

    // Extract action items from the AI response
    const extractedSteps = extractStepsFromText(fullText)
    
    if (extractedSteps.length > 0) {
      // Merge with existing steps, avoiding duplicates
      setSteps(prev => {
        const existingTexts = new Set(prev.map(s => s.text.toLowerCase()))
        const newSteps = extractedSteps.filter(s => !existingTexts.has(s.text.toLowerCase()))
        const merged = [...prev, ...newSteps].slice(0, 5) // Keep max 5 steps
        localStorage.setItem("aigrader-next-steps", JSON.stringify(merged))
        return merged
      })
    }
  }, [messages])

  const extractStepsFromText = (text: string): Step[] => {
    const steps: Step[] = []
    
    // Look for numbered lists, bullet points, or action-oriented sentences
    const patterns = [
      /(?:^|\n)\s*(?:\d+[\.\)]\s*|[-•]\s*)((?:Start|Begin|Try|Focus|Review|Study|Practice|Complete|Work on|Check|Make sure|Don't forget)[^.\n]+)/gi,
      /(?:^|\n)\s*(?:\d+[\.\)]\s*|[-•]\s*)((?:You should|I recommend|I suggest)[^.\n]+)/gi,
      /(?:^|\n)\s*(?:\d+[\.\)]\s*|[-•]\s*)([A-Z][^.\n]{10,60})/g,
    ]

    patterns.forEach(pattern => {
      let match
      while ((match = pattern.exec(text)) !== null && steps.length < 5) {
        const stepText = match[1].trim()
        if (stepText.length > 10 && stepText.length < 100) {
          const existing = steps.find(s => s.text.toLowerCase() === stepText.toLowerCase())
          if (!existing) {
            steps.push({
              id: `step-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              text: stepText,
              completed: false,
              priority: stepText.toLowerCase().includes("first") || stepText.toLowerCase().includes("important") ? "high" : "medium"
            })
          }
        }
      }
    })

    return steps.slice(0, 5)
  }

  const toggleStep = (id: string) => {
    setSteps(prev => {
      const updated = prev.map(s => s.id === id ? { ...s, completed: !s.completed } : s)
      localStorage.setItem("aigrader-next-steps", JSON.stringify(updated))
      return updated
    })
  }

  const clearSteps = () => {
    setSteps([])
    localStorage.removeItem("aigrader-next-steps")
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-400"
      case "medium": return "text-primary"
      case "low": return "text-muted-foreground"
      default: return "text-primary"
    }
  }

  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur-sm h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Sparkles className="h-5 w-5 theme-primary" />
            Next Steps
          </CardTitle>
          {steps.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSteps}
              className="text-muted-foreground hover:text-foreground h-8 px-2"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          AI-generated action items to help you succeed
        </p>
      </CardHeader>
      <CardContent>
        {!hasSpokenToAI ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full logo-gradient flex items-center justify-center mx-auto shadow-lg">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-1">Get Personalized Steps</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Talk to your AI tutor to get customized action items based on your classes
              </p>
            </div>
            <Button 
              onClick={onOpenTutor} 
              className="btn-gradient gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              Talk to AI Tutor
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        ) : steps.length === 0 ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-6 w-6 theme-primary" />
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-1">No Steps Yet</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Ask your AI tutor for study advice to generate personalized steps
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={onOpenTutor}
              className="gap-2 border-white/20"
            >
              <MessageSquare className="h-4 w-4" />
              Continue Chatting
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {steps.map((step) => (
              <button
                key={step.id}
                onClick={() => toggleStep(step.id)}
                className={`w-full flex items-start gap-3 p-3 rounded-lg text-left transition-all ${
                  step.completed 
                    ? "bg-white/5 opacity-60" 
                    : "bg-white/5 hover:bg-white/10"
                }`}
              >
                {step.completed ? (
                  <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
                ) : (
                  <Circle className={`h-5 w-5 shrink-0 mt-0.5 ${getPriorityColor(step.priority)}`} />
                )}
                <span className={`text-sm ${step.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                  {step.text}
                </span>
              </button>
            ))}
            
            <div className="pt-3 border-t border-white/10 mt-3">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onOpenTutor}
                className="w-full justify-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <MessageSquare className="h-4 w-4" />
                Get More Tips from AI
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
