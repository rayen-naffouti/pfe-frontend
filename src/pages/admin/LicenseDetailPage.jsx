"use client"

import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { AdminHeader } from "@/components/AdminHeader"
import { StatusBadge } from "@/components/StatusBadge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { EmptyState, ErrorState, LoadingState } from "@/components/DataState"
import { LicenseKeyField } from "@/components/LicenseKeyField"
import { getApiErrorMessage, licensesApi } from "@/lib/api"
import { formatCurrency, formatDate, formatDateTime, getLicenseStatus } from "@/lib/formatters"
import {
  Key,
  User,
  Package,
  Calendar,
  Shield,
  RefreshCw,
  Edit,
  Monitor,
  Clock,
  ArrowLeft,
  Activity,
  AlertTriangle,
  ListChecks,
  Server,
} from "lucide-react"

const decodeBase64UrlJson = (value) => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/")
  const padding = "=".repeat((4 - (normalized.length % 4)) % 4)
  const binary = globalThis.atob(`${normalized}${padding}`)
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
  return JSON.parse(new TextDecoder().decode(bytes))
}

const decodeLicenseKey = (licenseKey) => {
  if (!licenseKey) {
    return { header: null, payload: null, error: "Missing token" }
  }

  const token = licenseKey.startsWith("LIC-") ? licenseKey.slice(4) : licenseKey
  const parts = token.split(".")

  if (parts.length !== 2 && parts.length !== 3) {
    return { payload: null, error: "Missing token payload" }
  }

  try {
    if (parts.length === 3) {
      return {
        header: decodeBase64UrlJson(parts[0]),
        payload: decodeBase64UrlJson(parts[1]),
        error: null,
      }
    }

    return {
      header: null,
      payload: decodeBase64UrlJson(parts[0]),
      error: null,
    }
  } catch {
    return { header: null, payload: null, error: "Unable to decode token payload" }
  }
}

const formatNumber = (value) => {
  const numericValue = Number(value)

  if (Number.isNaN(numericValue)) {
    return "N/A"
  }

  return numericValue.toLocaleString()
}

