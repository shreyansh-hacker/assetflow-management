import { Sun, Moon, Bell, Search, Menu } from "lucide-react"
import { useTheme } from "@/hooks/useTheme"
import { useLocation, Link, useNavigate } from "react-router-dom"
import { ROUTES } from "@/constants/routes"
import { useAuth } from "@/contexts/AuthContext"
import { useQuery } from "@tanstack/react-query"
import { getNotifications } from "@/services/notifications"

type NavbarProps = {
  onMenuClick: () => void
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const { theme, setTheme } = useTheme()
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
    refetchInterval: 15000, // Refetch every 15 seconds to sync dashboard/realtime alerts
  })

  const unreadCount = notifications.filter((n) => !n.isRead).length

  // Dynamic breadcrumb generation
  const getBreadcrumbName = (path: string) => {
    switch (path) {
      case ROUTES.DASHBOARD:
        return "Dashboard"
      case ROUTES.ORG_SETUP:
        return "Organization Setup"
      case ROUTES.ASSETS:
        return "Asset Directory"
      case ROUTES.ALLOCATION:
        return "Allocation & Transfer"
      case ROUTES.BOOKING:
        return "Resource Booking"
      case ROUTES.MAINTENANCE:
        return "Maintenance"
      case ROUTES.AUDIT:
        return "Audit & Verification"
      case ROUTES.REPORTS:
        return "Analytics Reports"
      case ROUTES.NOTIFICATIONS:
        return "Notifications"
      case ROUTES.SETTINGS:
        return "Settings"
      default:
        return "Enterprise Panel"
    }
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const userInitials = user?.name 
    ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2)
    : "US"

  return (
    <header className="h-16 border-b border-border bg-card text-card-foreground flex items-center justify-between px-6 sticky top-0 z-20 select-none">
      {/* Left side: Mobile menu trigger & Breadcrumb */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-2 rounded-md hover:bg-muted text-foreground cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-sm font-medium">
          <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
            AssetFlow
          </Link>
          <span className="text-muted-foreground/50">/</span>
          <span className="text-foreground font-semibold">
            {getBreadcrumbName(location.pathname)}
          </span>
        </div>
      </div>

      {/* Right side: Search, Notifications, Theme, User */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Mock Search Box */}
        <div className="hidden sm:flex items-center gap-2 border border-input bg-background/50 rounded-lg px-3 py-1.5 w-64 max-w-xs focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Quick search (Cmd + K)..."
            className="bg-transparent border-0 p-0 text-xs w-full focus:outline-none focus:ring-0 placeholder:text-muted-foreground/60 text-foreground"
          />
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-muted text-foreground cursor-pointer transition-colors shadow-premium border border-border"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4 text-amber-500" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700" />
          )}
        </button>

        {/* Notification bell button */}
        <Link
          to={ROUTES.NOTIFICATIONS}
          className="p-2 rounded-lg hover:bg-muted text-foreground relative transition-colors shadow-premium border border-border cursor-pointer flex items-center justify-center"
          aria-label="View notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 flex items-center justify-center text-[7px] text-white font-bold" />
          )}
        </Link>

        {/* Vertical divider */}
        <div className="h-6 w-px bg-border hidden sm:block" />

        {/* Mini user profile badge */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(ROUTES.SETTINGS)}
            className="w-8 h-8 rounded-full bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center font-bold text-xs shadow-sm cursor-pointer select-none transition-colors uppercase border border-primary/20"
          >
            {userInitials}
          </button>
        </div>
      </div>
    </header>
  )
}
