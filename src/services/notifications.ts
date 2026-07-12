import { api, simulateApiDelay } from "@/services/api"
import type { NotificationItem } from "@/types/notifications"
import { adaptNotification } from "./adapters"

export const getNotifications = async (): Promise<NotificationItem[]> => {
  await simulateApiDelay()
  const response = await api.get("/notifications")
  if (response.data.success) {
    return response.data.data.map(adaptNotification)
  }
  return []
}

export const markNotificationRead = async (id: string): Promise<void> => {
  const notificationId = parseInt(id.replace("NOT-", ""))
  await api.put(`/notifications/${notificationId}/read`)
}

export const markAllNotificationsRead = async (): Promise<void> => {
  await api.put("/notifications/read-all")
}
