import initialAssets from "@/mock/assets.json"
import initialDashboard from "@/mock/dashboard.json"
import initialOrganization from "@/mock/organization.json"
import initialAllocations from "@/mock/allocations.json"
import initialBookings from "@/mock/bookings.json"
import initialMaintenance from "@/mock/maintenance.json"
import initialAudits from "@/mock/audits.json"
import initialReports from "@/mock/reports.json"
import initialNotifications from "@/mock/notifications.json"

import type { Asset, AssetHistoryEvent } from "@/types/assets"
import type { Department, Employee, AssetCategory } from "@/types/organization"
import type { ResourceBooking } from "@/types/bookings"
import type { TransferRequest, CustodyHistory } from "@/types/allocations"
import type { MaintenanceTicket } from "@/types/maintenance"
import type { AuditRun } from "@/types/audits"
import type { ExecutiveReportData } from "@/types/reports"
import type { NotificationItem } from "@/types/notifications"

const LOCAL_STORAGE_KEY = "assetflow_mock_db"

export interface DatabaseState {
  assets: Asset[]
  dashboard: typeof initialDashboard
  departments: Department[]
  employees: Employee[]
  categories: AssetCategory[]
  allocations: TransferRequest[]
  custodyHistory: CustodyHistory[]
  bookings: ResourceBooking[]
  maintenance: MaintenanceTicket[]
  audits: {
    activeAudit: AuditRun
    pastAudits: typeof initialAudits.pastAudits
  }
  reports: ExecutiveReportData
  notifications: NotificationItem[]
}

// Check localStorage or initialize
const getInitialState = (): DatabaseState => {
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY)
  if (stored) {
    try {
      return JSON.parse(stored) as DatabaseState
    } catch {
      // fallback
    }
  }

  const state: DatabaseState = {
    assets: initialAssets as Asset[],
    dashboard: initialDashboard,
    departments: initialOrganization.departments,
    employees: initialOrganization.employees,
    categories: initialOrganization.categories,
    allocations: initialAllocations.transferRequests as TransferRequest[],
    custodyHistory: initialAllocations.history as CustodyHistory[],
    bookings: initialBookings as ResourceBooking[],
    maintenance: initialMaintenance as MaintenanceTicket[],
    audits: initialAudits as any,
    reports: initialReports as ExecutiveReportData,
    notifications: initialNotifications as NotificationItem[],
  }

  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state))
  return state
}

const state = getInitialState()

export const saveState = () => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state))
}

// Sync helper after major state alterations
export const syncDatabaseStatistics = () => {
  // Update Dashboard stats counters
  const totalCount = state.assets.length
  const allocatedCount = state.assets.filter((a) => a.status === "allocated").length
  const maintenanceCount = state.assets.filter((a) => a.status === "maintenance").length

  const totalKPI = state.dashboard.kpis.find((k) => k.key === "total_assets")
  if (totalKPI) totalKPI.value = totalCount.toLocaleString()

  const allocatedKPI = state.dashboard.kpis.find((k) => k.key === "allocated_assets")
  if (allocatedKPI) allocatedKPI.value = allocatedCount.toLocaleString()

  const maintenanceKPI = state.dashboard.kpis.find((k) => k.key === "maintenance_assets")
  if (maintenanceKPI) maintenanceKPI.value = maintenanceCount.toLocaleString()

  // Synchronize dashboard transfers list
  state.dashboard.pendingTransfers = state.allocations
    .filter((a) => a.status === "pending")
    .map((req) => ({
      id: req.id,
      assetName: req.assetName,
      tag: req.assetTag,
      fromDepartment: req.currentDepartment,
      toDepartment: req.newDepartment,
      requester: req.currentHolder,
      date: req.requestDate,
    }))

  // Synchronize dashboard upcoming returns
  state.dashboard.upcomingReturns = state.allocations
    .filter((a) => a.status === "approved" && a.expectedReturnDate)
    .map((req) => ({
      id: req.id,
      assetName: req.assetName,
      tag: req.assetTag,
      employee: req.newHolder,
      dueDate: req.expectedReturnDate || "",
      status: "pending" as const,
    }))

  // Synchronize dashboard pending maintenance
  state.dashboard.pendingMaintenance = state.maintenance
    .filter((t) => t.status !== "completed")
    .map((t) => ({
      id: t.id,
      assetName: t.assetName,
      tag: t.assetTag,
      priority: t.priority,
      issue: t.title,
      technician: t.technician.name,
    }))

  // Synchronize Reports KPIs
  const totalValue = state.assets.reduce((sum, a) => sum + a.purchasePrice, 0)
  const depreciatedVal = state.assets.reduce((sum, a) => sum + a.depreciationValue, 0)
  const totalMaintCost = state.maintenance.reduce((sum, t) => sum + t.estimatedCost, 0)
  const utilizationPercent = Math.round((allocatedCount / (totalCount || 1)) * 100)

  state.reports.kpis.totalValue = totalValue
  state.reports.kpis.depreciatedValue = depreciatedVal
  state.reports.kpis.maintenanceCosts = totalMaintCost
  state.reports.kpis.activeUtilizationRate = utilizationPercent

  // Department-wise quota in Reports
  state.reports.utilizationByDepartment = state.departments.map((dept) => {
    const totalDeptAssets = state.assets.filter((a) => a.department === dept.name).length
    const allocatedDeptAssets = state.assets.filter((a) => a.department === dept.name && a.status === "allocated").length
    return {
      department: dept.name,
      allocated: allocatedDeptAssets,
      total: totalDeptAssets + 2, // simulated capacity limit
      percentage: Math.round((allocatedDeptAssets / ((totalDeptAssets + 2) || 1)) * 100),
    }
  })

  // Category Depreciation in Reports
  state.reports.depreciationSummary = state.categories.map((cat) => {
    const catAssets = state.assets.filter((a) => a.category === cat.name)
    const cost = catAssets.reduce((sum, a) => sum + a.purchasePrice, 0)
    const val = catAssets.reduce((sum, a) => sum + a.depreciationValue, 0)
    return {
      category: cat.name,
      originalCost: cost,
      depreciatedValue: val,
    }
  })

  saveState()
}

