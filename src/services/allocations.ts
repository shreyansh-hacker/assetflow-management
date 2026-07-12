import { simulateApiDelay } from "@/services/api"
import type { TransferRequest, CustodyHistory, TransferStatusType } from "@/types/allocations"
import mockData from "@/mock/allocations.json"

export const getTransferRequests = async (): Promise<TransferRequest[]> => {
  await simulateApiDelay()
  return mockData.transferRequests as TransferRequest[]
}

export const getCustodyHistory = async (): Promise<CustodyHistory[]> => {
  await simulateApiDelay()
  return mockData.history as CustodyHistory[]
}

export const createTransferRequest = async (request: Omit<TransferRequest, "id" | "requestDate" | "status">): Promise<TransferRequest> => {
  await simulateApiDelay()
  const newRequest: TransferRequest = {
    ...request,
    id: "TR-" + (Math.round(Math.random() * 1000) + 1000).toString(),
    requestDate: new Date().toISOString().split("T")[0],
    status: "pending" as TransferStatusType,
  }
  return newRequest
}
