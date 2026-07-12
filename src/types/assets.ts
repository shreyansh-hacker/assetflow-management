export type AssetStatusType = "available" | "allocated" | "maintenance" | "disposed"
export type AssetWarrantyType = "active" | "expired" | "expiring_soon"

export interface AssignedEmployee {
  name: string
  email: string
}

export interface AssetHistoryEvent {
  id: string | number
  type: "allocation" | "maintenance" | "system"
  title: string
  date: string
  user: string
  notes?: string
}

export interface Asset {
  id: string
  name: string
  tag: string
  category: string
  status: AssetStatusType
  department: string
  assignedTo: AssignedEmployee | null
  purchaseDate: string
  purchasePrice: number
  depreciationValue: number
  depreciationRate: string
  warrantyStatus: AssetWarrantyType
  warrantyExpiry: string
  location: string
  vendor: string
  invoiceNumber: string
  attachments: string[]
  history: AssetHistoryEvent[]
}