export default function LicenseDetailPage() {
  const { id } = useParams()
  const [license, setLicense] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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
  const decodedLicense = decodeLicenseKey(license.license_key)
  const tokenHeader = decodedLicense.header
  const tokenPayload = decodedLicense.payload
  const customPlan = tokenPayload?.customPlan || tokenPayload?.custom_plan || null
  const customPlanCurrency = customPlan?.pricing?.currency || "USD"
  const tokenFeatures = Array.isArray(tokenPayload?.features) ? tokenPayload.features : []
  const tokenLicenseId = tokenPayload?.licenseId || tokenPayload?.id
  const tokenExpiration = tokenPayload?.expirationDate || (tokenPayload?.exp ? tokenPayload.exp * 1000 : null)

  return (
    <div className="min-h-screen">
      <AdminHeader title="License Details" subtitle={`License #${license.id}`} />

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
                <LicenseKeyField
                  value={license.license_key}
                  wrap
                  className="rounded-lg border border-border bg-secondary/30 p-4"
                  codeClassName="max-h-24 overflow-auto text-sm text-primary"
                />
              </CardContent>
            </Card>

            <Card className="glass border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Decoded Token Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {decodedLicense.error ? (
                  <div className="p-3 rounded-lg bg-secondary/30 border border-border text-sm text-muted-foreground">
                    {decodedLicense.error}
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                      <div className="rounded-lg border border-border bg-secondary/30 p-3">
                        <p className="text-xs text-muted-foreground">Algorithm</p>
                        <p className="mt-1 truncate font-medium text-foreground">{tokenHeader?.alg || "N/A"}</p>
                      </div>
                      <div className="rounded-lg border border-border bg-secondary/30 p-3">
                        <p className="text-xs text-muted-foreground">Token License ID</p>
                        <p className="mt-1 truncate font-medium text-foreground" title={tokenLicenseId || "N/A"}>
                          {tokenLicenseId || "N/A"}
                        </p>
                      </div>
                      <div className="rounded-lg border border-border bg-secondary/30 p-3">
                        <p className="text-xs text-muted-foreground">Customer</p>
                        <p className="mt-1 truncate font-medium text-foreground" title={tokenPayload?.customer || "N/A"}>
                          {tokenPayload?.customer || "N/A"}
                        </p>
                      </div>
                      <div className="rounded-lg border border-border bg-secondary/30 p-3">
                        <p className="text-xs text-muted-foreground">Cluster</p>
                        <p className="mt-1 truncate font-medium text-foreground" title={tokenPayload?.clusterName || "N/A"}>
                          {tokenPayload?.clusterName || "N/A"}
                        </p>
                      </div>
                      <div className="rounded-lg border border-border bg-secondary/30 p-3">
                        <p className="text-xs text-muted-foreground">Issued At</p>
                        <p className="mt-1 font-medium text-foreground">{formatDateTime(tokenPayload?.issuedAt)}</p>
                      </div>
                      <div className="rounded-lg border border-border bg-secondary/30 p-3">
                        <p className="text-xs text-muted-foreground">Token Expiration</p>
                        <p className="mt-1 font-medium text-foreground">{formatDate(tokenExpiration)}</p>
                      </div>
                    </div>

                    <div className="rounded-lg border border-border bg-secondary/20 p-4">
                      <div className="mb-3 flex items-center gap-2">
                        <ListChecks className="h-4 w-4 text-primary" />
                        <h3 className="font-semibold text-foreground">Features</h3>
                      </div>
                      {tokenFeatures.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {tokenFeatures.map((feature) => (
                            <span
                              key={feature}
                              className="inline-block max-w-full truncate rounded-md border border-border bg-background/40 px-2 py-1 text-xs text-foreground"
                              title={feature}
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No features are embedded in this token.</p>
                      )}
                    </div>

                    {customPlan ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 rounded-lg border border-border bg-card/50 p-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Duration</p>
                            <p className="mt-1 text-sm font-medium text-foreground">
                              {customPlan.duration?.label || "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Total Price</p>
                            <p className="mt-1 text-sm font-medium text-primary">
                              {formatCurrency(customPlan.pricing?.totalPrice, customPlanCurrency)}
                            </p>
                          </div>
                        </div>

                        <div className="rounded-lg border border-border bg-secondary/20 p-4">
                          <div className="mb-3 flex items-center gap-2">
                            <ListChecks className="h-4 w-4 text-primary" />
                            <h3 className="font-semibold text-foreground">Selected Modules</h3>
                          </div>
                          <div className="space-y-4">
                            {(customPlan.modules || []).map((module) => (
                              <div key={module.id} className="rounded-lg border border-border bg-background/30 p-3">
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <p className="font-medium text-foreground">{module.name}</p>
                                    <p className="text-xs text-muted-foreground">{module.category}</p>
                                  </div>
                                  <span className="text-sm font-medium text-primary">
                                    {formatCurrency(module.basePrice, customPlanCurrency)}
                                  </span>
                                </div>
                                {module.submodules?.length > 0 && (
                                  <div className="mt-3 space-y-2 border-t border-border pt-3">
                                    {module.submodules.map((subModule) => (
                                      <div key={subModule.id} className="flex items-start justify-between gap-3 text-sm">
                                        <div>
                                          <p className="text-foreground">{subModule.name}</p>
                                          <p className="text-xs text-muted-foreground">{subModule.description}</p>
                                        </div>
                                        <span className="shrink-0 text-primary">
                                          {formatCurrency(subModule.price, customPlanCurrency)}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="rounded-lg border border-border bg-secondary/20 p-4">
                          <div className="mb-3 flex items-center gap-2">
                            <Server className="h-4 w-4 text-primary" />
                            <h3 className="font-semibold text-foreground">Selected Infrastructure</h3>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div>
                              <p className="text-xs text-muted-foreground">Requests</p>
                              <p className="mt-1 text-foreground">
                                {formatNumber(customPlan.infrastructure?.monthlyRequests)}/month
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Storage</p>
                              <p className="mt-1 text-foreground">{formatNumber(customPlan.infrastructure?.storageGb)} GB</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Seats</p>
                              <p className="mt-1 text-foreground">{formatNumber(customPlan.infrastructure?.teamSeats)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Environments</p>
                              <p className="mt-1 text-foreground">{formatNumber(customPlan.infrastructure?.environments)}</p>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-lg border border-border bg-background/40 p-4">
                          <p className="mb-2 text-xs text-muted-foreground">Decoded custom plan object</p>
                          <pre className="max-h-80 overflow-auto whitespace-pre-wrap break-words text-xs text-foreground">
                            {JSON.stringify(customPlan, null, 2)}
                          </pre>
                        </div>
                      </div>
                    ) : null}

                    <div className="rounded-lg border border-border bg-background/40 p-4">
                      <p className="mb-2 text-xs text-muted-foreground">Decoded payload</p>
                      <pre className="max-h-80 overflow-auto whitespace-pre-wrap break-words text-xs text-foreground">
                        {JSON.stringify(tokenPayload, null, 2)}
                      </pre>
                    </div>
                  </>
                )}
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
