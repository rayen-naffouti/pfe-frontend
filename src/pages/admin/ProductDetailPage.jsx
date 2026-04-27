"use client"

import { useState } from "react"
import { Link, useParams } from "react-router-dom"
import { AdminHeader } from "@/components/AdminHeader"
import { StatusBadge } from "@/components/StatusBadge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Bot,
  Clock,
  Code2,
  Cpu,
  CreditCard,
  Database,
  ExternalLink,
  FileSearch,
  Gauge,
  Globe2,
  Key,
  Lightbulb,
  ListFilter,
  Lock,
  Network,
  RefreshCw,
  Search,
  Server,
  ShieldCheck,
  Sparkles,
  Terminal,
  Wand2,
} from "lucide-react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

const productProfile = {
  name: "Tenant Web Application",
  tenantId: "tenant-prod-001",
  hostBaseUrl: "https://app.tenant.example.com",
  runtime: "React SPA, Node.js APIs, PostgreSQL, Redis, AI Diagnostics",
  release: "v2.8.4",
}

const signalCards = [
  { label: "API Requests", value: "41.2k", detail: "Last 24 hours", icon: Activity, tone: "text-primary" },
  { label: "Error Rate", value: "0.82%", detail: "Target below 1%", icon: AlertTriangle, tone: "text-warning" },
  { label: "AI Confidence", value: "87%", detail: "Root-cause prediction", icon: Bot, tone: "text-accent" },
  { label: "Log Volume", value: "1.8M", detail: "Events indexed today", icon: Terminal, tone: "text-success" },
]

const trafficTrend = [
  { time: "00:00", requests: 920, latency: 182, errors: 6 },
  { time: "04:00", requests: 780, latency: 168, errors: 4 },
  { time: "08:00", requests: 1850, latency: 214, errors: 11 },
  { time: "12:00", requests: 2410, latency: 238, errors: 18 },
  { time: "16:00", requests: 2630, latency: 226, errors: 13 },
  { time: "20:00", requests: 1720, latency: 196, errors: 7 },
]

