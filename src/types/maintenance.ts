export type MaintenanceStatusType = "pending" | "in_progress" | "testing" | "completed"
export type MaintenancePriorityType = "low" | "medium" | "high" | "critical"
export type SLALevelType = "within_sla" | "sla_breached" | "critical_limit"

export interface Technician {
  name: string
  email: string
}

export interface TicketComment {
  id: string
  author: string
  date: string
  text: string
}

export interface MaintenanceTicket {
  id: string
  assetId: string
  assetName: string
  assetTag: string
  title: string
  description: string
  status: MaintenanceStatusType
  priority: MaintenancePriorityType
  technician: Technician
  slaStatus: SLALevelType
  estimatedCost: number
  spareParts: string[]
  comments: TicketComment[]
  attachments: string[]
  progress: number
  createdAt: string
  updatedAt: string
}
