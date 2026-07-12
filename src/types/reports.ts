export interface ExecutiveKPIs {
  totalValue: number
  depreciatedValue: number
  activeUtilizationRate: number
  maintenanceCosts: number
  auditCompletionPercent: number
}

export interface DepartmentUtilization {
  department: string
  allocated: number
  total: number
  percentage: number
}

export interface CostTrends {
  month: string
  preventative: number
  corrective: number
  total: number
}

export interface DepreciationStat {
  category: string
  originalCost: number
  depreciatedValue: number
}

export interface BookingSlotCount {
  day: string
  slotsBooked: number
}

export interface LifecycleOverview {
  stage: string
  value: number
}

export interface RecentReportItem {
  id: string
  title: string
  date: string
  type: "financial" | "maintenance" | "compliance"
}

export interface ExecutiveReportData {
  kpis: ExecutiveKPIs
  utilizationByDepartment: DepartmentUtilization[]
  maintenanceCostTrends: CostTrends[]
  depreciationSummary: DepreciationStat[]
  bookingHeatmap: BookingSlotCount[]
  lifecycleOverview: LifecycleOverview[]
  recentReports: RecentReportItem[]
}
