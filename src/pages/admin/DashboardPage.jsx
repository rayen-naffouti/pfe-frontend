import { useEffect, useMemo, useState } from "react"
import { AdminHeader } from "@/components/AdminHeader"
import { StatsCard } from "@/components/StatsCard"
import { StatusBadge } from "@/components/StatusBadge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ErrorState, LoadingState } from "@/components/DataState"
import { Key, Users, AlertTriangle, Clock, TrendingUp, RefreshCw, Plus, ArrowRight, Activity } from "lucide-react"
import { customersApi, getApiErrorMessage, licensesApi, productsApi } from "@/lib/api"
import { getLicenseStatus } from "@/lib/formatters"
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

const renewalData = [
  { month: "Jan", renewals: 45 },
  { month: "Feb", renewals: 52 },
  { month: "Mar", renewals: 48 },
  { month: "Apr", renewals: 61 },
  { month: "May", renewals: 55 },
  { month: "Jun", renewals: 67 },
  { month: "Jul", renewals: 72 },
]

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
      { valid: 0, expired: 0, trial: 0, expiring: 0 },
    )
  }, [licenses])

  const licenseDistribution = [
    { name: "Active", value: licenseStats.valid || 0, color: "#22c55e" },
    { name: "Expired", value: licenseStats.expired || 0, color: "#ef4444" },
    { name: "Trial", value: licenseStats.trial || 0, color: "#06b6d4" },
    { name: "Expiring", value: licenseStats.expiring || 0, color: "#f59e0b" },
  ]

  const recentCustomers = customers.slice(0, 5).map((customer) => ({
    id: customer.id,
    name: customer.username,
    licenses: Number(customer.license_count || 0),
    status: Number(customer.license_count || 0) > 0 ? "valid" : "trial",
    lastActivity: "Recently",
  }))

  return (
    <div className="min-h-screen">
      <AdminHeader title="Dashboard" subtitle="Welcome back, Admin" />

      <div className="p-6 space-y-6">
        {loading && <LoadingState message="Loading dashboard data..." />}

        {error && !loading && <ErrorState message={error} onRetry={fetchDashboard} />}

        {!loading && !error && (
        <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Active Licenses"
            value={licenseStats.valid || 0}
            change={`${products.length} product(s)`}
            changeType="neutral"
            icon={Key}
            iconColor="text-primary"
          />
          <StatsCard
            title="Expired Licenses"
            value={licenseStats.expired || 0}
            change={`${licenses.length} total licenses`}
            changeType={(licenseStats.expired || 0) > 0 ? "negative" : "positive"}
            icon={AlertTriangle}
            iconColor="text-destructive"
          />
          <StatsCard
            title="Trial Licenses"
            value={licenseStats.trial || 0}
            change={`${customers.length} customer(s)`}
            changeType="neutral"
            icon={Clock}
            iconColor="text-accent"
          />
          <StatsCard
            title="Renewals Needed"
            value={licenseStats.expiring || 0}
            change="Within 30 days"
            changeType={(licenseStats.expiring || 0) > 0 ? "negative" : "positive"}
            icon={RefreshCw}
            iconColor="text-warning"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 glass border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-foreground flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Renewals Trend
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                View Report
              </Button>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={renewalData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.03 260)" />
                  <XAxis dataKey="month" stroke="oklch(0.6 0.02 260)" fontSize={12} />
                  <YAxis stroke="oklch(0.6 0.02 260)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "oklch(0.16 0.025 260)",
                      border: "1px solid oklch(0.25 0.03 260)",
                      borderRadius: "8px",
                      color: "oklch(0.95 0.01 260)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="renewals"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: "#06b6d4" }}
                  />
                </LineChart>
              </ResponsiveContainer>
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
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "oklch(0.16 0.025 260)",
                      border: "1px solid oklch(0.25 0.03 260)",
                      borderRadius: "8px",
                      color: "oklch(0.95 0.01 260)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
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
              <Button variant="ghost" size="sm" className="text-primary">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentCustomers.map((customer) => (
                  <div
                    key={customer.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                        {customer.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{customer.name}</p>
                        <p className="text-sm text-muted-foreground">{customer.licenses} licenses</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <StatusBadge status={customer.status} />
                      <span className="text-xs text-muted-foreground hidden md:block">{customer.lastActivity}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start gap-3 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30">
                <Plus className="w-4 h-4" />
                Create New License
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-3 border-border hover:bg-secondary bg-transparent"
              >
                <Users className="w-4 h-4" />
                Add Customer
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-3 border-border hover:bg-secondary bg-transparent"
              >
                <RefreshCw className="w-4 h-4" />
                Process Renewals
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-3 border-border hover:bg-secondary bg-transparent"
              >
                <AlertTriangle className="w-4 h-4" />
                View Alerts
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="glass border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-foreground flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              Recent Alerts
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              Clear All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-warning/10 border border-warning/30">
                <p className="font-medium text-warning">Expiring Soon</p>
                <p className="text-sm text-muted-foreground mt-1">{licenseStats.expiring || 0} licenses expiring within 30 days</p>
              </div>
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30">
                <p className="font-medium text-destructive">Expired Licenses</p>
                <p className="text-sm text-muted-foreground mt-1">{licenseStats.expired || 0} licenses are expired</p>
              </div>
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                <p className="font-medium text-primary">Customers</p>
                <p className="text-sm text-muted-foreground mt-1">{customers.length} customers registered</p>
              </div>
            </div>
          </CardContent>
        </Card>
        </>
        )}
      </div>
    </div>
  )
}
