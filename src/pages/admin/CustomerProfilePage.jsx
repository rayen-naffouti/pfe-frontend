import { Link } from "react-router-dom"
import { AdminHeader } from "@/components/AdminHeader"
import { StatusBadge } from "@/components/StatusBadge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Key, CreditCard, Bell, Mail, Phone, Building, MapPin, ArrowLeft, Edit, Plus } from "lucide-react"

const customerLicenses = [
  { id: "LIC-2024-001", product: "Enterprise Suite", type: "Perpetual", status: "valid", expiration: "2025-12-31" },
  { id: "LIC-2024-015", product: "Professional", type: "Annual", status: "valid", expiration: "2024-08-15" },
  { id: "LIC-2024-023", product: "Standard", type: "Subscription", status: "expiring", expiration: "2024-01-25" },
]

const billingHistory = [
  { date: "2024-01-15", description: "License Renewal - Enterprise Suite", amount: "$2,499.00", status: "Paid" },
  { date: "2023-12-01", description: "License Purchase - Professional", amount: "$999.00", status: "Paid" },
  { date: "2023-06-15", description: "License Upgrade", amount: "$500.00", status: "Paid" },
]

export default function CustomerProfilePage() {
  return (
    <div className="min-h-screen">
      <AdminHeader title="Customer Profile" subtitle="Acme Corporation" />

      <div className="p-6 space-y-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link to="/admin/customers">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Customers
          </Link>
        </Button>

        <Card className="glass border-border">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-primary text-3xl font-bold">
                  A
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Acme Corporation</h2>
                  <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      admin@acme.com
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      +1 (555) 123-4567
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Building className="w-4 h-4" />
                      Technology
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      San Francisco, CA
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="border-border bg-transparent">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Plus className="w-4 h-4 mr-2" />
                  Add License
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="licenses" className="space-y-6">
          <TabsList className="glass border-border p-1">
            <TabsTrigger
              value="licenses"
              className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
            >
              <Key className="w-4 h-4 mr-2" />
              Licenses
            </TabsTrigger>
            <TabsTrigger value="billing" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
              <CreditCard className="w-4 h-4 mr-2" />
              Billing
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
            >
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="licenses">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {customerLicenses.map((license) => (
                <Card
                  key={license.id}
                  className="glass border-border hover:glow-blue transition-all duration-300 cursor-pointer"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-medium text-foreground">{license.product}</p>
                        <code className="text-xs text-muted-foreground">{license.id}</code>
                      </div>
                      <StatusBadge status={license.status} />
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Type</span>
                        <span className="text-foreground">{license.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Expires</span>
                        <span className="text-foreground">{license.expiration}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="billing">
            <Card className="glass border-border overflow-hidden">
              <CardHeader>
                <CardTitle className="text-foreground">Billing History</CardTitle>
              </CardHeader>
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground">Date</TableHead>
                    <TableHead className="text-muted-foreground">Description</TableHead>
                    <TableHead className="text-muted-foreground">Amount</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {billingHistory.map((item, index) => (
                    <TableRow key={index} className="border-border hover:bg-secondary/30">
                      <TableCell className="text-muted-foreground">{item.date}</TableCell>
                      <TableCell className="text-foreground">{item.description}</TableCell>
                      <TableCell className="text-foreground font-medium">{item.amount}</TableCell>
                      <TableCell>
                        <Badge className="bg-success/10 text-success border-success/30">{item.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card className="glass border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  { label: "License Expiration Alerts", description: "Get notified before licenses expire" },
                  { label: "Renewal Reminders", description: "Receive renewal reminders via email" },
                  { label: "Security Alerts", description: "Notifications for suspicious activities" },
                  { label: "Product Updates", description: "News about new features and updates" },
                  { label: "Billing Notifications", description: "Payment confirmations and invoices" },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border"
                  >
                    <div>
                      <Label className="text-foreground">{item.label}</Label>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <Switch defaultChecked={index < 3} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
