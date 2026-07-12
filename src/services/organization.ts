import { simulateApiDelay } from "@/services/api"
import type { Department, Employee, AssetCategory } from "@/types/organization"
import {
  getDepartmentsDb,
  updateDepartmentsDb,
  getEmployeesDb,
  updateEmployeesDb,
  getCategoriesDb,
  updateCategoriesDb,
} from "./db"

export const getDepartments = async (): Promise<Department[]> => {
  await simulateApiDelay()
  return getDepartmentsDb()
}

export const saveDepartments = async (depts: Department[]): Promise<Department[]> => {
  await simulateApiDelay()
  updateDepartmentsDb(depts)
  return depts
}

export const getEmployees = async (): Promise<Employee[]> => {
  await simulateApiDelay()
  return getEmployeesDb()
}

export const saveEmployees = async (emps: Employee[]): Promise<Employee[]> => {
  await simulateApiDelay()
  updateEmployeesDb(emps)
  return emps
}

export const getCategories = async (): Promise<AssetCategory[]> => {
  await simulateApiDelay()
  return getCategoriesDb()
}

export const saveCategories = async (cats: AssetCategory[]): Promise<AssetCategory[]> => {
  await simulateApiDelay()
  updateCategoriesDb(cats)
  return cats
}
