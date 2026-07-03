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
  Bell,
  Mail,
} from "lucide-react"
import { customersApi, getApiErrorMessage, licensesApi, notificationsApi, productsApi } from "@/lib/api"
import { formatDate, formatDateTime, getLicenseStatus } from "@/lib/formatters"
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

const isCustomerActive = (customer) => {
  return customer?.is_active === true || customer?.is_active === "true" || Boolean(customer?.email_verified_at)
}

const getEmailStatusClassName = (status) => {
  if (status === "sent") {
    return "bg-success/10 text-success border-success/30"
  }

  if (status === "failed") {
    return "bg-destructive/10 text-destructive border-destructive/30"
  }

  if (status === "dry_run" || status === "disabled" || status === "skipped") {
    return "bg-muted text-muted-foreground border-muted"
  }

  return "bg-warning/10 text-warning border-warning/30"
}

const getNotificationEventLabel = (event) => {
  const labels = {
    license_created: "License created",
    license_renewed: "License renewed",
    license_expiration_reminder: "Expiration reminder",
    license_expired: "License expired",
  }

  return labels[event] || "Notification"
}

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

function OverviewPanel({
  activeRate,
  renewalRiskCount,
  activationRate,
  scheduledNotifications,
  totalProducts,
}) {
  const indicators = [
    { label: "Active rate", value: `${activeRate}%`, icon: ShieldCheck, tone: "text-success" },
    { label: "Renewal risk", value: renewalRiskCount, icon: AlertTriangle, tone: "text-warning" },
    { label: "Activation rate", value: `${activationRate}%`, icon: Users, tone: "text-accent" },
    { label: "Mail queue", value: scheduledNotifications, icon: Bell, tone: "text-primary" },
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
              <h2 className="text-2xl font-bold tracking-normal text-foreground">License and account operations</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Monitor license health, renewal pressure, account activation, and email automation from one workspace.
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
                <Link to="/admin/notifications">
                  <Bell className="mr-2 h-4 w-4" />
                  Review Notifications
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
            <div className="col-span-2 bg-card/70 px-5 py-3 text-xs text-muted-foreground">
              {totalProducts} product{totalProducts === 1 ? "" : "s"} monitored by the licensing workspace.
            </div>
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
  const [notifications, setNotifications] = useState([])
  const [unreadNotifications, setUnreadNotifications] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchDashboard = async () => {
    setLoading(true)
    setError(null)

    try {
      const [customersResponse, licensesResponse, productsResponse, notificationsResponse] = await Promise.all([
        customersApi.list(),
        licensesApi.list(),
        productsApi.list(),
        notificationsApi.list({ limit: 100, include_scheduled: true }),
      ])
      setCustomers(customersResponse.data)
      setLicenses(licensesResponse.data)
      setProducts(productsResponse.data)
      setNotifications(notificationsResponse.data.notifications || [])
      setUnreadNotifications(notificationsResponse.data.unread_count || 0)
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
  const activeCustomers = customers.filter(isCustomerActive).length
  const pendingActivationCustomers = Math.max(totalCustomers - activeCustomers, 0)
  const activeRate = totalLicenses ? Math.round((activeLicenses / totalLicenses) * 100) : 0
  const customerCoverage = totalCustomers ? Math.round((customersWithLicenses / totalCustomers) * 100) : 0
  const activationRate = totalCustomers ? Math.round((activeCustomers / totalCustomers) * 100) : 0

  const notificationStats = useMemo(() => {
    const emailNotifications = notifications.filter((notification) => notification.email_to || notification.email_status)
    const sentEmails = emailNotifications.filter((notification) => notification.email_status === "sent").length
    const failedEmails = emailNotifications.filter(
      (notification) => notification.email_status === "failed" || Boolean(notification.email_error),
    ).length
    const pendingEmails = emailNotifications.filter((notification) => notification.email_status === "pending").length
    const scheduledNotifications = notifications.filter((notification) => notification.status === "scheduled")
    const scheduledReminders = scheduledNotifications.filter((notification) =>
      ["license_expiration_reminder", "license_expired"].includes(notification.event),
    ).length
    const dueScheduled = scheduledNotifications.filter((notification) => {
      const scheduledTime = new Date(notification.scheduled_for || 0).getTime()

      return scheduledTime > 0 && scheduledTime <= Date.now()
    }).length
    const completedEmailAttempts = sentEmails + failedEmails
    const deliveryRate = completedEmailAttempts ? Math.round((sentEmails / completedEmailAttempts) * 100) : 100

    return {
      sentEmails,
      failedEmails,
      pendingEmails,
      scheduledReminders,
      dueScheduled,
      deliveryRate,
    }
  }, [notifications])

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
        active: isCustomerActive(customer),
        lastActivity: formatDate(customer.created_at, "Recently"),
      }))
  }, [customers])

  const pendingActivationQueue = useMemo(() => {
    return customers
      .filter((customer) => !isCustomerActive(customer))
      .sort((a, b) => {
        const dateA = new Date(a.activation_sent_at || a.created_at || 0).getTime()
        const dateB = new Date(b.activation_sent_at || b.created_at || 0).getTime()

        return dateB - dateA
      })
      .slice(0, 4)
  }, [customers])

  const latestEmailEvents = useMemo(() => {
    return notifications
      .filter((notification) => notification.email_to || notification.email_status)
      .sort((a, b) => {
        const dateA = new Date(a.email_sent_at || a.scheduled_for || a.sent_at || a.created_at || 0).getTime()
        const dateB = new Date(b.email_sent_at || b.scheduled_for || b.sent_at || b.created_at || 0).getTime()

        return dateB - dateA
      })
      .slice(0, 4)
  }, [notifications])

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
      title: "Pending activation",
      value: pendingActivationCustomers,
      description: "Accounts waiting for email confirmation.",
      icon: Users,
      tone: "text-primary",
      href: "/admin/customers",
    },
    {
      title: "Email delivery issues",
      value: notificationStats.failedEmails,
      description: "Notification emails that failed delivery.",
      icon: Mail,
      tone: "text-destructive",
      href: "/admin/notifications",
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
          activationRate={activationRate}
          scheduledNotifications={notificationStats.scheduledReminders}
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Activated Accounts"
            value={activeCustomers}
            change={`${activationRate}% activation rate`}
            changeType={pendingActivationCustomers > 0 ? "neutral" : "positive"}
            icon={ShieldCheck}
            iconColor="text-success"
          />
          <StatsCard
            title="Pending Activation"
            value={pendingActivationCustomers}
            change="Waiting for email confirmation"
            changeType={pendingActivationCustomers > 0 ? "negative" : "positive"}
            icon={Users}
            iconColor={pendingActivationCustomers > 0 ? "text-warning" : "text-success"}
          />
          <StatsCard
            title="Reminder Queue"
            value={notificationStats.scheduledReminders}
            change={
              notificationStats.dueScheduled > 0
                ? `${notificationStats.dueScheduled} due now`
                : `${notificationStats.pendingEmails} pending email(s)`
            }
            changeType={notificationStats.dueScheduled > 0 ? "negative" : "neutral"}
            icon={Bell}
            iconColor="text-primary"
          />
          <StatsCard
            title="Email Delivery"
            value={`${notificationStats.deliveryRate}%`}
            change={`${notificationStats.sentEmails} sent / ${notificationStats.failedEmails} failed`}
            changeType={notificationStats.failedEmails > 0 ? "negative" : "positive"}
            icon={Mail}
            iconColor={notificationStats.failedEmails > 0 ? "text-destructive" : "text-success"}
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <Card className="glass border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-foreground flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-success" />
                Account Activation
              </CardTitle>
              <Badge className="bg-primary/10 text-primary border-primary/30">{customerCoverage}% licensed</Badge>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-border bg-secondary/25 p-4">
                  <p className="text-2xl font-bold text-foreground">{activeCustomers}</p>
                  <p className="mt-1 text-xs uppercase tracking-normal text-muted-foreground">Activated</p>
                </div>
                <div className="rounded-lg border border-border bg-secondary/25 p-4">
                  <p className="text-2xl font-bold text-foreground">{pendingActivationCustomers}</p>
                  <p className="mt-1 text-xs uppercase tracking-normal text-muted-foreground">Pending</p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {pendingActivationQueue.length > 0 ? (
                  pendingActivationQueue.map((customer) => (
                    <Link
                      key={customer.id}
                      to={`/admin/customers/${customer.id}`}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border bg-secondary/25 p-3 transition-colors hover:bg-secondary/45"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {customer.username || "Unnamed customer"}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">{customer.email}</p>
                      </div>
                      <Badge className="shrink-0 bg-warning/10 text-warning border-warning/30">Pending</Badge>
                    </Link>
                  ))
                ) : (
                  <EmptyPanel
                    icon={CheckCircle2}
                    title="All accounts active"
                    description="Pending email confirmations will appear here after new customer registration."
                  />
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-border xl:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-foreground flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                Email Automation Health
              </CardTitle>
              <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
                <Link to="/admin/notifications">
                  Open Center
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <div className="rounded-lg border border-border bg-secondary/25 p-4">
                  <p className="text-2xl font-bold text-foreground">{notificationStats.sentEmails}</p>
                  <p className="mt-1 text-xs uppercase tracking-normal text-muted-foreground">Sent</p>
                </div>
                <div className="rounded-lg border border-border bg-secondary/25 p-4">
                  <p className="text-2xl font-bold text-foreground">{notificationStats.pendingEmails}</p>
                  <p className="mt-1 text-xs uppercase tracking-normal text-muted-foreground">Pending</p>
                </div>
                <div className="rounded-lg border border-border bg-secondary/25 p-4">
                  <p className="text-2xl font-bold text-foreground">{notificationStats.scheduledReminders}</p>
                  <p className="mt-1 text-xs uppercase tracking-normal text-muted-foreground">Scheduled</p>
                </div>
                <div className="rounded-lg border border-border bg-secondary/25 p-4">
                  <p className="text-2xl font-bold text-foreground">{unreadNotifications}</p>
                  <p className="mt-1 text-xs uppercase tracking-normal text-muted-foreground">Unread</p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {latestEmailEvents.length > 0 ? (
                  latestEmailEvents.map((notification) => (
                    <Link
                      key={notification.id}
                      to={notification.license_id ? `/admin/licenses/${notification.license_id}` : "/admin/notifications"}
                      className="grid gap-3 rounded-lg border border-border bg-secondary/25 p-3 transition-colors hover:bg-secondary/45 md:grid-cols-[1fr_auto]"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-sm font-medium text-foreground">
                            {getNotificationEventLabel(notification.event)}
                          </p>
                          <Badge className={getEmailStatusClassName(notification.email_status)}>
                            {notification.email_status || "pending"}
                          </Badge>
                        </div>
                        <p className="mt-1 truncate text-xs text-muted-foreground">
                          {[notification.customer_username, notification.product_name].filter(Boolean).join(" - ") ||
                            notification.email_to ||
                            "Email notification"}
                        </p>
                      </div>
                      <p className="text-left text-xs text-muted-foreground md:text-right">
                        {formatDateTime(
                          notification.email_sent_at ||
                            notification.scheduled_for ||
                            notification.sent_at ||
                            notification.created_at,
                          "Pending",
                        )}
                      </p>
                    </Link>
                  ))
                ) : (
                  <EmptyPanel
                    icon={Mail}
                    title="No email activity yet"
                    description="License purchase, renewal, reminder, and expiration emails will appear here."
                  />
                )}
              </div>
            </CardContent>
          </Card>
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
                        <Badge
                          className={
                            customer.active
                              ? "bg-success/10 text-success border-success/30"
                              : "bg-warning/10 text-warning border-warning/30"
                          }
                        >
                          {customer.active ? "Active" : "Pending"}
                        </Badge>
                        <span className="hidden text-xs text-muted-foreground md:block">
                          {customer.licenses} license{customer.licenses === 1 ? "" : "s"}
                        </span>
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
                  Register Customer
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
                  <Bell className="w-4 h-4" />
                  Notification Center
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full justify-start gap-3 border-border hover:bg-secondary bg-transparent"
              >
                <Link to="/admin/automation">
                  <Mail className="w-4 h-4" />
                  Email Automation
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

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
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
