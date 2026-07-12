import { api, simulateApiDelay } from "@/services/api"
import type { TransferRequest, CustodyHistory } from "@/types/allocations"
import { adaptTransferRequest } from "./adapters"

export const getTransferRequests = async (): Promise<TransferRequest[]> => {
  await simulateApiDelay()
  const response = await api.get("/transfer")
  if (response.data.success) {
    return response.data.data.map(adaptTransferRequest)
  }
  return []
}

export const getCustodyHistory = async (): Promise<CustodyHistory[]> => {
  await simulateApiDelay()
  // Generate custody history list by aggregating transfers and allocations
  const response = await api.get("/transfer")
  const history: CustodyHistory[] = []
  if (response.data.success) {
    response.data.data.forEach((t: any) => {
      if (t.status === "Approved") {
        history.push({
          id: `cust-${t.id}`,
          assetId: `AST-${String(t.assetId).padStart(4, "0")}`,
          event: "Reassigned",
          from: t.fromUser?.name || "Previous Holder",
          to: t.toUser?.name || "New Holder",
          date: (t.resolvedAt || t.requestedAt || new Date().toISOString()).split("T")[0],
          user: t.toUser?.name || "System"
        })
      }
    })
  }
  return history
}

export const createTransferRequest = async (request: Omit<TransferRequest, "id" | "requestDate" | "status">): Promise<TransferRequest> => {
  const assetId = parseInt(request.assetId.replace("AST-", ""))
  
  // Find employee id by looking up employee name or select default
  // Since we don't have user dropdown search easily in client, let's select user 1 or parse it from database
  // Actually, we can fetch all employees first to map newHolder name to user ID!
  const empResponse = await api.get("/employees")
  let toUserId = 1
  if (empResponse.data.success) {
    const match = empResponse.data.data.find(
      (e: any) => e.name.toLowerCase() === request.newHolder.toLowerCase()
    )
    if (match) toUserId = match.id
  }

  const response = await api.post("/transfer", {
    assetId,
    toUserId,
    reason: request.reason
  })

  return adaptTransferRequest(response.data.data)
}

export const approveTransfer = async (requestId: string): Promise<void> => {
  const transferId = parseInt(requestId.replace("TR-", ""))
  await api.put(`/transfer/${transferId}/approve`)
}

export const rejectTransfer = async (requestId: string): Promise<void> => {
  const transferId = parseInt(requestId.replace("TR-", ""))
  await api.put(`/transfer/${transferId}/reject`)
}