const microservices = [
  {
    id: "gateway",
    name: "API Gateway",
    icon: Network,
    status: "valid",
    runtime: "Nginx edge + Express middleware",
    owner: "Platform Team",
    health: "99.98%",
    latency: "42 ms",
    load: 64,
    version: "v1.14.2",
    responsibilities: ["CORS policy", "JWT forwarding", "Rate limiting", "Request id injection"],
    dependencies: ["Auth Service", "License Service", "Billing Service"],
    storage: ["Redis rate-limit cache"],
    logs: ["gateway.route.matched", "cors.origin.accepted", "rate_limit.bucket.updated"],
    aiNote: "Traffic is healthy. AI recommends adding per-tenant throttling before public API keys are introduced.",
    risk: "A CORS misconfiguration could block the frontend while backend health stays green.",
  },
  {
    id: "licenses",
    name: "License Service",
    icon: Key,
    status: "valid",
    runtime: "Node.js service + HMAC signing",
    owner: "Licensing Team",
    health: "99.91%",
    latency: "86 ms",
    load: 71,
    version: "v2.8.4",
    responsibilities: ["License key generation", "Expiration checks", "Customer/product joins", "History timeline"],
    dependencies: ["Tenant Service", "Product Catalog", "PostgreSQL"],
    storage: ["licenses", "license_transaction_history"],
    logs: ["license.created", "license.history.written", "license.expiration.checked"],
    aiNote: "AI detected validation drift when tenant metadata is absent. Add tenant_id to the signed payload next.",
    risk: "License keys can be generated without enough tenant context for multi-tenant troubleshooting.",
  },
  {
    id: "billing",
    name: "Billing Service",
    icon: CreditCard,
    status: "expiring",
    runtime: "Payment API worker",
    owner: "Revenue Ops",
    health: "99.42%",
    latency: "174 ms",
    load: 82,
    version: "v1.9.7",
    responsibilities: ["Payment recording", "Renewal receipts", "Webhook acknowledgement", "Retry handling"],
    dependencies: ["Payment Provider", "Notification Worker", "PostgreSQL"],
    storage: ["payments", "webhook_retry_queue"],
    logs: ["payment.recorded", "webhook.retry", "receipt.dispatch.pending"],
    aiNote: "AI ranks webhook timeout as the top incident risk. Add idempotency and dead-letter visibility.",
    risk: "Repeated webhook retries can inflate latency and duplicate support tickets.",
  },
  {
    id: "tenant",
    name: "Tenant Service",
    icon: Globe2,
    status: "valid",
    runtime: "Tenant metadata resolver",
    owner: "SaaS Platform",
    health: "99.95%",
    latency: "51 ms",
    load: 48,
    version: "v1.6.1",
    responsibilities: ["tenant_id mapping", "host_base_url validation", "Product namespace lookup", "Tenant risk score"],
    dependencies: ["Product Catalog", "Redis cache", "API Gateway"],
    storage: ["products", "tenant_host_cache"],
    logs: ["tenant.resolved", "host_base_url.mismatch", "tenant.cache.refresh"],
    aiNote: "Host mismatch logs are low volume but high value. AI suggests grouping them by customer and source IP.",
    risk: "Stale tenant cache can route diagnostics to the wrong product context.",
  },
  {
    id: "ai",
    name: "AI Diagnostics",
    icon: Bot,
    status: "trial",
    runtime: "Log and metric reasoning worker",
    owner: "Observability Team",
    health: "98.87%",
    latency: "682 ms",
    load: 76,
    version: "v0.12.0",
    responsibilities: ["Log clustering", "Root-cause ranking", "Runbook suggestions", "Incident summaries"],
    dependencies: ["Log Index", "Metrics Store", "Deploy History"],
    storage: ["ai_findings", "incident_summaries"],
    logs: ["ai.cluster.created", "ai.rca.generated", "ai.runbook.suggested"],
    aiNote: "AI confidence improves when request logs include tenant_id, trace_id, statusCode, and durationMs.",
    risk: "Low-quality logs reduce RCA accuracy and can produce generic troubleshooting steps.",
  },
  {
    id: "data",
    name: "Data Layer",
    icon: Database,
    status: "valid",
    runtime: "PostgreSQL + Redis",
    owner: "Infrastructure",
    health: "99.89%",
    latency: "33 ms",
    load: 57,
    version: "pg15 / redis7",
    responsibilities: ["Transactional storage", "Tenant cache", "Query performance", "Audit retention"],
    dependencies: ["License Service", "Billing Service", "Tenant Service"],
    storage: ["customers", "products", "licenses", "payments"],
    logs: ["query.slow", "cache.miss", "connection.pool.wait"],
    aiNote: "AI predicts cache pressure during traffic peaks. Pre-warm tenant and product lookups.",
    risk: "Slow relational joins can appear as API latency unless traces include query duration.",
  },
]

const serviceLoad = microservices.map((service) => ({
  service: service.name.replace(" Service", "").replace("API ", ""),
  load: service.load,
}))

const aiFindings = [
  {
    title: "Likely root cause: payment webhook retries",
    confidence: "91%",
    severity: "High",
    signal: "Billing p95 latency rose 2.1x while retry logs increased from 7 to 74 events/hour.",
    action: "Add idempotency keys to webhook processing and push repeated failures to a dead-letter queue.",
  },
  {
    title: "Tenant metadata drift",
    confidence: "84%",
    severity: "Medium",
    signal: "Several license create attempts are missing tenant_id or host_base_url metadata.",
    action: "Block submit until tenant metadata is valid and add backend schema validation alarms.",
  },
  {
    title: "Cache pressure prediction",
    confidence: "78%",
    severity: "Medium",
    signal: "Redis cache hit rate is trending down before peak traffic windows.",
    action: "Pre-warm tenant product metadata and increase TTL for stable host mappings.",
  },
]

