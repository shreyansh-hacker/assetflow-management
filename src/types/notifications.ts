export type NotificationCategoryType = "all" | "alerts" | "maintenance" | "booking" | "audit" | "transfer"
export type NotificationPriorityType = "low" | "medium" | "high" | "critical"

export interface NotificationItem {
  id: string
  title: string
  message: string
  category: "alerts" | "maintenance" | "booking" | "audit" | "transfer"
  priority: NotificationPriorityType
  isRead: boolean
  createdAt: string
}
