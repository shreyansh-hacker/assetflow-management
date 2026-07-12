import { simulateApiDelay } from "@/services/api"
import type { AuditRun } from "@/types/audits"
import mockData from "@/mock/audits.json"

export const getActiveAudit = async (): Promise<AuditRun> => {
  await simulateApiDelay()
  return mockData.activeAudit as AuditRun
}
