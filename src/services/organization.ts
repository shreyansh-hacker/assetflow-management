import { simulateApiDelay } from "@/services/api"
import type { Department, Employee, AssetCategory } from "@/types/organization"
import mockData from "@/mock/organization.json"

export const getDepartments = async (): Promise<Department[]> => {
  await simulateApiDelay()
  return mockData.departments as Department[]
}

export const getEmployees = async (): Promise<Employee[]> => {
  await simulateApiDelay()
  return mockData.employees as Employee[]
}

export const getCategories = async (): Promise<AssetCategory[]> => {
  await simulateApiDelay()
  return mockData.categories as AssetCategory[]
}
