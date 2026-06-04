import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { MinotaurLogo } from "@/components/MinotaurLogo"
import { ParticlesBackground } from "@/components/ParticlesBackground"
import { StatusBadge } from "@/components/StatusBadge"
import { ThemeToggle } from "@/components/ThemeToggle"
import { LicenseKeyField } from "@/components/LicenseKeyField"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { EmptyState, ErrorState, LoadingState } from "@/components/DataState"
import {
  Key,
  RefreshCw,
  Monitor,
  AlertTriangle,
  Clock,
  Package,
  LogOut,
  User,
  Bell,
  Globe2,
  ArrowRight,
  ShoppingCart,
  LayoutDashboard,
} from "lucide-react"
import { customersApi, getApiErrorMessage, productsApi } from "@/lib/api"
import { clearAuthSession, getAuthRole } from "@/lib/auth"
import { formatCurrency, formatDate, getLicenseStatus } from "@/lib/formatters"

const STANDARD_PLAN_START_PRICE = 999

export default function PortalPage() {
  const [customer, setCustomer] = useState(null)
  const [licenses, setLicenses] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchPortal = async () => {
    setLoading(true)
    setError(null)

    try {
      const customerResponse = await customersApi.current()
      const [licensesResponse, productsResponse] = await Promise.all([
        customersApi.licenses(customerResponse.data.id),
        productsApi.list(),
      ])

      setCustomer(customerResponse.data)
      setLicenses(licensesResponse.data)
      setProducts(productsResponse.data)
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to load portal data"))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPortal()
  }, [])

  const primaryLicense = licenses[0]
  const activeLicensesCount = licenses.filter((license) => ["valid", "expiring"].includes(getLicenseStatus(license))).length
  const ownedProductIds = new Set(licenses.map((license) => Number(license.product_id)))
  const isAdmin = getAuthRole() === "admin"
  const licensePeriod = useMemo(() => {
    if (!primaryLicense?.expiration_at) {
      return { daysRemaining: 0, progress: 0 }
    }

    const createdAt = new Date(primaryLicense.created_at)
    const expirationAt = new Date(primaryLicense.expiration_at)
    const now = new Date()
    const totalMs = expirationAt.getTime() - createdAt.getTime()
    const remainingMs = expirationAt.getTime() - now.getTime()
    const daysRemaining = Math.max(0, Math.ceil(remainingMs / 86_400_000))
    const progress =
      totalMs > 0 ? Math.min(100, Math.max(0, ((now.getTime() - createdAt.getTime()) / totalMs) * 100)) : 0

    return { daysRemaining, progress }
  }, [primaryLicense])

  const buildCheckoutHref = (productId) => {
    const mode = ownedProductIds.has(Number(productId)) ? "renew" : "buy"
    return `/portal/renew?productId=${productId}&mode=${mode}`
  }

  const handleLogout = () => {
    clearAuthSession()
  }

  return (
    <div className="min-h-screen relative">
      <ParticlesBackground />
      <div className="absolute inset-0 app-radial-bg" />

      <header className="relative z-10 glass-strong border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MinotaurLogo size="sm" glowing />
            <div>
              <span className="font-bold text-foreground uppercase">Licentra</span>
              <span className="text-xs text-muted-foreground ml-2">Customer Portal</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {isAdmin && (
              <Button variant="outline" className="hidden border-border bg-transparent md:inline-flex" asChild>
                <Link to="/admin/dashboard">
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Admin Dashboard
                </Link>
              </Button>
            )}
            <ThemeToggle />
            <Button variant="ghost" size="icon">
              <Bell className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <User className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link to="/login" onClick={handleLogout}>
                <LogOut className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8 space-y-6">
        {loading && <LoadingState message="Loading portal data..." />}

        {error && !loading && <ErrorState message={error} onRetry={fetchPortal} />}

        {!loading && !error && (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground">Welcome back, {customer?.username}</h1>
              <p className="text-muted-foreground">Manage your licenses or choose a new product and generate a plan.</p>
            </div>

            {primaryLicense ? (
              <Card className="glass border-border neon-border">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center">
                        <Key className="w-8 h-8 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3">
                          <h2 className="text-xl font-bold text-foreground">{primaryLicense.product_name || "N/A"}</h2>
                          <StatusBadge status={getLicenseStatus(primaryLicense)} />
                        </div>
                        <LicenseKeyField value={primaryLicense.license_key} className="mt-1 max-w-xl" />
                      </div>
                    </div>
                    <div className="flex-1 max-w-md">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">License Period</span>
                        <span className="text-sm font-medium text-foreground">
                          {licensePeriod.daysRemaining} days remaining
                        </span>
                      </div>
                      <Progress value={licensePeriod.progress} className="h-3 bg-secondary" />
                      <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                        <span>{formatDate(primaryLicense.created_at)}</span>
                        <span>{formatDate(primaryLicense.expiration_at)}</span>
                      </div>
                    </div>
                    <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground glow-blue">
                      <Link to={buildCheckoutHref(primaryLicense.product_id)}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Renew License
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="glass border-border neon-border">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center">
                        <ShoppingCart className="w-8 h-8 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-foreground">Start Your First License</h2>
                        <p className="text-muted-foreground mt-1">
                          Select one of the available web applications below, then choose Standard, Premium or Custom
                          modules and generate a license.
                        </p>
                      </div>
                    </div>
                    {products[0] && (
                      <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground glow-blue">
                        <Link to={buildCheckoutHref(products[0].id)}>
                          <ArrowRight className="w-4 h-4 mr-2" />
                          Buy a Product
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="glass border-border">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Package className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Available Products</p>
                      <p className="text-2xl font-bold text-foreground">{products.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="glass border-border">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
                      <Monitor className="w-6 h-6 text-success" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Active Licenses</p>
                      <p className="text-2xl font-bold text-foreground">{activeLicensesCount}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="glass border-border">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center">
                      <Clock className="w-6 h-6 text-warning" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Next Renewal</p>
                      <p className="text-2xl font-bold text-foreground">
                        {primaryLicense ? `${licensePeriod.daysRemaining}d` : "N/A"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <section className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Available Products</h2>
                  <p className="text-muted-foreground">
                    Pick a product, then continue to the plan builder to buy or customize the package.
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">Plans start from {formatCurrency(STANDARD_PLAN_START_PRICE)}</p>
              </div>

              {products.length === 0 ? (
                <EmptyState message="No products are available for purchase right now." />
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                  {products.map((product) => {
                    const owned = ownedProductIds.has(Number(product.id))
                    const customerLicense = licenses.find((license) => Number(license.product_id) === Number(product.id))

                    return (
                      <Card key={product.id} className="glass border-border hover:glow-blue transition-all duration-300">
                        <CardContent className="p-6 h-full flex flex-col">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-4 min-w-0">
                              <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                                <Package className="w-6 h-6 text-primary" />
                              </div>
                              <div className="min-w-0">
                                <h3 className="text-lg font-semibold text-foreground">{product.name}</h3>
                                <p className="text-sm text-muted-foreground mt-2">
                                  {product.description || "Web application product with customizable license plans."}
                                </p>
                              </div>
                            </div>
                            {owned && customerLicense ? (
                              <StatusBadge status={getLicenseStatus(customerLicense)} />
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-primary/10 text-primary border-primary/30">
                                Available
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-5">
                            <div className="p-3 rounded-lg bg-secondary/30 border border-border">
                              <p className="text-xs text-muted-foreground">Tenant ID</p>
                              <p className="text-sm text-foreground mt-1 break-all">{product.tenant_id || "Not assigned"}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-secondary/30 border border-border">
                              <p className="text-xs text-muted-foreground">Host Base URL</p>
                              <p className="text-sm text-foreground mt-1 break-all">
                                {product.host_base_url || "Not configured"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-4">
                            <Globe2 className="w-4 h-4 text-primary" />
                            <span>{product.slug}</span>
                            {customerLicense && (
                              <span className="ml-auto">Expires {formatDate(customerLicense.expiration_at)}</span>
                            )}
                          </div>

                          <div className="mt-auto pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                              <p className="text-xs text-muted-foreground">{owned ? "Owned product" : "New product"}</p>
                              <p className="text-lg font-bold text-foreground">From {formatCurrency(STANDARD_PLAN_START_PRICE)}</p>
                            </div>
                            <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground glow-blue">
                              <Link to={buildCheckoutHref(product.id)}>
                                {owned ? "Renew / Upgrade" : "Customize & Buy"}
                                <ArrowRight className="w-4 h-4 ml-2" />
                              </Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </section>

            {primaryLicense && (
              <>
                <Card className="glass border-border">
                  <CardHeader>
                    <CardTitle className="text-foreground flex items-center gap-2">
                      <Monitor className="w-5 h-5 text-primary" />
                      Activated Devices
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="p-4 rounded-lg bg-secondary/30 border border-border text-sm text-muted-foreground">
                        Activation devices are not exposed by the current backend API.
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass border-border border-l-4 border-l-warning">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <AlertTriangle className="w-6 h-6 text-warning" />
                      <div>
                        <p className="font-medium text-foreground">Renewal Reminder</p>
                        <p className="text-sm text-muted-foreground">
                          Your license will expire in {licensePeriod.daysRemaining} days. Renew now to avoid service
                          interruption.
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        className="ml-auto border-warning/50 text-warning hover:bg-warning/10 bg-transparent"
                        asChild
                      >
                        <Link to={buildCheckoutHref(primaryLicense.product_id)}>Renew Now</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </>
        )}
      </main>
    </div>
  )
}
