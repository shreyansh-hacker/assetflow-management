import * as React from "react"

export type ToastType = "success" | "error" | "info" | "warning"

export interface ToastMessage {
  id: string
  title: string
  description?: string
  type?: ToastType
  duration?: number
}

export type ToastContextType = {
  toast: (message: Omit<ToastMessage, "id">) => void
}

export const ToastContext = React.createContext<ToastContextType | undefined>(undefined)
