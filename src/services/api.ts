import axios from "axios"

export const API_BASE_URL = "http://localhost:3000/api/v1"

// Create central Axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
})

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("assetflow_token")
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors (401, 403, etc.)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status
      if (status === 401) {
        // Expired/Invalid token: clear credentials and redirect to login
        localStorage.removeItem("assetflow_token")
        localStorage.removeItem("assetflow_user")
        
        // Only redirect if not already on the login page to avoid loops
        if (!window.location.pathname.endsWith("/login")) {
          window.location.href = "/login"
        }
      }
    }
    return Promise.reject(error)
  }
)

// Simulated delay helper for consistency with react-query loaders
export const simulateApiDelay = async (): Promise<void> => {
  const delay = Number(import.meta.env.VITE_API_DELAY_MS) || 200
  await new Promise((resolve) => setTimeout(resolve, delay))
}
