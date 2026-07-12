import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Bell,
  CheckCheck,
  ChevronRight,
  AlertOctagon,
  Wrench,
  ArrowLeftRight,
  ShieldCheck,
  Calendar,
  Info,
} from "lucide-react"

import { getNotifications, markNotificationRead, markAllNotificationsRead } from "@/services/notifications"
import type { NotificationItem, NotificationCategoryType } from "@/types/notifications"
import { useToast } from "@/hooks/useToast"

// Reusable components
import PageHeader from "@/components/PageHeader"
import SearchBar from "@/components/SearchBar"

// UI Primitives
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/Drawer"

export default function Notifications() {
  const { toast } = useToast()

  // Local State representing notifications database
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [activeTab, setActiveTab] = useState<NotificationCategoryType>("all")
  const [searchQuery, setSearchQuery] = useState("")

  // Drawer Preview
  const [previewNotification, setPreviewNotification] = useState<NotificationItem | null>(null)

  // API Queries
  const { data: initialNotifications = [], isLoading: loadingNotifications } = useQuery({
    queryKey: ["notificationsData"],
    queryFn: getNotifications,
  })

  useEffect(() => {
    if (initialNotifications.length > 0) {
      setNotifications(initialNotifications)
    }
  }, [initialNotifications])

  // Mark single as read
  const handleMarkAsRead = async (id: string) => {
    await markNotificationRead(id)
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    )
  }

  // Mark all as read
  const handleMarkAllRead = async () => {
    await markAllNotificationsRead()
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    toast({
      title: "Inbox Cleared",
      description: "Successfully marked all notifications as read.",
      type: "success",
    })
  }

  // Preview click handler
  const handlePreviewClick = (item: NotificationItem) => {
    setPreviewNotification(item)
    handleMarkAsRead(item.id)
  }

  // Icon selector based on category
  const getCategoryIcon = (category: string, priority: string) => {
    if (priority === "critical" || priority === "high") {
      return <AlertOctagon className="w-4.5 h-4.5 text-red-500 animate-pulse" />
    }
    if (category === "maintenance") return <Wrench className="w-4.5 h-4.5 text-amber-500" />
    if (category === "transfer") return <ArrowLeftRight className="w-4.5 h-4.5 text-blue-500" />
    if (category === "audit") return <ShieldCheck className="w-4.5 h-4.5 text-emerald-500" />
    if (category === "booking") return <Calendar className="w-4.5 h-4.5 text-purple-500" />
    return <Info className="w-4.5 h-4.5 text-muted-foreground" />
  }

  // Priority badge formatter
  const getPriorityBadge = (p: string) => {
    if (p === "critical") return <Badge variant="danger">Critical</Badge>
    if (p === "high") return <Badge variant="warning">High Warning</Badge>
    if (p === "medium") return <Badge variant="outline" className="border-blue-500/50 text-blue-500 bg-blue-500/5">Medium</Badge>
    return <Badge variant="outline">Info</Badge>
  }

  // Filter & Search Logic
  const filteredNotifications = notifications.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.message.toLowerCase().includes(searchQuery.toLowerCase())

    if (activeTab === "all") return matchesSearch
    if (activeTab === "alerts") return matchesSearch && !n.isRead
    return matchesSearch && n.category === activeTab
  })

  // Count helper for badge indicators
  const getUnreadCount = (cat: NotificationCategoryType) => {
    if (cat === "all") return notifications.filter((n) => !n.isRead).length
    if (cat === "alerts") return notifications.filter((n) => !n.isRead).length
    return notifications.filter((n) => n.category === cat && !n.isRead).length
  }

  return (
    <div className="space-y-6 text-left select-none pb-12">
      {/* Title */}
      <PageHeader
        title="Notification Center"
        description="Verify system audit flags, asset transfer confirmations, and technical repair approvals"
        actions={
          <Button variant="outline" size="sm" onClick={handleMarkAllRead} className="shadow-premium gap-1 text-xs">
            <CheckCheck className="w-4 h-4" />
            <span>Mark All Read</span>
          </Button>
        }
      />

      {/* Tabs list folder bar */}
      <div className="flex border-b border-border/80 pb-px gap-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab("all")}
          className={`flex items-center gap-2 pb-3 text-sm font-semibold tracking-wide border-b-2 transition-all duration-200 cursor-pointer shrink-0 ${
            activeTab === "all"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Bell className="w-4.5 h-4.5" />
          <span>All Notifications</span>
          {getUnreadCount("all") > 0 && (
            <span className="text-[10px] bg-primary text-primary-foreground font-bold px-1.5 py-0.2 rounded-full">
              {getUnreadCount("all")}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("alerts")}
          className={`flex items-center gap-2 pb-3 text-sm font-semibold tracking-wide border-b-2 transition-all duration-200 cursor-pointer shrink-0 ${
            activeTab === "alerts"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <AlertOctagon className="w-4.5 h-4.5" />
          <span>Unread / Alerts</span>
          {getUnreadCount("alerts") > 0 && (
            <span className="text-[10px] bg-red-500 text-white font-bold px-1.5 py-0.2 rounded-full">
              {getUnreadCount("alerts")}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("maintenance")}
          className={`flex items-center gap-2 pb-3 text-sm font-semibold tracking-wide border-b-2 transition-all duration-200 cursor-pointer shrink-0 ${
            activeTab === "maintenance"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Wrench className="w-4.5 h-4.5" />
          <span>Maintenance</span>
        </button>

        <button
          onClick={() => setActiveTab("booking")}
          className={`flex items-center gap-2 pb-3 text-sm font-semibold tracking-wide border-b-2 transition-all duration-200 cursor-pointer shrink-0 ${
            activeTab === "booking"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Calendar className="w-4.5 h-4.5" />
          <span>Bookings</span>
        </button>

        <button
          onClick={() => setActiveTab("audit")}
          className={`flex items-center gap-2 pb-3 text-sm font-semibold tracking-wide border-b-2 transition-all duration-200 cursor-pointer shrink-0 ${
            activeTab === "audit"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <ShieldCheck className="w-4.5 h-4.5" />
          <span>Audits</span>
        </button>

        <button
          onClick={() => setActiveTab("transfer")}
          className={`flex items-center gap-2 pb-3 text-sm font-semibold tracking-wide border-b-2 transition-all duration-200 cursor-pointer shrink-0 ${
            activeTab === "transfer"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <ArrowLeftRight className="w-4.5 h-4.5" />
          <span>Transfers</span>
        </button>
      </div>

      {/* Search */}
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search notifications by title, contents, serial tags..."
      />

      {/* Notifications List */}
      <div className="space-y-3.5 pb-10">
        {loadingNotifications && notifications.length === 0 ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="h-16 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-border bg-card rounded-xl text-xs text-muted-foreground">
            No notifications in this folder view.
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handlePreviewClick(notif)}
              className={`p-4 rounded-xl border transition-all flex items-center justify-between text-xs cursor-pointer shadow-premium hover:shadow-md hover:scale-[1.005] ${
                notif.isRead
                  ? "border-border bg-card/60 opacity-70"
                  : "border-primary/20 bg-primary/[0.01] dark:bg-primary/[0.005]"
              }`}
            >
              <div className="flex items-start gap-3.5 pr-4 truncate w-full">
                {/* Category Icon indicator */}
                <div className="p-2 rounded-lg bg-secondary shrink-0 mt-0.5">
                  {getCategoryIcon(notif.category, notif.priority)}
                </div>

                {/* Body */}
                <div className="space-y-1 truncate w-full text-left">
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold block truncate leading-tight text-sm ${notif.isRead ? "text-muted-foreground" : "text-foreground"}`}>
                      {notif.title}
                    </span>
                    {!notif.isRead && (
                      <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    )}
                  </div>
                  <p className="text-muted-foreground truncate leading-relaxed max-w-2xl">{notif.message}</p>
                  <span className="text-[10px] text-muted-foreground block font-mono">{notif.createdAt}</span>
                </div>
              </div>

              {/* Priority & details arrow */}
              <div className="flex items-center gap-3 shrink-0">
                {getPriorityBadge(notif.priority)}
                <ChevronRight className="w-4 h-4 text-muted-foreground/60" />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Notification Detail Drawer */}
      <Drawer open={previewNotification !== null} onOpenChange={(open) => { if (!open) setPreviewNotification(null) }}>
        {previewNotification && (
          <DrawerContent className="max-w-md select-none text-left overflow-y-auto pr-1">
            <DrawerHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  {getCategoryIcon(previewNotification.category, previewNotification.priority)}
                </div>
                <div className="space-y-0.5">
                  <DrawerTitle>{previewNotification.title}</DrawerTitle>
                  <DrawerDescription className="font-mono text-xs flex items-center gap-2">
                    <span className="font-semibold text-foreground">{previewNotification.id}</span>
                    <span>•</span>
                    <span className="text-muted-foreground uppercase">{previewNotification.category}</span>
                  </DrawerDescription>
                </div>
              </div>
            </DrawerHeader>

            {/* Content Details */}
            <div className="flex-1 space-y-5 pt-2 pb-6 px-1 text-xs leading-relaxed">
              <div className="p-4 bg-muted/20 border border-border rounded-xl space-y-1.5 shadow-premium">
                <span className="text-[10px] text-muted-foreground font-bold uppercase block">Notification Message</span>
                <p className="text-foreground text-sm leading-relaxed">{previewNotification.message}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-card border border-border rounded-xl space-y-1 shadow-premium">
                  <span className="text-[10px] text-muted-foreground block font-semibold uppercase">Category</span>
                  <Badge variant="outline" className="capitalize">{previewNotification.category}</Badge>
                </div>
                <div className="p-3 bg-card border border-border rounded-xl space-y-1 shadow-premium">
                  <span className="text-[10px] text-muted-foreground block font-semibold uppercase">Alert Level</span>
                  <div>{getPriorityBadge(previewNotification.priority)}</div>
                </div>
                <div className="p-3 bg-card border border-border rounded-xl space-y-1 col-span-2 shadow-premium">
                  <span className="text-[10px] text-muted-foreground block font-semibold uppercase">Logged Date</span>
                  <span className="font-semibold text-foreground text-sm">{previewNotification.createdAt}</span>
                </div>
              </div>

              <div className="pt-2">
                <Button size="sm" className="w-full shadow-premium" onClick={() => setPreviewNotification(null)}>
                  Close Alert Viewport
                </Button>
              </div>
            </div>
          </DrawerContent>
        )}
      </Drawer>
    </div>
  )
}
