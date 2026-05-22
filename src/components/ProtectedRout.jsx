import { Navigate, Outlet, useLocation } from "react-router-dom"
import { clearAuthSession, getAuthRole, getDefaultRouteForRole, hasAuthSession } from "@/lib/auth"

export function PublicOnlyRoute() {
  const token = localStorage.getItem("token")

  if (hasAuthSession(token)) {
    return <Navigate to={getDefaultRouteForRole(getAuthRole(token))} replace />
  }

  if (token) {
    clearAuthSession()
  }

  return <Outlet />
}

export default function ProtectedRoute({ requireAdmin = false }) {
  const location = useLocation()
  const token = localStorage.getItem("token")

  if (!hasAuthSession(token)) {
    if (token) {
      clearAuthSession()
    }

    return <Navigate to="/login" replace state={{ from: location }} />
  }

  const role = getAuthRole(token)

  if (requireAdmin && role !== "admin") {
    return <Navigate to="/portal" replace />
  }

  return <Outlet />
}
