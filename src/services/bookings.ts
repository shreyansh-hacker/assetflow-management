import { api, simulateApiDelay } from "@/services/api"
import type { ResourceBooking } from "@/types/bookings"
import { adaptBooking } from "./adapters"

export const getBookings = async (): Promise<ResourceBooking[]> => {
  await simulateApiDelay()
  const response = await api.get("/bookings")
  if (response.data.success) {
    return response.data.data.map(adaptBooking)
  }
  return []
}

export const createBooking = async (booking: Omit<ResourceBooking, "id" | "status">): Promise<ResourceBooking> => {
  // Find assetId by name or use default 1
  const assetsResponse = await api.get("/assets")
  let assetId = 1
  if (assetsResponse.data.success) {
    const match = assetsResponse.data.data.find(
      (a: any) => a.name.toLowerCase() === booking.resourceName.toLowerCase()
    )
    if (match) assetId = match.id
  }

  // Create combined ISO date strings
  const startDateStr = new Date(`${booking.date}T${booking.startTime}:00`).toISOString()
  const endDateStr = new Date(`${booking.date}T${booking.endTime}:00`).toISOString()

  const response = await api.post("/bookings", {
    assetId,
    startDate: startDateStr,
    endDate: endDateStr,
    purpose: booking.purpose
  })

  return adaptBooking(response.data.data)
}

export const deleteBooking = async (bookingId: string): Promise<void> => {
  const bookingDbId = parseInt(bookingId.replace("BK-", ""))
  await api.delete(`/bookings/${bookingDbId}`)
}
