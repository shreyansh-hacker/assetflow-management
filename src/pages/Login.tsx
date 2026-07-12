import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/useToast"
import { Shield, Eye, EyeOff, KeyRound, Mail, User, Building, AlertCircle } from "lucide-react"

export default function Login() {
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [roleName, setRoleName] = useState("Employee")
  const [departmentId, setDepartmentId] = useState("1") // Default to IT (id 1)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  
  const { login, signup, isAuthenticated, isLoading } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/")
    }
  }, [isAuthenticated, navigate])

  const validateEmail = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!email) {
      setFormError("Email is required.")
      return
    }
    if (!validateEmail(email)) {
      setFormError("Please enter a valid email address.")
      return
    }

    if (mode === "login" || mode === "signup") {
      if (!password) {
        setFormError("Password is required.")
        return
      }
      if (password.length < 6) {
        setFormError("Password must be at least 6 characters.")
        return
      }
    }

    if (mode === "signup" && !name) {
      setFormError("Name is required.")
      return
    }

    try {
      if (mode === "login") {
        await login(email, password)
        if (rememberMe) {
          localStorage.setItem("assetflow_remember_email", email)
        } else {
          localStorage.removeItem("assetflow_remember_email")
        }
        toast({
          title: "Welcome Back",
          description: "Successfully signed in to your account.",
          type: "success",
        })
        navigate("/")
      } else if (mode === "signup") {
        await signup(name, email, password, roleName, parseInt(departmentId))
        toast({
          title: "Account Created",
          description: "Your enterprise account has been created successfully.",
          type: "success",
        })
        navigate("/")
      } else if (mode === "forgot") {
        // Mock Forgot password success
        toast({
          title: "Reset link sent",
          description: `A password reset link has been dispatched to ${email}.`,
          type: "success",
        })
        setMode("login")
      }
    } catch (err: any) {
      console.error(err)
      const msg = err.response?.data?.message || err.message || "An unexpected authentication error occurred."
      setFormError(msg)
      toast({
        title: "Authentication Failed",
        description: msg,
        type: "error",
      })
    }
  }

  // Pre-fill remembered email
  useEffect(() => {
    const saved = localStorage.getItem("assetflow_remember_email")
    if (saved) {
      setEmail(saved)
      setRememberMe(true)
    }
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#07090e] relative overflow-hidden select-none px-4">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-sky-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-[460px] bg-card/65 backdrop-blur-xl border border-border/40 p-8 rounded-2xl shadow-2xl relative z-10 text-left flex flex-col gap-6 transition-all duration-300">
        
        {/* Brand Header */}
        <div className="flex flex-col gap-2 text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center text-primary shadow-inner mb-2 animate-pulse">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            {mode === "login" && "Sign in to AssetFlow"}
            {mode === "signup" && "Create your account"}
            {mode === "forgot" && "Reset password"}
          </h2>
          <p className="text-xs text-muted-foreground">
            {mode === "login" && "Enter your credentials to access the console"}
            {mode === "signup" && "Register to manage assets and bookings"}
            {mode === "forgot" && "We will send you a secure link to reset your credentials"}
          </p>
        </div>

        {/* Form Error Message */}
        {formError && (
          <div className="flex items-start gap-2.5 p-3 rounded-lg border border-red-500/20 bg-red-500/5 text-xs text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{formError}</span>
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {mode === "signup" && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground/60">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full pl-9 pr-3 py-2 bg-muted/40 border border-border/50 rounded-lg text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-all text-foreground"
                  disabled={isLoading}
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground/60">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-9 pr-3 py-2 bg-muted/40 border border-border/50 rounded-lg text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-all text-foreground"
                disabled={isLoading}
              />
            </div>
          </div>

          {mode !== "forgot" && (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Password</label>
                {mode === "login" && (
                  <button
                    type="button"
                    onClick={() => setMode("forgot")}
                    className="text-[11px] text-primary hover:underline font-medium cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground/60">
                  <KeyRound className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2 bg-muted/40 border border-border/50 rounded-lg text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-all text-foreground"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground/50 hover:text-foreground cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {mode === "signup" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Assign Role</label>
                <div className="relative">
                  <select
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    className="w-full px-3 py-2 bg-muted/40 border border-border/50 rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-all appearance-none cursor-pointer"
                    disabled={isLoading}
                  >
                    <option value="Employee" className="bg-[#0f121d]">Employee</option>
                    <option value="Asset Manager" className="bg-[#0f121d]">Asset Manager</option>
                    <option value="Admin" className="bg-[#0f121d]">Admin</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Department</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-muted-foreground/60 pointer-events-none">
                    <Building className="w-4 h-4" />
                  </span>
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-muted/40 border border-border/50 rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-all appearance-none cursor-pointer"
                    disabled={isLoading}
                  >
                    <option value="1" className="bg-[#0f121d]">IT</option>
                    <option value="2" className="bg-[#0f121d]">HR</option>
                    <option value="3" className="bg-[#0f121d]">Finance</option>
                    <option value="4" className="bg-[#0f121d]">Operations</option>
                    <option value="5" className="bg-[#0f121d]">Marketing</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {mode === "login" && (
            <div className="flex items-center gap-2 py-1">
              <input
                id="remember"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-border bg-muted/40 text-primary focus:ring-primary cursor-pointer"
                disabled={isLoading}
              />
              <label htmlFor="remember" className="text-xs text-muted-foreground select-none cursor-pointer">
                Remember this email
              </label>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2 bg-primary hover:bg-primary/95 text-primary-foreground font-semibold rounded-lg text-sm shadow-lg shadow-primary/10 transition-all flex items-center justify-center cursor-pointer disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <span>
                {mode === "login" && "Continue"}
                {mode === "signup" && "Create Account"}
                {mode === "forgot" && "Send Password Reset Link"}
              </span>
            )}
          </button>
        </form>

        {/* Mode Toggles */}
        <div className="text-center text-xs text-muted-foreground border-t border-border/40 pt-4 mt-1">
          {mode === "login" && (
            <p>
              New to AssetFlow?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("signup")
                  setFormError(null)
                }}
                className="text-primary hover:underline font-semibold cursor-pointer"
              >
                Sign up here
              </button>
            </p>
          )}

          {mode === "signup" && (
            <p>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("login")
                  setFormError(null)
                }}
                className="text-primary hover:underline font-semibold cursor-pointer"
              >
                Sign in
              </button>
            </p>
          )}

          {mode === "forgot" && (
            <button
              type="button"
              onClick={() => {
                setMode("login")
                setFormError(null)
              }}
              className="text-primary hover:underline font-semibold cursor-pointer"
            >
              Back to sign in
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
