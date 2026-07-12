import { simulateApiDelay } from "@/services/api"
import type { NotificationItem } from "@/types/notifications"
import mockData from "@/mock/notifications.json"

export const getNotifications = async (): Promise<NotificationItem[]> => {
  await simulateApiDelay()
  return mockData as NotificationItem[]
}
