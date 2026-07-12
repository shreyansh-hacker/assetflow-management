import type { ReactNode } from "react"
import { cn } from "@/utils/cn"
import { Info, AlertCircle, RefreshCw, Wrench } from "lucide-react"

export type NotificationCategory = "system" | "maintenance" | "transfer" | "alert"

interface NotificationCardProps {
  id: string | number
  title: string
  description: string
  time: string
  category: NotificationCategory
  read?: boolean
  onClick?: () => void
  className?: string
}

export default function NotificationCard({
  title,
  description,
  time,
  category,
  read = false,
  onClick,
  className,
}: NotificationCardProps) {
  const getIcon = (cat: NotificationCategory): ReactNode => {
    switch (cat) {
      case "maintenance":
        return <Wrench className="w-4 h-4 text-amber-500" />
      case "transfer":
        return <RefreshCw className="w-4 h-4 text-primary" />
      case "alert":
        return <AlertCircle className="w-4 h-4 text-destructive" />
      case "system":
      default:
        return <Info className="w-4 h-4 text-sky-500" />
    }
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "p-4 rounded-xl border border-border bg-card shadow-premium select-none text-left flex gap-3 cursor-pointer transition-colors duration-150 hover:bg-muted/20 relative",
        !read && "border-primary/20 bg-primary/[0.01]",
        className
      )}
    >
      {/* Category Icon */}
      <div className={cn(
        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-secondary/80",
        !read && "bg-primary/5"
      )}>
        {getIcon(category)}
      </div>

      {/* Message Info */}
      <div className="flex-1 space-y-1 overflow-hidden pr-3">
        <div className="flex items-center justify-between gap-4">
          <h4 className={cn("text-sm font-semibold text-foreground truncate", !read && "text-primary")}>
            {title}
          </h4>
          <span className="text-[10px] text-muted-foreground whitespace-nowrap">{time}</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed truncate-2-lines">
          {description}
        </p>
      </div>

      {/* Unread circle badge */}
      {!read && (
        <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-primary shrink-0 animate-pulse" />
      )}
    </div>
  )
}
