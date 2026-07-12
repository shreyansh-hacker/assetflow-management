import type { ReactNode } from "react"
import { FolderOpen } from "lucide-react"

interface EmptyStateProps {
  title: string
  description?: string
  icon?: ReactNode
  action?: ReactNode
}

export default function EmptyState({
  title,
  description,
  icon = <FolderOpen className="w-10 h-10 text-muted-foreground/50" />,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center min-h-[300px] select-none">
      <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-muted/60 text-muted-foreground mb-4">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-foreground tracking-tight">{title}</h3>
      {description && <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-6 leading-relaxed">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
