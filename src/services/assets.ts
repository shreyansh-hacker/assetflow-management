import { simulateApiDelay } from "@/services/api"
import type { Asset } from "@/types/assets"
import mockData from "@/mock/assets.json"

export const getAssets = async (): Promise<Asset[]> => {
  await simulateApiDelay()
  return mockData as Asset[]
}

export const registerAsset = async (asset: Omit<Asset, "history" | "attachments">): Promise<Asset> => {
  await simulateApiDelay()
  const newAsset: Asset = {
    ...asset,
    attachments: [],
    history: [
      {
        id: "h-new",
        type: "system",
        title: "Asset Registered",
        date: new Date().toISOString().split("T")[0],
        user: "Enterprise Admin",
        notes: "Registered under cost center / department: " + asset.department,
      },
    ],
  }
  return newAsset
}
