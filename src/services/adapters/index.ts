import type { Asset } from "@/types/assets"
import type { Department, Employee, AssetCategory } from "@/types/organization"
import type { TransferRequest } from "@/types/allocations"
import type { ResourceBooking } from "@/types/bookings"
import type { MaintenanceTicket } from "@/types/maintenance"
import type { NotificationItem } from "@/types/notifications"

// 1. Asset Adapter
export const adaptAsset = (b: any): Asset => {
  return {
    id: `AST-${String(b.id).padStart(4, "0")}`,
    name: b.name,
    tag: b.assetCode,
    category: b.category?.name || "Laptops",
    status: (b.status || "Available").toLowerCase() as any,
    department: b.department?.name || "IT",
    assignedTo: b.allocations?.find((a: any) => a.status === "Active")?.user 
      ? {
          name: b.allocations.find((a: any) => a.status === "Active").user.name,
          email: b.allocations.find((a: any) => a.status === "Active").user.email,
        }
      : null,
    purchaseDate: b.purchaseDate || new Date().toISOString().split("T")[0],
    purchasePrice: b.purchasePrice || 1499,
    depreciationValue: b.depreciationValue || 300,
    depreciationRate: b.depreciationRate || "20%/year",
    warrantyStatus: (b.warrantyStatus || "active") as any,
    warrantyExpiry: b.warrantyExpiry || "2028-12-31",
    location: b.location || "Main Office",
    vendor: b.vendor || "Apple Inc.",
    invoiceNumber: b.invoiceNumber || "INV-998822",
    attachments: b.attachments || [],
    history: b.history || [
      {
        id: `h-${b.id}-1`,
        type: "system",
        title: "Asset Initialized",
        date: new Date().toISOString().split("T")[0],
        user: "System",
        notes: "Asset registered in central repository.",
      }
    ],
  }
}

// 2. Department Adapter
export const adaptDepartment = (b: any): Department => {
  return {
    id: b.id,
    name: b.name,
    code: b.name.substring(0, 3).toUpperCase(),
    manager: b.manager || "Sarah Jenkins",
    employeesCount: b._count?.users || 0,
    costCenter: b.costCenter || `CC-${100 + b.id}`,
  }
}

// 3. Employee Adapter
export const adaptEmployee = (b: any): Employee => {
  return {
    id: b.id,
    name: b.name,
    email: b.email,
    department: b.department?.name || "IT",
    role: b.role?.name || "Employee",
    activeAssets: b._count?.allocations || 0,
    joinedDate: b.joinedDate || "2024-01-15",
  }
}

// 4. Category Adapter
export const adaptCategory = (b: any): AssetCategory => {
  return {
    id: b.id,
    name: b.name,
    code: b.name.substring(0, 4).toUpperCase(),
    description: `Asset class for ${b.name}`,
    totalAssets: b._count?.assets || 0,
    depreciationRate: "15%/year",
  }
}

// 5. Transfer Request Adapter
export const adaptTransferRequest = (b: any): TransferRequest => {
  return {
    id: `TR-${String(b.id).padStart(4, "0")}`,
    assetId: `AST-${String(b.assetId).padStart(4, "0")}`,
    assetName: b.asset?.name || "MacBook Pro",
    assetTag: b.asset?.assetCode || "AF-LP-0001",
    currentHolder: b.fromUser?.name || "Unassigned",
    currentDepartment: b.fromUser?.department?.name || "IT",
    newHolder: b.toUser?.name || "Unassigned",
    newDepartment: b.toUser?.department?.name || "IT",
    reason: b.reason || "Project Requirements",
    expectedReturnDate: new Date(Date.now() + 90 * 24 * 3600000).toISOString().split("T")[0],
    priority: "medium",
    status: (b.status || "Pending").toLowerCase() as any,
    requestDate: (b.requestedAt || new Date().toISOString()).split("T")[0],
  }
}

// 6. Resource Booking Adapter
export const adaptBooking = (b: any): ResourceBooking => {
  const startDate = new Date(b.startDate)
  const endDate = new Date(b.endDate)
  return {
    id: `BK-${String(b.id).padStart(4, "0")}`,
    resourceName: b.asset?.name || `Asset #${b.assetId}`,
    resourceType: "Laptops",
    bookedBy: b.user?.name || "Employee",
    date: startDate.toISOString().split("T")[0],
    startTime: startDate.toTimeString().substring(0, 5),
    endTime: endDate.toTimeString().substring(0, 5),
    purpose: b.purpose || "Development work",
    department: b.user?.department?.name || "IT",
    status: (b.status === "Active" ? "confirmed" : b.status === "Cancelled" ? "cancelled" : "pending") as any,
    notes: b.notes || "",
  }
}

// 7. Maintenance Ticket Adapter
export const adaptMaintenance = (b: any): MaintenanceTicket => {
  return {
    id: `MNT-${String(b.id).padStart(4, "0")}`,
    assetId: `AST-${String(b.assetId).padStart(4, "0")}`,
    assetName: b.asset?.name || "Enterprise Server",
    assetTag: b.asset?.assetCode || "AF-SRV-002",
    title: b.issue || "Calibration issue",
    description: b.description || b.issue,
    status: (b.status === "Pending" ? "pending" : b.status === "Approved" ? "in_progress" : b.status === "Resolved" ? "completed" : "testing") as any,
    priority: "medium",
    technician: {
      name: "Marcus Chen",
      email: "marcus@assetflow.com",
    },
    slaStatus: "within_sla",
    estimatedCost: 150,
    spareParts: ["Thermal Paste", "Cooling Fan"],
    comments: [],
    attachments: [],
    progress: b.status === "Resolved" ? 100 : b.status === "Approved" ? 50 : 0,
    createdAt: (b.requestedAt || new Date().toISOString()).replace("T", " ").substring(0, 16),
    updatedAt: (b.resolvedAt || new Date().toISOString()).replace("T", " ").substring(0, 16),
  }
}

// 8. Notification Adapter
export const adaptNotification = (b: any): NotificationItem => {
  return {
    id: `NOT-${String(b.id).padStart(4, "0")}`,
    title: b.message.split(":")[0] || "System Alert",
    message: b.message,
    category: "alerts",
    priority: "medium",
    isRead: b.isRead,
    createdAt: (b.createdAt || new Date().toISOString()).replace("T", " ").substring(0, 16),
  }
}
