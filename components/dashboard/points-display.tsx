"use client"

import { useEffect, useState } from "react"
import { usePoints } from "@/lib/points-context"
import { Trophy, TrendingUp, TrendingDown } from "lucide-react"

interface PointsDisplayProps {
  size?: "sm" | "md"
}

export function PointsDisplay({ size = "md" }: PointsDisplayProps) {
  const { points, pointsChange } = usePoints()
  const [showAnimation, setShowAnimation] = useState(false)
  const [animationAmount, setAnimationAmount] = useState(0)
  const [isPositive, setIsPositive] = useState(true)

  useEffect(() => {
    if (pointsChange) {
      setAnimationAmount(pointsChange.amount)
      setIsPositive(pointsChange.amount > 0)
      setShowAnimation(true)
      
      const timer = setTimeout(() => {
        setShowAnimation(false)
      }, 2000)
      
      return () => clearTimeout(timer)
    }
  }, [pointsChange])

  const sizeClasses = size === "sm" 
    ? "px-2 py-1 text-xs" 
    : "px-3 py-1 text-sm"

  const iconSize = size === "sm" ? "h-3 w-3" : "h-4 w-4"

  return (
    <div className="relative">
      {/* Points Badge */}
      <div className={`flex items-center gap-1 rounded-full points-gradient border border-white/20 ${sizeClasses} ${showAnimation ? 'scale-110' : 'scale-100'} transition-transform duration-300`}>
        <Trophy className={`${iconSize} text-white`} />
        <span className="font-bold text-white">{points}</span>
        <span className="text-white/70">pts</span>
      </div>

      {/* Animation Popup */}
      {showAnimation && (
        <div 
          className={`absolute -top-8 left-1/2 transform -translate-x-1/2 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold whitespace-nowrap animate-bounce ${
            isPositive 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
          }`}
        >
          {isPositive ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          {isPositive ? '+' : ''}{animationAmount}
        </div>
      )}
    </div>
  )
}
