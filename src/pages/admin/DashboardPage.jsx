import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { AdminHeader } from "@/components/AdminHeader"
import { StatsCard } from "@/components/StatsCard"
import { StatusBadge } from "@/components/StatusBadge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ErrorState, LoadingState } from "@/components/DataState"
import {
  Key,
  Users,
  AlertTriangle,
  Clock,
  TrendingUp,
  RefreshCw,
  Plus,
  ArrowRight,
  Activity,
  CheckCircle2,
  Package,
  ShieldCheck,
  Sparkles,
} from "lucide-react"
import { customersApi, getApiErrorMessage, licensesApi, productsApi } from "@/lib/api"
import { formatDate, getLicenseStatus } from "@/lib/formatters"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

const chartTooltipStyle = {
  backgroundColor: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: "8px",
  color: "var(--foreground)",
}

const distributionConfig = [
  { name: "Active", status: "valid", color: "#22c55e" },
  { name: "Expired", status: "expired", color: "#ef4444" },
  { name: "Trial", status: "trial", color: "#06b6d4" },
  { name: "Expiring", status: "expiring", color: "#f59e0b" },
  { name: "Disabled", status: "disabled", color: "#64748b" },
]

const monthLabelFormatter = new Intl.DateTimeFormat("en-US", { month: "short" })

const getInitial = (value) => (value?.trim()?.charAt(0) || "?").toUpperCase()

const getDateKey = (value) => {
  if (!value) {
    return null
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return null
  }

  return `${date.getFullYear()}-${date.getMonth()}`
}

const getDaysUntil = (value) => {
  if (!value) {
    return null
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return null
  }

  return Math.ceil((date.getTime() - Date.now()) / 86_400_000)
}

const formatRenewalWindow = (value) => {
  const days = getDaysUntil(value)

  if (days === null) {
    return "No expiration date"
  }

  if (days < 0) {
    return `${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} overdue`
  }

  if (days === 0) {
    return "Due today"
  }

  return `Due in ${days} day${days === 1 ? "" : "s"}`
}

function EmptyPanel({ icon: Icon, title, description }) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-secondary/20 p-6 text-center">
      <Icon className="mb-3 h-8 w-8 text-muted-foreground" />
      <p className="font-medium text-foreground">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

