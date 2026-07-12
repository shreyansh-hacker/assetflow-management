import type { TimelineEvent } from "@/components/Timeline"

export interface DashboardWelcome {
  userName: string
  role: string
  alertCount: number
  systemStatus: string
}

export interface DashboardKPI {
  key: string
  title: string
  value: string | number
  trend?: {
    value: number
    label: string
    isPositive: boolean
  }
}

export interface AssetHealthData {
  excellent: number
  good: number
  fair: number
  critical: number
}

export interface ResourceUtilizationData {
  name: string
  value: number
}

export interface DepartmentUsageData {
  department: string
  assets: number
  cost: number
}

export interface UpcomingReturn {
  id: string
  assetName: string
  tag: string
  employee: string
  dueDate: string
  status: "pending" | "overdue"
}

export interface PendingMaintenanceTask {
  id: string
  assetName: string
  tag: string
  priority: "low" | "medium" | "high" | "critical"
  issue: string
  technician: string
}

export interface PendingTransferTask {
  id: string
  assetName: string
  tag: string
  fromDepartment: string
  toDepartment: string
  requester: string
  date: string
}

export interface AIInsightItem {
  id: string
  type: "warning" | "optimization" | "cost"
  message: string
}

export interface DashboardData {
  welcome: DashboardWelcome
  kpis: DashboardKPI[]
  assetHealth: AssetHealthData
  utilization: ResourceUtilizationData[]
  departmentUsage: DepartmentUsageData[]
  activity: TimelineEvent[]
  upcomingReturns: UpcomingReturn[]
  pendingMaintenance: PendingMaintenanceTask[]
  pendingTransfers: PendingTransferTask[]
  aiInsights: AIInsightItem[]
}
