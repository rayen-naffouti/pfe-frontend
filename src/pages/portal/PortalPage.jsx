import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { MinotaurLogo } from "@/components/MinotaurLogo"
import { ParticlesBackground } from "@/components/ParticlesBackground"
import { StatusBadge } from "@/components/StatusBadge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { EmptyState, ErrorState, LoadingState } from "@/components/DataState"
import { Key, RefreshCw, Monitor, AlertTriangle, Clock, Package, LogOut, User, Bell } from "lucide-react"
import { customersApi, getApiErrorMessage } from "@/lib/api"
import { formatDate, getLicenseStatus } from "@/lib/formatters"

export default function PortalPage() {
  const [customer, setCustomer] = useState(null)
  const [licenses, setLicenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchPortal = async () => {
    setLoading(true)
    setError(null)

    try {
      const customerResponse = await customersApi.current()
      const licensesResponse = await customersApi.licenses(customerResponse.data.id)
      setCustomer(customerResponse.data)
      setLicenses(licensesResponse.data)
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
    const progress = totalMs > 0 ? Math.min(100, Math.max(0, ((now.getTime() - createdAt.getTime()) / totalMs) * 100)) : 0

    return { daysRemaining, progress }
  }, [primaryLicense])

  const handleLogout = () => {
    localStorage.removeItem("token")
  }

  return (
    <div className="min-h-screen relative">
      <ParticlesBackground />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_oklch(0.18_0.04_250)_0%,_oklch(0.13_0.02_260)_70%)]" />

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
            <Button variant="ghost" size="icon">
              <Bell className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <User className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link to="/" onClick={handleLogout}>
                <LogOut className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8 space-y-6">
        {loading && <LoadingState message="Loading portal data..." />}

        {error && !loading && <ErrorState message={error} onRetry={fetchPortal} />}

        {!loading && !error && !primaryLicense && <EmptyState message="No licenses found for this account" />}

        {!loading && !error && primaryLicense && (
        <>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Welcome back, {customer?.username}</h1>
          <p className="text-muted-foreground">Manage your licenses and subscriptions</p>
        </div>

        <Card className="glass border-border neon-border">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Key className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-foreground">{primaryLicense.product_name || "N/A"}</h2>
                    <StatusBadge status={getLicenseStatus(primaryLicense)} />
                  </div>
                  <p className="text-muted-foreground">{primaryLicense.license_key}</p>
                </div>
              </div>
              <div className="flex-1 max-w-md">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">License Period</span>
                  <span className="text-sm font-medium text-foreground">{licensePeriod.daysRemaining} days remaining</span>
                </div>
                <Progress value={licensePeriod.progress} className="h-3 bg-secondary" />
                <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                  <span>{formatDate(primaryLicense.created_at)}</span>
                  <span>{formatDate(primaryLicense.expiration_at)}</span>
                </div>
              </div>
              <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground glow-blue">
                <Link to="/portal/renew">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Renew License
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="glass border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Monitor className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Activations</p>
                  <p className="text-2xl font-bold text-foreground">N/A</p>
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
                  <p className="text-sm text-muted-foreground">Days Remaining</p>
                  <p className="text-2xl font-bold text-foreground">{licensePeriod.daysRemaining}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
                  <Package className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Licenses</p>
                  <p className="text-2xl font-bold text-foreground">{licenses.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

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
                  Your license will expire in {licensePeriod.daysRemaining} days. Renew now to avoid service interruption.
                </p>
              </div>
              <Button
                variant="outline"
                className="ml-auto border-warning/50 text-warning hover:bg-warning/10 bg-transparent"
              >
                Renew Now
              </Button>
            </div>
          </CardContent>
        </Card>
        </>
        )}
      </main>
    </div>
  )
}
