"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { AdminHeader } from "@/components/AdminHeader"
import { StatusBadge } from "@/components/StatusBadge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Key, User, Package, Calendar, Shield, Save, ArrowLeft } from "lucide-react"

export default function CreateLicensePage() {
  const [activationLimit, setActivationLimit] = useState([10])
  const [autoRenew, setAutoRenew] = useState(false)

  return (
    <div className="min-h-screen">
      <AdminHeader title="Create New License" subtitle="Generate a new license key" />

      <div className="p-6">
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
                    <Select>
                      <SelectTrigger className="bg-input border-border">
                        <SelectValue placeholder="Choose a customer" />
                      </SelectTrigger>
                      <SelectContent className="glass-strong border-border">
                        <SelectItem value="acme">Acme Corporation</SelectItem>
                        <SelectItem value="techstart">TechStart Inc.</SelectItem>
                        <SelectItem value="globaltech">GlobalTech Ltd.</SelectItem>
                        <SelectItem value="new">+ Add New Customer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Contact Email</Label>
                    <Input id="email" placeholder="contact@company.com" className="bg-input border-border" />
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
                    <Select>
                      <SelectTrigger className="bg-input border-border">
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent className="glass-strong border-border">
                        <SelectItem value="enterprise">Enterprise Suite</SelectItem>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="standard">Standard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>License Type</Label>
                    <Select>
                      <SelectTrigger className="bg-input border-border">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent className="glass-strong border-border">
                        <SelectItem value="perpetual">Perpetual</SelectItem>
                        <SelectItem value="subscription">Subscription</SelectItem>
                        <SelectItem value="annual">Annual</SelectItem>
                        <SelectItem value="trial">Trial</SelectItem>
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
                    <Label>Start Date</Label>
                    <Input type="date" className="bg-input border-border" />
                  </div>
                  <div className="space-y-2">
                    <Label>Duration</Label>
                    <Select>
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
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground glow-blue">
                <Save className="w-4 h-4 mr-2" />
                Create License
              </Button>
            </div>
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
                    <code className="text-sm font-mono text-primary break-all">XXXX-XXXX-XXXX-XXXX</code>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Customer</span>
                      <span className="text-sm text-foreground">Not Selected</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Product</span>
                      <span className="text-sm text-foreground">Not Selected</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Status</span>
                      <StatusBadge status="valid" />
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
      </div>
    </div>
  )
}
