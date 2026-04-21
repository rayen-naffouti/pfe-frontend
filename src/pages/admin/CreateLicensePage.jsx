"use client"

import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { AdminHeader } from "@/components/AdminHeader"
import { StatusBadge } from "@/components/StatusBadge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { ErrorState, LoadingState } from "@/components/DataState"
import { Key, User, Package, Calendar, Shield, Save, ArrowLeft, Loader2 } from "lucide-react"
import { customersApi, getApiErrorMessage, licensesApi, productsApi } from "@/lib/api"
import { getLicenseStatus } from "@/lib/formatters"

export default function CreateLicensePage() {
  const navigate = useNavigate()
  const [activationLimit, setActivationLimit] = useState([10])
  const [autoRenew, setAutoRenew] = useState(false)
  const [customers, setCustomers] = useState([])
  const [products, setProducts] = useState([])
  const [loadingOptions, setLoadingOptions] = useState(true)
  const [optionsError, setOptionsError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [form, setForm] = useState({
    customer_id: "",
    product_id: "",
    status: "trial",
    expiration_at: "",
  })

  const fetchOptions = async () => {
    setLoadingOptions(true)
    setOptionsError(null)

    try {
      const [customersResponse, productsResponse] = await Promise.all([
        customersApi.list(),
        productsApi.list(),
      ])
      setCustomers(customersResponse.data)
      setProducts(productsResponse.data)
    } catch (err) {
      setOptionsError(getApiErrorMessage(err, "Failed to load customers and products"))
    } finally {
      setLoadingOptions(false)
    }
  }

  useEffect(() => {
    fetchOptions()
  }, [])

  const selectedCustomer = customers.find((customer) => String(customer.id) === form.customer_id)
  const selectedProduct = products.find((product) => String(product.id) === form.product_id)

  const updateForm = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const setExpirationFromDuration = (duration) => {
    const date = new Date()

    if (duration === "14d") {
      date.setDate(date.getDate() + 14)
    } else if (duration === "30d") {
      date.setDate(date.getDate() + 30)
    } else if (duration === "1y") {
      date.setFullYear(date.getFullYear() + 1)
    } else if (duration === "perpetual") {
      date.setFullYear(2099, 11, 31)
    }

    updateForm("expiration_at", date.toISOString().split("T")[0])
  }

  const handleCreateLicense = async () => {
    setSubmitError(null)

    if (!form.customer_id || !form.product_id || !form.expiration_at) {
      setSubmitError("Customer, product and expiration date are required")
      return
    }

    setSubmitting(true)

    try {
      const { data } = await licensesApi.create({
        customer_id: Number(form.customer_id),
        product_id: Number(form.product_id),
        status: form.status,
        expiration_at: form.expiration_at,
      })

      navigate(`/admin/licenses/${data.license.id}`)
    } catch (err) {
      setSubmitError(getApiErrorMessage(err, "Failed to create license"))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen">
      <AdminHeader title="Create New License" subtitle="Generate a new license key" />

      <div className="p-6">
        {loadingOptions && <LoadingState message="Loading customers and products..." />}

        {optionsError && !loadingOptions && <ErrorState message={optionsError} onRetry={fetchOptions} />}

        {!loadingOptions && !optionsError && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="glass border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customer">Select Customer</Label>
                    <Select value={form.customer_id} onValueChange={(value) => updateForm("customer_id", value)}>
                      <SelectTrigger className="bg-input border-border">
                        <SelectValue placeholder="Choose a customer" />
                      </SelectTrigger>
                      <SelectContent className="glass-strong border-border">
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={String(customer.id)}>
                            {customer.username}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Contact Email</Label>
                    <Input
                      id="email"
                      value={selectedCustomer?.email || ""}
                      readOnly
                      placeholder="Select a customer"
                      className="bg-input border-border"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  Product Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Product</Label>
                    <Select value={form.product_id} onValueChange={(value) => updateForm("product_id", value)}>
                      <SelectTrigger className="bg-input border-border">
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent className="glass-strong border-border">
                        {products.map((product) => (
                          <SelectItem key={product.id} value={String(product.id)}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={form.status} onValueChange={(value) => updateForm("status", value)}>
                      <SelectTrigger className="bg-input border-border">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent className="glass-strong border-border">
                        <SelectItem value="trial">Trial</SelectItem>
                        <SelectItem value="valid">Valid</SelectItem>
                        <SelectItem value="disabled">Disabled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Features / Add-ons</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {["API Access", "Priority Support", "White Label", "Custom Branding"].map((feature) => (
                      <label
                        key={feature}
                        className="flex items-center gap-2 p-3 rounded-lg bg-secondary/30 border border-border cursor-pointer hover:bg-secondary/50 transition-colors"
                      >
                        <input type="checkbox" className="rounded border-border text-primary focus:ring-primary" />
                        <span className="text-sm text-foreground">{feature}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Duration & Limits
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Expiration Date</Label>
                    <Input
                      type="date"
                      className="bg-input border-border"
                      value={form.expiration_at}
                      onChange={(event) => updateForm("expiration_at", event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Duration</Label>
                    <Select onValueChange={setExpirationFromDuration}>
                      <SelectTrigger className="bg-input border-border">
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent className="glass-strong border-border">
                        <SelectItem value="14d">14 Days (Trial)</SelectItem>
                        <SelectItem value="30d">30 Days</SelectItem>
                        <SelectItem value="1y">1 Year</SelectItem>
                        <SelectItem value="perpetual">Perpetual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Activation Limit</Label>
                    <span className="text-sm font-mono text-primary">{activationLimit[0]} devices</span>
                  </div>
                  <Slider
                    value={activationLimit}
                    onValueChange={setActivationLimit}
                    max={100}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border">
                  <div>
                    <Label className="text-foreground">Auto-Renew</Label>
                    <p className="text-sm text-muted-foreground">Automatically renew this license before expiration</p>
                  </div>
                  <Switch checked={autoRenew} onCheckedChange={setAutoRenew} />
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Security Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Encryption Algorithm</Label>
                    <Select defaultValue="rsa2048">
                      <SelectTrigger className="bg-input border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="glass-strong border-border">
                        <SelectItem value="rsa2048">RSA-2048</SelectItem>
                        <SelectItem value="rsa4096">RSA-4096</SelectItem>
                        <SelectItem value="ecc256">ECC P-256</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Hardware Binding</Label>
                    <Select defaultValue="none">
                      <SelectTrigger className="bg-input border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="glass-strong border-border">
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="machine">Machine ID</SelectItem>
                        <SelectItem value="mac">MAC Address</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-between">
              <Button variant="outline" asChild className="border-border bg-transparent">
                <Link to="/admin/licenses">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Cancel
                </Link>
              </Button>
              <Button
                className="bg-primary hover:bg-primary/90 text-primary-foreground glow-blue"
                disabled={submitting}
                onClick={handleCreateLicense}
              >
                {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                {submitting ? "Creating..." : "Create License"}
              </Button>
            </div>

            {submitError && <ErrorState message={submitError} />}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card className="glass border-border neon-border">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    <Key className="w-5 h-5 text-primary" />
                    License Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg bg-secondary/30 border border-border">
                    <p className="text-xs text-muted-foreground mb-1">License Key</p>
                    <code className="text-sm font-mono text-primary break-all">Generated after save</code>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Customer</span>
                      <span className="text-sm text-foreground">{selectedCustomer?.username || "Not Selected"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Product</span>
                      <span className="text-sm text-foreground">{selectedProduct?.name || "Not Selected"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Status</span>
                      <StatusBadge status={getLicenseStatus(form)} />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Activations</span>
                      <span className="text-sm text-foreground">0/{activationLimit[0]}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Auto-Renew</span>
                      <span className="text-sm text-foreground">{autoRenew ? "Enabled" : "Disabled"}</span>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Shield className="w-4 h-4 text-success" />
                      <span>License will be digitally signed</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  )
}
