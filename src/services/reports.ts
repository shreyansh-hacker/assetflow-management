import { simulateApiDelay } from "@/services/api"
import type { ExecutiveReportData } from "@/types/reports"
import mockData from "@/mock/reports.json"

export const getExecutiveReports = async (): Promise<ExecutiveReportData> => {
  await simulateApiDelay()
  return mockData as ExecutiveReportData
}
