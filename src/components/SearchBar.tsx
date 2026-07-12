import type { ReactNode } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/Input"
import { cn } from "@/utils/cn"

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  actions?: ReactNode
  className?: string
}

export default function SearchBar({ value, onChange, placeholder = "Search...", actions, className }: SearchBarProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row items-center gap-3 w-full", className)}>
      <div className="w-full sm:flex-1">
        <Input
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          leftIcon={<Search className="w-4 h-4 text-muted-foreground/60" />}
          className="bg-card w-full"
        />
      </div>
      {actions && <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">{actions}</div>}
    </div>
  )
}
