import { forwardRef } from "react"
import type { ButtonHTMLAttributes } from "react"
import { cn } from "@/utils/cn"
import { Loader2 } from "lucide-react"

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive" | "link"
  size?: "sm" | "md" | "lg" | "icon"
  isLoading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-medium text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] select-none cursor-pointer",
          // Variants
          variant === "primary" && "bg-primary text-primary-foreground hover:bg-primary/95 shadow-sm shadow-primary/10 border border-primary/20",
          variant === "secondary" && "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border/50",
          variant === "outline" && "border border-border bg-background hover:bg-muted text-foreground",
          variant === "ghost" && "hover:bg-muted text-foreground",
          variant === "destructive" && "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm border border-destructive/20",
          variant === "link" && "text-primary underline-offset-4 hover:underline active:scale-100 p-0 h-auto",
          // Sizing
          size === "sm" && "h-9 px-3 text-xs gap-1.5",
          size === "md" && "h-10 px-4 gap-2",
          size === "lg" && "h-11 px-6 text-base gap-2.5",
          size === "icon" && "h-9 w-9 p-0",
          className
        )}
        {...props}
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : null}
        {children}
      </button>
    )
  }
)

Button.displayName = "Button"
