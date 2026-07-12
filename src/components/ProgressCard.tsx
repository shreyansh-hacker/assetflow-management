import { cn } from "@/utils/cn"

interface ProgressCardProps {
  title: string
  subtitle?: string
  value: number // Out of 100
  statusText?: string
  className?: string
}

export default function ProgressCard({ title, subtitle, value, statusText, className }: ProgressCardProps) {
  // Clamp value between 0 and 100
  const percentage = Math.min(Math.max(value, 0), 100)

  return (
    <div className={cn("p-5 rounded-xl border border-border bg-card shadow-premium select-none text-left space-y-3", className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-0.5">
          <h4 className="font-semibold text-sm text-foreground">{title}</h4>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {statusText && (
          <span className="text-xs font-semibold text-primary bg-primary/10 rounded px-2 py-0.5 whitespace-nowrap">
            {statusText}
          </span>
        )}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-medium">
          <span className="text-muted-foreground">Progress</span>
          <span className="text-foreground">{percentage}%</span>
        </div>
        {/* Progress track */}
        <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  )
}
