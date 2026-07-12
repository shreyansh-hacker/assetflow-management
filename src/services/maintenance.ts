import { simulateApiDelay } from "@/services/api"
import type { MaintenanceTicket, MaintenanceStatusType } from "@/types/maintenance"
import {
  getMaintenanceDb,
  updateMaintenanceDb,
  getAssetsDb,
  updateAssetsDb,
  createSystemNotification,
} from "./db"

export const getMaintenanceTickets = async (): Promise<MaintenanceTicket[]> => {
  await simulateApiDelay()
  return getMaintenanceDb()
}

export const createMaintenanceTicket = async (ticket: Omit<MaintenanceTicket, "id" | "progress" | "createdAt" | "updatedAt" | "comments" | "attachments" | "slaStatus">): Promise<MaintenanceTicket> => {
  await simulateApiDelay()
  const newTicket: MaintenanceTicket = {
    ...ticket,
    id: "MNT-" + (Math.round(Math.random() * 1000) + 3000).toString(),
    slaStatus: "within_sla",
    comments: [],
    attachments: [],
    progress: 0,
    createdAt: new Date().toISOString().split("T")[0],
    updatedAt: new Date().toISOString().split("T")[0],
  }

  const current = getMaintenanceDb()
  updateMaintenanceDb([newTicket, ...current])

  // System notification
  createSystemNotification(
    `Maintenance Request: ${ticket.assetName}`,
    `New ticket ${newTicket.id} raised for panel: "${ticket.title}".`,
    "maintenance",
    ticket.priority === "critical" ? "critical" : "medium"
  )

  // Update asset status to maintenance
  const assets = getAssetsDb()
  const asset = assets.find((a) => a.id === ticket.assetId)
  if (asset) {
    asset.status = "maintenance"
    updateAssetsDb([...assets])
  }

  return newTicket
}

export const updateTicketStatus = async (ticketId: string, nextStatus: MaintenanceStatusType, progressVal: number): Promise<void> => {
  await simulateApiDelay()
  const current = getMaintenanceDb()
  const updated = current.map((t) => {
    if (t.id === ticketId) {
      return {
        ...t,
        status: nextStatus,
        progress: progressVal,
        updatedAt: new Date().toISOString().split("T")[0],
      }
    }
    return t
  })
  updateMaintenanceDb(updated)

  const match = current.find((t) => t.id === ticketId)
  if (match) {
    createSystemNotification(
      `Maintenance Ticket ${ticketId} Status Update`,
      `Ticket state for ${match.assetName} transitioned to: ${nextStatus}.`,
      "maintenance",
      "low"
    )
  }
}

export const addTicketComment = async (ticketId: string, commentText: string): Promise<void> => {
  await simulateApiDelay()
  const current = getMaintenanceDb()
  const updated = current.map((t) => {
    if (t.id === ticketId) {
      const newComment = {
        id: "c-" + Date.now().toString(),
        author: "Enterprise Admin",
        date: new Date().toISOString().split("T")[0],
        text: commentText.trim(),
      }
      return {
        ...t,
        comments: [...t.comments, newComment],
      }
    }
    return t
  })
  updateMaintenanceDb(updated)
}
