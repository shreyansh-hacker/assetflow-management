import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  ArrowLeftRight,
  User,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Tag,
  Activity,
  UserCheck,
  Send,
} from "lucide-react"

import { getAssets } from "@/services/assets"
import { getDepartments, getEmployees } from "@/services/organization"
import { getTransferRequests, createTransferRequest, getCustodyHistory } from "@/services/allocations"
import type { Asset } from "@/types/assets"
import type { TransferRequest, CustodyHistory, TransferPriorityType, TransferStatusType } from "@/types/allocations"
import { useToast } from "@/hooks/useToast"

// Reusable components
import PageHeader from "@/components/PageHeader"
import Timeline from "@/components/Timeline"
import type { TimelineEvent } from "@/components/Timeline"

// UI primitives
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Badge } from "@/components/ui/Badge"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/Select"

// Zod validation for Transfer form
const transferFormSchema = z.object({
  newHolder: z.string().min(1, "Please select a new recipient employee"),
  newDepartment: z.string().min(1, "Please select a new recipient department"),
  reason: z.string().min(5, "Reason must be at least 5 characters"),
  expectedReturnDate: z.string().min(1, "Expected return date is required"),
  priority: z.enum(["low", "medium", "high"]),
  notes: z.string().optional(),
})

export default function Allocation() {
  const { toast } = useToast()

  // Selection
  const [selectedAssetId, setSelectedAssetId] = useState<string>("")
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)

  // Local state for live updates
  const [transferRequests, setTransferRequests] = useState<TransferRequest[]>([])
  const [custodyHistory, setCustodyHistory] = useState<CustodyHistory[]>([])
  const [activeStep, setActiveStep] = useState<number>(0) // Workflow progress stepper

  // Form hook
  const form = useForm<z.infer<typeof transferFormSchema>>({
    resolver: zodResolver(transferFormSchema),
    defaultValues: {
      newHolder: "",
      newDepartment: "",
      reason: "",
      expectedReturnDate: "",
      priority: "medium",
      notes: "",
    },
  })

  // Queries
  const { data: assets = [] } = useQuery({
    queryKey: ["assetsList"],
    queryFn: getAssets,
  })

  const { data: departments = [] } = useQuery({
    queryKey: ["deptsData"],
    queryFn: getDepartments,
  })

  const { data: employees = [] } = useQuery({
    queryKey: ["empsData"],
    queryFn: getEmployees,
  })

  const { data: initialRequests = [] } = useQuery({
    queryKey: ["transferRequests"],
    queryFn: getTransferRequests,
  })

  const { data: initialHistory = [] } = useQuery({
    queryKey: ["custodyHistory"],
    queryFn: getCustodyHistory,
  })

  // Synchronize local states
  useEffect(() => {
    if (initialRequests.length > 0) setTransferRequests(initialRequests)
  }, [initialRequests])

  useEffect(() => {
    if (initialHistory.length > 0) setCustodyHistory(initialHistory)
  }, [initialHistory])

  // Asset changes handler
  const handleAssetSelect = (assetId: string) => {
    setSelectedAssetId(assetId)
    const asset = assets.find((a) => a.id === assetId) || null
    setSelectedAsset(asset)

    if (asset) {
      // Set workflow visualizer active step: 1 (Asset Selected) or 2 (Holder Loaded)
      setActiveStep(asset.assignedTo ? 2 : 1)
      // Autofill values or reset form
      form.reset({
        newHolder: "",
        newDepartment: "",
        reason: "",
        expectedReturnDate: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split("T")[0],
        priority: "medium",
        notes: "",
      })
    } else {
      setActiveStep(0)
    }
  }

  // Handle Transfer submit
  const onSubmitTransfer = async (values: z.infer<typeof transferFormSchema>) => {
    if (!selectedAsset) return

    try {
      const draft = {
        assetId: selectedAsset.id,
        assetName: selectedAsset.name,
        assetTag: selectedAsset.tag,
        currentHolder: selectedAsset.assignedTo ? selectedAsset.assignedTo.name : "Inventory",
        currentDepartment: selectedAsset.department,
        newHolder: values.newHolder,
        newDepartment: values.newDepartment,
        reason: values.reason,
        expectedReturnDate: values.expectedReturnDate,
        priority: values.priority as TransferPriorityType,
        notes: values.notes,
      }

      const newRequest = await createTransferRequest(draft)
      setTransferRequests((prev) => [newRequest, ...prev])
      form.reset()
      setActiveStep(4) // Move step to Approval Pending

      toast({
        title: "Transfer Requested",
        description: `Request ${newRequest.id} has been submitted for approval.`,
        type: "info",
      })
    } catch {
      toast({
        title: "Submission Error",
        description: "Could not create the transfer request.",
        type: "error",
      })
    }
  }

  // Approve / Reject local action triggers
  const handleApproveRequest = (requestId: string) => {
    const request = transferRequests.find((r) => r.id === requestId)
    if (!request) return

    // Update Request status
    setTransferRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: "approved" as TransferStatusType } : r))
    )

    // Add custody logs
    const newLog: CustodyHistory = {
      id: "ah-" + (Math.round(Math.random() * 1000) + 100).toString(),
      assetId: request.assetId,
      event: "Reassigned",
      from: request.currentHolder,
      to: request.newHolder,
      date: new Date().toISOString().split("T")[0],
      user: "System Admin",
    }
    setCustodyHistory((prev) => [newLog, ...prev])

    // Update active asset details if it matches the currently selected one
    if (selectedAsset && selectedAsset.id === request.assetId) {
      setSelectedAsset((prev) =>
        prev
          ? {
              ...prev,
              assignedTo: { name: request.newHolder, email: `${request.newHolder.toLowerCase().replace(/\s+/g, ".")}@assetflow.com` },
              department: request.newDepartment,
            }
          : null
      )
      setActiveStep(6) // Set workflow visualizer step to "Asset Assigned"
    }

    toast({
      title: "Request Approved",
      description: `Asset ${request.assetName} has been assigned to ${request.newHolder}.`,
      type: "success",
    })
  }

  const handleRejectRequest = (requestId: string) => {
    setTransferRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: "rejected" as TransferStatusType } : r))
    )

    if (selectedAsset) {
      setActiveStep(2) // Revert to Holder view
    }

    toast({
      title: "Request Rejected",
      description: "Transfer request was marked as Rejected.",
      type: "warning",
    })
  }



  // Stepper elements definitions
  const workflowSteps = [
    { title: "Asset Selected", icon: <Tag className="w-4 h-4" /> },
    { title: "Current Holder", icon: <User className="w-4 h-4" /> },
    { title: "Transfer Request", icon: <ArrowLeftRight className="w-4 h-4" /> },
    { title: "Approval Pending", icon: <Clock className="w-4 h-4" /> },
    { title: "Approved / Rejected", icon: <UserCheck className="w-4 h-4" /> },
    { title: "Asset Assigned", icon: <CheckCircle2 className="w-4 h-4" /> },
    { title: "Activity Logged", icon: <Activity className="w-4 h-4" /> },
  ]

  // Priority layout tags mapper
  const getPriorityBadge = (p: TransferPriorityType) => {
    if (p === "high") return <Badge variant="danger">High</Badge>
    if (p === "medium") return <Badge variant="warning">Medium</Badge>
    return <Badge variant="outline">Low</Badge>
  }

  // Status mapping layout colors
  const getRequestStatusBadge = (s: TransferStatusType) => {
    if (s === "approved") return <Badge variant="success">Approved</Badge>
    if (s === "rejected") return <Badge variant="danger">Rejected</Badge>
    if (s === "cancelled") return <Badge variant="outline">Cancelled</Badge>
    return <Badge variant="warning" className="animate-pulse">Pending</Badge>
  }

  // Filter history logs for the current selected asset
  const filteredLogs: TimelineEvent[] = custodyHistory
    .filter((log) => !selectedAssetId || log.assetId === selectedAssetId)
    .map((log) => ({
      id: log.id,
      title: `${log.event}: ${log.to}`,
      subtitle: `Transferred from ${log.from}`,
      description: `Actioned by ${log.user} on ${log.date}`,
      date: log.date,
      status: log.event === "Returned" ? "warning" : log.event === "Maintenance Transfer" ? "danger" : "success",
    }))

  return (
    <div className="space-y-6 text-left select-none">
      {/* Title */}
      <PageHeader
        title="Asset Allocation & Transfer"
        description="Transfer custody ownership and route approvals between department sectors"
      />

      {/* Workflow Timeline progress indicator */}
      {selectedAsset && (
        <div className="p-5 rounded-xl border border-border bg-card shadow-premium space-y-4">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Transfer Pipeline</span>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 overflow-x-auto pb-2">
            {workflowSteps.map((step, index) => {
              const stepNum = index + 1
              const isActive = activeStep >= stepNum
              const isCurrent = activeStep === stepNum
              return (
                <div key={index} className="flex items-center gap-3 shrink-0">
                  <div
                    className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                      isCurrent
                        ? "border-primary bg-primary text-primary-foreground scale-110 shadow-md"
                        : isActive
                        ? "border-primary/50 bg-primary/10 text-primary"
                        : "border-border bg-muted/30 text-muted-foreground"
                    }`}
                  >
                    {step.icon}
                  </div>
                  <div className="space-y-0.5">
                    <span
                      className={`text-xs font-semibold block leading-tight ${
                        isCurrent ? "text-foreground font-bold" : isActive ? "text-muted-foreground" : "text-muted-foreground/60"
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                  {index < workflowSteps.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-muted-foreground/40 hidden md:block" />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Grid container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left main forms column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Asset Selection Card */}
          <div className="p-6 rounded-xl border border-border bg-card shadow-premium space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm text-foreground tracking-tight uppercase tracking-wider text-muted-foreground">
                Select Target Asset
              </h3>
              {selectedAsset && <Badge variant="outline">{selectedAsset.category}</Badge>}
            </div>

            <div className="space-y-1">
              <Select value={selectedAssetId} onValueChange={handleAssetSelect}>
                <SelectTrigger className="w-full bg-card h-11">
                  <SelectValue placeholder="Search or select asset to transfer..." />
                </SelectTrigger>
                <SelectContent className="z-[50]">
                  {assets.map((asset) => (
                    <SelectItem key={asset.id} value={asset.id}>
                      {asset.name} ({asset.tag}) - {asset.assignedTo ? `Custody: ${asset.assignedTo.name}` : "Inventory"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedAsset && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-xs border-t border-border/60 mt-2">
                <div className="space-y-0.5">
                  <span className="text-muted-foreground">Inventory ID</span>
                  <span className="font-mono font-semibold text-foreground block">{selectedAsset.tag}</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-muted-foreground">Original Cost</span>
                  <span className="font-semibold text-foreground block">${selectedAsset.purchasePrice.toLocaleString()}</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-muted-foreground">Current Valuation</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 block">${selectedAsset.depreciationValue.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>

          {/* Current Custody / Holder Card */}
          {selectedAsset && (
            <div className="p-6 rounded-xl border border-border bg-card shadow-premium space-y-4">
              <h3 className="font-semibold text-sm text-foreground tracking-tight uppercase tracking-wider text-muted-foreground">
                Current Custody Details
              </h3>
              <div className="flex items-center gap-4 bg-muted/20 border border-border p-4 rounded-xl shadow-premium">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg shrink-0">
                  {selectedAsset.assignedTo ? selectedAsset.assignedTo.name.substring(0, 2).toUpperCase() : "INV"}
                </div>
                {selectedAsset.assignedTo ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full text-xs">
                    <div className="space-y-1">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wide">Employee</span>
                      <p className="font-semibold text-foreground text-sm">{selectedAsset.assignedTo.name}</p>
                      <p className="text-muted-foreground">{selectedAsset.assignedTo.email}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wide">Location Group</span>
                      <p className="font-semibold text-foreground">{selectedAsset.department} Department</p>
                      <p className="text-muted-foreground">Assigned: {selectedAsset.purchaseDate}</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <span className="font-semibold text-muted-foreground/60 italic block">No Active Holder</span>
                    <p className="text-xs text-muted-foreground mt-0.5">This asset is currently stored in warehouses and ready to be assigned.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Transfer Form (validated) */}
          {selectedAsset && (
            <div className="p-6 rounded-xl border border-border bg-card shadow-premium space-y-4">
              <h3 className="font-semibold text-sm text-foreground tracking-tight uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <ArrowLeftRight className="w-4 h-4 text-primary" />
                <span>Initiate Custody Transfer</span>
              </h3>

              <form onSubmit={form.handleSubmit(onSubmitTransfer)} className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-4">
                  {/* Select Recipient */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold tracking-wide text-foreground/80">Select New Recipient</label>
                    <Controller
                      name="newHolder"
                      control={form.control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="w-full bg-card">
                            <SelectValue placeholder="Recipient Employee" />
                          </SelectTrigger>
                          <SelectContent className="z-[50]">
                            {employees.map((emp) => (
                              <SelectItem key={emp.id} value={emp.name}>
                                {emp.name} ({emp.role})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {form.formState.errors.newHolder && (
                      <p className="text-xs text-destructive font-medium tracking-wide">
                        {form.formState.errors.newHolder.message}
                      </p>
                    )}
                  </div>

                  {/* Select Recipient Department */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold tracking-wide text-foreground/80">Recipient Department</label>
                    <Controller
                      name="newDepartment"
                      control={form.control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="w-full bg-card">
                            <SelectValue placeholder="Recipient Department" />
                          </SelectTrigger>
                          <SelectContent className="z-[50]">
                            {departments.map((dept) => (
                              <SelectItem key={dept.id} value={dept.name}>
                                {dept.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {form.formState.errors.newDepartment && (
                      <p className="text-xs text-destructive font-medium tracking-wide">
                        {form.formState.errors.newDepartment.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Expected Return Date"
                    type="date"
                    error={form.formState.errors.expectedReturnDate?.message}
                    {...form.register("expectedReturnDate")}
                  />

                  {/* Priority */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold tracking-wide text-foreground/80">Transfer Priority</label>
                    <Controller
                      name="priority"
                      control={form.control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="w-full bg-card">
                            <SelectValue placeholder="Select Priority" />
                          </SelectTrigger>
                          <SelectContent className="z-[50]">
                            <SelectItem value="low">Low Priority</SelectItem>
                            <SelectItem value="medium">Medium Priority</SelectItem>
                            <SelectItem value="high">High Priority</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>

                <Input
                  label="Transfer Reason"
                  placeholder="e.g. Deploying updates on production code sandbox"
                  error={form.formState.errors.reason?.message}
                  {...form.register("reason")}
                />

                <Input
                  label="Additional Notes (Optional)"
                  placeholder="Include any accessories, cables, or licenses attached"
                  {...form.register("notes")}
                />

                <div className="flex justify-end gap-2 pt-2">
                  <Button type="submit" size="sm" className="shadow-premium gap-1.5">
                    <Send className="w-4 h-4" />
                    <span>Submit Transfer Request</span>
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Right sidebar requests & timelines column */}
        <div className="space-y-6">
          {/* Active Transfer Requests & Approval cards */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-foreground tracking-tight uppercase tracking-wider text-muted-foreground">
              Transfer Approvals
            </h3>
            {transferRequests.length === 0 ? (
              <div className="p-6 rounded-xl border border-dashed border-border bg-card text-center text-muted-foreground text-xs">
                No active transfer requests pending review.
              </div>
            ) : (
              transferRequests.map((req) => (
                <div key={req.id} className="p-4 rounded-xl border border-border bg-card shadow-premium space-y-4">
                  {/* Card Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono text-xs font-semibold text-foreground block">{req.id}</span>
                      <span className="text-[10px] text-muted-foreground block">Req: {req.requestDate}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {getPriorityBadge(req.priority)}
                      {getRequestStatusBadge(req.status)}
                    </div>
                  </div>

                  {/* Card Content summary */}
                  <div className="space-y-2 text-xs border-t border-b border-border/50 py-3">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Asset Tag</span>
                      <span className="font-mono font-medium text-foreground">{req.assetTag}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Asset</span>
                      <span className="font-semibold text-foreground max-w-[150px] truncate">{req.assetName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Sender</span>
                      <span className="font-semibold text-foreground">{req.currentHolder}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Recipient</span>
                      <span className="font-semibold text-primary">{req.newHolder}</span>
                    </div>
                    <div className="flex flex-col gap-0.5 pt-1">
                      <span className="text-muted-foreground text-[10px]">Reason:</span>
                      <p className="text-muted-foreground leading-relaxed italic">"{req.reason}"</p>
                    </div>
                  </div>

                  {/* Action buttons if Pending */}
                  {req.status === "pending" && (
                    <div className="flex items-center gap-2 pt-1.5 justify-end">
                      <Button variant="outline" size="sm" className="h-8 text-xs text-destructive hover:bg-destructive/10" onClick={() => handleRejectRequest(req.id)}>
                        <XCircle className="w-4 h-4 mr-1" /> Reject
                      </Button>
                      <Button size="sm" className="h-8 text-xs shadow-premium" onClick={() => handleApproveRequest(req.id)}>
                        <CheckCircle2 className="w-4 h-4 mr-1" /> Approve
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Custody Logs Timeline */}
          <div className="p-6 rounded-xl border border-border bg-card shadow-premium space-y-4">
            <h3 className="font-semibold text-sm text-foreground tracking-tight uppercase tracking-wider text-muted-foreground">
              Custody Transfer Logs
            </h3>
            {filteredLogs.length === 0 ? (
              <div className="text-center py-6 text-xs text-muted-foreground">
                No transfer logs recorded for this asset.
              </div>
            ) : (
              <div className="pr-1 max-h-[400px] overflow-y-auto">
                <Timeline events={filteredLogs} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