const logClusters = [
  {
    label: "401 token failures",
    count: "428",
    level: "warn",
    trace: "auth-7f21",
    summary: "Expired customer tokens are driving portal redirects after deploy.",
  },
  {
    label: "Payment timeout",
    count: "91",
    level: "error",
    trace: "pay-31ac",
    summary: "Webhook acknowledgement exceeded provider timeout window.",
  },
  {
    label: "Tenant host mismatch",
    count: "37",
    level: "warn",
    trace: "ten-f09b",
    summary: "Requests arrived from host_base_url not matching configured tenant.",
  },
  {
    label: "Slow license query",
    count: "24",
    level: "info",
    trace: "lic-55de",
    summary: "License listing query crosses 250 ms during peak load.",
  },
]

const liveLogs = [
  { time: "16:42:11", level: "ERROR", service: "billing", message: "payment webhook retry exhausted", trace: "pay-31ac" },
  { time: "16:42:08", level: "WARN", service: "tenant", message: "host_base_url mismatch for tenant-prod-001", trace: "ten-f09b" },
  { time: "16:41:54", level: "INFO", service: "licenses", message: "license created with signed tenant payload", trace: "lic-55de" },
  { time: "16:41:21", level: "WARN", service: "auth", message: "expired token used from customer portal", trace: "auth-7f21" },
  { time: "16:40:57", level: "INFO", service: "gateway", message: "traffic routed to license service", trace: "gw-882a" },
]

const aiIdeas = [
  "Natural-language log search across request id, tenant id, and trace id.",
  "AI-generated incident summaries with customer impact and timeline.",
  "Root-cause ranking using deploy history, logs, metrics, and traces.",
  "Auto-generated troubleshooting checklist for each detected log cluster.",
  "Predictive alerts before Redis cache pressure causes API latency.",
  "Suggested backend patches from recurring exception patterns.",
  "Daily AI health report for product owner and support team.",
  "One-click escalation draft with evidence, trace ids, and failed endpoints.",
]

const chartTooltipStyle = {
  backgroundColor: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: "8px",
  color: "var(--foreground)",
}

const levelClassName = {
  ERROR: "bg-destructive/10 text-destructive border-destructive/30",
  WARN: "bg-warning/10 text-warning border-warning/30",
  INFO: "bg-primary/10 text-primary border-primary/30",
}

