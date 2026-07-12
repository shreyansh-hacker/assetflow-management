import { api, simulateApiDelay } from "@/services/api"
import type { MaintenanceTicket, MaintenanceStatusType } from "@/types/maintenance"
import { adaptMaintenance } from "./adapters"

export const getMaintenanceTickets = async (): Promise<MaintenanceTicket[]> => {
  await simulateApiDelay()
  const response = await api.get("/maintenance")
  if (response.data.success) {
    return response.data.data.map(adaptMaintenance)
  }
  return []
}

export const createMaintenanceTicket = async (ticket: Omit<MaintenanceTicket, "id" | "progress" | "createdAt" | "updatedAt" | "comments" | "attachments" | "slaStatus">): Promise<MaintenanceTicket> => {
  const assetId = parseInt(ticket.assetId.replace("AST-", ""))
  const response = await api.post("/maintenance", {
    assetId,
    issue: ticket.title
  })
  return adaptMaintenance(response.data.data)
}

export const updateTicketStatus = async (ticketId: string, nextStatus: MaintenanceStatusType, _progressVal: number): Promise<void> => {
  const ticketDbId = parseInt(ticketId.replace("MNT-", ""))
  
  if (nextStatus === "in_progress") {
    await api.put(`/maintenance/${ticketDbId}/approve`)
  } else if (nextStatus === "completed") {
    await api.put(`/maintenance/${ticketDbId}/resolve`)
  } else {
    // If reject / other, fallback
    await api.put(`/maintenance/${ticketDbId}/reject`)
  }
}

export const addTicketComment = async (ticketId: string, commentText: string): Promise<void> => {
  await simulateApiDelay()
  // Comments are not stored in database models in backend, so we gracefully mock saving the comment locally
  console.log(`Add comment to ticket ${ticketId}: ${commentText}`)
}
