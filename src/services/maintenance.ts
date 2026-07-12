import { simulateApiDelay } from "@/services/api"
import type { MaintenanceTicket } from "@/types/maintenance"
import mockData from "@/mock/maintenance.json"

export const getMaintenanceTickets = async (): Promise<MaintenanceTicket[]> => {
  await simulateApiDelay()
  return mockData as MaintenanceTicket[]
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
  return newTicket
}
