import type { ReactNode } from "react"
import { cn } from "@/utils/cn"

interface HistoryCardProps {
  title: string
  date: string
  actor: {
    name: string
    avatar?: string
    role?: string
  }
  description?: string
  badge?: ReactNode
  className?: string
}

export default function HistoryCard({ title, date, actor, description, badge, className }: HistoryCardProps) {
  return (
    <div className={cn("p-4 rounded-xl border border-border bg-card shadow-premium select-none text-left flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-card-hover", className)}>
      <div className="flex items-start gap-3">
        {/* Actor initials / avatar fallback */}
        <div className="w-8 h-8 rounded-full bg-secondary/80 flex items-center justify-center font-bold text-xs text-muted-foreground uppercase shrink-0">
          {actor.name.substring(0, 2)}
        </div>
        
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h5 className="text-sm font-semibold text-foreground tracking-tight">{title}</h5>
            {badge}
          </div>
          {description && <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>}
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground pt-0.5">
            <span>By {actor.name}</span>
            {actor.role && <span>({actor.role})</span>}
            <span>•</span>
            <span>{date}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
