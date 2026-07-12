import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Plus,
  Edit2,
  Trash2,
  Building2,
  Users,
  FolderTree,
  Mail,
  User,
  Briefcase,
  AlertTriangle,
} from "lucide-react"

import { getDepartments, getEmployees, getCategories } from "@/services/organization"
import type { Department, Employee, AssetCategory } from "@/types/organization"
import { useToast } from "@/hooks/useToast"

// Reusable custom widgets
import DataTable from "@/components/DataTable"
import type { Column } from "@/components/DataTable"
import SearchBar from "@/components/SearchBar"
import ConfirmDialog from "@/components/ConfirmDialog"
import PageHeader from "@/components/PageHeader"

// UI primitives
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Badge } from "@/components/ui/Badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/Dialog"
import {
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/Select"
import * as SelectPrimitive from "@radix-ui/react-select"

// Zod Validation Schemas
const departmentSchema = z.object({
  name: z.string().min(2, "Department name must be at least 2 characters"),
  code: z.string().min(2, "Code must be 2-4 characters").max(4, "Code cannot exceed 4 characters").toUpperCase(),
  manager: z.string().min(2, "Manager name must be specified"),
  costCenter: z.string().regex(/^CC-\d{3}$/, "Cost center must match format: CC-XXX"),
})

const employeeSchema = z.object({
  name: z.string().min(2, "Employee name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  department: z.string().min(1, "Please select a department"),
  role: z.string().min(2, "Role description must be at least 2 characters"),
})

const categorySchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters"),
  code: z.string().min(2, "Code must be 2-5 characters").max(5, "Code cannot exceed 5 characters").toUpperCase(),
  description: z.string().min(5, "Please provide a brief description"),
  depreciationRate: z.string().regex(/^\d+%\/year$/, "Rate must match format: X%/year"),
})

type TabType = "departments" | "employees" | "categories"

