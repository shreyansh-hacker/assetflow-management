import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Plus,
  Download,
  Upload,
  QrCode,
  Laptop,
  Sofa,
  Cpu,
  Globe,
  Smartphone,
  MapPin,
  Tag,
  Building,
  User,
  History,
  FileText,
  Paperclip,
  ExternalLink,
  ChevronRight,
} from "lucide-react"

import { getAssets, registerAsset, updateAsset, deleteAsset } from "@/services/assets"
import { getDepartments } from "@/services/organization"
import type { Asset, AssetStatusType, AssetWarrantyType } from "@/types/assets"
import { useToast } from "@/hooks/useToast"

// Reusable components
import DataTable from "@/components/DataTable"
import type { Column } from "@/components/DataTable"
import StatusBadge from "@/components/StatusBadge"
import Timeline from "@/components/Timeline"
import type { TimelineEvent } from "@/components/Timeline"
import PageHeader from "@/components/PageHeader"
import SearchBar from "@/components/SearchBar"

// UI Primitives
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
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/Drawer"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/Select"

// Zod Validation Schema for Asset Registration
const assetRegistrationSchema = z.object({
  name: z.string().min(2, "Asset name must be at least 2 characters"),
  tag: z.string().regex(/^AF-[A-Z]{2}-\d{4}$/, "Tag must match format: AF-XX-XXXX"),
  category: z.string().min(1, "Please select a category"),
  status: z.string().min(1, "Please select an initial status"),
  department: z.string().min(1, "Please select a department"),
  purchaseDate: z.string().min(1, "Purchase date is required"),
  purchasePrice: z.number().min(1, "Price must be greater than 0"),
  warrantyExpiry: z.string().min(1, "Warranty expiration date is required"),
  location: z.string().min(2, "Location is required"),
  vendor: z.string().min(2, "Vendor must be specified"),
  invoiceNumber: z.string().min(2, "Invoice number is required"),
})

