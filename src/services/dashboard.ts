import { simulateApiDelay } from "@/services/api"
import type { DashboardData } from "@/types/dashboard"
import { getDashboardStatsDb } from "./db"

export const getDashboardData = async (): Promise<DashboardData> => {
  await simulateApiDelay()
  return getDashboardStatsDb() as DashboardData
}
