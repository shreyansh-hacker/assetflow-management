import React, { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useTheme } from "@/hooks/useTheme"
import { useToast } from "@/hooks/useToast"
import PageHeader from "@/components/PageHeader"
import { Button } from "@/components/ui/Button"
import { User, Bell, Shield, Info, Palette, Check, Moon, Sun, Monitor, LogOut } from "lucide-react"

export default function Settings() {
  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()
  
  const [activeTab, setActiveTab] = useState<"profile" | "appearance" | "notifications" | "security" | "about">("profile")
  const [name, setName] = useState(user?.name || "")
  const [email, setEmail] = useState(user?.email || "")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // Notification states
  const [notifyEmail, setNotifyEmail] = useState(true)
  const [notifyPush, setNotifyPush] = useState(true)
  const [notifySound, setNotifySound] = useState(false)

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    toast({
      title: "Profile Updated",
      description: "Successfully updated your profile details.",
      type: "success",
    })
  }

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match.",
        type: "error",
      })
      return
    }
    toast({
      title: "Password Changed",
      description: "Your account credentials have been updated.",
      type: "success",
    })
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full select-none pb-12 text-left">
      <PageHeader
        title="Settings"
        description="Manage your account preferences, system settings, and notifications."
      />

      <div className="flex flex-col md:flex-row gap-8 mt-2 items-start">
        
        {/* Navigation Sidebar */}
        <div className="w-full md:w-[220px] flex flex-col gap-1 shrink-0">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "profile"
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/10"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile</span>
          </button>
          
          <button
            onClick={() => setActiveTab("appearance")}
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "appearance"
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/10"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Appearance</span>
          </button>

          <button
            onClick={() => setActiveTab("notifications")}
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "notifications"
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/10"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Notifications</span>
          </button>

          <button
            onClick={() => setActiveTab("security")}
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "security"
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/10"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Security</span>
          </button>

          <button
            onClick={() => setActiveTab("about")}
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "about"
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/10"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            }`}
          >
            <Info className="w-4 h-4" />
            <span>About</span>
          </button>
        </div>

        {/* Content Pane */}
        <div className="flex-1 bg-card border border-border/40 rounded-xl p-6 md:p-8 w-full shadow-premium transition-all">
          
          {/* PROFILE TAB */}
          {activeTab === "profile" && (
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="text-lg font-bold text-foreground">Profile Settings</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Customize your personal credentials and company identifiers.</p>
              </div>

              {/* Avatar Preview */}
              <div className="flex items-center gap-4 py-2 border-b border-border/40 pb-5">
                <div className="w-16 h-16 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xl font-bold">
                  {user?.name ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2) : "US"}
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-bold text-foreground">{user?.name}</span>
                  <span className="text-xs text-muted-foreground capitalize">{user?.role} — {user?.department || "Unassigned"}</span>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 bg-muted/40 border border-border/50 rounded-lg text-sm focus:outline-none focus:border-primary transition-all text-foreground"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-muted/40 border border-border/50 rounded-lg text-sm focus:outline-none focus:border-primary transition-all text-foreground"
                    />
                  </div>
                </div>

                <div className="flex justify-end mt-4">
                  <Button type="submit">
                    Save Changes
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* APPEARANCE TAB */}
          {activeTab === "appearance" && (
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="text-lg font-bold text-foreground">Theme Settings</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Customize the interface theme styling for the application.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-2">
                <button
                  onClick={() => setTheme("light")}
                  className={`flex flex-col items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer ${
                    theme === "light"
                      ? "border-primary bg-primary/5 text-primary shadow-sm"
                      : "border-border/60 hover:border-border text-muted-foreground hover:text-foreground bg-muted/10"
                  }`}
                >
                  <Sun className="w-6 h-6" />
                  <span className="text-xs font-bold">Light Mode</span>
                  {theme === "light" && <Check className="w-3.5 h-3.5 mt-0.5" />}
                </button>

                <button
                  onClick={() => setTheme("dark")}
                  className={`flex flex-col items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer ${
                    theme === "dark"
                      ? "border-primary bg-primary/5 text-primary shadow-sm"
                      : "border-border/60 hover:border-border text-muted-foreground hover:text-foreground bg-muted/10"
                  }`}
                >
                  <Moon className="w-6 h-6" />
                  <span className="text-xs font-bold">Dark Mode</span>
                  {theme === "dark" && <Check className="w-3.5 h-3.5 mt-0.5" />}
                </button>

                <button
                  onClick={() => setTheme("system")}
                  className={`flex flex-col items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer ${
                    theme === "system"
                      ? "border-primary bg-primary/5 text-primary shadow-sm"
                      : "border-border/60 hover:border-border text-muted-foreground hover:text-foreground bg-muted/10"
                  }`}
                >
                  <Monitor className="w-6 h-6" />
                  <span className="text-xs font-bold">System Default</span>
                  {theme === "system" && <Check className="w-3.5 h-3.5 mt-0.5" />}
                </button>
              </div>
            </div>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === "notifications" && (
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="text-lg font-bold text-foreground">Notification Preferences</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Control how and where you receive system updates and alerts.</p>
              </div>

              <div className="flex flex-col gap-4 py-2">
                <div className="flex items-center justify-between p-3.5 rounded-lg border border-border/40 bg-muted/10">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold text-foreground">Email Notifications</span>
                    <span className="text-xs text-muted-foreground">Receive daily digests, transfer approvals, and ticket resolutions.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifyEmail}
                    onChange={(e) => setNotifyEmail(e.target.checked)}
                    className="w-4.5 h-4.5 rounded text-primary border-border focus:ring-primary cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-lg border border-border/40 bg-muted/10">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold text-foreground">In-App Push Alerts</span>
                    <span className="text-xs text-muted-foreground">Display popups and alert bubbles inside the console workspace.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifyPush}
                    onChange={(e) => setNotifyPush(e.target.checked)}
                    className="w-4.5 h-4.5 rounded text-primary border-border focus:ring-primary cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-lg border border-border/40 bg-muted/10">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold text-foreground">Sound Effects</span>
                    <span className="text-xs text-muted-foreground">Play a subtle audio alert whenever new notifications arrive.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifySound}
                    onChange={(e) => setNotifySound(e.target.checked)}
                    className="w-4.5 h-4.5 rounded text-primary border-border focus:ring-primary cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECURITY TAB */}
          {activeTab === "security" && (
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="text-lg font-bold text-foreground">Change Password</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Keep your credentials secure by updating your passwords regularly.</p>
              </div>

              <form onSubmit={handleChangePassword} className="flex flex-col gap-4 border-b border-border/40 pb-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 bg-muted/40 border border-border/50 rounded-lg text-sm focus:outline-none focus:border-primary transition-all text-foreground"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 bg-muted/40 border border-border/50 rounded-lg text-sm focus:outline-none focus:border-primary transition-all text-foreground"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 bg-muted/40 border border-border/50 rounded-lg text-sm focus:outline-none focus:border-primary transition-all text-foreground"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end mt-2">
                  <Button type="submit">
                    Update Password
                  </Button>
                </div>
              </form>

              <div>
                <h4 className="text-sm font-bold text-foreground">Sign Out</h4>
                <p className="text-xs text-muted-foreground mt-0.5">Disconnect this local session and clear security tokens.</p>
                <div className="flex justify-start mt-3">
                  <Button
                    onClick={logout}
                    variant="outline"
                    className="border-red-500/20 hover:bg-red-500/5 text-red-400 font-semibold"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out Session</span>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ABOUT TAB */}
          {activeTab === "about" && (
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="text-lg font-bold text-foreground">About Application</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Enterprise Asset and Resource Management Workspace.</p>
              </div>

              <div className="flex flex-col gap-4.5 py-2">
                <div className="grid grid-cols-2 gap-4 border-b border-border/40 pb-3 text-xs">
                  <span className="font-semibold text-muted-foreground">Product Name</span>
                  <span className="text-foreground font-semibold">AssetFlow Enterprise Edition</span>
                </div>
                <div className="grid grid-cols-2 gap-4 border-b border-border/40 pb-3 text-xs">
                  <span className="font-semibold text-muted-foreground">Application Version</span>
                  <span className="text-foreground font-semibold">v1.2.0 (hackathon-production)</span>
                </div>
                <div className="grid grid-cols-2 gap-4 border-b border-border/40 pb-3 text-xs">
                  <span className="font-semibold text-muted-foreground">Target Framework</span>
                  <span className="text-foreground font-semibold">React 19 + TypeScript + Vite</span>
                </div>
                <div className="grid grid-cols-2 gap-4 border-b border-border/40 pb-3 text-xs">
                  <span className="font-semibold text-muted-foreground">Database Layer</span>
                  <span className="text-foreground font-semibold">Prisma Client + PostgreSQL (Local WSL)</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <span className="font-semibold text-muted-foreground">Authentication Protocol</span>
                  <span className="text-foreground font-semibold">JSON Web Tokens (JWT Bearer)</span>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
