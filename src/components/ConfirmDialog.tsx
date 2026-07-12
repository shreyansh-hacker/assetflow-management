import type { ReactNode } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/Dialog"
import { Button } from "@/components/ui/Button"
import { AlertTriangle } from "lucide-react"

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: "primary" | "destructive"
  isLoading?: boolean
  icon?: ReactNode
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "primary",
  isLoading = false,
  icon = <AlertTriangle className="w-6 h-6 text-amber-500" />,
}: ConfirmDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="max-w-md select-none text-left">
        <DialogHeader className="flex flex-row items-start gap-4 space-y-0">
          {icon && (
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted/80 shrink-0">
              {icon}
            </div>
          )}
          <div className="space-y-1">
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription className="leading-relaxed pt-1">{description}</DialogDescription>
          </div>
        </DialogHeader>

        <DialogFooter className="mt-4 gap-2">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            variant={variant === "destructive" ? "destructive" : "primary"}
            size="sm"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
