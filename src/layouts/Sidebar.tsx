import { useState } from "react"
import { NavLink } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard,
  Building,
  Package,
  ArrowLeftRight,
  Calendar,
  Wrench,
  ClipboardCheck,
  BarChart3,
  Bell,
  Settings,
  ChevronLeft,
  X,
  Shield,
} from "lucide-react"
import { ROUTES } from "@/constants/routes"
import { cn } from "@/utils/cn"
import { useAuth } from "@/contexts/AuthContext"

type SidebarProps = {
  isMobileOpen: boolean
  setIsMobileOpen: (open: boolean) => void
}

export default function Sidebar({ isMobileOpen, setIsMobileOpen }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { user } = useAuth()

  const allMenuItems = [
    { name: "Dashboard", path: ROUTES.DASHBOARD, icon: LayoutDashboard },
    { name: "Organization Setup", path: ROUTES.ORG_SETUP, icon: Building, roles: ["Admin"] },
    { name: "Assets", path: ROUTES.ASSETS, icon: Package },
    { name: "Allocation", path: ROUTES.ALLOCATION, icon: ArrowLeftRight },
    { name: "Booking", path: ROUTES.BOOKING, icon: Calendar },
    { name: "Maintenance", path: ROUTES.MAINTENANCE, icon: Wrench },
    { name: "Audit", path: ROUTES.AUDIT, icon: ClipboardCheck, roles: ["Admin", "Asset Manager"] },
    { name: "Reports", path: ROUTES.REPORTS, icon: BarChart3, roles: ["Admin", "Asset Manager"] },
    { name: "Notifications", path: ROUTES.NOTIFICATIONS, icon: Bell },
    { name: "Settings", path: ROUTES.SETTINGS, icon: Settings },
  ]

  // Filter items by role
  const menuItems = allMenuItems.filter(item => {
    if (!item.roles) return true
    const userRole = user?.role || "Employee"
    return item.roles.includes(userRole)
  })

  const sidebarVariants = {
    expanded: { width: 260 },
    collapsed: { width: 72 },
  }

  const userInitials = user?.name 
    ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2)
    : "US"

  const DesktopSidebar = (
    <motion.aside
      initial={false}
      animate={isCollapsed ? "collapsed" : "expanded"}
      variants={sidebarVariants}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className={cn(
        "hidden md:flex flex-col h-screen bg-sidebar text-sidebar-foreground border-r border-sidebar-border relative z-10 shrink-0 select-none"
      )}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground shrink-0 shadow-md">
            <Shield className="w-5 h-5" />
          </div>
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-base font-semibold tracking-tight whitespace-nowrap bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent"
            >
              AssetFlow
            </motion.span>
          )}
        </div>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-6 flex items-center justify-center w-6 h-6 rounded-full border border-sidebar-border bg-card text-foreground shadow-premium hover:bg-muted transition-colors cursor-pointer"
        >
          <ChevronLeft
            className={cn(
              "w-4 h-4 transition-transform duration-200",
              isCollapsed && "rotate-180"
            )}
          />
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group duration-150",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={cn(
                    "w-5 h-5 shrink-0 transition-colors",
                    isActive
                      ? "text-primary"
                      : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground/80"
                  )}
                />
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="whitespace-nowrap"
                  >
                    {item.name}
                  </motion.span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Sidebar Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm shadow-sm uppercase">
              {userInitials}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-semibold text-foreground truncate">
                {user?.name || "System User"}
              </span>
              <span className="text-[10px] text-muted-foreground truncate">
                {user?.email || "user@assetflow.com"}
              </span>
            </div>
          </div>
        </div>
      )}
    </motion.aside>
  )

  return (
    <>
      {DesktopSidebar}

      {/* Mobile Drawer Sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-black z-40 md:hidden"
            />
            {/* Mobile Drawer Panel */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 bottom-0 left-0 w-[280px] bg-sidebar text-sidebar-foreground border-r border-sidebar-border z-50 flex flex-col md:hidden"
            >
              <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground shadow-md">
                    <Shield className="w-5 h-5" />
                  </div>
                  <span className="text-base font-semibold">AssetFlow</span>
                </div>
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="p-1 rounded-md hover:bg-sidebar-accent text-sidebar-foreground cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {menuItems.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsMobileOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group duration-150",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                      )
                    }
                  >
                    <item.icon className="w-5 h-5 shrink-0 text-sidebar-foreground/60" />
                    <span>{item.name}</span>
                  </NavLink>
                ))}
              </nav>

              <div className="p-4 border-t border-sidebar-border">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm shadow-sm uppercase">
                    {userInitials}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-foreground">
                      {user?.name || "System User"}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {user?.email || "user@assetflow.com"}
                    </span>
                  </div>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
