import * as AvatarPrimitive from "@radix-ui/react-avatar"
import * as React from "react"

import { cn } from "@/lib/utils"
import { StatusIndicator } from "./status-indicator"

function Avatar({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-full",
        className
      )}
      {...props}
    />
  )
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full", className)}
      {...props}
    />
  )
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "bg-muted flex size-full items-center justify-center rounded-full",
        className
      )}
      {...props}
    />
  )
}

interface AvatarWithStatusProps {
  isOnline?: boolean
  lastSeenAt?: string | null
  statusSize?: "sm" | "md" | "lg"
  size?: "sm" | "md" | "lg"
  className?: string
  children?: React.ReactNode
}

const avatarSizes = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
}

function AvatarWithStatus({
  isOnline = false,
  lastSeenAt = null,
  statusSize = "md",
  size = "md",
  className,
  children,
}: AvatarWithStatusProps) {
  return (
    <div className={cn("relative inline-block", avatarSizes[size])}>
      <Avatar className={cn(avatarSizes[size], className)}>
        {children}
      </Avatar>
      <StatusIndicator
        isOnline={isOnline}
        lastSeenAt={lastSeenAt}
        size={statusSize}
      />
    </div>
  )
}

export { Avatar, AvatarImage, AvatarFallback, AvatarWithStatus }
