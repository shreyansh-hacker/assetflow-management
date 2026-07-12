export type BookingStatusType = "pending" | "confirmed" | "cancelled"
export type ResourceType = "Meeting Rooms" | "Projectors" | "Laptops" | "Cameras" | "Testing Devices"

export interface ResourceBooking {
  id: string
  resourceName: string
  resourceType: ResourceType
  bookedBy: string
  date: string
  startTime: string
  endTime: string
  purpose: string
  department: string
  status: BookingStatusType
  notes?: string
}
