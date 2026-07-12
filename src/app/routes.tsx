import { createBrowserRouter } from "react-router-dom"
import { ROUTES } from "@/constants/routes"
import MainLayout from "@/layouts/MainLayout"
import Dashboard from "@/pages/Dashboard"
import Organization from "@/pages/Organization"
import Assets from "@/pages/Assets"
import Allocation from "@/pages/Allocation"
import Booking from "@/pages/Booking"
import Maintenance from "@/pages/Maintenance"
import Audit from "@/pages/Audit"
import Reports from "@/pages/Reports"
import Notifications from "@/pages/Notifications"
import Settings from "@/pages/Settings"
import Login from "@/pages/Login"
import { ProtectedRoute } from "@/components/ProtectedRoute"

export const router = createBrowserRouter([
  {
    path: ROUTES.LOGIN,
    element: <Login />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: ROUTES.DASHBOARD,
        element: <Dashboard />,
      },
      {
        path: ROUTES.ORG_SETUP,
        element: <Organization />,
      },
      {
        path: ROUTES.ASSETS,
        element: <Assets />,
      },
      {
        path: ROUTES.ALLOCATION,
        element: <Allocation />,
      },
      {
        path: ROUTES.BOOKING,
        element: <Booking />,
      },
      {
        path: ROUTES.MAINTENANCE,
        element: <Maintenance />,
      },
      {
        path: ROUTES.AUDIT,
        element: <Audit />,
      },
      {
        path: ROUTES.REPORTS,
        element: <Reports />,
      },
      {
        path: ROUTES.NOTIFICATIONS,
        element: <Notifications />,
      },
      {
        path: ROUTES.SETTINGS,
        element: <Settings />,
      },
    ],
  },
])
