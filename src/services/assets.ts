import { simulateApiDelay } from "@/services/api"
import type { Asset } from "@/types/assets"
import { getAssetsDb, updateAssetsDb } from "./db"

export const getAssets = async (): Promise<Asset[]> => {
  await simulateApiDelay()
  return getAssetsDb()
}

export const registerAsset = async (asset: Omit<Asset, "history" | "attachments">): Promise<Asset> => {
  await simulateApiDelay()
  const newAsset: Asset = {
    ...asset,
    attachments: [],
    history: [
      {
        id: "h-" + Date.now().toString(),
        type: "system",
        title: "Asset Registered",
        date: new Date().toISOString().split("T")[0],
        user: "Enterprise Admin",
        notes: "Registered under cost center / department: " + asset.department,
      },
    ],
  }
  const current = getAssetsDb()
  updateAssetsDb([newAsset, ...current])
  return newAsset
}
