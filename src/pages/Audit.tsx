import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  CheckSquare,
  Activity,
  MapPinOff,
  RefreshCw,
  Camera,
} from "lucide-react"

import { getActiveAudit, toggleChecklistItem, resolveLocationMismatch, scanAndVerifyAsset } from "@/services/audits"
import { getAssets } from "@/services/assets"
import type { AuditRun } from "@/types/audits"
import { useToast } from "@/hooks/useToast"

// Reusable components
import PageHeader from "@/components/PageHeader"
import MetricCard from "@/components/MetricCard"
import ProgressCard from "@/components/ProgressCard"
import Timeline from "@/components/Timeline"
import type { TimelineEvent } from "@/components/Timeline"

// UI Primitives
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/Dialog"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/Select"

export default function Audit() {
  const { toast } = useToast()

  // Local State representing audit run state in real-time
  const [audit, setAudit] = useState<AuditRun | null>(null)
  const [isScanOpen, setIsScanOpen] = useState(false)
  const [scanAssetId, setScanAssetId] = useState("")

  // API Queries
  const { data: initialAudit, isLoading: loadingAudit } = useQuery({
    queryKey: ["activeAuditRun"],
    queryFn: getActiveAudit,
  })

  const { data: assets = [] } = useQuery({
    queryKey: ["assetsList"],
    queryFn: getAssets,
  })

  useEffect(() => {
    if (initialAudit) {
      setAudit(initialAudit)
    }
  }, [initialAudit])

  // Checklist Item Toggle
  const handleToggleChecklist = async (itemId: string) => {
    if (!audit) return
    const targetItem = audit.checklist.find((item) => item.id === itemId)
    if (!targetItem) return

    await toggleChecklistItem(itemId, !targetItem.checked)

    const updatedChecklist = audit.checklist.map((item) =>
      item.id === itemId ? { ...item, checked: !item.checked } : item
    )

    setAudit({
      ...audit,
      checklist: updatedChecklist,
    })

    toast({
      title: "Checklist Saved",
      description: "Audit action item status synchronized.",
      type: "success",
    })
  }

  // Resolve Location Mismatch (updates actual database state & clears discrepancy)
  const handleResolveMismatch = async (mismatchId: string) => {
    if (!audit) return

    const matched = audit.locationMismatches.find((m) => m.id === mismatchId)
    if (!matched) return

    await resolveLocationMismatch(mismatchId)

    // Update checklist/counts
    const updatedMismatches = audit.locationMismatches.filter((m) => m.id !== mismatchId)
    const verifiedIncrement = audit.verifiedAssets + 1

    setAudit({
      ...audit,
      verifiedAssets: verifiedIncrement,
      progress: Math.round((verifiedIncrement / audit.totalAssets) * 100),
      locationMismatches: updatedMismatches,
    })

    toast({
      title: "Location Discrepancy Resolved",
      description: `Asset ${matched.name} location updated to: "${matched.actualLocation}".`,
      type: "success",
    })
  }

  // Trigger Mock QR Scan Verification
  const handleSimulateScan = async () => {
    if (!audit || !scanAssetId) return

    const targetAsset = assets.find((a) => a.id === scanAssetId)
    if (!targetAsset) return

    setIsScanOpen(false)

    // Check if it already exists as missing
    const isMissing = audit.missingAssets.some((m) => m.id === scanAssetId)

    if (isMissing) {
      // Restore from missing (let's verify it)
      const res = await scanAndVerifyAsset(scanAssetId)
      const updatedMissing = audit.missingAssets.filter((m) => m.id !== scanAssetId)
      const verifiedIncrement = audit.verifiedAssets + 1
      setAudit({
        ...audit,
        verifiedAssets: verifiedIncrement,
        progress: Math.round((verifiedIncrement / audit.totalAssets) * 100),
        missingAssets: updatedMissing,
      })

      toast({
        title: "Asset Found & Verified",
        description: res.message,
        type: "success",
      })
      setScanAssetId("")
      return
    }

    const res = await scanAndVerifyAsset(scanAssetId)
    if (res.status === "mismatch") {
      // Refresh active audit values to capture mismatch
      const freshAudit = await getActiveAudit()
      setAudit(freshAudit)
      toast({
        title: "Discrepancy Triggered",
        description: res.message,
        type: "warning",
      })
    } else {
      const verifiedIncrement = audit.verifiedAssets + 1
      setAudit({
        ...audit,
        verifiedAssets: verifiedIncrement,
        progress: Math.round((verifiedIncrement / audit.totalAssets) * 100),
      })

      toast({
        title: "Asset Verified",
        description: res.message,
        type: "success",
      })
    }

    setScanAssetId("")
  }

  // Compile audit timelines
  const getAuditTimelines = (): TimelineEvent[] => {
    if (!audit) return []
    return [
      { id: "au-1", title: "Audit Verification Ping", subtitle: "Scanned and verified 12 assets", description: "Checked by " + audit.auditor, date: audit.auditDate, status: "success" },
      { id: "au-2", title: "Discrepancy Detected", subtitle: "Herman Miller chair reported missing", description: "Flagged under missing logs", date: audit.auditDate, status: "danger" },
      { id: "au-3", title: "Location Mismatch Detected", subtitle: "Oculus VR headset scanned in Block A", description: "Expected location: Tech Lab", date: audit.auditDate, status: "warning" },
      { id: "au-4", title: "Audit Runs Initialized", subtitle: "Q3 Head Office verification open", description: "Authorized cost center CC-101", date: audit.auditDate, status: "primary" },
    ]
  }

  if (loadingAudit || !audit) {
    return (
      <div className="space-y-6 text-left py-12">
        <div className="h-8 bg-muted w-1/4 animate-pulse rounded" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="h-24 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 text-left select-none pb-12">
      {/* Title */}
      <PageHeader
        title="Audit & Compliance"
        description="Verify inventory coordinates, flag discrepancies, and generate compliance checklists"
        actions={
          <Button size="sm" onClick={() => setIsScanOpen(true)} className="shadow-premium gap-1.5 text-xs">
            <QrCode className="w-4.5 h-4.5" />
            <span>Simulate Scan</span>
          </Button>
        }
      />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard
          title="Total Assets to Verify"
          value={audit.totalAssets}
          icon={<CheckSquare className="w-5 h-5" />}
        />
        <MetricCard
          title="Verified Assets Count"
          value={audit.verifiedAssets}
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />}
          trend={{ value: audit.progress, label: "audit progress", isPositive: true }}
        />
        <MetricCard
          title="Discovered Missing"
          value={audit.missingAssets.length}
          icon={<AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />}
        />
        <MetricCard
          title="Location Mismatches"
          value={audit.locationMismatches.length}
          icon={<MapPinOff className="w-5 h-5 text-amber-500" />}
        />
      </div>

      {/* Stepper Progress bar */}
      <ProgressCard
        title="Audit Accomplishment Completion Curve"
        value={audit.progress}
        className="shadow-premium"
      />

      {/* Main grids split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Columns: check lists & Mismatch discrepancies */}
        <div className="lg:col-span-2 space-y-6">
          {/* Physical Verification Checklist */}
          <div className="p-6 rounded-xl border border-border bg-card shadow-premium space-y-4">
            <h3 className="font-semibold text-sm text-foreground tracking-tight uppercase tracking-wider text-muted-foreground">
              Audit Progress Checklist
            </h3>
            <div className="space-y-3.5 pt-2">
              {audit.checklist.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleToggleChecklist(item.id)}
                  className="flex items-start gap-3.5 p-3 rounded-lg border border-border bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer text-xs"
                >
                  <input
                    type="checkbox"
                    checked={item.checked}
                    readOnly
                    className="rounded border-input text-primary focus:ring-primary w-4.5 h-4.5 cursor-pointer mt-0.5"
                  />
                  <span className={`font-semibold leading-relaxed ${item.checked ? "line-through text-muted-foreground/60" : "text-foreground"}`}>
                    {item.item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Mismatch Exception reports */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-foreground tracking-tight uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <MapPinOff className="w-4.5 h-4.5 text-amber-500" />
              <span>Location Discrepancies Reports</span>
            </h3>

            {audit.locationMismatches.length === 0 ? (
              <div className="p-6 border border-dashed border-border bg-card rounded-xl text-center text-xs text-muted-foreground">
                No active location mismatches detected.
              </div>
            ) : (
              audit.locationMismatches.map((mis) => (
                <div key={mis.id} className="p-4 rounded-xl border border-border bg-card shadow-premium space-y-3 hover:shadow-md transition-all text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground text-sm block">
                      {mis.name} ({mis.tag})
                    </span>
                    <Badge variant="warning">Location Mismatch</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-b border-border/60 py-3 text-muted-foreground">
                    <div className="space-y-0.5">
                      <span>Expected Location</span>
                      <p className="font-semibold text-foreground">{mis.expectedLocation}</p>
                    </div>
                    <div className="space-y-0.5">
                      <span>Detected Actual Location</span>
                      <p className="font-bold text-amber-600 dark:text-amber-400">{mis.actualLocation}</p>
                    </div>
                    <div className="space-y-0.5">
                      <span>Active Custody Holder</span>
                      <p className="font-semibold text-foreground">{mis.holder}</p>
                    </div>
                    <div className="space-y-0.5">
                      <span>Detection Log Date</span>
                      <p className="font-mono">{mis.dateDetected}</p>
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <Button size="sm" className="h-8 text-[11px] shadow-premium gap-1" onClick={() => handleResolveMismatch(mis.id)}>
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Approve Relocation</span>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Missing Assets Exceptions */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-foreground tracking-tight uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <ShieldAlert className="w-4.5 h-4.5 text-red-500 animate-pulse" />
              <span>Missing Assets Exception Reports</span>
            </h3>

            {audit.missingAssets.length === 0 ? (
              <div className="p-6 border border-dashed border-border bg-card rounded-xl text-center text-xs text-muted-foreground">
                No active missing assets reported. All clean.
              </div>
            ) : (
              audit.missingAssets.map((mis) => (
                <div key={mis.id} className="p-4 rounded-xl border border-border bg-card shadow-premium space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground text-sm block">
                      {mis.name} ({mis.tag})
                    </span>
                    <Badge variant="danger">Missing / Unresolved</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-border/60 pt-3 text-muted-foreground">
                    <div className="space-y-0.5">
                      <span>Expected Location</span>
                      <p className="font-semibold text-foreground">{mis.expectedLocation}</p>
                    </div>
                    <div className="space-y-0.5">
                      <span>Reported By</span>
                      <p className="font-semibold text-foreground">{mis.reportedMissingBy}</p>
                    </div>
                    <div className="space-y-0.5 col-span-2">
                      <span>Incidence Date</span>
                      <p className="font-mono block">{mis.dateLogged}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Columns: QR Scanner Mock Frame & Audit timelines */}
        <div className="space-y-6">
          {/* Scanner mock view */}
          <div className="p-6 rounded-xl border border-border bg-card shadow-premium space-y-4 relative overflow-hidden">
            <h3 className="font-semibold text-sm text-foreground tracking-tight uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Camera className="w-4.5 h-4.5 text-primary animate-pulse" />
              <span>Verifying Camera Scanner Overlay</span>
            </h3>

            {/* Dark mock scanner lens overlay */}
            <div className="w-full h-48 rounded-xl bg-neutral-900 border-2 border-primary/40 relative flex items-center justify-center overflow-hidden shadow-inner">
              {/* Corner brackets */}
              <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-primary" />
              <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-primary" />
              <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-primary" />
              <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-primary" />

              {/* Scanning red line */}
              <div className="absolute left-0 w-full h-0.5 bg-red-500 top-1/2 -translate-y-1/2 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-bounce" />

              <div className="text-center space-y-2 z-10 select-none">
                <QrCode className="w-10 h-10 text-primary-foreground/45 mx-auto" />
                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Camera Scan Viewport Active</p>
              </div>
            </div>

            <Button size="sm" className="w-full h-10 shadow-premium gap-1.5" onClick={() => setIsScanOpen(true)}>
              <QrCode className="w-4.5 h-4.5" />
              <span>Scan QR Code Tag</span>
            </Button>
          </div>

          {/* Audit log Timelines */}
          <div className="p-6 rounded-xl border border-border bg-card shadow-premium space-y-4">
            <h3 className="font-semibold text-sm text-foreground tracking-tight uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <Activity className="w-4.5 h-4.5 text-primary" />
              <span>Audit Run Actions logs</span>
            </h3>
            <div className="pr-1 max-h-[350px] overflow-y-auto">
              <Timeline events={getAuditTimelines()} />
            </div>
          </div>
        </div>
      </div>

      {/* Simulate QR Scan Dialog Selection */}
      <Dialog open={isScanOpen} onOpenChange={setIsScanOpen}>
        <DialogContent className="max-w-md select-none text-left">
          <DialogHeader>
            <DialogTitle>Simulate QR Code Scan</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Select an asset from the registered inventory database to simulate scanning its barcode using the active camera lens.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold tracking-wide text-foreground/80">Choose Asset to Scan</label>
              <Select value={scanAssetId} onValueChange={setScanAssetId}>
                <SelectTrigger className="w-full bg-card">
                  <SelectValue placeholder="Select Asset for Scan Simulation" />
                </SelectTrigger>
                <SelectContent className="z-[60]">
                  {assets.map((asset) => (
                    <SelectItem key={asset.id} value={asset.id}>
                      {asset.name} ({asset.tag}) - Loc: {asset.location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsScanOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSimulateScan} disabled={!scanAssetId}>
              Verify Scan Trigger
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
