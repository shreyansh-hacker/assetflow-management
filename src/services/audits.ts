import { api, simulateApiDelay } from "@/services/api"
import type { AuditRun } from "@/types/audits"
import { getAssets } from "./assets"

export const getActiveAudit = async (): Promise<AuditRun> => {
  await simulateApiDelay()
  const response = await api.get("/audits")
  let activeCycle = response.data.data?.find((c: any) => c.status === "Open")

  if (!activeCycle) {
    // Graceful creation if none exists
    const createResponse = await api.post("/audits", {
      name: "Annual Inventory Audit",
      startDate: new Date().toISOString()
    })
    activeCycle = createResponse.data.data
    // Refetch list to include items count
    const listRes = await api.get("/audits")
    activeCycle = listRes.data.data?.find((c: any) => c.id === activeCycle.id)
  }

  // Load all assets to count totals and handle verification
  const assets = await getAssets()
  const items = activeCycle.items || []
  const verifiedItems = items.filter((i: any) => i.status === "Verified")
  const missingItems = items.filter((i: any) => i.status === "Missing" || i.status === "Lost")

  // Map to frontend AuditRun interface
  return {
    id: String(activeCycle.id),
    title: activeCycle.name,
    status: activeCycle.status === "Open" ? "in_progress" : "completed",
    auditor: "Enterprise Auditor",
    auditDate: activeCycle.startDate.split("T")[0],
    totalAssets: assets.length,
    verifiedAssets: verifiedItems.length,
    progress: assets.length > 0 ? Math.round((verifiedItems.length / assets.length) * 100) : 0,
    missingAssets: missingItems.map((i: any) => {
      const asset = assets.find((a) => a.id === `AST-${String(i.assetId).padStart(4, "0")}`)
      return {
        id: `AST-${String(i.assetId).padStart(4, "0")}`,
        name: asset?.name || `Asset #${i.assetId}`,
        tag: asset?.tag || `TAG-${i.assetId}`,
        expectedLocation: asset?.location || "HQ - Block A",
        reportedMissingBy: "System Auditor",
        dateLogged: (i.verifiedAt || new Date().toISOString()).split("T")[0]
      }
    }),
    locationMismatches: [], // Derived/Simulated discrepancies
    checklist: [
      { id: "chk-1", item: "Verify Server Room inventory racks", checked: true },
      { id: "chk-2", item: "Scan all marketing department display monitors", checked: false },
      { id: "chk-3", item: "Perform check on developer laptop pool", checked: false },
    ]
  }
}

export const toggleChecklistItem = async (itemId: string, checked: boolean): Promise<void> => {
  await simulateApiDelay()
  console.log(`Toggled checklist item ${itemId} to ${checked}`)
}

export const resolveLocationMismatch = async (assetId: string): Promise<void> => {
  await simulateApiDelay()
  console.log(`Resolved location discrepancy for ${assetId}`)
}

export const scanAndVerifyAsset = async (assetId: string): Promise<{ status: "verified" | "mismatch"; message: string }> => {
  const assetDbId = parseInt(assetId.replace("AST-", ""))
  
  // Find current active cycle id
  const listResponse = await api.get("/audits")
  const activeCycle = listResponse.data.data?.find((c: any) => c.status === "Open")
  if (!activeCycle) {
    return { status: "verified", message: "No active open audit cycle found." }
  }

  // Create verification entry
  const response = await api.post(`/audits/${activeCycle.id}/verify`, {
    assetId: assetDbId,
    status: "Verified"
  })

  if (response.data.success) {
    return {
      status: "verified",
      message: `Asset inventory verification logged successfully.`
    }
  }

  return {
    status: "verified",
    message: "Failed to log verification entry."
  }
}
