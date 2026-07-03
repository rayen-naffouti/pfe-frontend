import { Routes, Route } from "react-router-dom"
import AdminLayout from "@/components/AdminLayout"

import LandingPage from "@/pages/LandingPage"
import LoginPage from "@/pages/LoginPage"
import DashboardPage from "@/pages/admin/DashboardPage"
import LicensesPage from "@/pages/admin/LicensesPage"
import LicenseDetailPage from "@/pages/admin/LicenseDetailPage"
import CreateLicensePage from "@/pages/admin/CreateLicensePage"
import CustomersPage from "@/pages/admin/CustomersPage"
import CustomerProfilePage from "@/pages/admin/CustomerProfilePage"
import AutomationPage from "@/pages/admin/AutomationPage"
import NotificationsPage from "@/pages/admin/NotificationsPage"
import ApiConsolePage from "@/pages/admin/ApiConsolePage"
import PortalPage from "@/pages/portal/PortalPage"
import RenewalPage from "@/pages/portal/RenewalPage"
import ProtectedRoute, { PublicOnlyRoute } from "../components/ProtectedRout"
import RegisterPage from "../pages/RegisterPage"
import ProductsPage from "../pages/admin/ProductsPage"
import ProductDetailPage from "../pages/admin/ProductDetailPage"
import ForgotPasswordPage from "@/pages/ForgotPasswordPage"
import ResetPasswordPage from "@/pages/ResetPasswordPage"
import ActivateAccountPage from "@/pages/ActivateAccountPage"

export default function AppRoutes() {
  return (
    <Routes>

      <Route path="/" element={<LandingPage />} />

      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Route>

      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/activate-account" element={<ActivateAccountPage />} />

      <Route element={<ProtectedRoute requireAdmin />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="licenses" element={<LicensesPage />} />
          <Route path="licenses/new" element={<CreateLicensePage />} />
          <Route path="licenses/:id" element={<LicenseDetailPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="customers/:id" element={<CustomerProfilePage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="products/:id" element={<ProductDetailPage />} />
          <Route path="automation" element={<AutomationPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="api-console" element={<ApiConsolePage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/portal" element={<PortalPage />} />
        <Route path="/portal/renew" element={<RenewalPage />} />
      </Route>
    </Routes>
  )
}
