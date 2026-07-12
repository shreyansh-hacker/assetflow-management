import { simulateApiDelay } from "@/services/api"
import type { DashboardData } from "@/types/dashboard"
import mockData from "@/mock/dashboard.json"

export const getDashboardData = async (): Promise<DashboardData> => {
  await simulateApiDelay()
  return mockData as DashboardData
}
