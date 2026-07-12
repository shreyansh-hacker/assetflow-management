import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import {
  Download,
  Calendar,
  Filter,
  TrendingUp,
  Percent,
  Wrench,
  FileText,
  Database,
} from "lucide-react"

import { getExecutiveReports } from "@/services/reports"
import type { ExecutiveReportData } from "@/types/reports"
import { getDepartments } from "@/services/organization"
import { getCategories } from "@/services/organization"
import { useToast } from "@/hooks/useToast"

// Reusable components
import PageHeader from "@/components/PageHeader"
import MetricCard from "@/components/MetricCard"

// UI Primitives
import { Button } from "@/components/ui/Button"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/Select"

export default function Reports() {
  const { toast } = useToast()

  // Filters State
  const [selectedDept, setSelectedDept] = useState("all")
  const [selectedCat, setSelectedCat] = useState("all")
  const [startDate, setStartDate] = useState("2026-01-01")
  const [endDate, setEndDate] = useState("2026-07-12")

  // Local State representing reports dataset
  const [reportData, setReportData] = useState<ExecutiveReportData | null>(null)

  // API Queries
  const { data: initialReports, isLoading: loadingReports } = useQuery({
    queryKey: ["executiveReportsData"],
    queryFn: getExecutiveReports,
  })

  const { data: departments = [] } = useQuery({
    queryKey: ["deptsData"],
    queryFn: getDepartments,
  })

  const { data: categories = [] } = useQuery({
    queryKey: ["catsData"],
    queryFn: getCategories,
  })

  useEffect(() => {
    if (initialReports) {
      setReportData(initialReports)
    }
  }, [initialReports])

  // Mock Export CSV
  const handleExportCSV = () => {
    toast({
      title: "Generating CSV Sheet",
      description: "Data records compiling. Your CSV download will start shortly.",
      type: "success",
    })
  }

  // Mock Export PDF
  const handleExportPDF = () => {
    toast({
      title: "Compiling PDF Report",
      description: "Rendering document layout pages. PDF download will start shortly.",
      type: "success",
    })
  }

  if (loadingReports || !reportData) {
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

  // Colors palette for Pie Chart stages
  const PIE_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"]

  return (
    <div className="space-y-6 text-left select-none pb-12">
      {/* Title */}
      <PageHeader
        title="Executive Reports & Analytics"
        description="Review financial depreciation, technician SLA costs, and departmental equipment quotas"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCSV} className="shadow-premium gap-1 text-xs">
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </Button>
            <Button size="sm" onClick={handleExportPDF} className="shadow-premium gap-1 text-xs">
              <Download className="w-4 h-4" />
              <span>Export PDF Summary</span>
            </Button>
          </div>
        }
      />

      {/* Filter panel */}
      <div className="p-4 rounded-xl border border-border bg-card shadow-premium space-y-4">
        <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
          <Filter className="w-4 h-4 text-primary" />
          <span>Report Filtration Parameters</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          {/* Dept */}
          <div className="space-y-1.5">
            <label className="font-semibold text-foreground/80">Department Sector</label>
            <Select value={selectedDept} onValueChange={setSelectedDept}>
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

          {/* Category */}
          <div className="space-y-1.5">
            <label className="font-semibold text-foreground/80">Asset Category</label>
            <Select value={selectedCat} onValueChange={setSelectedCat}>
              <SelectTrigger className="w-full bg-card h-9">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.name}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Start Date */}
          <div className="space-y-1.5">
            <label className="font-semibold text-foreground/80 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Start Date</span>
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full h-9 rounded-lg border border-input bg-card px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary text-xs"
            />
          </div>

          {/* End Date */}
          <div className="space-y-1.5">
            <label className="font-semibold text-foreground/80 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
              <span>End Date</span>
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full h-9 rounded-lg border border-input bg-card px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary text-xs"
            />
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard
          title="Total Capital Cost"
          value={`$${reportData.kpis.totalValue.toLocaleString()}`}
          icon={<Database className="w-5 h-5 text-blue-500" />}
        />
        <MetricCard
          title="Active Asset Valuation"
          value={`$${reportData.kpis.depreciatedValue.toLocaleString()}`}
          icon={<TrendingUp className="w-5 h-5 text-emerald-500" />}
          trend={{ value: 66, label: "retained valuation", isPositive: true }}
        />
        <MetricCard
          title="Active Utilization Rate"
          value={`${reportData.kpis.activeUtilizationRate}%`}
          icon={<Percent className="w-5 h-5 text-amber-500" />}
        />
        <MetricCard
          title="Total Repair Costs"
          value={`$${reportData.kpis.maintenanceCosts.toLocaleString()}`}
          icon={<Wrench className="w-5 h-5 text-red-500 animate-pulse" />}
        />
      </div>

      {/* Row 1 Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cost trends */}
        <div className="lg:col-span-2 p-6 border border-border bg-card rounded-xl shadow-premium space-y-4 flex flex-col justify-between h-[350px]">
          <div>
            <h4 className="font-semibold text-sm text-foreground">Maintenance Cost Trends (2026)</h4>
            <p className="text-xs text-muted-foreground">Preventative vs Corrective engineering fees in USD</p>
          </div>
          <div className="flex-1 min-h-0 pt-2 text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={reportData.maintenanceCostTrends}>
                <defs>
                  <linearGradient id="colorCorrective" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorPreventative" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }} />
                <Legend />
                <Area type="monotone" dataKey="corrective" name="Corrective Repair" stroke="#ef4444" fillOpacity={1} fill="url(#colorCorrective)" />
                <Area type="monotone" dataKey="preventative" name="Preventative Calibrations" stroke="#3b82f6" fillOpacity={1} fill="url(#colorPreventative)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie lifecycle */}
        <div className="p-6 border border-border bg-card rounded-xl shadow-premium space-y-4 flex flex-col justify-between h-[350px]">
          <div>
            <h4 className="font-semibold text-sm text-foreground">Asset Lifecycle Overview</h4>
            <p className="text-xs text-muted-foreground">Distribution of active assets across stages</p>
          </div>
          <div className="flex-1 min-h-0 flex items-center justify-center pt-2 text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={reportData.lifecycleOverview}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  nameKey="stage"
                >
                  {reportData.lifecycleOverview.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }} />
                <Legend layout="horizontal" align="center" verticalAlign="bottom" wrapperStyle={{ fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2 Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Asset Depreciation */}
        <div className="p-6 border border-border bg-card rounded-xl shadow-premium space-y-4 flex flex-col justify-between h-[350px]">
          <div>
            <h4 className="font-semibold text-sm text-foreground">Depreciation per Category</h4>
            <p className="text-xs text-muted-foreground">Capital value vs current depreciated value</p>
          </div>
          <div className="flex-1 min-h-0 pt-2 text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reportData.depreciationSummary} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} />
                <YAxis dataKey="category" type="category" stroke="hsl(var(--muted-foreground))" fontSize={9} tickLine={false} width={80} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }} />
                <Legend />
                <Bar dataKey="originalCost" name="Original Cost" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                <Bar dataKey="depreciatedValue" name="Current Value" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dept utilization */}
        <div className="lg:col-span-2 p-6 border border-border bg-card rounded-xl shadow-premium space-y-4 flex flex-col justify-between h-[350px]">
          <div>
            <h4 className="font-semibold text-sm text-foreground">Department Allocation Quota</h4>
            <p className="text-xs text-muted-foreground">Allocated assets vs total pool limits</p>
          </div>
          <div className="flex-1 min-h-0 pt-2 text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reportData.utilizationByDepartment}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="department" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }} />
                <Legend />
                <Bar dataKey="total" name="Total Pool Quota" fill="rgba(59, 130, 246, 0.2)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="allocated" name="Currently Allocated" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3 widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Booking activity */}
        <div className="lg:col-span-2 p-6 border border-border bg-card rounded-xl shadow-premium space-y-4 flex flex-col justify-between h-[300px]">
          <div>
            <h4 className="font-semibold text-sm text-foreground">Weekly Booking slots volume</h4>
            <p className="text-xs text-muted-foreground">Booking heatmap distribution counts</p>
          </div>
          <div className="flex-1 min-h-0 pt-2 text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reportData.bookingHeatmap}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }} />
                <Bar dataKey="slotsBooked" name="Slots Booked" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent reports list */}
        <div className="p-6 border border-border bg-card rounded-xl shadow-premium space-y-4 flex flex-col justify-between h-[300px]">
          <div>
            <h4 className="font-semibold text-sm text-foreground">Generated Audit Reports</h4>
            <p className="text-xs text-muted-foreground">Download or view recent compliance evaluations</p>
          </div>
          <div className="flex-1 overflow-y-auto pr-1 space-y-3 pt-2">
            {reportData.recentReports.map((rep) => (
              <div
                key={rep.id}
                onClick={handleExportPDF}
                className="p-3 bg-muted/20 border border-border hover:bg-muted/40 transition-colors rounded-xl flex items-center justify-between text-xs cursor-pointer shadow-premium"
              >
                <div className="flex items-center gap-2.5 truncate pr-4">
                  <FileText className="w-4.5 h-4.5 text-primary shrink-0" />
                  <div className="truncate">
                    <span className="font-semibold text-foreground block leading-tight truncate">{rep.title}</span>
                    <span className="text-[10px] text-muted-foreground block">{rep.date} • {rep.type}</span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
