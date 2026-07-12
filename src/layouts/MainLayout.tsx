import { useState } from "react"
import { Outlet } from "react-router-dom"
import Sidebar from "@/layouts/Sidebar"
import Navbar from "@/layouts/Navbar"
import { motion } from "framer-motion"

export default function MainLayout() {
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      {/* Sidebar Navigation */}
      <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

      {/* Main Container */}
      <div className="flex flex-col flex-1 h-full overflow-hidden">
        {/* Top Navbar */}
        <Navbar onMenuClick={() => setIsMobileOpen(true)} />

        {/* Viewport Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="max-w-[1600px] mx-auto space-y-5"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  )
}
