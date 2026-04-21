"use client"

import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { AdminHeader } from "@/components/AdminHeader"
import { StatusBadge } from "@/components/StatusBadge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { EmptyState, ErrorState, LoadingState } from "@/components/DataState"
import { getApiErrorMessage, licensesApi } from "@/lib/api"
import { formatDate, formatDateTime, getLicenseStatus } from "@/lib/formatters"
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

export default function LicenseDetailPage() {
  const { id } = useParams()
  const [license, setLicense] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)

  const fetchLicense = async () => {
    setLoading(true)
    setError(null)

    try {
      const [licenseResponse, historyResponse] = await Promise.all([
        licensesApi.get(id),
        licensesApi.history(id),
      ])
      setLicense(licenseResponse.data)
      setHistory(historyResponse.data)
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to load license details"))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLicense()
  }, [id])

  const handleCopy = async () => {
    if (!license?.license_key) {
      return
    }

    await navigator.clipboard.writeText(license.license_key)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <AdminHeader title="License Details" subtitle={`License #${id}`} />
        <div className="p-6">
          <LoadingState message="Loading license details..." />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <AdminHeader title="License Details" subtitle={`License #${id}`} />
        <div className="p-6 space-y-6">
          <Button variant="ghost" asChild>
            <Link to="/admin/licenses">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Licenses
            </Link>
          </Button>
          <ErrorState message={error} onRetry={fetchLicense} />
        </div>
      </div>
    )
  }

  if (!license) {
    return (
      <div className="min-h-screen">
        <AdminHeader title="License Details" subtitle={`License #${id}`} />
        <div className="p-6">
          <EmptyState message="License not found" />
        </div>
      </div>
    )
  }

  const status = getLicenseStatus(license)

  return (
    <div className="min-h-screen">
      <AdminHeader title="License Details" subtitle={license.license_key || `License #${license.id}`} />

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
                    <h2 className="text-xl font-bold text-foreground">{license.customer_username || "N/A"}</h2>
                    <StatusBadge status={status} />
                  </div>
                  <p className="text-muted-foreground">{license.product_name || "N/A"}</p>
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
                  <code className="flex-1 text-lg font-mono text-primary break-all">{license.license_key}</code>
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
                      <p className="font-medium text-foreground">{license.customer_username || "N/A"}</p>
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
                      <p className="font-medium text-foreground">{license.product_name || "N/A"}</p>
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
                      <p className="font-medium text-foreground">{formatDate(license.expiration_at)}</p>
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
                      <p className="text-sm text-muted-foreground">Created</p>
                      <p className="font-medium text-foreground">{formatDate(license.license_created_at || license.created_at)}</p>
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
                    {history.length === 0 && (
                      <p className="text-sm text-muted-foreground pl-10">No history entries yet.</p>
                    )}
                    {history.map((log) => (
                      <div key={log.id} className="relative pl-10">
                        <div className="absolute left-2.5 w-3 h-3 rounded-full bg-primary ring-4 ring-background" />
                        <div className="p-4 rounded-lg bg-secondary/30 border border-border">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-foreground">{log.action}</span>
                            <span className="text-xs text-muted-foreground">{formatDateTime(log.created_at)}</span>
                          </div>
                          <div className="flex gap-4 text-sm text-muted-foreground">
                            {log.old_status && <span>From: {log.old_status}</span>}
                            {log.new_status && <span>To: {log.new_status}</span>}
                            {log.note && <span>{log.note}</span>}
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
                    <div className="p-3 rounded-lg bg-secondary/30 border border-border text-sm text-muted-foreground">
                      Activation devices are not exposed by the current backend API.
                    </div>
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
                    {history.length === 0 && <p>No verification or history logs available.</p>}
                    {history.map((log) => (
                      <p key={log.id}>
                        [{formatDateTime(log.created_at)}] {log.action}
                        {log.note ? ` - ${log.note}` : ""}
                      </p>
                    ))}
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
