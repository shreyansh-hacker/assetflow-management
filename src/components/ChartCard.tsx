import type { ReactNode } from "react"
import { cn } from "@/utils/cn"

interface ChartCardProps {
  title: string
  description?: string
  actions?: ReactNode
  children: ReactNode
  className?: string
}

export default function ChartCard({ title, description, actions, children, className }: ChartCardProps) {
  return (
    <div className={cn("p-6 rounded-xl border border-border bg-card shadow-premium flex flex-col gap-4", className)}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/40 pb-4">
        <div className="space-y-1 text-left">
          <h3 className="font-semibold text-foreground tracking-tight">{title}</h3>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-2 self-start sm:self-auto">{actions}</div>}
      </div>
      <div className="flex-1 w-full min-h-[260px] flex items-center justify-center">
        {children}
      </div>
    </div>
  )
}
