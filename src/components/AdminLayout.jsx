import { Outlet } from "react-router-dom"
import { AdminSidebar } from "./AdminSidebar"

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <div className="pl-64 transition-all duration-300">
        <Outlet />
      </div>
    </div>
  )
}