export default function Organization() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<TabType>("departments")

  // Local State representing CRUD changes in real-time
  const [departments, setDepartments] = useState<Department[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [categories, setCategories] = useState<AssetCategory[]>([])

  // Search filter states
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDeptFilter, setSelectedDeptFilter] = useState("all")

  // API Queries
  const { data: initialDepts, isLoading: loadingDepts } = useQuery({
    queryKey: ["deptsData"],
    queryFn: getDepartments,
  })
  const { data: initialEmps, isLoading: loadingEmps } = useQuery({
    queryKey: ["empsData"],
    queryFn: getEmployees,
  })
  const { data: initialCats, isLoading: loadingCats } = useQuery({
    queryKey: ["catsData"],
    queryFn: getCategories,
  })

  // Synchronize state once queries complete
  useEffect(() => {
    if (initialDepts) setDepartments(initialDepts)
  }, [initialDepts])

  useEffect(() => {
    if (initialEmps) setEmployees(initialEmps)
  }, [initialEmps])

  useEffect(() => {
    if (initialCats) setCategories(initialCats)
  }, [initialCats])

  // Reset search query when tabs switch
  useEffect(() => {
    setSearchQuery("")
  }, [activeTab])

  // CRUD Trigger states
  const [crudModal, setCrudModal] = useState<{
    isOpen: boolean
    type: "create" | "edit"
    tab: TabType
    targetId?: number
  }>({ isOpen: false, type: "create", tab: "departments" })

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean
    tab: TabType
    targetId?: number
    targetName?: string
  }>({ isOpen: false, tab: "departments" })

  // Validation Forms Hooks
  const deptForm = useForm<z.infer<typeof departmentSchema>>({
    resolver: zodResolver(departmentSchema),
    defaultValues: { name: "", code: "", manager: "", costCenter: "" },
  })

  const empForm = useForm<z.infer<typeof employeeSchema>>({
    resolver: zodResolver(employeeSchema),
    defaultValues: { name: "", email: "", department: "", role: "" },
  })

  const catForm = useForm<z.infer<typeof categorySchema>>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "", code: "", description: "", depreciationRate: "" },
  })

  // Prepopulate form on Edit trigger
  const handleOpenEdit = (tab: TabType, id: number) => {
    if (tab === "departments") {
      const dept = departments.find((d) => d.id === id)
      if (dept) {
        deptForm.reset({
          name: dept.name,
          code: dept.code,
          manager: dept.manager,
          costCenter: dept.costCenter,
        })
        setCrudModal({ isOpen: true, type: "edit", tab: "departments", targetId: id })
      }
    } else if (tab === "employees") {
      const emp = employees.find((e) => e.id === id)
      if (emp) {
        empForm.reset({
          name: emp.name,
          email: emp.email,
          department: emp.department,
          role: emp.role,
        })
        setCrudModal({ isOpen: true, type: "edit", tab: "employees", targetId: id })
      }
    } else if (tab === "categories") {
      const cat = categories.find((c) => c.id === id)
      if (cat) {
        catForm.reset({
          name: cat.name,
          code: cat.code,
          description: cat.description,
          depreciationRate: cat.depreciationRate,
        })
        setCrudModal({ isOpen: true, type: "edit", tab: "categories", targetId: id })
      }
    }
  }

  // Prepopulate form on Create trigger
  const handleOpenCreate = (tab: TabType) => {
    if (tab === "departments") {
      deptForm.reset({ name: "", code: "", manager: "", costCenter: "" })
    } else if (tab === "employees") {
      empForm.reset({ name: "", email: "", department: "", role: "" })
    } else if (tab === "categories") {
      catForm.reset({ name: "", code: "", description: "", depreciationRate: "" })
    }
    setCrudModal({ isOpen: true, type: "create", tab })
  }

  // Save Forms Submissions
  const onSaveDepartment = (values: z.infer<typeof departmentSchema>) => {
    if (crudModal.type === "create") {
      const newDept: Department = {
        id: Math.round(Math.random() * 1000) + 100,
        name: values.name,
        code: values.code,
        manager: values.manager,
        employeesCount: 0,
        costCenter: values.costCenter,
      }
      setDepartments((prev) => [newDept, ...prev])
      toast({
        title: "Department Created",
        description: `Successfully added department ${values.name} (${values.code}).`,
        type: "success",
      })
    } else {
      setDepartments((prev) =>
        prev.map((d) => (d.id === crudModal.targetId ? { ...d, ...values } : d))
      )
      toast({
        title: "Department Updated",
        description: `Successfully modified details for ${values.name}.`,
        type: "success",
      })
    }
    setCrudModal({ isOpen: false, type: "create", tab: "departments" })
  }

  const onSaveEmployee = (values: z.infer<typeof employeeSchema>) => {
    if (crudModal.type === "create") {
      const newEmp: Employee = {
        id: Math.round(Math.random() * 1000) + 500,
        name: values.name,
        email: values.email,
        department: values.department,
        role: values.role,
        activeAssets: 0,
        joinedDate: new Date().toISOString().split("T")[0],
      }
      setEmployees((prev) => [newEmp, ...prev])
      // Increment headcount on matching department
      setDepartments((prev) =>
        prev.map((d) => (d.name === values.department ? { ...d, employeesCount: d.employeesCount + 1 } : d))
      )
      toast({
        title: "Employee Registered",
        description: `${values.name} has been added to the employee folder directory.`,
        type: "success",
      })
    } else {
      setEmployees((prev) =>
        prev.map((e) => (e.id === crudModal.targetId ? { ...e, ...values } : e))
      )
      toast({
        title: "Employee Details Updated",
        description: `Successfully saved data profiles for ${values.name}.`,
        type: "success",
      })
    }
    setCrudModal({ isOpen: false, type: "create", tab: "employees" })
  }

  const onSaveCategory = (values: z.infer<typeof categorySchema>) => {
    if (crudModal.type === "create") {
      const newCat: AssetCategory = {
        id: Math.round(Math.random() * 1000) + 900,
        name: values.name,
        code: values.code,
        description: values.description,
        totalAssets: 0,
        depreciationRate: values.depreciationRate,
      }
      setCategories((prev) => [newCat, ...prev])
      toast({
        title: "Category Registered",
        description: `Asset classification ${values.name} created successfully.`,
        type: "success",
      })
    } else {
      setCategories((prev) =>
        prev.map((c) => (c.id === crudModal.targetId ? { ...c, ...values } : c))
      )
      toast({
        title: "Category Updated",
        description: `Successfully modified ${values.name} classification configuration.`,
        type: "success",
      })
    }
    setCrudModal({ isOpen: false, type: "create", tab: "categories" })
  }

  // Delete Action Confirm Trigger
  const handleDeleteTrigger = (tab: TabType, id: number, name: string) => {
    setDeleteModal({ isOpen: true, tab, targetId: id, targetName: name })
  }

  const handleConfirmDelete = () => {
    const { tab, targetId, targetName } = deleteModal
    if (tab === "departments") {
      setDepartments((prev) => prev.filter((d) => d.id !== targetId))
      toast({
        title: "Department Removed",
        description: `${targetName} has been deleted successfully.`,
        type: "success",
      })
    } else if (tab === "employees") {
      const emp = employees.find((e) => e.id === targetId)
      setEmployees((prev) => prev.filter((e) => e.id !== targetId))
      // Decrement headcount on matching department
      if (emp) {
        setDepartments((prev) =>
          prev.map((d) => (d.name === emp.department ? { ...d, employeesCount: Math.max(0, d.employeesCount - 1) } : d))
        )
      }
      toast({
        title: "Employee Removed",
        description: `${targetName} is deleted from directory records.`,
        type: "success",
      })
    } else if (tab === "categories") {
      setCategories((prev) => prev.filter((c) => c.id !== targetId))
      toast({
        title: "Category Deleted",
        description: `Asset category classification ${targetName} was deleted.`,
        type: "success",
      })
    }
    setDeleteModal({ isOpen: false, tab: "departments" })
  }

  // Table Column Definitions
  const departmentColumns: Column<Department>[] = [
    { header: "Code", accessor: (row) => <Badge variant="outline" className="font-mono">{row.code}</Badge>, className: "w-24" },
    { header: "Department Name", accessor: "name", className: "font-semibold text-foreground" },
    { header: "Manager", accessor: "manager", className: "text-muted-foreground" },
    { header: "Cost Center", accessor: (row) => <span className="font-mono text-xs">{row.costCenter}</span> },
    { header: "Employee Count", accessor: "employeesCount", className: "text-right pr-6" },
    {
      header: "Actions",
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted text-muted-foreground hover:text-foreground" onClick={() => handleOpenEdit("departments", row.id)}>
            <Edit2 className="w-4.5 h-4.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/10 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteTrigger("departments", row.id, row.name)}>
            <Trash2 className="w-4.5 h-4.5" />
          </Button>
        </div>
      ),
      className: "w-28",
    },
  ]

  const employeeColumns: Column<Employee>[] = [
    {
      header: "Employee Name",
      accessor: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
            {row.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <span className="font-semibold text-foreground block leading-tight">{row.name}</span>
            <span className="text-[11px] text-muted-foreground block">{row.email}</span>
          </div>
        </div>
      ),
    },
    { header: "Department", accessor: (row) => <Badge variant="secondary">{row.department}</Badge> },
    { header: "Role", accessor: "role", className: "text-muted-foreground" },
    { header: "Active Assets", accessor: "activeAssets", className: "text-center" },
    { header: "Join Date", accessor: "joinedDate", className: "text-muted-foreground text-xs" },
    {
      header: "Actions",
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted text-muted-foreground hover:text-foreground" onClick={() => handleOpenEdit("employees", row.id)}>
            <Edit2 className="w-4.5 h-4.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/10 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteTrigger("employees", row.id, row.name)}>
            <Trash2 className="w-4.5 h-4.5" />
          </Button>
        </div>
      ),
      className: "w-28",
    },
  ]

  const categoryColumns: Column<AssetCategory>[] = [
    { header: "Category Code", accessor: (row) => <Badge variant="outline" className="font-mono">{row.code}</Badge>, className: "w-32" },
    { header: "Category Name", accessor: "name", className: "font-semibold text-foreground" },
    { header: "Description", accessor: "description", className: "text-muted-foreground max-w-sm truncate" },
    { header: "Depreciation Rate", accessor: "depreciationRate", className: "font-medium" },
    { header: "Total Assets", accessor: "totalAssets", className: "text-right pr-6" },
    {
      header: "Actions",
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted text-muted-foreground hover:text-foreground" onClick={() => handleOpenEdit("categories", row.id)}>
            <Edit2 className="w-4.5 h-4.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/10 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteTrigger("categories", row.id, row.name)}>
            <Trash2 className="w-4.5 h-4.5" />
          </Button>
        </div>
      ),
      className: "w-28",
    },
  ]

  // Filter & Search Logic
  const filteredDepartments = departments.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.manager.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredEmployees = employees.filter((e) => {
    const matchesSearch =
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.role.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesDept = selectedDeptFilter === "all" || e.department === selectedDeptFilter
    return matchesSearch && matchesDept
  })

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const showLoading =
    (activeTab === "departments" && loadingDepts && departments.length === 0) ||
    (activeTab === "employees" && loadingEmps && employees.length === 0) ||
    (activeTab === "categories" && loadingCats && categories.length === 0)

  return (
    <div className="space-y-6 text-left select-none">
      {/* Title Header */}
      <PageHeader
        title="Organization Setup"
        description="Configure cost centers, hierarchy department groups, and employee registry profiles"
        actions={
          <Button size="sm" onClick={() => handleOpenCreate(activeTab)} className="shadow-premium">
            <Plus className="w-4 h-4 mr-1.5" />
            {activeTab === "departments"
              ? "New Department"
              : activeTab === "employees"
              ? "Add Employee"
              : "New Category"}
          </Button>
        }
      />

      {/* Tabs Bar Switcher */}
      <div className="flex border-b border-border/80 pb-px gap-6">
        <button
          onClick={() => setActiveTab("departments")}
          className={`flex items-center gap-2 pb-3 text-sm font-semibold tracking-wide border-b-2 transition-all duration-200 cursor-pointer ${
            activeTab === "departments"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Building2 className="w-4.5 h-4.5" />
          <span>Departments</span>
          <span className="text-[10px] bg-secondary text-secondary-foreground font-bold px-1.5 py-0.2 rounded-full border">
            {departments.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("employees")}
          className={`flex items-center gap-2 pb-3 text-sm font-semibold tracking-wide border-b-2 transition-all duration-200 cursor-pointer ${
            activeTab === "employees"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Users className="w-4.5 h-4.5" />
          <span>Employees</span>
          <span className="text-[10px] bg-secondary text-secondary-foreground font-bold px-1.5 py-0.2 rounded-full border">
            {employees.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("categories")}
          className={`flex items-center gap-2 pb-3 text-sm font-semibold tracking-wide border-b-2 transition-all duration-200 cursor-pointer ${
            activeTab === "categories"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <FolderTree className="w-4.5 h-4.5" />
          <span>Asset Categories</span>
          <span className="text-[10px] bg-secondary text-secondary-foreground font-bold px-1.5 py-0.2 rounded-full border">
            {categories.length}
          </span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row items-center gap-3">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={
            activeTab === "departments"
              ? "Search by code, department name, manager..."
              : activeTab === "employees"
              ? "Search by employee name, role, email..."
              : "Search by classification name, code..."
          }
          actions={
            activeTab === "employees" && (
              <SelectPrimitive.Root value={selectedDeptFilter} onValueChange={setSelectedDeptFilter}>
                <SelectTrigger className="w-48 bg-card">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((d) => (
                    <SelectItem key={d.id} value={d.name}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </SelectPrimitive.Root>
            )
          }
        />
      </div>

      {/* Data tables container */}
      <div className="w-full">
        {activeTab === "departments" && (
          <DataTable
            columns={departmentColumns}
            data={filteredDepartments}
            loading={showLoading}
          />
        )}

        {activeTab === "employees" && (
          <DataTable
            columns={employeeColumns}
            data={filteredEmployees}
            loading={showLoading}
          />
        )}

        {activeTab === "categories" && (
          <DataTable
            columns={categoryColumns}
            data={filteredCategories}
            loading={showLoading}
          />
        )}
      </div>

      {/* CRUD Modals */}
      <Dialog
        open={crudModal.isOpen}
        onOpenChange={(open) => {
          if (!open) setCrudModal((prev) => ({ ...prev, isOpen: false }))
        }}
      >
        <DialogContent className="max-w-md select-none text-left">
          <DialogHeader>
            <DialogTitle>
              {crudModal.type === "create" ? "Add New " : "Modify "}
              {crudModal.tab === "departments"
                ? "Department"
                : crudModal.tab === "employees"
                ? "Employee Profile"
                : "Asset Category"}
            </DialogTitle>
          </DialogHeader>

          {/* Department CRUD Form */}
          {crudModal.tab === "departments" && (
            <form onSubmit={deptForm.handleSubmit(onSaveDepartment)} className="space-y-4 pt-2">
              <Input
                label="Department Name"
                placeholder="e.g. Quality Assurance"
                error={deptForm.formState.errors.name?.message}
                {...deptForm.register("name")}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Dept Code"
                  placeholder="e.g. QAA"
                  error={deptForm.formState.errors.code?.message}
                  {...deptForm.register("code")}
                />
                <Input
                  label="Cost Center"
                  placeholder="e.g. CC-105"
                  error={deptForm.formState.errors.costCenter?.message}
                  {...deptForm.register("costCenter")}
                />
              </div>
              <Input
                label="Dept Manager"
                placeholder="e.g. Sarah Jenkins"
                error={deptForm.formState.errors.manager?.message}
                {...deptForm.register("manager")}
              />

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCrudModal((prev) => ({ ...prev, isOpen: false }))}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          )}

          {/* Employee CRUD Form */}
          {crudModal.tab === "employees" && (
            <form onSubmit={empForm.handleSubmit(onSaveEmployee)} className="space-y-4 pt-2">
              <Input
                label="Employee Name"
                placeholder="e.g. Aarav Sharma"
                leftIcon={<User className="w-4 h-4 text-muted-foreground/60" />}
                error={empForm.formState.errors.name?.message}
                {...empForm.register("name")}
              />
              <Input
                label="Work Email"
                placeholder="e.g. aarav.s@assetflow.com"
                leftIcon={<Mail className="w-4 h-4 text-muted-foreground/60" />}
                error={empForm.formState.errors.email?.message}
                {...empForm.register("email")}
              />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-semibold tracking-wide text-foreground/80">
                    Department
                  </label>
                  <Controller
                    name="department"
                    control={empForm.control}
                    render={({ field }) => (
                      <SelectPrimitive.Root value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Dept" />
                        </SelectTrigger>
                        <SelectContent className="z-[60]">
                          {departments.map((d) => (
                            <SelectItem key={d.id} value={d.name}>
                              {d.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </SelectPrimitive.Root>
                    )}
                  />
                  {empForm.formState.errors.department && (
                    <p className="text-xs text-destructive font-medium tracking-wide">
                      {empForm.formState.errors.department.message}
                    </p>
                  )}
                </div>
                <Input
                  label="Role / Title"
                  placeholder="e.g. QA Lead"
                  leftIcon={<Briefcase className="w-4 h-4 text-muted-foreground/60" />}
                  error={empForm.formState.errors.role?.message}
                  {...empForm.register("role")}
                />
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCrudModal((prev) => ({ ...prev, isOpen: false }))}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          )}

          {/* Category CRUD Form */}
          {crudModal.tab === "categories" && (
            <form onSubmit={catForm.handleSubmit(onSaveCategory)} className="space-y-4 pt-2">
              <Input
                label="Category Name"
                placeholder="e.g. Lab Sensors"
                error={catForm.formState.errors.name?.message}
                {...catForm.register("name")}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Code"
                  placeholder="e.g. LBSN"
                  error={catForm.formState.errors.code?.message}
                  {...catForm.register("code")}
                />
                <Input
                  label="Depreciation Rate"
                  placeholder="e.g. 15%/year"
                  error={catForm.formState.errors.depreciationRate?.message}
                  {...catForm.register("depreciationRate")}
                />
              </div>
              <Input
                label="Description"
                placeholder="Sensor rigs, RF testing kits, adapters"
                error={catForm.formState.errors.description?.message}
                {...catForm.register("description")}
              />

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCrudModal((prev) => ({ ...prev, isOpen: false }))}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmDelete}
        title="Confirm Removal Request"
        description={`Are you absolutely sure you want to delete "${deleteModal.targetName}"? This action will remove this entity record permanent from database indexes.`}
        variant="destructive"
        confirmText="Remove Record"
        cancelText="Cancel"
        icon={<AlertTriangle className="w-5 h-5 text-destructive" />}
      />
    </div>
  )
}
