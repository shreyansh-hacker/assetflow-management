import { simulateApiDelay } from "@/services/api"
import type { ResourceBooking } from "@/types/bookings"
import mockBookings from "@/mock/bookings.json"

export const getBookings = async (): Promise<ResourceBooking[]> => {
  await simulateApiDelay()
  return mockBookings as ResourceBooking[]
}

export const createBooking = async (booking: Omit<ResourceBooking, "id" | "status">): Promise<ResourceBooking> => {
  await simulateApiDelay()
  const newBooking: ResourceBooking = {
    ...booking,
    id: "BK-" + (Math.round(Math.random() * 1000) + 2000).toString(),
    status: "confirmed",
  }
  return newBooking
}
