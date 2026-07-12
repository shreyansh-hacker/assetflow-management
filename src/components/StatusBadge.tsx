import { Badge } from "@/components/ui/Badge"

export type AssetStatus = "available" | "allocated" | "maintenance" | "disposed" | "in_use"
export type BookingStatus = "pending" | "confirmed" | "cancelled"
export type TicketStatus = "backlog" | "in_progress" | "testing" | "completed"
export type PriorityLevel = "low" | "medium" | "high" | "critical"

interface StatusBadgeProps {
  status: string
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const normStatus = status.toLowerCase()

  switch (normStatus) {
    // Asset statuses
    case "available":
      return <Badge variant="success">Available</Badge>
    case "allocated":
    case "in_use":
      return <Badge variant="primary">Allocated</Badge>
    case "maintenance":
      return <Badge variant="warning">Maintenance</Badge>
    case "disposed":
      return <Badge variant="danger">Disposed</Badge>

    // Booking statuses
    case "pending":
      return <Badge variant="warning">Pending</Badge>
    case "confirmed":
      return <Badge variant="success">Confirmed</Badge>
    case "cancelled":
      return <Badge variant="danger">Cancelled</Badge>

    // Ticket statuses
    case "backlog":
      return <Badge variant="outline">Backlog</Badge>
    case "in_progress":
      return <Badge variant="info">In Progress</Badge>
    case "testing":
      return <Badge variant="warning">Testing</Badge>
    case "completed":
      return <Badge variant="success">Completed</Badge>

    // Priorities
    case "low":
      return <Badge variant="secondary">Low</Badge>
    case "medium":
      return <Badge variant="info">Medium</Badge>
    case "high":
      return <Badge variant="warning">High</Badge>
    case "critical":
      return <Badge variant="danger">Critical</Badge>

    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}