// Helper to push system notifications
export const createSystemNotification = (
  title: string,
  message: string,
  category: "alerts" | "maintenance" | "booking" | "audit" | "transfer",
  priority: "low" | "medium" | "high" | "critical"
) => {
  const notif: NotificationItem = {
    id: "NOT-" + (Date.now() + Math.round(Math.random() * 100)).toString().substring(8),
    title,
    message,
    category,
    priority,
    isRead: false,
    createdAt: new Date().toISOString().replace("T", " ").substring(0, 16),
  }
  state.notifications = [notif, ...state.notifications]

  // Add notification to dashboard activity list if high priority
  if (priority === "critical" || priority === "high") {
    state.dashboard.activity = [
      {
        id: "act-" + Date.now().toString(),
        title,
        subtitle: message,
        description: "",
        date: "Just Now",
        status: priority === "critical" ? "danger" : "warning",
      },
      ...state.dashboard.activity,
    ]
  }

  saveState()
}

export const getAssetsDb = () => state.assets
export const updateAssetsDb = (newAssets: Asset[]) => {
  state.assets = newAssets
  syncDatabaseStatistics()
}

export const getDashboardStatsDb = () => state.dashboard
export const updateDashboardDb = (newDash: typeof initialDashboard) => {
  state.dashboard = newDash
  saveState()
}

export const getDepartmentsDb = () => state.departments
export const updateDepartmentsDb = (newDepts: Department[]) => {
  state.departments = newDepts
  syncDatabaseStatistics()
}

export const getEmployeesDb = () => state.employees
export const updateEmployeesDb = (newEmps: Employee[]) => {
  state.employees = newEmps
  saveState()
}

export const getCategoriesDb = () => state.categories
export const updateCategoriesDb = (newCats: AssetCategory[]) => {
  state.categories = newCats
  syncDatabaseStatistics()
}

export const getAllocationsDb = () => state.allocations
export const updateAllocationsDb = (newAllocations: TransferRequest[]) => {
  state.allocations = newAllocations
  syncDatabaseStatistics()
}

export const getBookingsDb = () => state.bookings
export const updateBookingsDb = (newBookings: ResourceBooking[]) => {
  state.bookings = newBookings
  saveState()
}

export const getMaintenanceDb = () => state.maintenance
export const updateMaintenanceDb = (newMaint: MaintenanceTicket[]) => {
  state.maintenance = newMaint
  // Sync asset health based on maintenance changes
  newMaint.forEach((t) => {
    if (t.status === "completed") {
      const asset = state.assets.find((a) => a.id === t.assetId)
      if (asset && asset.status === "maintenance") {
        asset.status = "available"
        // add system history log to asset details
        const hist: AssetHistoryEvent = {
          id: "hist-" + Date.now().toString(),
          type: "system",
          title: "Maintenance Completed",
          date: new Date().toISOString().split("T")[0],
          user: t.technician.name,
          notes: `Calibration completed: ${t.title}. Estimated repairs: $${t.estimatedCost}.`,
        }
        asset.history = [hist, ...asset.history]
      }
    }
  })
  syncDatabaseStatistics()
}

export const getAuditsDb = () => state.audits
export const updateAuditsDb = (newAudits: typeof state.audits) => {
  state.audits = newAudits
  // Update Reports audit percentage
  state.reports.kpis.auditCompletionPercent = newAudits.activeAudit.progress
  syncDatabaseStatistics()
}

export const getReportsDb = () => state.reports
export const getNotificationsDb = () => state.notifications
export const updateNotificationsDb = (newNotifs: NotificationItem[]) => {
  state.notifications = newNotifs
  saveState()
}