function ProductHero({ product }) {
  return (
    <Card className="glass border-border neon-border">
      <CardContent className="p-6">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
              <Globe2 className="w-8 h-8 text-primary" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-xl font-bold text-foreground">{product.name}</h2>
                <StatusBadge status="valid" />
              </div>
              <p className="text-muted-foreground mt-1">{product.runtime}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge className="bg-primary/10 text-primary border-primary/30">Tenant: {product.tenantId}</Badge>
                <Badge className="bg-secondary/70 text-muted-foreground border-border">Release {product.release}</Badge>
                <Badge className="bg-success/10 text-success border-success/30">Production</Badge>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" className="border-border bg-transparent" asChild>
              <a href={product.hostBaseUrl} target="_blank" rel="noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                Open App
              </a>
            </Button>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground glow-blue">
              <RefreshCw className="w-4 h-4 mr-2" />
              Run AI Diagnostics
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function SignalCard({ item }) {
  const Icon = item.icon

  return (
    <Card className="glass border-border">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">{item.label}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{item.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{item.detail}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className={`w-5 h-5 ${item.tone}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function TrafficPanel() {
  return (
    <Card className="glass border-border">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <Network className="w-5 h-5 text-primary" />
          API Traffic and Latency
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={trafficTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
            <XAxis dataKey="time" stroke="var(--chart-axis)" fontSize={12} />
            <YAxis stroke="var(--chart-axis)" fontSize={12} />
            <Tooltip contentStyle={chartTooltipStyle} />
            <Area type="monotone" dataKey="requests" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.18} />
            <Line type="monotone" dataKey="latency" stroke="#06b6d4" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

function LogCommandCenter() {
  return (
    <Card className="glass border-border">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <Terminal className="w-5 h-5 text-primary" />
          Logging Command Center
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {["All logs", "Errors", "Warnings", "Tenant traces", "Slow requests"].map((filter, index) => (
            <button
              key={filter}
              type="button"
              className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${
                index === 0
                  ? "bg-primary/20 text-primary border-primary/30"
                  : "bg-secondary/30 text-muted-foreground border-border hover:text-foreground"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {logClusters.map((cluster) => (
            <div key={cluster.trace} className="p-3 rounded-lg bg-secondary/30 border border-border">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <FileSearch className="w-4 h-4 text-primary shrink-0" />
                  <p className="font-medium text-foreground truncate">{cluster.label}</p>
                </div>
                <Badge
                  className={
                    cluster.level === "error"
                      ? "bg-destructive/10 text-destructive border-destructive/30"
                      : cluster.level === "warn"
                        ? "bg-warning/10 text-warning border-warning/30"
                        : "bg-primary/10 text-primary border-primary/30"
                  }
                >
                  {cluster.count}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-2">{cluster.summary}</p>
              <code className="text-xs text-primary mt-2 block">trace_id={cluster.trace}</code>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function AiAnalysisGrid() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
      {aiFindings.map((finding) => (
        <Card key={finding.title} className="glass border-border">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-foreground">{finding.title}</p>
                <p className="text-xs text-muted-foreground mt-1">Confidence {finding.confidence}</p>
              </div>
              <Badge
                className={
                  finding.severity === "High"
                    ? "bg-destructive/10 text-destructive border-destructive/30"
                    : "bg-warning/10 text-warning border-warning/30"
                }
              >
                {finding.severity}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{finding.signal}</p>
            <div className="flex items-start gap-2 text-sm text-primary">
              <Sparkles className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{finding.action}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function LiveLogStream() {
  return (
    <Card className="glass border-border">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          Live Log Stream
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {liveLogs.map((log) => (
          <div key={`${log.time}-${log.trace}`} className="grid grid-cols-1 lg:grid-cols-[74px_74px_100px_1fr_96px] gap-3 p-3 rounded-lg code-panel border border-border font-mono text-xs">
            <span className="text-muted-foreground">{log.time}</span>
            <span className={`px-2 py-0.5 rounded border text-center ${levelClassName[log.level]}`}>{log.level}</span>
            <span className="text-accent">{log.service}</span>
            <span>{log.message}</span>
            <span className="text-primary">{log.trace}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function MicroserviceArchitecture() {
  const [selectedServiceId, setSelectedServiceId] = useState(microservices[0].id)
  const selectedService = microservices.find((service) => service.id === selectedServiceId) || microservices[0]
  const SelectedIcon = selectedService.icon

  return (
    <Card className="glass border-border">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <Cpu className="w-5 h-5 text-primary" />
          Microservice Architecture
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-5">
        <div className="space-y-3">
          {microservices.map((service) => {
            const Icon = service.icon
            const isSelected = service.id === selectedServiceId

            return (
              <button
                key={service.id}
                type="button"
                onClick={() => setSelectedServiceId(service.id)}
                className={`w-full text-left p-4 rounded-lg border transition-all ${
                  isSelected
                    ? "bg-primary/10 border-primary/40 glow-blue"
                    : "bg-secondary/30 border-border hover:bg-secondary/50"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate">{service.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{service.owner}</p>
                    </div>
                  </div>
                  <StatusBadge status={service.status} />
                </div>
                <div className="grid grid-cols-3 gap-2 mt-4 text-xs">
                  <div>
                    <p className="text-muted-foreground">Health</p>
                    <p className="text-foreground">{service.health}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Latency</p>
                    <p className="text-foreground">{service.latency}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Load</p>
                    <p className="text-foreground">{service.load}%</p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        <div className="space-y-5">
          <div className="p-5 rounded-lg bg-secondary/30 border border-border">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <SelectedIcon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-lg font-semibold text-foreground">{selectedService.name}</h3>
                    <StatusBadge status={selectedService.status} />
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{selectedService.runtime}</p>
                </div>
              </div>
              <Badge className="bg-primary/10 text-primary border-primary/30">{selectedService.version}</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-5">
              {[
                ["Owner", selectedService.owner],
                ["Health", selectedService.health],
                ["P95 latency", selectedService.latency],
              ].map(([label, value]) => (
                <div key={label} className="p-3 rounded-lg bg-background/30 border border-border">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-sm text-foreground mt-1">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-secondary/30 border border-border">
              <p className="font-medium text-foreground mb-3">Responsibilities</p>
              <div className="space-y-2">
                {selectedService.responsibilities.map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ShieldCheck className="w-4 h-4 text-success" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-secondary/30 border border-border">
              <p className="font-medium text-foreground mb-3">Dependencies</p>
              <div className="flex flex-wrap gap-2">
                {selectedService.dependencies.map((dependency) => (
                  <Badge key={dependency} className="bg-primary/10 text-primary border-primary/30">
                    {dependency}
                  </Badge>
                ))}
              </div>
              <p className="font-medium text-foreground mt-5 mb-3">Storage</p>
              <div className="flex flex-wrap gap-2">
                {selectedService.storage.map((store) => (
                  <Badge key={store} className="bg-secondary/70 text-muted-foreground border-border">
                    {store}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg code-panel border border-border">
              <p className="font-medium text-foreground mb-3 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-primary" />
                Service Logs
              </p>
              <div className="space-y-2">
                {selectedService.logs.map((log) => (
                  <code key={log} className="block text-xs">
                    [{selectedService.id}] {log}
                  </code>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-secondary/30 border border-border">
              <p className="font-medium text-foreground mb-3 flex items-center gap-2">
                <Bot className="w-4 h-4 text-primary" />
                AI Service Review
              </p>
              <p className="text-sm text-muted-foreground">{selectedService.aiNote}</p>
              <div className="mt-4 p-3 rounded-lg bg-warning/10 border border-warning/30">
                <p className="text-xs text-warning mb-1">Risk</p>
                <p className="text-sm text-muted-foreground">{selectedService.risk}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ServiceHealthPanel() {
  return (
    <Card className="glass border-border">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <Server className="w-5 h-5 text-primary" />
          Service Health
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={serviceLoad}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
            <XAxis dataKey="service" stroke="var(--chart-axis)" fontSize={12} />
            <YAxis stroke="var(--chart-axis)" fontSize={12} />
            <Tooltip contentStyle={chartTooltipStyle} />
            <Bar dataKey="load" fill="#3b82f6" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>

        <div className="space-y-3">
          {microservices.slice(0, 4).map((service) => (
            <div key={service.name} className="p-3 rounded-lg bg-secondary/30 border border-border">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-foreground">{service.name}</p>
                <StatusBadge status={service.status} />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Health</p>
                  <p className="text-foreground">{service.health}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Latency</p>
                  <p className="text-foreground">{service.latency}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">{service.risk}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function AiIdeasPanel() {
  const icons = [Search, Wand2, Lightbulb, ListFilter, Gauge, Code2, Clock, ShieldCheck]

  return (
    <Card className="glass border-border">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <Bot className="w-5 h-5 text-primary" />
          AI and Logging Enhancements
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {aiIdeas.map((idea, index) => {
          const Icon = icons[index]

          return (
            <div key={idea} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30 border border-border">
              <Icon className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <p className="text-sm text-muted-foreground">{idea}</p>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

export default function ProductDetailPage() {
  const { id } = useParams()
  const product = {
    ...productProfile,
    id,
  }

  return (
    <div className="min-h-screen">
      <AdminHeader title={product.name} subtitle="AI diagnostics, logs and product observability" />

      <div className="p-6 space-y-6">
        <Button variant="ghost" asChild>
          <Link to="/admin/products">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Link>
        </Button>

        <ProductHero product={product} />

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {signalCards.map((item) => (
            <SignalCard key={item.label} item={item} />
          ))}
        </div>

        <MicroserviceArchitecture />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <TrafficPanel />
            <AiAnalysisGrid />
            <LiveLogStream />
          </div>

          <div className="space-y-6">
            <LogCommandCenter />
            <ServiceHealthPanel />
          </div>
        </div>

        <AiIdeasPanel />

        <Card className="glass border-border">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Next useful static views</p>
                  <p className="text-sm text-muted-foreground">
                    Add log retention policy, request replay, AI ticket draft, deployment comparison, tenant risk score,
                    and a full trace waterfall once backend reporting APIs are ready.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {["RCA draft", "Trace explorer", "Runbook", "SLO report"].map((label) => (
                  <Badge key={label} className="bg-primary/10 text-primary border-primary/30">
                    {label}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
