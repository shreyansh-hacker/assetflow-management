import * as React from "react"
import * as ToastPrimitive from "@radix-ui/react-toast"
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react"
import { cn } from "@/utils/cn"
import { ToastContext } from "./ToastContext"
import type { ToastMessage } from "./ToastContext"

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastMessage[]>([])

  const toast = React.useCallback(({ title, description, type = "info", duration = 3000 }: Omit<ToastMessage, "id">) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { id, title, description, type, duration }])
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      <ToastPrimitive.Provider swipeDirection="right">
        {children}

        {toasts.map(({ id, title, description, type, duration }) => (
          <ToastPrimitive.Root
            key={id}
            duration={duration}
            onOpenChange={(open) => {
              if (!open) setTimeout(() => removeToast(id), 150)
            }}
            className={cn(
              "z-50 pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border bg-card p-4 shadow-lg transition-all duration-300 data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] select-none border-border",
              type === "success" && "border-emerald-500/20 bg-emerald-500/5",
              type === "error" && "border-destructive/20 bg-destructive/5",
              type === "warning" && "border-amber-500/20 bg-amber-500/5",
              type === "info" && "border-sky-500/20 bg-sky-500/5"
            )}
          >
            {/* Status Icons */}
            <div className="shrink-0 pt-0.5">
              {type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
              {type === "error" && <AlertCircle className="w-5 h-5 text-destructive" />}
              {type === "warning" && <AlertTriangle className="w-5 h-5 text-amber-500" />}
              {type === "info" && <Info className="w-5 h-5 text-sky-500" />}
            </div>

            {/* Message Body */}
            <div className="grid gap-1 flex-1">
              {title && <ToastPrimitive.Title className="text-sm font-semibold text-foreground">{title}</ToastPrimitive.Title>}
              {description && (
                <ToastPrimitive.Description className="text-xs text-muted-foreground leading-relaxed">
                  {description}
                </ToastPrimitive.Description>
              )}
            </div>

            {/* Close Button */}
            <ToastPrimitive.Close className="shrink-0 rounded-md p-0.5 text-muted-foreground/60 transition-opacity hover:text-foreground cursor-pointer">
              <X className="w-4 h-4" />
            </ToastPrimitive.Close>
          </ToastPrimitive.Root>
        ))}

        <ToastPrimitive.Viewport className="fixed bottom-0 right-0 z-50 flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px] gap-3" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  )
}
