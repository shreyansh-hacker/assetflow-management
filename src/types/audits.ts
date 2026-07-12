export interface AuditChecklist {
  id: string
  item: string
  checked: boolean
}

export interface MissingAssetEvent {
  id: string
  name: string
  tag: string
  expectedLocation: string
  reportedMissingBy: string
  dateLogged: string
}

export interface LocationMismatchEvent {
  id: string
  name: string
  tag: string
  expectedLocation: string
  actualLocation: string
  holder: string
  dateDetected: string
}

export interface AuditRun {
  id: string
  title: string
  status: "in_progress" | "completed"
  auditor: string
  auditDate: string
  totalAssets: number
  verifiedAssets: number
  progress: number
  missingAssets: MissingAssetEvent[]
  locationMismatches: LocationMismatchEvent[]
  checklist: AuditChecklist[]
}

export interface AuditDatabase {
  activeAudit: AuditRun
  pastAudits: Omit<AuditRun, "missingAssets" | "locationMismatches" | "checklist">[]
}
