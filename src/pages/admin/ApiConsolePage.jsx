"use client"

import { useState } from "react"
import { AdminHeader } from "@/components/AdminHeader"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Copy, Check, Play, Key, Shield, Terminal, FileCode, Lock, Loader2 } from "lucide-react"
import api from "@/lib/axios"
import { getApiErrorMessage } from "@/lib/api"

const endpoints = [
  { method: "POST", path: "/api/auth/register", description: "Register through auth route" },
  { method: "POST", path: "/api/auth/login", description: "Login and receive a token" },
  { method: "GET", path: "/api/auth/profile", description: "Get authenticated profile" },
  { method: "POST", path: "/api/customers/register", description: "Register a customer" },
  { method: "GET", path: "/api/customers", description: "List customers" },
  { method: "GET", path: "/api/customers/{id}", description: "Get customer details" },
  { method: "GET", path: "/api/customer", description: "Get current customer" },
  { method: "GET", path: "/api/products", description: "List products" },
  { method: "POST", path: "/api/products", description: "Create product" },
  { method: "GET", path: "/api/licenses", description: "List licenses" },
  { method: "POST", path: "/api/licenses", description: "Create license" },
  { method: "GET", path: "/api/licenses/{id}", description: "Get license details" },
  { method: "GET", path: "/api/customers/{customerId}/licenses", description: "List customer licenses" },
  { method: "POST", path: "/api/payments", description: "Record payment" },
  { method: "GET", path: "/api/customers/{customerId}/payments", description: "List customer payments" },
  { method: "GET", path: "/api/licenses/{licenseId}/history", description: "List license history" },
]

const exampleRequest = `{
  "customer_id": 1,
  "product_id": 1,
  "status": "trial",
  "expiration_at": "2026-12-31"
}`

const exampleResponse = `{
  "license": {
    "id": 1,
    "status": "trial",
    "customer_id": 1,
    "product_id": 1,
    "expiration_at": "2026-12-31T00:00:00.000Z"
  }
}`

const rsaPublicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA2mKqH...
...truncated for display...
-----END PUBLIC KEY-----`

export default function ApiConsolePage() {
  const [copied, setCopied] = useState(null)
  const [testResult, setTestResult] = useState(null)
  const [testError, setTestError] = useState(null)
  const [testStatus, setTestStatus] = useState(null)
  const [testing, setTesting] = useState(false)
  const [method, setMethod] = useState("GET")
  const [endpoint, setEndpoint] = useState("/api/licenses")
  const [requestBody, setRequestBody] = useState(exampleRequest)

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const runTest = async () => {
    setTesting(true)
    setTestError(null)
    setTestResult(null)
    setTestStatus(null)

    try {
      const url = endpoint.replace(/^\/api/, "")
      const payload = method === "GET" ? undefined : JSON.parse(requestBody || "{}")
      const response = await api.request({
        method,
        url,
        data: payload,
      })

      setTestStatus(response.status)
      setTestResult(JSON.stringify(response.data, null, 2))
    } catch (err) {
      setTestStatus(err.response?.status || null)
      setTestError(err instanceof SyntaxError ? "Request body must be valid JSON" : getApiErrorMessage(err, "API request failed"))
      if (err.response?.data) {
        setTestResult(JSON.stringify(err.response.data, null, 2))
      }
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="min-h-screen">
      <AdminHeader title="API Console" subtitle="License verification API documentation and testing" />

      <div className="p-6 space-y-6">
        <Tabs defaultValue="endpoints" className="space-y-6">
          <TabsList className="glass border-border p-1">
            <TabsTrigger
              value="endpoints"
              className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
            >
              <FileCode className="w-4 h-4 mr-2" />
              Endpoints
            </TabsTrigger>
            <TabsTrigger value="testing" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
              <Terminal className="w-4 h-4 mr-2" />
              API Tester
            </TabsTrigger>
            <TabsTrigger value="keys" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
              <Key className="w-4 h-4 mr-2" />
              API Keys
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
            >
              <Shield className="w-4 h-4 mr-2" />
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="endpoints" className="space-y-6">
            <Card className="glass border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Available Endpoints</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {endpoints.map((endpoint, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border hover:bg-secondary/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <Badge
                        className={cn(
                          "font-mono",
                          endpoint.method === "GET"
                            ? "bg-success/10 text-success border-success/30"
                            : "bg-primary/10 text-primary border-primary/30",
                        )}
                      >
                        {endpoint.method}
                      </Badge>
                      <code className="text-sm font-mono text-foreground">{endpoint.path}</code>
                    </div>
                    <span className="text-sm text-muted-foreground">{endpoint.description}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="glass border-border">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-foreground text-sm">Example Request</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => handleCopy(exampleRequest, "request")}>
                    {copied === "request" ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </CardHeader>
                <CardContent>
                  <pre className="p-4 rounded-lg code-panel border border-border overflow-x-auto">
                    <code className="text-sm font-mono">{exampleRequest}</code>
                  </pre>
                </CardContent>
              </Card>
              <Card className="glass border-border">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-foreground text-sm">Example Response</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => handleCopy(exampleResponse, "response")}>
                    {copied === "response" ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </CardHeader>
                <CardContent>
                  <pre className="p-4 rounded-lg code-panel border border-border overflow-x-auto">
                    <code className="text-sm font-mono">{exampleResponse}</code>
                  </pre>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="testing" className="space-y-6">
            <Card className="glass border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-primary" />
                  API Test Runner
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Method</Label>
                    <select
                      className="w-full p-2 rounded-lg bg-input border border-border text-foreground"
                      value={method}
                      onChange={(event) => setMethod(event.target.value)}
                    >
                      <option>GET</option>
                      <option>POST</option>
                    </select>
                  </div>
                  <div className="md:col-span-3 space-y-2">
                    <Label>Endpoint</Label>
                    <Input
                      value={endpoint}
                      onChange={(event) => setEndpoint(event.target.value)}
                      className="bg-input border-border font-mono"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Request Body</Label>
                  <textarea
                    rows={8}
                    className="w-full p-4 rounded-lg code-panel border border-border font-mono text-sm resize-none"
                    value={requestBody}
                    onChange={(event) => setRequestBody(event.target.value)}
                  />
                </div>
                {testError && <p className="text-sm text-destructive">{testError}</p>}
                <Button
                  onClick={runTest}
                  disabled={testing}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground glow-blue"
                >
                  {testing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
                  {testing ? "Running..." : "Run Test"}
                </Button>
                {testResult && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Response</Label>
                      <Badge className={cn(
                        testStatus >= 400
                          ? "bg-destructive/10 text-destructive border-destructive/30"
                          : "bg-success/10 text-success border-success/30",
                      )}>
                        {testStatus || "N/A"}
                      </Badge>
                    </div>
                    <pre className="p-4 rounded-lg code-panel border border-border overflow-x-auto">
                      <code className="text-sm font-mono">{testResult}</code>
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="keys" className="space-y-6">
            <Card className="glass border-border">
              <CardHeader>
                <CardTitle className="text-foreground">API Keys</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-secondary/30 border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Production Key</span>
                    <Badge className="bg-success/10 text-success border-success/30">Active</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-2 rounded bg-input border border-border font-mono text-sm text-foreground">
                      {"sk_live_••••••••••••••••••••••••"}
                    </code>
                    <Button variant="ghost" size="icon">
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-secondary/30 border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Test Key</span>
                    <Badge className="bg-warning/10 text-warning border-warning/30">Test Mode</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-2 rounded bg-input border border-border font-mono text-sm text-foreground">
                      {"sk_test_••••••••••••••••••••••••"}
                    </code>
                    <Button variant="ghost" size="icon">
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <Button variant="outline" className="border-border bg-transparent">
                  <Key className="w-4 h-4 mr-2" />
                  Generate New Key
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="glass border-border">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    <Lock className="w-5 h-5 text-primary" />
                    RSA Public Key
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Use this public key to verify license signatures in your application.
                  </p>
                  <pre className="p-4 rounded-lg code-panel border border-border overflow-x-auto">
                    <code className="text-xs font-mono">{rsaPublicKey}</code>
                  </pre>
                  <Button
                    variant="outline"
                    className="mt-4 border-border bg-transparent"
                    onClick={() => handleCopy(rsaPublicKey, "rsa")}
                  >
                    {copied === "rsa" ? (
                      <Check className="w-4 h-4 mr-2 text-success" />
                    ) : (
                      <Copy className="w-4 h-4 mr-2" />
                    )}
                    Copy Public Key
                  </Button>
                </CardContent>
              </Card>
              <Card className="glass border-border">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    JWT Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg bg-secondary/30 border border-border">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-muted-foreground">Algorithm</span>
                      <span className="text-sm font-mono text-foreground">RS256</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-secondary/30 border border-border">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-muted-foreground">Token Expiry</span>
                      <span className="text-sm font-mono text-foreground">24 hours</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-secondary/30 border border-border">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-muted-foreground">Issuer</span>
                      <span className="text-sm font-mono text-foreground">licentra.license.api</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
