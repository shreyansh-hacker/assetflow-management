import type { ReactNode } from "react"
import { cn } from "@/utils/cn"

export interface TimelineEvent {
  id: string | number
  title: string
  subtitle?: string
  description?: string
  date: string
  icon?: ReactNode
  status?: "primary" | "success" | "warning" | "danger" | "secondary"
}

interface TimelineProps {
  events: TimelineEvent[]
  className?: string
}

export default function Timeline({ events, className }: TimelineProps) {
  return (
    <div className={cn("relative border-l border-border pl-6 space-y-6 text-left select-none", className)}>
      {events.map((event) => (
        <div key={event.id} className="relative group">
          {/* Timeline bullet node */}
          <div
            className={cn(
              "absolute -left-[31px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full border border-card shadow-premium bg-card ring-4 ring-background transition-colors duration-150",
              event.status === "primary" && "bg-primary text-primary-foreground border-primary",
              event.status === "success" && "bg-emerald-500 text-white border-emerald-500",
              event.status === "warning" && "bg-amber-500 text-white border-amber-500",
              event.status === "danger" && "bg-destructive text-white border-destructive",
              (!event.status || event.status === "secondary") && "bg-slate-300 dark:bg-slate-700 border-border"
            )}
          >
            {event.icon ? (
              <div className="scale-[0.6]">{event.icon}</div>
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
            )}
          </div>

          {/* Content Block */}
          <div className="space-y-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
              <h5 className="text-sm font-semibold text-foreground tracking-tight">{event.title}</h5>
              <span className="text-[10px] font-medium text-muted-foreground whitespace-nowrap">{event.date}</span>
            </div>
            {event.subtitle && <p className="text-xs font-semibold text-muted-foreground">{event.subtitle}</p>}
            {event.description && <p className="text-xs text-muted-foreground leading-relaxed pt-0.5">{event.description}</p>}
          </div>
        </div>
      ))}
    </div>
  )
}
