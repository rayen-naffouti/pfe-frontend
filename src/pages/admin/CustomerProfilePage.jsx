import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { AdminHeader } from "@/components/AdminHeader"
import { StatusBadge } from "@/components/StatusBadge"
import { LicenseKeyField } from "@/components/LicenseKeyField"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { EmptyState, ErrorState, LoadingState } from "@/components/DataState"
import { Key, CreditCard, Bell, Mail, Building, MapPin, ArrowLeft, Edit, Plus } from "lucide-react"
import { customersApi, getApiErrorMessage } from "@/lib/api"
import { formatCurrency, formatDate, getLicenseStatus } from "@/lib/formatters"

export default function CustomerProfilePage() {
  const { id } = useParams()
  const [customer, setCustomer] = useState(null)
  const [licenses, setLicenses] = useState([])
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchCustomerProfile = async () => {
    setLoading(true)
    setError(null)

    try {
      const [customerResponse, licensesResponse, paymentsResponse] = await Promise.all([
        customersApi.get(id),
        customersApi.licenses(id),
        customersApi.payments(id),
      ])
      setCustomer(customerResponse.data)
      setLicenses(licensesResponse.data)
      setPayments(paymentsResponse.data)
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to load customer profile"))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomerProfile()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen">
        <AdminHeader title="Customer Profile" subtitle={`Customer #${id}`} />
        <div className="p-6">
          <LoadingState message="Loading customer profile..." />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <AdminHeader title="Customer Profile" subtitle={`Customer #${id}`} />
        <div className="p-6 space-y-6">
          <Button variant="ghost" asChild>
            <Link to="/admin/customers">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Customers
            </Link>
          </Button>
          <ErrorState message={error} onRetry={fetchCustomerProfile} />
        </div>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="min-h-screen">
        <AdminHeader title="Customer Profile" subtitle={`Customer #${id}`} />
        <div className="p-6">
          <EmptyState message="Customer not found" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <AdminHeader title="Customer Profile" subtitle={customer.username} />

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
                  {customer.username?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{customer.username}</h2>
                  <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {customer.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Building className="w-4 h-4" />
                      {customer.role || "customer"}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      Joined {formatDate(customer.created_at)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="border-border bg-transparent">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
                <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Link to="/admin/licenses/new">
                    <Plus className="w-4 h-4 mr-2" />
                    Add License
                  </Link>
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
              {licenses.length === 0 && <EmptyState message="No licenses found for this customer" />}
              {licenses.map((license) => (
                <Card
                  key={license.id}
                  className="glass border-border hover:glow-blue transition-all duration-300 cursor-pointer"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground">{license.product_name || "N/A"}</p>
                        <LicenseKeyField
                          value={license.license_key}
                          fallback={`#${license.id}`}
                          className="mt-1 max-w-full"
                          buttonClassName="h-7 w-7"
                        />
                      </div>
                      <StatusBadge status={getLicenseStatus(license)} />
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status</span>
                        <span className="text-foreground capitalize">{license.status || "valid"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Expires</span>
                        <span className="text-foreground">{formatDate(license.expiration_at)}</span>
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
                  {payments.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        No payments found for this customer
                      </TableCell>
                    </TableRow>
                  )}
                  {payments.map((item) => (
                    <TableRow key={item.id} className="border-border hover:bg-secondary/30">
                      <TableCell className="text-muted-foreground">{formatDate(item.created_at)}</TableCell>
                      <TableCell className="text-foreground">Payment for license #{item.license_id}</TableCell>
                      <TableCell className="text-foreground font-medium">
                        {formatCurrency(item.amount, item.currency || "USD")}
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-success/10 text-success border-success/30">{item.status || "paid"}</Badge>
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
