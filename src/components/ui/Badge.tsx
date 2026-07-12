import type { HTMLAttributes } from "react"
import { cn } from "@/utils/cn"

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "primary" | "secondary" | "success" | "warning" | "danger" | "info" | "outline"
}

export function Badge({ className, variant = "secondary", children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold select-none border whitespace-nowrap",
        // Variants
        variant === "primary" && "bg-primary/10 text-primary border-primary/20",
        variant === "secondary" && "bg-secondary text-secondary-foreground border-border/50",
        variant === "success" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
        variant === "warning" && "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
        variant === "danger" && "bg-destructive/10 text-destructive border-destructive/20",
        variant === "info" && "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
        variant === "outline" && "bg-transparent text-foreground border-border",
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
