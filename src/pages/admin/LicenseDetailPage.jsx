"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { AdminHeader } from "@/components/AdminHeader"
import { StatusBadge } from "@/components/StatusBadge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  Key,
  User,
  Package,
  Calendar,
  Shield,
  RefreshCw,
  Edit,
  Copy,
  Check,
  Monitor,
  Clock,
  ArrowLeft,
  Activity,
  AlertTriangle,
} from "lucide-react"

const activityLog = [
  { date: "2024-01-15 14:32", action: "License Activated", device: "MacBook Pro M2", ip: "192.168.1.100" },
  { date: "2024-01-14 09:15", action: "License Verified", device: "Windows Desktop", ip: "10.0.0.55" },
  { date: "2024-01-10 16:45", action: "License Created", device: "Admin Portal", ip: "Admin" },
]

const activationHistory = [
  { device: "MacBook Pro M2", os: "macOS 14.2", activated: "2024-01-15", status: "Active" },
  { device: "Windows Desktop", os: "Windows 11", activated: "2024-01-14", status: "Active" },
  { device: "Linux Server", os: "Ubuntu 22.04", activated: "2024-01-12", status: "Deactivated" },
]

export default function LicenseDetailPage() {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText("LIC-2024-001-ACME-XXXX-YYYY-ZZZZ")
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen">
      <AdminHeader title="License Details" subtitle="LIC-2024-001" />

      <div className="p-6 space-y-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link to="/admin/licenses">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Licenses
          </Link>
        </Button>

        <Card className="glass border-border">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Key className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-foreground">Acme Corporation</h2>
                    <StatusBadge status="valid" />
                  </div>
                  <p className="text-muted-foreground">Enterprise Suite - Perpetual License</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="border-border bg-transparent">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground glow-blue">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Renew License
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="glass border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Key className="w-5 h-5 text-primary" />
                  License Key
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary/30 border border-border">
                  <code className="flex-1 text-lg font-mono text-primary">LIC-2024-001-ACME-XXXX-YYYY-ZZZZ</code>
                  <Button variant="ghost" size="icon" onClick={handleCopy}>
                    {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="glass border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Customer</p>
                      <p className="font-medium text-foreground">Acme Corporation</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="glass border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Package className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Product</p>
                      <p className="font-medium text-foreground">Enterprise Suite</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="glass border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Expiration</p>
                      <p className="font-medium text-foreground">December 31, 2025</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="glass border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Monitor className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Activations</p>
                      <p className="font-medium text-foreground">5 / 10 devices</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="glass border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Activity Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
                  <div className="space-y-6">
                    {activityLog.map((log, index) => (
                      <div key={index} className="relative pl-10">
                        <div className="absolute left-2.5 w-3 h-3 rounded-full bg-primary ring-4 ring-background" />
                        <div className="p-4 rounded-lg bg-secondary/30 border border-border">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-foreground">{log.action}</span>
                            <span className="text-xs text-muted-foreground">{log.date}</span>
                          </div>
                          <div className="flex gap-4 text-sm text-muted-foreground">
                            <span>Device: {log.device}</span>
                            <span>IP: {log.ip}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Accordion type="multiple" className="space-y-4">
              <AccordionItem value="activations" className="glass border-border rounded-lg px-4">
                <AccordionTrigger className="text-foreground hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Monitor className="w-5 h-5 text-primary" />
                    Activation History
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 pt-2">
                    {activationHistory.map((device, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border"
                      >
                        <div>
                          <p className="font-medium text-foreground">{device.device}</p>
                          <p className="text-sm text-muted-foreground">{device.os}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">{device.activated}</p>
                          <span
                            className={`text-xs ${device.status === "Active" ? "text-success" : "text-muted-foreground"}`}
                          >
                            {device.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="logs" className="glass border-border rounded-lg px-4">
                <AccordionTrigger className="text-foreground hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    Verification Logs
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="p-4 rounded-lg bg-secondary/30 border border-border font-mono text-sm text-muted-foreground">
                    <p>[2024-01-15 14:32:15] License verified successfully</p>
                    <p>[2024-01-15 14:32:14] Signature validation: PASSED</p>
                    <p>[2024-01-15 14:32:13] Hardware ID check: PASSED</p>
                    <p>[2024-01-15 14:32:12] Expiration check: VALID</p>
                    <p>[2024-01-15 14:32:11] Verification request received</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <div className="space-y-6">
            <Card className="glass border-border neon-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Encryption</span>
                  <span className="text-sm font-mono text-primary">RSA-2048</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Hardware Binding</span>
                  <span className="text-sm text-foreground">Machine ID</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Signature</span>
                  <span className="text-sm text-success">Valid</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Tamper Detection</span>
                  <span className="text-sm text-success">Enabled</span>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start border-border bg-transparent">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset Activations
                </Button>
                <Button variant="outline" className="w-full justify-start border-border bg-transparent">
                  <Key className="w-4 h-4 mr-2" />
                  Regenerate Key
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-warning/50 text-warning hover:bg-warning/10 bg-transparent"
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Suspend License
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
