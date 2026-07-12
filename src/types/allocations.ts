export type TransferStatusType = "pending" | "approved" | "rejected" | "cancelled"
export type TransferPriorityType = "low" | "medium" | "high"

export interface TransferRequest {
  id: string
  assetId: string
  assetName: string
  assetTag: string
  currentHolder: string
  currentDepartment: string
  newHolder: string
  newDepartment: string
  reason: string
  expectedReturnDate: string
  priority: TransferPriorityType
  status: TransferStatusType
  requestDate: string
  notes?: string
}

export interface CustodyHistory {
  id: string | number
  assetId: string
  event: "Assigned" | "Returned" | "Reassigned" | "Department Changed" | "Maintenance Transfer"
  from: string
  to: string
  date: string
  user: string
}
