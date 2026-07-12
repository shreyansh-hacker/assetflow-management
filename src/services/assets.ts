import { api, simulateApiDelay } from "@/services/api"
import type { Asset } from "@/types/assets"
import { adaptAsset } from "./adapters"

export const getAssets = async (): Promise<Asset[]> => {
  await simulateApiDelay()
  const response = await api.get("/assets")
  if (response.data.success) {
    return response.data.data.map(adaptAsset)
  }
  return []
}

export const registerAsset = async (asset: Omit<Asset, "id" | "history" | "attachments" | "depreciationValue" | "depreciationRate" | "warrantyStatus" | "warrantyExpiry" | "assignedTo">): Promise<Asset> => {
  // Map category to categoryId
  let categoryId = 1 // default
  if (asset.category === "Monitors") categoryId = 2
  else if (asset.category === "Furniture") categoryId = 3
  else if (asset.category === "Software") categoryId = 4
  else if (asset.category === "Vehicles") categoryId = 5

  // Map department to departmentId
  let departmentId = 1 // default
  if (asset.department === "HR") departmentId = 2
  else if (asset.department === "Finance") departmentId = 3
  else if (asset.department === "Operations") departmentId = 4
  else if (asset.department === "Marketing") departmentId = 5

  const response = await api.post("/assets", {
    name: asset.name,
    assetCode: asset.tag,
    serialNumber: `SN-${asset.tag}-${Math.round(Math.random() * 1000)}`, // auto-generate serial number
    categoryId,
    departmentId,
    status: "Available"
  })

  return adaptAsset(response.data.data)
}

export const updateAsset = async (id: string, asset: Partial<Asset>): Promise<Asset> => {
  const assetDbId = parseInt(id.replace("AST-", ""))
  
  // Prepare backend payload
  const payload: any = {}
  if (asset.name) payload.name = asset.name
  if (asset.location) payload.location = asset.location
  if (asset.status) {
    // capitalize status for backend
    payload.status = asset.status.charAt(0).toUpperCase() + asset.status.slice(1)
  }

  const response = await api.put(`/assets/${assetDbId}`, payload)
  return adaptAsset(response.data.data)
}

export const deleteAsset = async (id: string): Promise<void> => {
  const assetDbId = parseInt(id.replace("AST-", ""))
  await api.delete(`/assets/${assetDbId}`)
}
