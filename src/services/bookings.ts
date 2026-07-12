import { simulateApiDelay } from "@/services/api"
import type { ResourceBooking } from "@/types/bookings"
import { getBookingsDb, updateBookingsDb, createSystemNotification } from "./db"

export const getBookings = async (): Promise<ResourceBooking[]> => {
  await simulateApiDelay()
  return getBookingsDb()
}

export const createBooking = async (booking: Omit<ResourceBooking, "id" | "status">): Promise<ResourceBooking> => {
  await simulateApiDelay()
  const newBooking: ResourceBooking = {
    ...booking,
    id: "BK-" + (Math.round(Math.random() * 1000) + 2000).toString(),
    status: "confirmed",
  }

  const current = getBookingsDb()
  updateBookingsDb([...current, newBooking])

  // System notification
  createSystemNotification(
    `Resource Reserved: ${booking.resourceName}`,
    `Reserved for ${booking.bookedBy} on ${booking.date} (${booking.startTime} - ${booking.endTime}).`,
    "booking",
    "low"
  )

  return newBooking
}

export const deleteBooking = async (bookingId: string): Promise<void> => {
  await simulateApiDelay()
  const current = getBookingsDb()
  const match = current.find((b) => b.id === bookingId)
  const filtered = current.filter((b) => b.id !== bookingId)
  updateBookingsDb(filtered)

  if (match) {
    createSystemNotification(
      `Resource Booking Cancelled: ${match.resourceName}`,
      `Booking ${bookingId} on ${match.date} was cancelled.`,
      "booking",
      "low"
    )
  }
}
