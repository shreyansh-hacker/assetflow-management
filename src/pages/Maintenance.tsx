import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Plus,
  Wrench,
  Send,
  Layers,
  Check,
  ChevronRight,
  Activity,
} from "lucide-react"

import { getMaintenanceTickets, createMaintenanceTicket, updateTicketStatus, addTicketComment } from "@/services/maintenance"
import { getAssets } from "@/services/assets"
import { getEmployees } from "@/services/organization"
import type { MaintenanceTicket, MaintenanceStatusType, MaintenancePriorityType, SLALevelType } from "@/types/maintenance"
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

// Zod validation for Creating Maintenance Ticket
const ticketFormSchema = z.object({
  assetId: z.string().min(1, "Please select an asset"),
  title: z.string().min(4, "Title must be at least 4 characters"),
  description: z.string().min(6, "Provide a descriptive summary"),
  priority: z.enum(["low", "medium", "high", "critical"]),
  technicianName: z.string().min(1, "Please assign a technician"),
  estimatedCost: z.number().min(0, "Cost cannot be negative"),
  spareParts: z.string().optional(),
})

export default function Maintenance() {
  const { toast } = useToast()

  // Local State representing ticket changes in real-time
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([])
  const [selectedTicket, setSelectedTicket] = useState<MaintenanceTicket | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  // Comments feed state
  const [commentText, setCommentText] = useState("")

  // API Queries
  const { data: initialTickets = [] } = useQuery({
    queryKey: ["maintenanceTickets"],
    queryFn: getMaintenanceTickets,
  })

  const { data: assets = [] } = useQuery({
    queryKey: ["assetsList"],
    queryFn: getAssets,
  })

  const { data: employees = [] } = useQuery({
    queryKey: ["empsData"],
    queryFn: getEmployees,
  })

  useEffect(() => {
    if (initialTickets.length > 0) {
      setTickets(initialTickets)
    }
  }, [initialTickets])

  // Form Hook
  const form = useForm<z.infer<typeof ticketFormSchema>>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: {
      assetId: "",
      title: "",
      description: "",
      priority: "medium",
      technicianName: "",
      estimatedCost: 0,
      spareParts: "",
    },
  })

  // Submit Handler
  const onSubmitTicket = async (values: z.infer<typeof ticketFormSchema>) => {
    const asset = assets.find((a) => a.id === values.assetId)
    const emp = employees.find((e) => e.name === values.technicianName)
    if (!asset) return

    try {
      const draft = {
        assetId: asset.id,
        assetName: asset.name,
        assetTag: asset.tag,
        title: values.title,
        description: values.description,
        status: "pending" as MaintenanceStatusType,
        priority: values.priority as MaintenancePriorityType,
        technician: {
          name: values.technicianName,
          email: emp ? emp.email : "tech@assetflow.com",
        },
        estimatedCost: values.estimatedCost,
        spareParts: values.spareParts ? values.spareParts.split(",").map((s) => s.trim()) : [],
      }

      const savedTicket = await createMaintenanceTicket(draft)
      setTickets((prev) => [savedTicket, ...prev])
      setIsCreateOpen(false)
      form.reset()
      toast({
        title: "Ticket Raised",
        description: `Successfully logged ticket ${savedTicket.id} for "${asset.name}".`,
        type: "success",
      })
    } catch {
      toast({
        title: "Submission Error",
        description: "An error occurred while launching the maintenance ticket.",
        type: "error",
      })
    }
  }

  // Update Status from Detail Drawer
  const handleUpdateStatus = async (ticketId: string, nextStatus: MaintenanceStatusType) => {
    const progressMap: Record<MaintenanceStatusType, number> = {
      pending: 10,
      in_progress: 45,
      testing: 80,
      completed: 100,
    }

    await updateTicketStatus(ticketId, nextStatus, progressMap[nextStatus])

    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              status: nextStatus,
              progress: progressMap[nextStatus],
              updatedAt: new Date().toISOString().split("T")[0],
            }
          : t
      )
    )

    // Update active drawer object state
    setSelectedTicket((prev) =>
      prev
        ? {
            ...prev,
            status: nextStatus,
            progress: progressMap[nextStatus],
            updatedAt: new Date().toISOString().split("T")[0],
          }
        : null
    )

    toast({
      title: "Status Updated",
      description: `Ticket status set to ${nextStatus.replace("_", " ")}.`,
      type: "info",
    })
  }

  // Add Comment trigger
  const handleAddComment = async () => {
    if (!selectedTicket || !commentText.trim()) return

    await addTicketComment(selectedTicket.id, commentText)

    const newComment = {
      id: "c-" + Date.now().toString(),
      author: "Enterprise Admin",
      date: new Date().toISOString().split("T")[0],
      text: commentText.trim(),
    }

    setTickets((prev) =>
      prev.map((t) =>
        t.id === selectedTicket.id
          ? {
              ...t,
              comments: [...t.comments, newComment],
            }
          : t
      )
    )

    setSelectedTicket((prev) =>
      prev
        ? {
            ...prev,
            comments: [...prev.comments, newComment],
          }
        : null
    )

    setCommentText("")
    toast({
      title: "Comment Logged",
      description: "Added feedback notes to repair timeline.",
      type: "success",
    })
  }

  // SLA Color Mapper
  const getSLABadge = (s: SLALevelType) => {
    if (s === "within_sla") return <Badge variant="success">Within SLA</Badge>
    if (s === "sla_breached") return <Badge variant="danger">SLA Breached</Badge>
    return <Badge variant="warning">Breach Warning</Badge>
  }

  // Priority color classes mapper
  const getPriorityBadge = (p: MaintenancePriorityType) => {
    if (p === "critical") return <Badge variant="danger">Critical</Badge>
    if (p === "high") return <Badge variant="warning">High</Badge>
    if (p === "medium") return <Badge variant="outline" className="border-amber-500/50 text-amber-500 bg-amber-500/5">Medium</Badge>
    return <Badge variant="outline">Low</Badge>
  }

  // Status mapping headers
  const columns: { status: MaintenanceStatusType; label: string; color: string }[] = [
    { status: "pending", label: "Backlog / Pending", color: "bg-muted/10 border-t-muted-foreground/30" },
    { status: "in_progress", label: "In Progress", color: "bg-primary/[0.01] border-t-primary/40" },
    { status: "testing", label: "Testing / Review", color: "bg-amber-[0.01] border-t-amber-500/40" },
    { status: "completed", label: "Completed", color: "bg-emerald-[0.01] border-t-emerald-500/40" },
  ]

  // Mock Timeline logs for ticket history
  const getTicketHistoryLogs = (ticket: MaintenanceTicket): TimelineEvent[] => {
    const logs: TimelineEvent[] = [
      { id: "e-1", title: "Ticket Raised", subtitle: "Registered in system", description: "Reported under initial priority: " + ticket.priority, date: ticket.createdAt, status: "primary" },
    ]

    if (ticket.status !== "pending") {
      logs.push({ id: "e-2", title: "Assigned & In Progress", subtitle: `Assigned to ${ticket.technician.name}`, description: "SLA limits activated", date: ticket.updatedAt, status: "warning" })
    }
    if (ticket.status === "testing" || ticket.status === "completed") {
      logs.push({ id: "e-3", title: "Testing Phase", subtitle: "Diagnostic calibrations running", description: "Calibration test runs initialized", date: ticket.updatedAt, status: "success" })
    }
    if (ticket.status === "completed") {
      logs.push({ id: "e-4", title: "Repairs Completed", subtitle: "Released back to directory", description: "Final validation certified signoff", date: ticket.updatedAt, status: "success" })
    }

    return logs.reverse()
  }

  return (
    <div className="space-y-6 text-left select-none">
      {/* Page Title */}
      <PageHeader
        title="Maintenance Management"
        description="Raise tickets, track SLA milestones, and coordinate engineer calibration workloads"
        actions={
          <Button size="sm" onClick={() => setIsCreateOpen(true)} className="shadow-premium gap-1.5 text-xs">
            <Plus className="w-4.5 h-4.5" />
            <span>Raise Ticket</span>
          </Button>
        }
      />

      {/* Kanban Board Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start pb-10">
        {columns.map((col, cIdx) => {
          const columnTickets = tickets.filter((t) => t.status === col.status)

          return (
            <div key={cIdx} className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-foreground tracking-wide">
                    {col.label}
                  </span>
                  <span className="text-[10px] bg-secondary text-secondary-foreground font-bold px-1.5 py-0.2 rounded-full border">
                    {columnTickets.length}
                  </span>
                </div>
              </div>

              {/* Column Cards stack */}
              <div className={`p-3 rounded-xl border border-border flex flex-col gap-3 min-h-[500px] border-t-2 ${col.color}`}>
                {columnTickets.length === 0 ? (
                  <div className="text-center py-12 text-xs text-muted-foreground/60 italic border border-dashed border-border/80 rounded-lg">
                    No tickets in this lane
                  </div>
                ) : (
                  columnTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      onClick={() => setSelectedTicket(ticket)}
                      className="p-4 rounded-xl border border-border bg-card shadow-premium hover:shadow-md cursor-pointer transition-all hover:scale-[1.01] hover:-translate-y-0.5 space-y-3"
                    >
                      {/* Ticket Header */}
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] font-bold text-muted-foreground">
                          {ticket.id}
                        </span>
                        {getPriorityBadge(ticket.priority)}
                      </div>

                      {/* Content */}
                      <div className="space-y-1">
                        <span className="font-semibold text-foreground text-xs block leading-snug">
                          {ticket.title}
                        </span>
                        <span className="text-[10px] text-muted-foreground block truncate">
                          {ticket.assetName} ({ticket.assetTag})
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1">
                        <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary transition-all duration-300" style={{ width: `${ticket.progress}%` }} />
                        </div>
                        <div className="flex justify-between text-[9px] text-muted-foreground font-semibold">
                          <span>Est Cost: ${ticket.estimatedCost}</span>
                          <span>{ticket.progress}% Done</span>
                        </div>
                      </div>

                      {/* Technician assignment footer */}
                      <div className="flex items-center justify-between pt-1.5 border-t border-border/50 text-[10px] text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-secondary text-foreground font-bold flex items-center justify-center text-[8px] uppercase">
                            {ticket.technician.name.substring(0, 2)}
                          </div>
                          <span>{ticket.technician.name}</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Ticket Details Drawer */}
      <Drawer open={selectedTicket !== null} onOpenChange={(open) => { if (!open) setSelectedTicket(null) }}>
        {selectedTicket && (
          <DrawerContent className="max-w-lg select-none text-left overflow-y-auto pr-1">
            <DrawerHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Wrench className="w-5 h-5 animate-pulse" />
                </div>
                <div className="space-y-0.5">
                  <DrawerTitle>{selectedTicket.title}</DrawerTitle>
                  <DrawerDescription className="font-mono text-xs flex items-center gap-2">
                    <span className="font-semibold text-foreground">{selectedTicket.id}</span>
                    <span>•</span>
                    <span className="text-muted-foreground">{selectedTicket.assetName} ({selectedTicket.assetTag})</span>
                  </DrawerDescription>
                </div>
              </div>
            </DrawerHeader>

            {/* Content body */}
            <div className="flex-1 space-y-6 pt-2 pb-6 px-1 text-xs">
              {/* Ticket State Control buttons */}
              <div className="p-3 bg-muted/40 border border-border rounded-xl space-y-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Move Ticket Phase
                </span>
                <div className="grid grid-cols-4 gap-2">
                  <Button variant={selectedTicket.status === "pending" ? "primary" : "outline"} size="sm" className="h-8 text-[10px] px-1" onClick={() => handleUpdateStatus(selectedTicket.id, "pending")}>
                    Backlog
                  </Button>
                  <Button variant={selectedTicket.status === "in_progress" ? "primary" : "outline"} size="sm" className="h-8 text-[10px] px-1" onClick={() => handleUpdateStatus(selectedTicket.id, "in_progress")}>
                    Work
                  </Button>
                  <Button variant={selectedTicket.status === "testing" ? "primary" : "outline"} size="sm" className="h-8 text-[10px] px-1" onClick={() => handleUpdateStatus(selectedTicket.id, "testing")}>
                    Test
                  </Button>
                  <Button variant={selectedTicket.status === "completed" ? "primary" : "outline"} size="sm" className="h-8 text-[10px] px-1" onClick={() => handleUpdateStatus(selectedTicket.id, "completed")}>
                    Complete
                  </Button>
                </div>
              </div>

              {/* Specifications parameters details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-card border border-border rounded-xl space-y-1 shadow-premium">
                  <span className="text-[10px] text-muted-foreground block font-semibold uppercase">Priority Level</span>
                  <div className="pt-0.5">{getPriorityBadge(selectedTicket.priority)}</div>
                </div>
                <div className="p-3 bg-card border border-border rounded-xl space-y-1 shadow-premium">
                  <span className="text-[10px] text-muted-foreground block font-semibold uppercase">SLA Milestone</span>
                  <div className="pt-0.5">{getSLABadge(selectedTicket.slaStatus)}</div>
                </div>
                <div className="p-3 bg-card border border-border rounded-xl space-y-1 shadow-premium">
                  <span className="text-[10px] text-muted-foreground block font-semibold uppercase">Assigned Technician</span>
                  <p className="font-semibold text-foreground leading-tight">{selectedTicket.technician.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{selectedTicket.technician.email}</p>
                </div>
                <div className="p-3 bg-card border border-border rounded-xl space-y-1 shadow-premium">
                  <span className="text-[10px] text-muted-foreground block font-semibold uppercase">Cost Estimate</span>
                  <span className="font-bold text-foreground text-sm block">${selectedTicket.estimatedCost}</span>
                </div>
              </div>

              {/* Spare Parts list */}
              {selectedTicket.spareParts.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Allocated Spare Parts</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedTicket.spareParts.map((part, pIdx) => (
                      <Badge key={pIdx} variant="secondary" className="gap-1 px-2 py-0.5">
                        <Check className="w-3 h-3 text-emerald-500" />
                        <span>{part}</span>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Progress visualizer */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Repair Progress: {selectedTicket.progress}%
                </span>
                <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden border border-border shadow-inner">
                  <div className="h-full bg-primary transition-all duration-500" style={{ width: `${selectedTicket.progress}%` }} />
                </div>
              </div>

              {/* Ticket description */}
              <div className="space-y-1.5 p-3.5 rounded-xl border border-border bg-card shadow-premium">
                <span className="text-[10px] text-muted-foreground font-bold uppercase block">Incident Summary</span>
                <p className="text-muted-foreground leading-relaxed italic">"{selectedTicket.description}"</p>
              </div>

              {/* Custom Timeline logs */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5" />
                  <span>Audit Logs & Repair Timelines</span>
                </span>
                <div className="p-4 rounded-xl border border-border bg-card shadow-premium">
                  <Timeline events={getTicketHistoryLogs(selectedTicket)} />
                </div>
              </div>

              {/* Comments Feed */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Technician Comments Feed ({selectedTicket.comments.length})
                </span>
                <div className="space-y-2.5">
                  {selectedTicket.comments.map((comm) => (
                    <div key={comm.id} className="p-3 bg-muted/20 border border-border rounded-xl space-y-1 relative">
                      <div className="flex items-center justify-between text-[10px] font-bold">
                        <span className="text-foreground">{comm.author}</span>
                        <span className="text-muted-foreground font-normal">{comm.date}</span>
                      </div>
                      <p className="text-muted-foreground text-xs leading-relaxed">{comm.text}</p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-1.5">
                  <Input
                    placeholder="Write a comment or update diagnostic notes..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="flex-1 bg-card"
                  />
                  <Button size="sm" onClick={handleAddComment} className="shadow-premium h-10 px-3">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </DrawerContent>
        )}
      </Drawer>

      {/* Raise Ticket Dialog Form */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md select-none text-left">
          <DialogHeader>
            <DialogTitle>Raise Maintenance Request Ticket</DialogTitle>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmitTicket)} className="space-y-4 pt-2">
            {/* Select Target Asset */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold tracking-wide text-foreground/80">Target Asset</label>
              <Controller
                name="assetId"
                control={form.control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full bg-card">
                      <SelectValue placeholder="Select Asset" />
                    </SelectTrigger>
                    <SelectContent className="z-[60]">
                      {assets.map((asset) => (
                        <SelectItem key={asset.id} value={asset.id}>
                          {asset.name} ({asset.tag})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.assetId && (
                <p className="text-xs text-destructive font-medium tracking-wide">
                  {form.formState.errors.assetId.message}
                </p>
              )}
            </div>

            <Input
              label="Ticket Title"
              placeholder="e.g. Screen Flickers or Broken Hinge"
              error={form.formState.errors.title?.message}
              {...form.register("title")}
            />

            <Input
              label="Description Summary"
              placeholder="Detailed explanation of error codes or physical wear..."
              error={form.formState.errors.description?.message}
              {...form.register("description")}
            />

            <div className="grid grid-cols-2 gap-4">
              {/* Priority */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold tracking-wide text-foreground/80">Priority</label>
                <Controller
                  name="priority"
                  control={form.control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full bg-card">
                        <SelectValue placeholder="Select Priority" />
                      </SelectTrigger>
                      <SelectContent className="z-[60]">
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Technician */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold tracking-wide text-foreground/80">Technician</label>
                <Controller
                  name="technicianName"
                  control={form.control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full bg-card">
                        <SelectValue placeholder="Assign Eng" />
                      </SelectTrigger>
                      <SelectContent className="z-[60]">
                        {employees.map((emp) => (
                          <SelectItem key={emp.id} value={emp.name}>
                            {emp.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.technicianName && (
                  <p className="text-xs text-destructive font-medium tracking-wide">
                    {form.formState.errors.technicianName.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Estimated Repair Cost ($)"
                placeholder="e.g. 150"
                type="number"
                error={form.formState.errors.estimatedCost?.message}
                {...form.register("estimatedCost", { valueAsNumber: true })}
              />
              <Input
                label="Required Spare Parts"
                placeholder="Parts list (comma separated)"
                error={form.formState.errors.spareParts?.message}
                {...form.register("spareParts")}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Raise Ticket
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
