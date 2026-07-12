import { simulateApiDelay } from "@/services/api"
import type { TransferRequest, CustodyHistory, TransferStatusType } from "@/types/allocations"
import {
  getAllocationsDb,
  updateAllocationsDb,
  getAssetsDb,
  updateAssetsDb,
  createSystemNotification,
} from "./db"
import type { AssetHistoryEvent } from "@/types/assets"

export const getTransferRequests = async (): Promise<TransferRequest[]> => {
  await simulateApiDelay()
  return getAllocationsDb()
}

export const getCustodyHistory = async (): Promise<CustodyHistory[]> => {
  await simulateApiDelay()
  const assets = getAssetsDb()
  const history: CustodyHistory[] = []
  assets.forEach((asset) => {
    asset.history.forEach((h) => {
      if (h.type === "allocation") {
        history.push({
          id: h.id.toString(),
          assetId: asset.id,
          event: "Reassigned" as const,
          from: "Previous Holder",
          to: h.user,
          date: h.date,
          user: h.user,
        })
      }
    })
  })
  return history
}

export const createTransferRequest = async (request: Omit<TransferRequest, "id" | "requestDate" | "status">): Promise<TransferRequest> => {
  await simulateApiDelay()
  const currentAlloc = getAllocationsDb()
  const newRequestDb: TransferRequest = {
    ...request,
    id: "TR-" + (Math.round(Math.random() * 1000) + 1000).toString(),
    status: "pending" as TransferStatusType,
    requestDate: new Date().toISOString().split("T")[0],
  }

  updateAllocationsDb([newRequestDb, ...currentAlloc])

  createSystemNotification(
    `Transfer Request Raised for ${request.assetName}`,
    `${request.currentHolder} requested transfer to ${request.newHolder} in ${request.newDepartment}.`,
    "transfer",
    "medium"
  )

  return newRequestDb
}

export const approveTransfer = async (requestId: string): Promise<void> => {
  await simulateApiDelay()
  const currentAlloc = getAllocationsDb()
  const match = currentAlloc.find((a) => a.id === requestId)
  if (!match) return

  match.status = "approved"
  updateAllocationsDb([...currentAlloc])

  const assets = getAssetsDb()
  const asset = assets.find((a) => a.id === match.assetId)
  if (asset) {
    const prevHolder = asset.assignedTo ? asset.assignedTo.name : "Unassigned"
    asset.assignedTo = {
      name: match.newHolder,
      email: `${match.newHolder.toLowerCase().replace(/\s+/g, ".")}@assetflow.com`,
    }
    asset.department = match.newDepartment
    asset.status = "allocated"

    const hist: AssetHistoryEvent = {
      id: "hist-" + Date.now().toString(),
      type: "allocation",
      title: "Custody Transferred",
      date: new Date().toISOString().split("T")[0],
      user: match.newHolder,
      notes: `Transferred from ${prevHolder} to ${match.newHolder} (Dept: ${match.newDepartment}). Reason: ${match.reason}`,
    }
    asset.history = [hist, ...asset.history]
    updateAssetsDb([...assets])
  }

  createSystemNotification(
    `Transfer Request Approved: ${match.assetName}`,
    `Asset transferred successfully to ${match.newHolder} (${match.newDepartment}).`,
    "transfer",
    "low"
  )
}

export const rejectTransfer = async (requestId: string): Promise<void> => {
  await simulateApiDelay()
  const currentAlloc = getAllocationsDb()
  const match = currentAlloc.find((a) => a.id === requestId)
  if (!match) return

  match.status = "rejected"
  updateAllocationsDb([...currentAlloc])

  createSystemNotification(
    `Transfer Request Rejected: ${match.assetName}`,
    `Transfer custody request for ${match.newHolder} was rejected.`,
    "transfer",
    "low"
  )
}
