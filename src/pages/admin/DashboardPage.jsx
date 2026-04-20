import { AdminHeader } from "@/components/AdminHeader"
import { StatsCard } from "@/components/StatsCard"
import { StatusBadge } from "@/components/StatusBadge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Key, Users, AlertTriangle, Clock, TrendingUp, RefreshCw, Plus, ArrowRight, Activity } from "lucide-react"
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

const licenseDistribution = [
  { name: "Active", value: 847, color: "#22c55e" },
  { name: "Expired", value: 124, color: "#ef4444" },
  { name: "Trial", value: 89, color: "#06b6d4" },
  { name: "Expiring", value: 56, color: "#f59e0b" },
]

const recentCustomers = [
  { name: "Acme Corporation", licenses: 12, status: "valid", lastActivity: "2 hours ago" },
  { name: "TechStart Inc.", licenses: 5, status: "trial", lastActivity: "5 hours ago" },
  { name: "GlobalTech Ltd.", licenses: 28, status: "expiring", lastActivity: "1 day ago" },
  { name: "InnovateCo", licenses: 8, status: "valid", lastActivity: "2 days ago" },
  { name: "DataFlow Systems", licenses: 15, status: "expired", lastActivity: "3 days ago" },
]

export default function DashboardPage() {
  return (
    <div className="min-h-screen">
      <AdminHeader title="Dashboard" subtitle="Welcome back, Admin" />

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Active Licenses"
            value="847"
            change="+12% from last month"
            changeType="positive"
            icon={Key}
            iconColor="text-primary"
          />
          <StatsCard
            title="Expired Licenses"
            value="124"
            change="-8% from last month"
            changeType="positive"
            icon={AlertTriangle}
            iconColor="text-destructive"
          />
          <StatsCard
            title="Trial Licenses"
            value="89"
            change="+5 new this week"
            changeType="neutral"
            icon={Clock}
            iconColor="text-accent"
          />
          <StatsCard
            title="Renewals Needed"
            value="56"
            change="Within 30 days"
            changeType="negative"
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
                {recentCustomers.map((customer, index) => (
                  <div
                    key={index}
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
                <p className="text-sm text-muted-foreground mt-1">15 licenses expiring within 7 days</p>
              </div>
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30">
                <p className="font-medium text-destructive">Failed Activations</p>
                <p className="text-sm text-muted-foreground mt-1">3 activation attempts failed today</p>
              </div>
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                <p className="font-medium text-primary">New Registrations</p>
                <p className="text-sm text-muted-foreground mt-1">8 new customers this week</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
