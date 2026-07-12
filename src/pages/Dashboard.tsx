import { useQuery } from "@tanstack/react-query"
import {
  Sparkles,
  ShieldCheck,
  Wrench,
  ArrowLeftRight,
  PlusCircle,
  Calendar,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  BellRing,
} from "lucide-react"
import { getDashboardData } from "@/services/dashboard"
import MetricCard from "@/components/MetricCard"
import ChartCard from "@/components/ChartCard"
import StatusBadge from "@/components/StatusBadge"
import Timeline from "@/components/Timeline"
import CalendarCard from "@/components/CalendarCard"
import { Button } from "@/components/ui/Button"
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
} from "recharts"

export default function Dashboard() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboardData"],
    queryFn: getDashboardData,
  })

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse text-left">
        {/* Welcome Shimmer */}
        <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full" />
        {/* KPIs Shimmer */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          ))}
        </div>
        {/* Dashboard Grid Shimmer */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center select-none min-h-[50vh]">
        <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
        <h3 className="text-lg font-bold">Failed to load dashboard data</h3>
        <p className="text-sm text-muted-foreground mt-1 mb-6">Please check your configuration or refresh the page.</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    )
  }

  // Color variables for Pie Chart
  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"]
  const pieData = [
    { name: "Excellent", value: data.assetHealth.excellent },
    { name: "Good", value: data.assetHealth.good },
    { name: "Fair", value: data.assetHealth.fair },
    { name: "Critical", value: data.assetHealth.critical },
  ]

  return (
    <div className="space-y-6 text-left">
      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 md:p-8 shadow-premium select-none">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>System Status: {data.welcome.systemStatus}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
              Welcome back, {data.welcome.userName}!
            </h1>
            <p className="text-sm text-muted-foreground max-w-xl">
              You have <strong className="text-foreground font-semibold">{data.welcome.alertCount} items</strong> requiring immediate action today. General system components are fully operational.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="inline-flex items-center justify-center w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-semibold text-muted-foreground">Real-time sync active</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {data.kpis.map((kpi) => (
          <MetricCard
            key={kpi.key}
            title={kpi.title}
            value={kpi.value}
            trend={kpi.trend}
            icon={
              kpi.key === "total_assets" ? (
                <ShieldCheck className="w-5 h-5 text-primary" />
              ) : kpi.key === "allocated_assets" ? (
                <ArrowLeftRight className="w-5 h-5 text-primary" />
              ) : kpi.key === "maintenance_assets" ? (
                <Wrench className="w-5 h-5 text-primary" />
              ) : (
                <Sparkles className="w-5 h-5 text-primary" />
              )
            }
          />
        ))}
      </div>

      {/* Primary Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (span 2) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions & AI Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Quick Actions */}
            <div className="p-6 rounded-xl border border-border bg-card shadow-premium select-none space-y-4">
              <h3 className="font-semibold text-sm text-foreground tracking-tight uppercase tracking-wider text-muted-foreground">
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button className="flex flex-col items-center justify-center p-3 rounded-lg border border-border bg-muted/20 text-foreground hover:bg-muted transition-all text-center gap-2 group cursor-pointer shadow-premium">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                    <PlusCircle className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold">New Asset</span>
                </button>
                <button className="flex flex-col items-center justify-center p-3 rounded-lg border border-border bg-muted/20 text-foreground hover:bg-muted transition-all text-center gap-2 group cursor-pointer shadow-premium">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                    <ArrowLeftRight className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold">Transfer</span>
                </button>
                <button className="flex flex-col items-center justify-center p-3 rounded-lg border border-border bg-muted/20 text-foreground hover:bg-muted transition-all text-center gap-2 group cursor-pointer shadow-premium">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold">Maintenance</span>
                </button>
                <button className="flex flex-col items-center justify-center p-3 rounded-lg border border-border bg-muted/20 text-foreground hover:bg-muted transition-all text-center gap-2 group cursor-pointer shadow-premium">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold">Book Resource</span>
                </button>
              </div>
            </div>

            {/* AI Insights Card */}
            <div className="p-6 rounded-xl border border-border bg-card shadow-premium select-none space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl" />
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm text-foreground tracking-tight uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-amber-500 animate-pulse" />
                  <span>AI Insights</span>
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Insight Engine
                </span>
              </div>
              <div className="space-y-3 overflow-y-auto max-h-[168px] pr-1">
                {data.aiInsights.map((insight) => (
                  <div
                    key={insight.id}
                    className="p-2.5 rounded-lg border border-border bg-muted/30 text-xs flex gap-2 items-start hover:bg-muted/50 transition-colors"
                  >
                    <span className="text-amber-500 shrink-0 mt-0.5">✨</span>
                    <p className="text-muted-foreground leading-relaxed text-[11px]">
                      {insight.message}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Analytics Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Asset Health Card */}
            <ChartCard
              title="Asset Health Distribution"
              description="Inventory condition breakdown"
            >
              <div className="w-full h-full flex flex-col sm:flex-row items-center justify-around gap-4">
                <div className="w-44 h-44 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        innerRadius={60}
                        outerRadius={75}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {pieData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Custom Legend */}
                <div className="space-y-2 select-none w-full sm:w-auto">
                  {pieData.map((item, idx) => (
                    <div key={item.name} className="flex items-center justify-between sm:justify-start gap-4 sm:gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: COLORS[idx] }}
                        />
                        <span className="text-muted-foreground font-medium">{item.name}</span>
                      </div>
                      <span className="font-bold text-foreground">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </ChartCard>

            {/* Resource Utilization */}
            <ChartCard
              title="Resource Utilization Rate"
              description="Average utilization per asset type (%)"
            >
              <div className="w-full h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.utilization} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} unit="%" />
                    <RechartsTooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        borderColor: "hsl(var(--border))",
                        borderRadius: "var(--radius)",
                        fontSize: "11px",
                      }}
                    />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={28}>
                      {data.utilization.map((_, index) => (
                        <Cell key={`cell-${index}`} fill="hsl(var(--primary))" fillOpacity={0.85 + (index % 2 === 0 ? 0.15 : 0)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>

          {/* Department Usage Table */}
          <div className="p-6 rounded-xl border border-border bg-card shadow-premium select-none space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-4">
              <div className="space-y-1">
                <h3 className="font-semibold text-foreground tracking-tight">Departmental Usage & Financials</h3>
                <p className="text-xs text-muted-foreground">Asset allocation counts and capital expenditure values</p>
              </div>
              <Button variant="outline" size="sm" className="gap-1 text-xs">
                View Allocation Audit <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/50 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 px-3">Department</th>
                    <th className="py-2.5 px-3 text-right">Assets Assigned</th>
                    <th className="py-2.5 px-3 text-right">Capital Value</th>
                    <th className="py-2.5 px-3 text-right">Budget Allocation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30 text-xs">
                  {data.departmentUsage.map((dept) => (
                    <tr key={dept.department} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-3 font-semibold text-foreground">{dept.department}</td>
                      <td className="py-3 px-3 text-right font-medium text-muted-foreground">{dept.assets}</td>
                      <td className="py-3 px-3 text-right font-bold text-foreground">
                        ${dept.cost.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 h-1.5 rounded-full bg-secondary overflow-hidden hidden sm:block">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${Math.min((dept.cost / 150000) * 100, 100)}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-muted-foreground">
                            {Math.round((dept.cost / 324000) * 100)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pending Transfers & Upcoming Returns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pending Transfers */}
            <div className="p-6 rounded-xl border border-border bg-card shadow-premium select-none space-y-4">
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <h3 className="font-semibold text-sm text-foreground tracking-tight uppercase tracking-wider text-muted-foreground">
                  Pending Transfers
                </h3>
                <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  {data.pendingTransfers.length} Actionable
                </span>
              </div>
              <div className="space-y-3">
                {data.pendingTransfers.map((trf) => (
                  <div
                    key={trf.id}
                    className="p-3 rounded-lg border border-border bg-muted/10 flex flex-col gap-2 hover:bg-muted/20 transition-colors text-xs"
                  >
                    <div className="flex items-start justify-between font-semibold">
                      <span className="text-foreground truncate">{trf.assetName}</span>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">{trf.tag}</span>
                    </div>
                    <div className="flex justify-between items-center gap-4 text-[10px]">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <span className="font-medium text-foreground">{trf.fromDepartment}</span>
                        <span>➔</span>
                        <span className="font-medium text-primary">{trf.toDepartment}</span>
                      </div>
                      <span className="text-muted-foreground italic truncate">By {trf.requester}</span>
                    </div>
                    <div className="flex items-center gap-2 justify-end pt-1">
                      <Button variant="ghost" size="sm" className="h-7 text-[10px] px-2">
                        Deny
                      </Button>
                      <Button variant="primary" size="sm" className="h-7 text-[10px] px-2.5">
                        Approve
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Returns */}
            <div className="p-6 rounded-xl border border-border bg-card shadow-premium select-none space-y-4">
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <h3 className="font-semibold text-sm text-foreground tracking-tight uppercase tracking-wider text-muted-foreground">
                  Upcoming Returns
                </h3>
                <span className="text-[10px] font-bold bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded-full">
                  {data.upcomingReturns.length} Scheduled
                </span>
              </div>
              <div className="space-y-3">
                {data.upcomingReturns.map((ret) => (
                  <div
                    key={ret.id}
                    className="p-3 rounded-lg border border-border bg-muted/10 flex flex-col gap-2 hover:bg-muted/20 transition-colors text-xs"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-0.5">
                        <span className="font-semibold text-foreground block truncate">{ret.assetName}</span>
                        <span className="text-[10px] text-muted-foreground block">{ret.tag} • {ret.employee}</span>
                      </div>
                      {ret.status === "overdue" ? (
                        <span className="text-[10px] font-bold text-destructive bg-destructive/10 px-1.5 py-0.5 rounded border border-destructive/10 uppercase tracking-wider animate-pulse">
                          Overdue
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-sky-600 bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/10 uppercase tracking-wider">
                          Pending
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between items-center text-[10px] border-t border-border/30 pt-2 text-muted-foreground">
                      <span>Due date:</span>
                      <span className="font-semibold text-foreground">{ret.dueDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (span 1) */}
        <div className="space-y-6">
          {/* Calendar Widget */}
          <CalendarCard />

          {/* Recent Activity Timeline */}
          <div className="p-6 rounded-xl border border-border bg-card shadow-premium select-none space-y-4">
            <h3 className="font-semibold text-sm text-foreground tracking-tight uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-3">
              Recent Activity
            </h3>
            <Timeline events={data.activity} />
          </div>

          {/* Pending Maintenance */}
          <div className="p-6 rounded-xl border border-border bg-card shadow-premium select-none space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="font-semibold text-sm text-foreground tracking-tight uppercase tracking-wider text-muted-foreground">
                Pending Maintenance
              </h3>
              <span className="text-[10px] font-bold bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded-full">
                {data.pendingMaintenance.length} Open
              </span>
            </div>
            <div className="space-y-3">
              {data.pendingMaintenance.map((maint) => (
                <div
                  key={maint.id}
                  className="p-3 rounded-lg border border-border bg-muted/10 flex flex-col gap-2 hover:bg-muted/20 transition-colors text-xs"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-0.5">
                      <span className="font-semibold text-foreground block truncate">{maint.assetName}</span>
                      <span className="text-[10px] text-muted-foreground block">{maint.tag}</span>
                    </div>
                    <StatusBadge status={maint.priority} />
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed italic pr-1">
                    "{maint.issue}"
                  </p>
                  <div className="flex justify-between items-center text-[10px] border-t border-border/30 pt-2 text-muted-foreground">
                    <span>Technician:</span>
                    <span className="font-semibold text-foreground">{maint.technician}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Notifications Feed */}
          <div className="p-6 rounded-xl border border-border bg-card shadow-premium select-none space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="font-semibold text-sm text-foreground tracking-tight uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <BellRing className="w-4 h-4 text-primary" />
                <span>Alerts Feed</span>
              </h3>
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            </div>
            <div className="space-y-3">
              <div className="text-xs p-3 rounded-lg border border-border/50 hover:bg-muted/10 cursor-pointer flex items-start gap-2.5 text-left transition-colors">
                <span className="text-sky-500 mt-0.5">ℹ️</span>
                <div>
                  <span className="font-semibold text-foreground block">System Backup Success</span>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                    Database snapshot captured and backed up to secondary storage node.
                  </p>
                </div>
              </div>
              <div className="text-xs p-3 rounded-lg border border-border/50 hover:bg-muted/10 cursor-pointer flex items-start gap-2.5 text-left transition-colors">
                <span className="text-amber-500 mt-0.5">⚠️</span>
                <div>
                  <span className="font-semibold text-foreground block">Server rack temperature spike</span>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                    Sensors in rack 4B reported 29°C (normal: 21-24°C). Technician notified.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
