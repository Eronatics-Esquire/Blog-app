import * as React from "react"
import { cn } from "@/lib/utils"

interface StatusIndicatorProps extends React.HTMLAttributes<HTMLSpanElement> {
  isOnline?: boolean
  lastSeenAt?: string | null
  size?: "sm" | "md" | "lg"
}

function StatusIndicator({
  isOnline = false,
  size = "md",
  className,
  ...props
}: StatusIndicatorProps) {
  const sizeMap = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  }
  
  return (
    <span
      className={cn(
        "absolute rounded-full border-2 border-white",
        isOnline ? "bg-green-500" : "bg-gray-400",
        sizeMap[size],
        className
      )}
      style={{ position: 'absolute', bottom: 0, right: 0, zIndex: 10 }}
      {...props}
    />
  )
}

function formatTimeAgo(dateString: string | null): string {
  if (!dateString) return ""
  
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "Active now"
  if (diffMins < 60) return `${diffMins}m`
  if (diffHours < 24) return `${diffHours}h`
  if (diffDays < 7) return `${diffDays}d`
  return date.toLocaleDateString()
}

export { StatusIndicator, formatTimeAgo }
