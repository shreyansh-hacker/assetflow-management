export interface Department {
  id: number
  name: string
  code: string
  manager: string
  employeesCount: number
  costCenter: string
}

export interface Employee {
  id: number
  name: string
  email: string
  department: string
  role: string
  activeAssets: number
  joinedDate: string
}

export interface AssetCategory {
  id: number
  name: string
  code: string
  description: string
  totalAssets: number
  depreciationRate: string
}

export interface OrganizationData {
  departments: Department[]
  employees: Employee[]
  categories: AssetCategory[]
}
