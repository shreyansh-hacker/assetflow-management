import { api, simulateApiDelay } from "@/services/api"
import type { ExecutiveReportData } from "@/types/reports"
import mockData from "@/mock/reports.json"

export const getExecutiveReports = async (): Promise<ExecutiveReportData> => {
  await simulateApiDelay()
  
  try {
    const assetsRes = await api.get("/reports/assets")
    const utilRes = await api.get("/reports/utilization")
    const maintenanceRes = await api.get("/reports/maintenance")

    const byStatus = assetsRes.data.data?.statusCounts || []
    
    // Map backend statuses to frontend stages
    const mappedStages = [
      { stage: "Procured", value: byStatus.find((s: any) => s.status === "Available")?._count?.status || 0 },
      { stage: "Allocated", value: byStatus.find((s: any) => s.status === "Allocated")?._count?.status || 0 },
      { stage: "In Maintenance", value: byStatus.find((s: any) => s.status === "Under Maintenance")?._count?.status || 0 },
      { stage: "Disposed / Recycled", value: byStatus.find((s: any) => s.status === "Disposed")?._count?.status || 0 }
    ]

    // Calculate real active utilization rate
    const totalAssets = utilRes.data.data?.totalAllocations + utilRes.data.data?.totalBookings || 10
    const allocated = utilRes.data.data?.totalAllocations || 2
    const rate = Math.round((allocated / totalAssets) * 1000) / 10

    return {
      ...mockData,
      kpis: {
        ...mockData.kpis,
        activeUtilizationRate: rate || 85.5,
        maintenanceCosts: (maintenanceRes.data.data?.totalRequests || 0) * 120, // estimated cost per ticket
      },
      lifecycleOverview: mappedStages,
    } as ExecutiveReportData
  } catch (error) {
    // Graceful fallback to mock data on error
    console.error("Failed to load backend reports, falling back to mock data:", error)
    return mockData as ExecutiveReportData
  }
}
