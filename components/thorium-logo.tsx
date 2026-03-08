"use client"

import Image from "next/image"
import { useTheme } from "@/lib/theme-context"

interface ThoriumLogoProps {
  size?: number
  className?: string
}

export function ThoriumLogo({ size = 40, className = "" }: ThoriumLogoProps) {
  const { theme } = useTheme()
  
  // Different filter styles for each theme
  const filterClass = theme === "midnight" 
    ? "brightness-75 contrast-125 grayscale"
    : theme === "sunset"
    ? "hue-rotate-[320deg] saturate-150 brightness-110"
    : "" // ocean keeps original blue/purple tint
  
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <Image
        src="/images/thorium-logo.png"
        alt="Thorium Logo"
        width={size}
        height={size}
        className={`object-contain ${filterClass} transition-all duration-300`}
        priority
      />
    </div>
  )
}
