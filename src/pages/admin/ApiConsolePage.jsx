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
import { Copy, Check, Play, Key, Shield, Terminal, FileCode, Lock } from "lucide-react"

const endpoints = [
  { method: "POST", path: "/api/v1/licenses/verify", description: "Verify a license key" },
  { method: "GET", path: "/api/v1/licenses/{id}", description: "Get license details" },
  { method: "POST", path: "/api/v1/licenses/activate", description: "Activate a license" },
  { method: "POST", path: "/api/v1/licenses/deactivate", description: "Deactivate a license" },
  { method: "GET", path: "/api/v1/licenses/{id}/status", description: "Check license status" },
]

const exampleRequest = `{
  "license_key": "LIC-2024-001-ACME-XXXX-YYYY-ZZZZ",
  "hardware_id": "a1b2c3d4e5f6",
  "product_id": "enterprise-suite"
}`

const exampleResponse = `{
  "valid": true,
  "license": {
    "id": "LIC-2024-001",
    "customer": "Acme Corporation",
    "product": "Enterprise Suite",
    "type": "perpetual",
    "status": "active",
    "expiration": "2025-12-31T23:59:59Z",
    "activations": { "current": 5, "max": 10 }
  },
  "signature": "eyJhbGciOiJSUzI1NiIs..."
}`

const rsaPublicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA2mKqH...
...truncated for display...
-----END PUBLIC KEY-----`

export default function ApiConsolePage() {
  const [copied, setCopied] = useState(null)
  const [testResult, setTestResult] = useState(null)

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const runTest = () => setTestResult(exampleResponse)

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
                  <pre className="p-4 rounded-lg bg-[#0d1117] border border-border overflow-x-auto">
                    <code className="text-sm font-mono text-[#c9d1d9]">{exampleRequest}</code>
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
                  <pre className="p-4 rounded-lg bg-[#0d1117] border border-border overflow-x-auto">
                    <code className="text-sm font-mono text-[#c9d1d9]">{exampleResponse}</code>
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
                    <select className="w-full p-2 rounded-lg bg-input border border-border text-foreground">
                      <option>POST</option>
                      <option>GET</option>
                    </select>
                  </div>
                  <div className="md:col-span-3 space-y-2">
                    <Label>Endpoint</Label>
                    <Input defaultValue="/api/v1/licenses/verify" className="bg-input border-border font-mono" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Request Body</Label>
                  <textarea
                    rows={8}
                    className="w-full p-4 rounded-lg bg-[#0d1117] border border-border font-mono text-sm text-[#c9d1d9] resize-none"
                    defaultValue={exampleRequest}
                  />
                </div>
                <Button onClick={runTest} className="bg-primary hover:bg-primary/90 text-primary-foreground glow-blue">
                  <Play className="w-4 h-4 mr-2" />
                  Run Test
                </Button>
                {testResult && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Response</Label>
                      <Badge className="bg-success/10 text-success border-success/30">200 OK</Badge>
                    </div>
                    <pre className="p-4 rounded-lg bg-[#0d1117] border border-border overflow-x-auto">
                      <code className="text-sm font-mono text-[#c9d1d9]">{testResult}</code>
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
                  <pre className="p-4 rounded-lg bg-[#0d1117] border border-border overflow-x-auto">
                    <code className="text-xs font-mono text-[#c9d1d9]">{rsaPublicKey}</code>
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
