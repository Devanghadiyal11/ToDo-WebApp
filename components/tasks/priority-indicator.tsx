"use client"

import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Circle, Minus, Zap } from "lucide-react"

interface PriorityIndicatorProps {
  priority: "low" | "medium" | "high" | "urgent"
  size?: "sm" | "md" | "lg"
  showIcon?: boolean
}

const priorityConfig = {
  low: {
    label: "Low",
    color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    icon: Minus,
  },
  medium: {
    label: "Medium",
    color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    icon: Circle,
  },
  high: {
    label: "High",
    color: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    icon: AlertTriangle,
  },
  urgent: {
    label: "Urgent",
    color: "bg-red-500/20 text-red-400 border-red-500/30",
    icon: Zap,
  },
}

export function PriorityIndicator({ priority, size = "sm", showIcon = true }: PriorityIndicatorProps) {
  const config = priorityConfig[priority]
  const Icon = config.icon

  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-2",
  }

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  }

  return (
    <Badge variant="outline" className={`${config.color} ${sizeClasses[size]} font-medium`}>
      {showIcon && <Icon className={`${iconSizes[size]} mr-1`} />}
      {config.label}
    </Badge>
  )
}
