import React, { createContext, useContext, useState, useEffect } from "react"
import axios from "axios"

export interface User {
  id: number
  name: string
  email: string
  role: string // Admin, Asset Manager, Department Head, Employee
  department?: string
  createdAt?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string, roleName: string, departmentId?: number) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
  isAdmin: boolean
  isAssetManager: boolean
  isEmployee: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Session persistence on load
    const storedToken = localStorage.getItem("assetflow_token")
    const storedUser = localStorage.getItem("assetflow_user")

    if (storedToken && storedUser) {
      setToken(storedToken)
      try {
        setUser(JSON.parse(storedUser))
      } catch (e) {
        // Clear corrupt storage
        localStorage.removeItem("assetflow_token")
        localStorage.removeItem("assetflow_user")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await axios.post("http://localhost:3000/api/v1/auth/login", { email, password })
      if (response.data.success) {
        const { user: backendUser, token: backendToken } = response.data.data
        
        // Map backendUser properties if needed
        const mappedUser: User = {
          id: backendUser.id,
          name: backendUser.name,
          email: backendUser.email,
          role: backendUser.role?.name || backendUser.role || "Employee",
          department: backendUser.department?.name || backendUser.department
        }

        setUser(mappedUser)
        setToken(backendToken)
        localStorage.setItem("assetflow_token", backendToken)
        localStorage.setItem("assetflow_user", JSON.stringify(mappedUser))
      } else {
        throw new Error(response.data.message || "Invalid credentials")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (name: string, email: string, password: string, roleName: string, departmentId?: number) => {
    setIsLoading(true)
    try {
      const response = await axios.post("http://localhost:3000/api/v1/auth/signup", {
        name,
        email,
        password,
        roleName,
        departmentId: departmentId || null
      })
      if (response.data.success) {
        const { user: backendUser, token: backendToken } = response.data.data

        const mappedUser: User = {
          id: backendUser.id,
          name: backendUser.name,
          email: backendUser.email,
          role: backendUser.role?.name || backendUser.role || "Employee",
          department: backendUser.department?.name || backendUser.department
        }

        setUser(mappedUser)
        setToken(backendToken)
        localStorage.setItem("assetflow_token", backendToken)
        localStorage.setItem("assetflow_user", JSON.stringify(mappedUser))
      } else {
        throw new Error(response.data.message || "Signup failed")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem("assetflow_token")
    localStorage.removeItem("assetflow_user")
  }

  const role = user?.role || "Employee"
  const isAdmin = role === "Admin"
  const isAssetManager = role === "Asset Manager"
  const isEmployee = role === "Employee" || (!isAdmin && !isAssetManager)

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        signup,
        logout,
        isAuthenticated: !!token,
        isAdmin,
        isAssetManager,
        isEmployee
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
