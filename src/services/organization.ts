import { api, simulateApiDelay } from "@/services/api"
import type { Department, Employee, AssetCategory } from "@/types/organization"
import {
  adaptDepartment,
  adaptEmployee,
  adaptCategory
} from "./adapters"

// --- DEPARTMENTS ---
export const getDepartments = async (): Promise<Department[]> => {
  await simulateApiDelay()
  const response = await api.get("/departments")
  if (response.data.success) {
    return response.data.data.map(adaptDepartment)
  }
  return []
}

export const createDepartment = async (name: string): Promise<Department> => {
  const response = await api.post("/departments", { name })
  return adaptDepartment(response.data.data)
}

export const updateDepartment = async (id: number, name: string): Promise<Department> => {
  const response = await api.put(`/departments/${id}`, { name })
  return adaptDepartment(response.data.data)
}

export const deleteDepartment = async (id: number): Promise<void> => {
  await api.delete(`/departments/${id}`)
}

// --- EMPLOYEES ---
export const getEmployees = async (): Promise<Employee[]> => {
  await simulateApiDelay()
  const response = await api.get("/employees")
  if (response.data.success) {
    return response.data.data.map(adaptEmployee)
  }
  return []
}

export const createEmployee = async (data: Omit<Employee, "id" | "activeAssets" | "joinedDate"> & { password?: string }): Promise<Employee> => {
  // Find standard department ID and role ID
  // For safety during seed, Admin role is 1, Asset Manager is 2, Employee is 4
  const roleId = data.role === "Admin" ? 1 : data.role === "Asset Manager" ? 2 : 4
  // Map department string to id
  let departmentId = 1
  if (data.department === "HR") departmentId = 2
  else if (data.department === "Finance") departmentId = 3
  else if (data.department === "Operations") departmentId = 4
  else if (data.department === "Marketing") departmentId = 5

  const response = await api.post("/employees", {
    name: data.name,
    email: data.email,
    password: data.password || "employee123",
    roleId,
    departmentId
  })
  return adaptEmployee(response.data.data)
}

export const updateEmployee = async (id: number, data: Partial<Employee>): Promise<Employee> => {
  const roleId = data.role === "Admin" ? 1 : data.role === "Asset Manager" ? 2 : 4
  let departmentId = 1
  if (data.department === "HR") departmentId = 2
  else if (data.department === "Finance") departmentId = 3
  else if (data.department === "Operations") departmentId = 4
  else if (data.department === "Marketing") departmentId = 5

  const response = await api.put(`/employees/${id}`, {
    name: data.name,
    email: data.email,
    roleId,
    departmentId
  })
  return adaptEmployee(response.data.data)
}

// --- CATEGORIES ---
export const getCategories = async (): Promise<AssetCategory[]> => {
  await simulateApiDelay()
  const response = await api.get("/categories")
  if (response.data.success) {
    return response.data.data.map(adaptCategory)
  }
  return []
}

export const createCategory = async (name: string): Promise<AssetCategory> => {
  const response = await api.post("/categories", { name })
  return adaptCategory(response.data.data)
}