function OverviewPanel({ activeRate, renewalRiskCount, customerCoverage, totalProducts }) {
  const indicators = [
    { label: "Active rate", value: `${activeRate}%`, icon: ShieldCheck, tone: "text-success" },
    { label: "Renewal risk", value: renewalRiskCount, icon: AlertTriangle, tone: "text-warning" },
    { label: "Customer coverage", value: `${customerCoverage}%`, icon: Users, tone: "text-accent" },
    { label: "Products", value: totalProducts, icon: Package, tone: "text-primary" },
  ]

  return (
    <Card className="glass border-border overflow-hidden">
      <CardContent className="p-0">
        <div className="grid gap-0 xl:grid-cols-[1.3fr_1fr]">
          <div className="border-b border-border p-6 xl:border-b-0 xl:border-r">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-primary/10 text-primary border-primary/30">
                <Sparkles className="h-3 w-3" />
                Operations
              </Badge>
              <Badge className="bg-success/10 text-success border-success/30">Live data</Badge>
            </div>

            <div className="mt-4 max-w-2xl">
              <h2 className="text-2xl font-bold tracking-normal text-foreground">License operations overview</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Monitor license health, renewal pressure, customer coverage, and product usage from one workspace.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground glow-blue">
                <Link to="/admin/licenses/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create License
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-border bg-transparent">
                <Link to="/admin/licenses">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Review Renewals
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-px bg-border">
            {indicators.map((item) => {
              const Icon = item.icon

              return (
                <div key={item.label} className="bg-card/70 p-5">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/70">
                    <Icon className={`h-5 w-5 ${item.tone}`} />
                  </div>
                  <p className="text-2xl font-bold text-foreground">{item.value}</p>
                  <p className="mt-1 text-xs uppercase tracking-normal text-muted-foreground">{item.label}</p>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const [customers, setCustomers] = useState([])
  const [licenses, setLicenses] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchDashboard = async () => {
    setLoading(true)
    setError(null)

    try {
      const [customersResponse, licensesResponse, productsResponse] = await Promise.all([
        customersApi.list(),
        licensesApi.list(),
        productsApi.list(),
      ])
      setCustomers(customersResponse.data)
      setLicenses(licensesResponse.data)
      setProducts(productsResponse.data)
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to load dashboard data"))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
  }, [])

  const licenseStats = useMemo(() => {
    return licenses.reduce(
      (acc, license) => {
        const status = getLicenseStatus(license)
        acc[status] = (acc[status] || 0) + 1
        return acc
      },
      { valid: 0, expired: 0, trial: 0, expiring: 0, disabled: 0 },
    )
  }, [licenses])

  const totalLicenses = licenses.length
  const totalCustomers = customers.length
  const totalProducts = products.length
  const activeLicenses = licenseStats.valid || 0
  const expiredLicenses = licenseStats.expired || 0
  const expiringLicenses = licenseStats.expiring || 0
  const renewalRiskCount = expiredLicenses + expiringLicenses
  const customersWithLicenses = customers.filter((customer) => Number(customer.license_count || 0) > 0).length
  const activeRate = totalLicenses ? Math.round((activeLicenses / totalLicenses) * 100) : 0
  const customerCoverage = totalCustomers ? Math.round((customersWithLicenses / totalCustomers) * 100) : 0

  const licenseDistribution = useMemo(
    () =>
      distributionConfig.map((item) => ({
        ...item,
        value: licenseStats[item.status] || 0,
      })),
    [licenseStats],
  )

  const activityTrend = useMemo(() => {
    const now = new Date()
    const buckets = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1)

      return {
        key: `${date.getFullYear()}-${date.getMonth()}`,
        month: monthLabelFormatter.format(date),
        created: 0,
        expiring: 0,
      }
    })
    const bucketMap = new Map(buckets.map((bucket) => [bucket.key, bucket]))

    licenses.forEach((license) => {
      const createdKey = getDateKey(license.created_at)
      const expirationKey = getDateKey(license.expiration_at)

      if (bucketMap.has(createdKey)) {
        bucketMap.get(createdKey).created += 1
      }

      if (bucketMap.has(expirationKey)) {
        bucketMap.get(expirationKey).expiring += 1
      }
    })

    return buckets
  }, [licenses])

  const recentCustomers = useMemo(() => {
    return [...customers]
      .sort((a, b) => {
        const dateA = new Date(a.created_at || 0).getTime()
        const dateB = new Date(b.created_at || 0).getTime()

        return dateB - dateA
      })
      .slice(0, 5)
      .map((customer) => ({
        id: customer.id,
        name: customer.username || "Unnamed customer",
        email: customer.email,
        licenses: Number(customer.license_count || 0),
        status: Number(customer.license_count || 0) > 0 ? "valid" : "trial",
        lastActivity: formatDate(customer.created_at, "Recently"),
      }))
  }, [customers])

  const renewalQueue = useMemo(() => {
    return licenses
      .map((license) => ({
        ...license,
        status: getLicenseStatus(license),
        daysUntilExpiration: getDaysUntil(license.expiration_at),
      }))
      .filter((license) => license.status === "expired" || license.status === "expiring")
      .sort((a, b) => {
        const daysA = a.daysUntilExpiration ?? Number.MAX_SAFE_INTEGER
        const daysB = b.daysUntilExpiration ?? Number.MAX_SAFE_INTEGER

        return daysA - daysB
      })
      .slice(0, 5)
  }, [licenses])

  const topProducts = useMemo(() => {
    return [...products]
      .map((product) => ({
        id: product.id,
        name: product.name || product.slug || "Unnamed product",
        slug: product.slug,
        licenses: Number(product.license_count || 0),
      }))
      .sort((a, b) => b.licenses - a.licenses)
      .slice(0, 4)
  }, [products])

  const productLicenseMax = Math.max(...topProducts.map((product) => product.licenses), 1)
  const hasDistributionData = licenseDistribution.some((item) => item.value > 0)
  const alertItems = [
    {
      title: "Renewals in 30 days",
      value: expiringLicenses,
      description: "Licenses entering the renewal window.",
      icon: RefreshCw,
      tone: "text-warning",
      href: "/admin/licenses",
    },
    {
      title: "Expired licenses",
      value: expiredLicenses,
      description: "Licenses that need immediate attention.",
      icon: AlertTriangle,
      tone: "text-destructive",
      href: "/admin/licenses",
    },
    {
      title: "Unlicensed customers",
      value: totalCustomers - customersWithLicenses,
      description: "Customers without an attached license.",
      icon: Users,
      tone: "text-primary",
      href: "/admin/customers",
    },
  ]

  return (
    <div className="min-h-screen">
      <AdminHeader title="Dashboard" subtitle="Welcome back, Admin" />

      <div className="p-6 space-y-6">
        {loading && <LoadingState message="Loading dashboard data..." />}

        {error && !loading && <ErrorState message={error} onRetry={fetchDashboard} />}

        {!loading && !error && (
        <>
        <OverviewPanel
          activeRate={activeRate}
          renewalRiskCount={renewalRiskCount}
          customerCoverage={customerCoverage}
          totalProducts={totalProducts}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Active Licenses"
            value={activeLicenses}
            change={`${activeRate}% of all licenses`}
            changeType="neutral"
            icon={Key}
            iconColor="text-primary"
          />
          <StatsCard
            title="Expired Licenses"
            value={expiredLicenses}
            change={`${totalLicenses} total licenses`}
            changeType={expiredLicenses > 0 ? "negative" : "positive"}
            icon={AlertTriangle}
            iconColor="text-destructive"
          />
          <StatsCard
            title="Trial Licenses"
            value={licenseStats.trial || 0}
            change={`${totalCustomers} customer(s)`}
            changeType="neutral"
            icon={Clock}
            iconColor="text-accent"
          />
          <StatsCard
            title="Renewals Needed"
            value={expiringLicenses}
            change="Within 30 days"
            changeType={expiringLicenses > 0 ? "negative" : "positive"}
            icon={RefreshCw}
            iconColor="text-warning"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 glass border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-foreground flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                License Activity
              </CardTitle>
              <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
                <Link to="/admin/licenses">
                  View Report
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={activityTrend} margin={{ top: 10, right: 12, left: -18, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                  <XAxis dataKey="month" stroke="var(--chart-axis)" fontSize={12} />
                  <YAxis stroke="var(--chart-axis)" fontSize={12} allowDecimals={false} />
                  <Tooltip
                    contentStyle={chartTooltipStyle}
                    formatter={(value, name) => [value, name === "created" ? "Created" : "Expiring"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="created"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: "#06b6d4" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="expiring"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    dot={{ fill: "#f59e0b", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: "#f59e0b" }}
                  />
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  Created licenses
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-warning" />
                  Expiring licenses
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                License Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              {hasDistributionData ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={licenseDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {licenseDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={chartTooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <EmptyPanel
                  icon={Activity}
                  title="No license data"
                  description="License status distribution appears once licenses are created."
                />
              )}
              <div className="grid grid-cols-2 gap-2 mt-4">
                {licenseDistribution.map((item) => (
                  <div key={item.name} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-muted-foreground">{item.name}</span>
                    <span className="text-foreground font-medium ml-auto">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 glass border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-foreground flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Recent Customers
              </CardTitle>
              <Button asChild variant="ghost" size="sm" className="text-primary">
                <Link to="/admin/customers">
                  View All <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {recentCustomers.length > 0 ? (
                <div className="space-y-3">
                  {recentCustomers.map((customer) => (
                    <Link
                      to={`/admin/customers/${customer.id}`}
                      key={customer.id}
                      className="flex items-center justify-between gap-4 rounded-lg border border-transparent bg-secondary/30 p-3 transition-colors hover:border-border hover:bg-secondary/50"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20 font-semibold text-primary">
                          {getInitial(customer.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-foreground">{customer.name}</p>
                          <p className="truncate text-sm text-muted-foreground">
                            {customer.email || `${customer.licenses} licenses`}
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-4">
                        <StatusBadge status={customer.status} />
                        <span className="hidden text-xs text-muted-foreground md:block">{customer.lastActivity}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyPanel
                  icon={Users}
                  title="No customers yet"
                  description="New customers will appear here after they register."
                />
              )}
            </CardContent>
          </Card>

          <Card className="glass border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-success" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full justify-start gap-3 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30">
                <Link to="/admin/licenses/new">
                  <Plus className="w-4 h-4" />
                  Create New License
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full justify-start gap-3 border-border hover:bg-secondary bg-transparent"
              >
                <Link to="/register">
                  <Users className="w-4 h-4" />
                  Add Customer
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full justify-start gap-3 border-border hover:bg-secondary bg-transparent"
              >
                <Link to="/admin/licenses">
                  <RefreshCw className="w-4 h-4" />
                  Process Renewals
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full justify-start gap-3 border-border hover:bg-secondary bg-transparent"
              >
                <Link to="/admin/notifications">
                  <AlertTriangle className="w-4 h-4" />
                  View Alerts
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <Card className="glass border-border xl:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-foreground flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-warning" />
                Renewal Queue
              </CardTitle>
              <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
                <Link to="/admin/licenses">
                  Open Licenses
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {renewalQueue.length > 0 ? (
                <div className="space-y-3">
                  {renewalQueue.map((license) => (
                    <Link
                      key={license.id}
                      to={`/admin/licenses/${license.id}`}
                      className="grid gap-3 rounded-lg border border-border bg-secondary/25 p-4 transition-colors hover:bg-secondary/45 md:grid-cols-[1fr_auto]"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate font-medium text-foreground">
                            {license.customer_username || "Unassigned customer"}
                          </p>
                          <StatusBadge status={license.status} />
                        </div>
                        <p className="mt-1 truncate text-sm text-muted-foreground">
                          {license.product_name || "No product"} - {license.license_key || `License #${license.id}`}
                        </p>
                      </div>
                      <div className="text-left md:text-right">
                        <p className="text-sm font-medium text-foreground">{formatRenewalWindow(license.expiration_at)}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{formatDate(license.expiration_at)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyPanel
                  icon={CheckCircle2}
                  title="No urgent renewals"
                  description="Expired and expiring licenses will be listed here when attention is needed."
                />
              )}
            </CardContent>
          </Card>

          <Card className="glass border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                Product Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topProducts.length > 0 ? (
                <div className="space-y-4">
                  {topProducts.map((product) => (
                    <div key={product.id || product.name} className="space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">{product.name}</p>
                          {product.slug && <p className="truncate text-xs text-muted-foreground">{product.slug}</p>}
                        </div>
                        <span className="shrink-0 text-sm font-semibold text-foreground">{product.licenses}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{
                            width: product.licenses
                              ? `${Math.max((product.licenses / productLicenseMax) * 100, 4)}%`
                              : "0%",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyPanel
                  icon={Package}
                  title="No products yet"
                  description="Product usage appears after products are created."
                />
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {alertItems.map((item) => {
            const Icon = item.icon

            return (
              <Link
                key={item.title}
                to={item.href}
                className="rounded-xl border border-border bg-card/60 p-4 transition-colors hover:bg-secondary/30"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className={`text-sm font-medium ${item.tone}`}>{item.title}</p>
                    <p className="mt-2 text-3xl font-bold text-foreground">{item.value}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/60">
                    <Icon className={`h-5 w-5 ${item.tone}`} />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
        </>
        )}
      </div>
    </div>
  )
}
