"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Palette, Check, Lock } from "lucide-react"
import { useTheme, ThemeVariant, themeConfig, themeUnlockPoints } from "@/lib/theme-context"
import { usePoints } from "@/lib/points-context"

const themes: { id: ThemeVariant; label: string; colors: string[] }[] = [
  { id: "midnight", label: "Midnight", colors: ["#52525B", "#A1A1AA", "#E4E4E7"] },
  { id: "ocean", label: "Ocean", colors: ["#3B82F6", "#22D3EE", "#312E81"] },
  { id: "sunset", label: "Sunset", colors: ["#EA580C", "#FACC15", "#DC2626"] },
]

export function ThemeSwitcher() {
  const { theme, setTheme, isThemeUnlocked } = useTheme()
  const { points } = usePoints()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-foreground/70 hover:text-foreground hover:bg-white/10"
        >
          <Palette className="h-4 w-4" />
          <span className="hidden sm:inline">Theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-card border-border">
        {themes.map((t) => {
          const unlocked = isThemeUnlocked(t.id, points)
          const unlockPts = themeUnlockPoints[t.id]
          
          return (
            <DropdownMenuItem
              key={t.id}
              onClick={() => unlocked && setTheme(t.id)}
              className={`flex items-center gap-3 ${unlocked ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
              disabled={!unlocked}
            >
              <div className="flex gap-1">
                {t.colors.map((color, i) => (
                  <div
                    key={i}
                    className="w-4 h-4 rounded-full border border-white/20"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <span className="flex-1">{t.label}</span>
              {!unlocked ? (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Lock className="h-3 w-3" />
                  <span>{unlockPts} pts</span>
                </div>
              ) : theme === t.id ? (
                <Check className="h-4 w-4 text-primary" />
              ) : null}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
