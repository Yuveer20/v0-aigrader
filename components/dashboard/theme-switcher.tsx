"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Palette, Check } from "lucide-react"
import { useTheme, ThemeVariant, themeConfig } from "@/lib/theme-context"

const themes: { id: ThemeVariant; label: string; colors: string[] }[] = [
  { id: "ocean", label: "Ocean", colors: ["#3B82F6", "#22D3EE", "#312E81"] },
  { id: "sunset", label: "Sunset", colors: ["#F97316", "#FBBF24", "#7C2D12"] },
  { id: "midnight", label: "Midnight", colors: ["#71717A", "#FAFAFA", "#262626"] },
]

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()

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
      <DropdownMenuContent align="end" className="w-48 bg-card border-border">
        {themes.map((t) => (
          <DropdownMenuItem
            key={t.id}
            onClick={() => setTheme(t.id)}
            className="flex items-center gap-3 cursor-pointer"
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
            {theme === t.id && <Check className="h-4 w-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
