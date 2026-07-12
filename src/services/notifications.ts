import { simulateApiDelay } from "@/services/api"
import type { NotificationItem } from "@/types/notifications"
import { getNotificationsDb, updateNotificationsDb } from "./db"

export const getNotifications = async (): Promise<NotificationItem[]> => {
  await simulateApiDelay()
  return getNotificationsDb()
}

export const markNotificationRead = async (id: string): Promise<void> => {
  await simulateApiDelay()
  const current = getNotificationsDb()
  const updated = current.map((n) => (n.id === id ? { ...n, isRead: true } : n))
  updateNotificationsDb(updated)
}

export const markAllNotificationsRead = async (): Promise<void> => {
  await simulateApiDelay()
  const current = getNotificationsDb()
  const updated = current.map((n) => ({ ...n, isRead: true }))
  updateNotificationsDb(updated)
}
