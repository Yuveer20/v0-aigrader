"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Play, Pause, RotateCcw, Coffee, Brain, Settings, Zap, Trophy } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { usePoints } from "@/lib/points-context"

type TimerMode = "focus" | "shortBreak" | "longBreak"

interface TimerSettings {
  focus: number
  shortBreak: number
  longBreak: number
}

const DEFAULT_SETTINGS: TimerSettings = {
  focus: 25,
  shortBreak: 5,
  longBreak: 15,
}

export function PomodoroTimer() {
  const { points, addPoints } = usePoints()
  const [settings, setSettings] = useState<TimerSettings>(DEFAULT_SETTINGS)
  const [mode, setMode] = useState<TimerMode>("focus")
  const [timeLeft, setTimeLeft] = useState(settings.focus * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [sessionsCompleted, setSessionsCompleted] = useState(0)
  const [showSettings, setShowSettings] = useState(false)
  const [showPointsPopup, setShowPointsPopup] = useState(false)

  const resetTimer = useCallback((newMode?: TimerMode) => {
    const targetMode = newMode || mode
    setTimeLeft(settings[targetMode] * 60)
    setIsRunning(false)
  }, [mode, settings])

  useEffect(() => {
    resetTimer(mode)
  }, [mode, settings, resetTimer])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      // Timer completed
      if (mode === "focus") {
        setSessionsCompleted((prev) => prev + 1)
        // Award points for completing a focus session
        addPoints(10, "Completed a focus session")
        setShowPointsPopup(true)
        setTimeout(() => setShowPointsPopup(false), 2000)
        // Auto switch to break
        const newMode = (sessionsCompleted + 1) % 4 === 0 ? "longBreak" : "shortBreak"
        setMode(newMode)
        playNotification()
      } else {
        // Break completed, switch back to focus
        setMode("focus")
        playNotification()
      }
      setIsRunning(false)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, timeLeft, mode, sessionsCompleted])

  const playNotification = () => {
    // Play notification sound if available
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification("Pomodoro Timer", {
          body: mode === "focus" ? "Time for a break!" : "Break is over, time to focus!",
        })
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission()
      }
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getProgress = () => {
    const total = settings[mode] * 60
    return ((total - timeLeft) / total) * 100
  }

  const getModeColor = () => {
    switch (mode) {
      case "focus":
        return "from-blue-500 to-cyan-400"
      case "shortBreak":
        return "from-green-500 to-emerald-400"
      case "longBreak":
        return "from-purple-500 to-pink-400"
    }
  }

  const getModeIcon = () => {
    switch (mode) {
      case "focus":
        return <Brain className="h-6 w-6" />
      case "shortBreak":
      case "longBreak":
        return <Coffee className="h-6 w-6" />
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <Card className="bg-card/50 backdrop-blur-sm border-border">
        <CardHeader className="text-center pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-gradient">Pomodoro Timer</CardTitle>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-3 py-1 rounded-full points-gradient border border-white/20">
                <Trophy className="h-4 w-4 text-white" />
                <span className="text-sm font-bold text-white">{points}</span>
                <span className="text-xs text-white/70">pts</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Stay focused and earn <span className="text-primary font-medium">+10 points</span> per session!
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mode Selector */}
          <div className="flex gap-2 justify-center">
            {(["focus", "shortBreak", "longBreak"] as TimerMode[]).map((m) => (
              <Button
                key={m}
                variant={mode === m ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setMode(m)
                  setIsRunning(false)
                }}
                className={mode === m ? "btn-gradient" : ""}
              >
                {m === "focus" ? "Focus" : m === "shortBreak" ? "Short Break" : "Long Break"}
              </Button>
            ))}
          </div>

          {/* Points Popup */}
          {showPointsPopup && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 animate-bounce">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold shadow-lg">
                <Zap className="h-5 w-5" />
                +10 Points!
              </div>
            </div>
          )}

          {/* Timer Display */}
          <div className="relative flex items-center justify-center">
            <div className="relative w-64 h-64">
              {/* Progress Ring */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="text-muted/30"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${getProgress() * 2.83} 283`}
                  className="transition-all duration-1000"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="var(--theme-primary, #3B82F6)" />
                    <stop offset="100%" stopColor="var(--theme-accent, #22D3EE)" />
                  </linearGradient>
                </defs>
              </svg>
              {/* Timer Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className={`p-3 rounded-full bg-gradient-to-r ${getModeColor()} mb-2`}>
                  {getModeIcon()}
                </div>
                <span className="text-5xl font-bold font-mono text-foreground">
                  {formatTime(timeLeft)}
                </span>
                <span className="text-sm text-muted-foreground mt-1 capitalize">
                  {mode === "focus" ? "Focus Time" : mode === "shortBreak" ? "Short Break" : "Long Break"}
                </span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-4">
            <Button
              size="lg"
              onClick={() => setIsRunning(!isRunning)}
              className="btn-gradient px-8"
            >
              {isRunning ? (
                <>
                  <Pause className="h-5 w-5 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-5 w-5 mr-2" />
                  Start
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => resetTimer()}
            >
              <RotateCcw className="h-5 w-5 mr-2" />
              Reset
            </Button>
          </div>

          {/* Sessions Counter */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Sessions completed today: <span className="text-gradient font-semibold">{sessionsCompleted}</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              After 4 focus sessions, you'll get a long break
            </p>
          </div>

          {/* Settings */}
          {showSettings && (
            <div className="border-t border-border pt-4 space-y-4">
              <h4 className="font-medium text-foreground">Timer Settings (minutes)</h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground">Focus</label>
                  <Select
                    value={settings.focus.toString()}
                    onValueChange={(v) => setSettings((s) => ({ ...s, focus: parseInt(v) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[15, 20, 25, 30, 45, 60].map((v) => (
                        <SelectItem key={v} value={v.toString()}>{v} min</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Short Break</label>
                  <Select
                    value={settings.shortBreak.toString()}
                    onValueChange={(v) => setSettings((s) => ({ ...s, shortBreak: parseInt(v) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[3, 5, 10, 15].map((v) => (
                        <SelectItem key={v} value={v.toString()}>{v} min</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Long Break</label>
                  <Select
                    value={settings.longBreak.toString()}
                    onValueChange={(v) => setSettings((s) => ({ ...s, longBreak: parseInt(v) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[10, 15, 20, 30].map((v) => (
                        <SelectItem key={v} value={v.toString()}>{v} min</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="bg-muted/30 rounded-lg p-4">
            <h4 className="font-medium text-foreground mb-2">Pomodoro Technique Tips</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>Work on a single task during each focus session</li>
              <li>Take breaks to refresh your mind</li>
              <li>After 4 sessions, take a longer break</li>
              <li>Use the AI Tutor to plan your study sessions</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
