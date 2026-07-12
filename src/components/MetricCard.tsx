import type { ReactNode } from "react"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"
import { cn } from "@/utils/cn"

interface MetricCardProps {
  title: string
  value: string | number
  icon?: ReactNode
  trend?: {
    value: number
    label: string
    isPositive: boolean
  }
  loading?: boolean
  className?: string
}

export default function MetricCard({ title, value, icon, trend, loading, className }: MetricCardProps) {
  if (loading) {
    return (
      <div className={cn("p-6 rounded-xl border border-border bg-card shadow-premium animate-pulse space-y-4", className)}>
        <div className="flex items-center justify-between">
          <div className="h-4 w-24 bg-muted rounded" />
          <div className="h-8 w-8 bg-muted rounded-lg" />
        </div>
        <div className="space-y-2">
          <div className="h-8 w-16 bg-muted rounded" />
          <div className="h-3 w-32 bg-muted rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className={cn("p-6 rounded-xl border border-border bg-card shadow-premium flex flex-col justify-between transition-all duration-300 hover:scale-[1.01] hover:-translate-y-0.5 hover:shadow-md cursor-pointer select-none", className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</span>
        {icon && <div className="text-muted-foreground/80 bg-muted/60 p-2 rounded-lg">{icon}</div>}
      </div>
      <div className="mt-4 space-y-1">
        <h3 className="text-2xl font-bold tracking-tight text-foreground">{value}</h3>
        {trend && (
          <div className="flex items-center gap-1.5 text-xs">
            <span
              className={cn(
                "inline-flex items-center font-medium gap-0.5 rounded px-1 py-0.5",
                trend.isPositive
                  ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
                  : "text-destructive bg-destructive/10"
              )}
            >
              {trend.isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              {trend.value}%
            </span>
            <span className="text-muted-foreground">{trend.label}</span>
          </div>
        )}
      </div>
    </div>
  )
}
