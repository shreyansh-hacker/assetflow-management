import { simulateApiDelay } from "@/services/api"
import type { AuditRun } from "@/types/audits"
import {
  getAuditsDb,
  updateAuditsDb,
  getAssetsDb,
  updateAssetsDb,
  createSystemNotification,
} from "./db"

export const getActiveAudit = async (): Promise<AuditRun> => {
  await simulateApiDelay()
  return getAuditsDb().activeAudit
}

export const toggleChecklistItem = async (itemId: string, checked: boolean): Promise<void> => {
  await simulateApiDelay()
  const db = getAuditsDb()
  db.activeAudit.checklist = db.activeAudit.checklist.map((item) =>
    item.id === itemId ? { ...item, checked } : item
  )
  updateAuditsDb(db)
}

export const resolveLocationMismatch = async (assetId: string): Promise<void> => {
  await simulateApiDelay()
  const db = getAuditsDb()
  const mismatch = db.activeAudit.locationMismatches.find((m) => m.id === assetId)
  if (mismatch) {
    // Remove mismatch
    db.activeAudit.locationMismatches = db.activeAudit.locationMismatches.filter((m) => m.id !== assetId)
    // Update asset location in Asset Directory
    const assets = getAssetsDb()
    const asset = assets.find((a) => a.id === assetId)
    if (asset) {
      asset.location = mismatch.actualLocation
      updateAssetsDb(assets)
    }

    // Increment verified
    db.activeAudit.verifiedAssets += 1
    db.activeAudit.progress = Math.round((db.activeAudit.verifiedAssets / db.activeAudit.totalAssets) * 100)
    updateAuditsDb(db)

    // Notify
    createSystemNotification(
      `Discrepancy Resolved: ${mismatch.name}`,
      `Asset coordinate mismatch corrected to: "${mismatch.actualLocation}".`,
      "audit",
      "low"
    )
  }
}

export const scanAndVerifyAsset = async (assetId: string): Promise<{ status: "verified" | "mismatch"; message: string }> => {
  await simulateApiDelay()
  const db = getAuditsDb()
  const assets = getAssetsDb()
  const targetAsset = assets.find((a) => a.id === assetId)
  if (!targetAsset) return { status: "verified", message: "Asset not found" }

  // Check if it already exists as mismatch
  const existsMismatch = db.activeAudit.locationMismatches.some((m) => m.id === assetId)
  // Let's check location alignment (if location starts with Room or Cabinet, simulate mismatch)
  const isLocationMismatch = targetAsset.location.includes("Room") || targetAsset.location.includes("Cabinet")

  if (isLocationMismatch && !existsMismatch) {
    const newMismatch = {
      id: targetAsset.id,
      name: targetAsset.name,
      tag: targetAsset.tag,
      expectedLocation: "HQ - Block A, Floor 3",
      actualLocation: targetAsset.location,
      holder: targetAsset.assignedTo ? targetAsset.assignedTo.name : "Unassigned",
      dateDetected: new Date().toISOString().split("T")[0],
    }

    db.activeAudit.locationMismatches = [newMismatch, ...db.activeAudit.locationMismatches]
    updateAuditsDb(db)

    createSystemNotification(
      `Audit Discrepancy: ${targetAsset.name}`,
      `Location mismatch scanned for inventory tag ${targetAsset.tag}. Expected: HQ Floor 3, Found: ${targetAsset.location}`,
      "audit",
      "high"
    )

    return {
      status: "mismatch",
      message: `Location mismatch detected for ${targetAsset.name}. Logged discrepancy.`,
    }
  } else {
    // Normal verify
    db.activeAudit.verifiedAssets += 1
    db.activeAudit.progress = Math.round((db.activeAudit.verifiedAssets / db.activeAudit.totalAssets) * 100)
    updateAuditsDb(db)

    createSystemNotification(
      `Audit Scanned: ${targetAsset.name}`,
      `Scanned tag ${targetAsset.tag}. Headcount coordinate verified.`,
      "audit",
      "low"
    )

    return {
      status: "verified",
      message: `Inventory tag ${targetAsset.tag} verified successfully.`,
    }
  }
}
