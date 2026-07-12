import { api, simulateApiDelay } from "@/services/api"
import type { DashboardData } from "@/types/dashboard"
import mockData from "@/mock/dashboard.json"

export const getDashboardData = async (): Promise<DashboardData> => {
  await simulateApiDelay()

  try {
    const response = await api.get("/dashboard")
    if (response.data.success) {
      const stats = response.data.data
      
      // Load current user profile for welcome banner
      const storedUser = localStorage.getItem("assetflow_user")
      const userName = storedUser ? JSON.parse(storedUser).name : "System Administrator"
      const role = storedUser ? JSON.parse(storedUser).role : "Enterprise Administrator"

      // Recalculate total assets
      const totalAssetsCount = (stats.availableAssets || 0) + (stats.allocatedAssets || 0) + (stats.maintenanceToday || 0)

      // Map backend stats into frontend KPI structure
      const updatedKpis = mockData.kpis.map((kpi) => {
        if (kpi.key === "total_assets") {
          return { ...kpi, value: String(totalAssetsCount) }
        }
        if (kpi.key === "allocated_assets") {
          return { ...kpi, value: String(stats.allocatedAssets || 0) }
        }
        if (kpi.key === "maintenance_assets") {
          return { ...kpi, value: String(stats.maintenanceToday || 0) }
        }
        if (kpi.key === "pending_audits") {
          return { ...kpi, value: String(stats.pendingTransfers || 0) }
        }
        return kpi
      })

      return {
        ...mockData,
        welcome: {
          ...mockData.welcome,
          userName,
          role,
        },
        kpis: updatedKpis,
      } as DashboardData
    }
  } catch (error) {
    console.error("Failed to fetch backend dashboard KPIs, using mock fallback:", error)
  }

  return mockData as DashboardData
}