export default function Assets() {
  const { toast } = useToast()

  // Local State represent CRUD changes in real-time
  const [assets, setAssets] = useState<Asset[]>([])

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [warrantyFilter, setWarrantyFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [departmentFilter, setDepartmentFilter] = useState("all")

  // Sorting (placeholder states)

  // Bulk Selection State
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([])

  // Drawer Preview
  const [previewAsset, setPreviewAsset] = useState<Asset | null>(null)

  // Register Modal state
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)

  // API Queries
  const { data: initialAssets, isLoading: loadingAssets } = useQuery({
    queryKey: ["assetsData"],
    queryFn: getAssets,
  })

  const { data: departments = [] } = useQuery({
    queryKey: ["deptsData"],
    queryFn: getDepartments,
  })

  useEffect(() => {
    if (initialAssets) {
      setAssets(initialAssets)
    }
  }, [initialAssets])

  // Validation Form Hook
  const registerForm = useForm<z.infer<typeof assetRegistrationSchema>>({
    resolver: zodResolver(assetRegistrationSchema),
    defaultValues: {
      name: "",
      tag: "",
      category: "",
      status: "available",
      department: "",
      purchaseDate: new Date().toISOString().split("T")[0],
      purchasePrice: 0,
      warrantyExpiry: new Date(new Date().setFullYear(new Date().getFullYear() + 3)).toISOString().split("T")[0],
      location: "",
      vendor: "",
      invoiceNumber: "",
    },
  })

  // Submit Handler
  const onSubmitRegistration = async (values: z.infer<typeof assetRegistrationSchema>) => {
    try {
      const formattedAsset = {
        id: "AST-" + (assets.length + 1).toString().padStart(4, "0"),
        name: values.name,
        tag: values.tag,
        category: values.category,
        status: values.status as AssetStatusType,
        department: values.department,
        assignedTo: null,
        purchaseDate: values.purchaseDate,
        purchasePrice: values.purchasePrice,
        depreciationValue: values.purchasePrice, // Initially same
        depreciationRate: "20%/year",
        warrantyStatus: "active" as AssetWarrantyType,
        warrantyExpiry: values.warrantyExpiry,
        location: values.location,
        vendor: values.vendor,
        invoiceNumber: values.invoiceNumber,
      }

      const savedAsset = await registerAsset(formattedAsset)
      setAssets((prev) => [savedAsset, ...prev])
      setIsRegisterOpen(false)
      registerForm.reset()
      toast({
        title: "Asset Registered",
        description: `Successfully cataloged "${values.name}" with inventory tag ${values.tag}.`,
        type: "success",
      })
    } catch {
      toast({
        title: "Registration Failed",
        description: "An error occurred while creating the asset record.",
        type: "error",
      })
    }
  }

  // Bulk Actions
  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedAssetIds.map((id) => deleteAsset(id)))
      setAssets((prev) => prev.filter((asset) => !selectedAssetIds.includes(asset.id)))
      toast({
        title: "Bulk Action Success",
        description: `Successfully deleted ${selectedAssetIds.length} assets from system index.`,
        type: "success",
      })
      setSelectedAssetIds([])
    } catch (err: any) {
      toast({
        title: "Bulk Action Failed",
        description: err.response?.data?.message || err.message || "Failed to delete assets.",
        type: "error",
      })
    }
  }

  const handleBulkScrap = async () => {
    try {
      await Promise.all(
        selectedAssetIds.map((id) => updateAsset(id, { status: "disposed" }))
      )
      setAssets((prev) =>
        prev.map((asset) =>
          selectedAssetIds.includes(asset.id)
            ? {
                ...asset,
                status: "disposed" as any,
                assignedTo: null,
                depreciationValue: 0,
              }
            : asset
        )
      )
      toast({
        title: "Bulk Action Success",
        description: `Successfully marked ${selectedAssetIds.length} assets as Disposed.`,
        type: "success",
      })
      setSelectedAssetIds([])
    } catch (err: any) {
      toast({
        title: "Bulk Action Failed",
        description: err.response?.data?.message || err.message || "Failed to scrap assets.",
        type: "error",
      })
    }
  }

  // Row Selection Toggle
  const toggleSelectAsset = (id: string) => {
    setSelectedAssetIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = (filteredList: Asset[]) => {
    const filteredIds = filteredList.map((a) => a.id)
    const allSelected = filteredIds.every((id) => selectedAssetIds.includes(id))

    if (allSelected) {
      setSelectedAssetIds((prev) => prev.filter((id) => !filteredIds.includes(id)))
    } else {
      setSelectedAssetIds((prev) => [...new Set([...prev, ...filteredIds])])
    }
  }

  // Category Icon Generator
  const getCategoryIcon = (category: string) => {
    const norm = category.toLowerCase()
    if (norm.includes("hardware") || norm.includes("computer")) return <Laptop className="w-4 h-4" />
    if (norm.includes("furniture") || norm.includes("chair")) return <Sofa className="w-4 h-4" />
    if (norm.includes("lab") || norm.includes("equipment")) return <Cpu className="w-4 h-4" />
    if (norm.includes("license") || norm.includes("software")) return <Globe className="w-4 h-4" />
    if (norm.includes("mobile") || norm.includes("phone")) return <Smartphone className="w-4 h-4" />
    return <Tag className="w-4 h-4" />
  }

  // Warranty Badge mapping
  const getWarrantyBadge = (status: AssetWarrantyType) => {
    if (status === "active") return <Badge variant="success">Active</Badge>
    if (status === "expired") return <Badge variant="danger">Expired</Badge>
    return <Badge variant="warning">Expiring Soon</Badge>
  }

  // Filter & Search Execution
  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (asset.assignedTo?.name || "").toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || asset.status === statusFilter
    const matchesWarranty = warrantyFilter === "all" || asset.warrantyStatus === warrantyFilter
    const matchesCategory = categoryFilter === "all" || asset.category === categoryFilter
    const matchesDept = departmentFilter === "all" || asset.department === departmentFilter

    return matchesSearch && matchesStatus && matchesWarranty && matchesCategory && matchesDept
  })

  // Table Columns config
  const columns: Column<Asset>[] = [
    {
      header: (
        <input
          type="checkbox"
          checked={filteredAssets.length > 0 && filteredAssets.every((a) => selectedAssetIds.includes(a.id))}
          onChange={() => toggleSelectAll(filteredAssets)}
          className="rounded border-input text-primary focus:ring-primary w-4 h-4 cursor-pointer"
        />
      ),
      accessor: (row) => (
        <input
          type="checkbox"
          checked={selectedAssetIds.includes(row.id)}
          onChange={() => toggleSelectAsset(row.id)}
          className="rounded border-input text-primary focus:ring-primary w-4 h-4 cursor-pointer"
        />
      ),
      className: "w-12 text-center",
    },
    {
      header: "Asset Tag",
      accessor: (row) => (
        <button
          onClick={() => setPreviewAsset(row)}
          className="font-mono text-xs font-semibold text-primary hover:underline bg-transparent border-none p-0 cursor-pointer"
        >
          {row.tag}
        </button>
      ),
      className: "w-32",
    },
    {
      header: "Asset Name",
      accessor: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-secondary/80 text-muted-foreground flex items-center justify-center shrink-0">
            {getCategoryIcon(row.category)}
          </div>
          <div>
            <span className="font-semibold text-foreground block leading-tight">{row.name}</span>
            <span className="text-[11px] text-muted-foreground block">{row.category}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Status",
      accessor: (row) => <StatusBadge status={row.status} />,
      className: "w-28",
    },
    {
      header: "Assigned To",
      accessor: (row) =>
        row.assignedTo ? (
          <div>
            <span className="font-medium text-foreground block text-xs">{row.assignedTo.name}</span>
            <span className="text-[10px] text-muted-foreground block">{row.department}</span>
          </div>
        ) : (
          <span className="text-muted-foreground/60 italic text-xs">Unassigned</span>
        ),
      className: "w-40",
    },
    {
      header: "Value / Cost",
      accessor: (row) => (
        <div className="text-right pr-4">
          <span className="font-bold text-foreground block">${row.purchasePrice.toLocaleString()}</span>
          <span className="text-[10px] text-muted-foreground block">Dep: ${row.depreciationValue.toLocaleString()}</span>
        </div>
      ),
      className: "w-32 text-right",
    },
    {
      header: "Location",
      accessor: (row) => (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate max-w-[120px]">{row.location}</span>
        </div>
      ),
      className: "w-40",
    },
    {
      header: "Warranty",
      accessor: (row) => getWarrantyBadge(row.warrantyStatus),
      className: "w-32",
    },
    {
      header: "Details",
      accessor: (row) => (
        <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={() => setPreviewAsset(row)}>
          Open <ChevronRight className="w-4 h-4 ml-0.5" />
        </Button>
      ),
      className: "w-20",
    },
  ]

  // Timeline events mapping for preview drawer
  const getTimelineEvents = (asset: Asset): TimelineEvent[] => {
    return asset.history.map((event) => ({
      id: event.id,
      title: event.title,
      subtitle: event.notes,
      description: `Actioned by ${event.user}`,
      date: event.date,
      status: event.type === "allocation" ? "success" : event.type === "maintenance" ? "warning" : "primary",
    }))
  }

  return (
    <div className="space-y-6 text-left select-none relative">
      {/* Page Title */}
      <PageHeader
        title="Asset Directory"
        description="Search, audit, and track capital assets across department sectors and offices"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="shadow-premium gap-1 text-xs">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </Button>
            <Button variant="outline" size="sm" className="shadow-premium gap-1 text-xs">
              <Upload className="w-4 h-4" />
              <span>Import</span>
            </Button>
            <Button size="sm" onClick={() => setIsRegisterOpen(true)} className="shadow-premium gap-1.5 text-xs">
              <Plus className="w-4.5 h-4.5" />
              <span>Register Asset</span>
            </Button>
          </div>
        }
      />

      {/* Advanced Filters */}
      <div className="p-4 rounded-xl border border-border bg-card shadow-premium space-y-4">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by tag, asset name, holder email..."
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-1">
          {/* Status Filter */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Status</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full bg-card h-9">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="allocated">Allocated</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="disposed">Disposed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Warranty Filter */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Warranty</label>
            <Select value={warrantyFilter} onValueChange={setWarrantyFilter}>
              <SelectTrigger className="w-full bg-card h-9">
                <SelectValue placeholder="All Warranties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Warranties</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="expiring_soon">Expiring Soon</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category Filter */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Category</label>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full bg-card h-9">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="IT Hardware">IT Hardware</SelectItem>
                <SelectItem value="Office Furniture">Office Furniture</SelectItem>
                <SelectItem value="Lab Equipment">Lab Equipment</SelectItem>
                <SelectItem value="Software Licenses">Software Licenses</SelectItem>
                <SelectItem value="Mobile Devices">Mobile Devices</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Department Filter */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Department</label>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-full bg-card h-9">
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
            </Select>
          </div>
        </div>
      </div>

      {/* Bulk Action Sticky Bar */}
      {selectedAssetIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 bg-primary text-primary-foreground px-6 py-3 rounded-full shadow-lg flex items-center gap-6 border border-primary/20 animate-fade-in">
          <span className="text-xs font-semibold">
            {selectedAssetIds.length} Assets selected
          </span>
          <div className="h-4 w-px bg-primary-foreground/35" />
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-8 text-xs text-primary-foreground hover:bg-white/10" onClick={handleBulkScrap}>
              Scrap Selected
            </Button>
            <Button variant="ghost" size="sm" className="h-8 text-xs text-destructive-foreground hover:bg-red-500/20" onClick={handleBulkDelete}>
              Delete Selected
            </Button>
          </div>
        </div>
      )}

      {/* Main DataTable */}
      <DataTable
        columns={columns}
        data={filteredAssets}
        loading={loadingAssets && assets.length === 0}
        emptyState={
          <div className="text-center py-12">
            <p className="text-sm font-semibold text-muted-foreground">No assets found matching filters</p>
          </div>
        }
      />

      {/* Register Asset Modal */}
      <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
        <DialogContent className="max-w-xl select-none text-left">
          <DialogHeader>
            <DialogTitle>Register New Capital Asset</DialogTitle>
          </DialogHeader>

          <form onSubmit={registerForm.handleSubmit(onSubmitRegistration)} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Asset Name"
                placeholder="e.g. Dell Latitude 5440"
                error={registerForm.formState.errors.name?.message}
                {...registerForm.register("name")}
              />
              <Input
                label="Inventory Code / Tag"
                placeholder="e.g. AF-LP-0112"
                error={registerForm.formState.errors.tag?.message}
                {...registerForm.register("tag")}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold tracking-wide text-foreground/80">Category</label>
                <Controller
                  name="category"
                  control={registerForm.control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full bg-card">
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent className="z-[60]">
                        <SelectItem value="IT Hardware">IT Hardware</SelectItem>
                        <SelectItem value="Office Furniture">Office Furniture</SelectItem>
                        <SelectItem value="Lab Equipment">Lab Equipment</SelectItem>
                        <SelectItem value="Software Licenses">Software Licenses</SelectItem>
                        <SelectItem value="Mobile Devices">Mobile Devices</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {registerForm.formState.errors.category && (
                  <p className="text-xs text-destructive font-medium tracking-wide">
                    {registerForm.formState.errors.category.message}
                  </p>
                )}
              </div>

              {/* Department */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold tracking-wide text-foreground/80">Department</label>
                <Controller
                  name="department"
                  control={registerForm.control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full bg-card">
                        <SelectValue placeholder="Select Dept" />
                      </SelectTrigger>
                      <SelectContent className="z-[60]">
                        {departments.map((d) => (
                          <SelectItem key={d.id} value={d.name}>
                            {d.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {registerForm.formState.errors.department && (
                  <p className="text-xs text-destructive font-medium tracking-wide">
                    {registerForm.formState.errors.department.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Purchase Date"
                type="date"
                error={registerForm.formState.errors.purchaseDate?.message}
                {...registerForm.register("purchaseDate")}
              />
              <Input
                label="Purchase Value ($)"
                placeholder="e.g. 1299"
                type="number"
                error={registerForm.formState.errors.purchasePrice?.message}
                {...registerForm.register("purchasePrice", { valueAsNumber: true })}
              />
              <Input
                label="Warranty Expiration"
                type="date"
                error={registerForm.formState.errors.warrantyExpiry?.message}
                {...registerForm.register("warrantyExpiry")}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Primary Location"
                placeholder="e.g. Tech Lab - Cabinet B"
                error={registerForm.formState.errors.location?.message}
                {...registerForm.register("location")}
              />
              <Input
                label="Vendor Partner"
                placeholder="e.g. Apple Enterprise Sales"
                error={registerForm.formState.errors.vendor?.message}
                {...registerForm.register("vendor")}
              />
            </div>
            <Input
              label="Purchase Invoice Number"
              placeholder="e.g. INV-2026-9912"
              error={registerForm.formState.errors.invoiceNumber?.message}
              {...registerForm.register("invoiceNumber")}
            />

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsRegisterOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Save Assets Records
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* right-side drawer preview */}
      <Drawer open={previewAsset !== null} onOpenChange={(open) => { if (!open) setPreviewAsset(null) }}>
        {previewAsset && (
          <DrawerContent className="max-w-lg select-none text-left overflow-y-auto pr-1">
            <DrawerHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  {getCategoryIcon(previewAsset.category)}
                </div>
                <div className="space-y-0.5">
                  <DrawerTitle>{previewAsset.name}</DrawerTitle>
                  <DrawerDescription className="font-mono text-xs flex items-center gap-2">
                    <span className="font-semibold">{previewAsset.tag}</span>
                    <span>•</span>
                    <StatusBadge status={previewAsset.status} />
                  </DrawerDescription>
                </div>
              </div>
            </DrawerHeader>

            {/* Scrollable details content */}
            <div className="flex-1 space-y-6 pt-2 pb-6 px-1">
              {/* QR Preview & Banner */}
              <div className="grid grid-cols-3 items-center gap-4 bg-muted/40 p-4 rounded-xl border border-border">
                <div className="col-span-2 space-y-1.5">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Asset Barcode</span>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Scan to view audit history logs or check-in tickets instantly.
                  </p>
                  <Badge variant="outline" className="font-mono text-[9px] tracking-wide mt-1">
                    ID: {previewAsset.id}
                  </Badge>
                </div>
                <div className="flex justify-center">
                  {/* Mock QR graphic */}
                  <div className="w-20 h-20 bg-card rounded-lg border border-border flex items-center justify-center relative shadow-premium">
                    <QrCode className="w-16 h-16 text-foreground" />
                    <span className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  </div>
                </div>
              </div>

              {/* Ownership */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-4 h-4 text-primary" />
                  <span>Current Ownership</span>
                </span>
                <div className="p-3.5 rounded-xl border border-border bg-card flex items-center gap-3 shadow-premium">
                  <div className="w-10 h-10 rounded-full bg-secondary/80 flex items-center justify-center font-bold text-sm text-muted-foreground shrink-0">
                    {previewAsset.assignedTo ? previewAsset.assignedTo.name.substring(0, 2).toUpperCase() : "NA"}
                  </div>
                  {previewAsset.assignedTo ? (
                    <div>
                      <span className="font-semibold text-foreground block text-sm">{previewAsset.assignedTo.name}</span>
                      <span className="text-xs text-muted-foreground block">{previewAsset.assignedTo.email}</span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary bg-primary/10 rounded px-1.5 py-0.2 mt-1">
                        <Building className="w-3 h-3" />
                        {previewAsset.department}
                      </span>
                    </div>
                  ) : (
                    <div>
                      <span className="text-sm font-semibold text-muted-foreground/60 italic block">No active assignment</span>
                      <p className="text-xs text-muted-foreground">Available to allocate to staff.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Specifications details */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-primary" />
                  <span>Technical & Procurement Details</span>
                </span>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-muted/20 border border-border rounded-lg space-y-1">
                    <span className="text-[10px] text-muted-foreground">Current Location</span>
                    <span className="font-semibold text-foreground block truncate">{previewAsset.location}</span>
                  </div>
                  <div className="p-3 bg-muted/20 border border-border rounded-lg space-y-1">
                    <span className="text-[10px] text-muted-foreground">Vendor Partner</span>
                    <span className="font-semibold text-foreground block truncate">{previewAsset.vendor}</span>
                  </div>
                  <div className="p-3 bg-muted/20 border border-border rounded-lg space-y-1">
                    <span className="text-[10px] text-muted-foreground">Cost Valuation</span>
                    <span className="font-bold text-foreground block">${previewAsset.purchasePrice.toLocaleString()}</span>
                  </div>
                  <div className="p-3 bg-muted/20 border border-border rounded-lg space-y-1">
                    <span className="text-[10px] text-muted-foreground">Depreciated Value</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 block">
                      ${previewAsset.depreciationValue.toLocaleString()} ({previewAsset.depreciationRate})
                    </span>
                  </div>
                  <div className="p-3 bg-muted/20 border border-border rounded-lg space-y-1">
                    <span className="text-[10px] text-muted-foreground">Purchase Date</span>
                    <span className="font-semibold text-foreground block">{previewAsset.purchaseDate}</span>
                  </div>
                  <div className="p-3 bg-muted/20 border border-border rounded-lg space-y-1">
                    <span className="text-[10px] text-muted-foreground">Warranty Expiration</span>
                    <span className="font-semibold text-foreground block flex items-center gap-1">
                      {previewAsset.warrantyExpiry}
                      {getWarrantyBadge(previewAsset.warrantyStatus)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Attachments */}
              {previewAsset.attachments.length > 0 && (
                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Paperclip className="w-4 h-4 text-primary" />
                    <span>Purchase Invoices & Attaches ({previewAsset.attachments.length})</span>
                  </span>
                  <div className="grid grid-cols-1 gap-2">
                    {previewAsset.attachments.map((file, fIdx) => (
                      <div key={fIdx} className="p-2.5 rounded-lg border border-border bg-card hover:bg-muted/10 transition-colors flex items-center justify-between text-xs cursor-pointer shadow-premium">
                        <div className="flex items-center gap-2 text-foreground font-medium truncate pr-4">
                          <FileText className="w-4.5 h-4.5 text-primary shrink-0" />
                          <span className="truncate">{file}</span>
                        </div>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Timeline Log */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <History className="w-4 h-4 text-primary" />
                  <span>Activity Logs & Maintenance History</span>
                </span>
                <div className="p-4 rounded-xl border border-border bg-card shadow-premium">
                  <Timeline events={getTimelineEvents(previewAsset)} />
                </div>
              </div>
            </div>
          </DrawerContent>
        )}
      </Drawer>
    </div>
  )
}
