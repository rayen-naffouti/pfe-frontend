"use client"

import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { AdminHeader } from "@/components/AdminHeader"
import { StatusBadge } from "@/components/StatusBadge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState, ErrorState, LoadingState } from "@/components/DataState"
import { getApiErrorMessage, productsApi } from "@/lib/api"
import {
  Activity,
  ArrowLeft,
  Bot,
  Clock,
  Code2,
  Cpu,
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
  tenantId: "Not assigned",
  hostBaseUrl: "",
  runtime: "Express Gateway, RBAC, PostgreSQL audit logs, Redis rate limiting",
  release: "gateway",
}

const gatewayProxyRoutes = [
  { id: "dispatcher", name: "Dispatcher", path: "/proxy/minotaur/dispatcher" },
  { id: "extractor", name: "Extractor", path: "/proxy/minotaur/ext" },
  { id: "decision-engine", name: "Decision Engine", path: "/proxy/minotaur/decision" },
  { id: "sap-hyper-automation", name: "SAP Hyper Automation", path: "/proxy/minotaur/sapient" },
  { id: "cortexflow", name: "Cortexflow", path: "/proxy/minotaur/cortexflow" },
  { id: "notifications", name: "Notification Service", path: "/proxy/minotaur/notif" },
  { id: "mca-core", name: "MCA Core API", path: "/proxy/minotaur/api" },
  { id: "external-service", name: "External Service", path: "/proxy/external-service" },
]

const trafficTrend = [
  { time: "00:00", requests: 920, latency: 182, errors: 6 },
  { time: "04:00", requests: 780, latency: 168, errors: 4 },
  { time: "08:00", requests: 1850, latency: 214, errors: 11 },
  { time: "12:00", requests: 2410, latency: 238, errors: 18 },
  { time: "16:00", requests: 2630, latency: 226, errors: 13 },
  { time: "20:00", requests: 1720, latency: 196, errors: 7 },
]

const buildGatewayMicroservices = (product) => [
  {
    id: "gateway",
    name: "GatewayRBAC",
    icon: Network,
    status: "valid",
    runtime: normalizeGatewayBaseUrl(product.hostBaseUrl) || "Host Base URL not configured",
    owner: "GatewayRBAC",
    health: product.hostBaseUrl ? "Linked" : "Missing",
    latency: "Edge",
    load: 58,
    version: "Express + TypeScript",
    responsibilities: ["CORS policy", "JWT ACT validation", "License guard", "RBAC proxy routing"],
    dependencies: ["PostgreSQL", "Redis", "License file", "Minotaur upstreams"],
    storage: ["audit_logs", "users", "roles", "permissions", "redis rate-limit cache"],
    logs: ["cors.origin.accepted", "license.validated", "audit-log.query", "proxy.route.matched"],
    aiNote: "GatewayRBAC is the entry point. Product Host Base URL tells Licentra which deployed gateway to inspect.",
    risk: "If the Host Base URL is wrong or the ACT token has no audit:read permission, live gateway logs cannot be displayed.",
  },
  {
    id: "cortexflow",
    name: "Cortexflow",
    icon: Cpu,
    status: "valid",
    runtime: `${normalizeGatewayBaseUrl(product.hostBaseUrl) || "Gateway"}/proxy/minotaur/cortexflow`,
    owner: "Minotaur App",
    health: "Gateway route",
    latency: "Proxied",
    load: 71,
    version: "Cortexflow",
    responsibilities: ["Workflow orchestration", "Data shapes", "AI shapes", "Boomi shapes", "API connector shapes"],
    dependencies: ["GatewayRBAC", "Decision Engine", "Extractor", "MCA Core API"],
    storage: ["Cortexflow workspace data", "process definitions"],
    logs: ["minotaur-cortexflow.request", "workflow.started", "shape.executed"],
    aiNote: "Cortexflow traffic enters through GatewayRBAC at /proxy/minotaur/cortexflow.",
    risk: "If MINOTAUR_CORTEXFLOW_HOST is unset or unreachable, the gateway returns 503 or 504 for this app.",
  },
  {
    id: "sap-hyper-automation",
    name: "SAP Hyper Automation",
    icon: Bot,
    status: "valid",
    runtime: `${normalizeGatewayBaseUrl(product.hostBaseUrl) || "Gateway"}/proxy/minotaur/sapient`,
    owner: "Minotaur App",
    health: "Gateway route",
    latency: "Proxied",
    load: 64,
    version: "SAP Hyper Automation",
    responsibilities: ["SAP workflow bot", "Invoice automation", "Guided SAP task execution", "Approval handoffs"],
    dependencies: ["GatewayRBAC", "Dispatcher", "Decision Engine", "Notification Service"],
    storage: ["SAP workflow state", "automation audit trail"],
    logs: ["minotaur-sapient.request", "sap.workflow.started", "invoice.automation.step"],
    aiNote: "SAP Hyper Automation is represented by the gateway sapient route: /proxy/minotaur/sapient.",
    risk: "Long-running SAP automation needs trace IDs propagated from GatewayRBAC to every workflow step.",
  },
  {
    id: "dispatcher",
    name: "Minotaur Dispatcher",
    icon: Server,
    status: "valid",
    runtime: `${normalizeGatewayBaseUrl(product.hostBaseUrl) || "Gateway"}/proxy/minotaur/dispatcher`,
    owner: "Minotaur Platform",
    health: "Gateway route",
    latency: "Proxied",
    load: 52,
    version: "Dispatcher",
    responsibilities: ["Route Minotaur jobs", "Coordinate service execution", "Forward request context", "Preserve request id"],
    dependencies: ["GatewayRBAC", "Cortexflow", "SAP Hyper Automation", "Notification Service"],
    storage: ["Dispatch queue metadata"],
    logs: ["minotaur-dispatcher.request", "job.dispatched", "request.context.forwarded"],
    aiNote: "Dispatcher is the coordination layer reached through /proxy/minotaur/dispatcher.",
    risk: "If request IDs are not forwarded, audit logs are harder to connect across Minotaur services.",
  },
  {
    id: "decision-engine",
    name: "Decision Engine",
    icon: Key,
    status: "trial",
    runtime: `${normalizeGatewayBaseUrl(product.hostBaseUrl) || "Gateway"}/proxy/minotaur/decision`,
    owner: "Minotaur Platform",
    health: "Gateway route",
    latency: "Proxied",
    load: 49,
    version: "Decision",
    responsibilities: ["Decision APIs", "Rule execution", "Automation branching", "Runtime validation"],
    dependencies: ["GatewayRBAC", "Cortexflow", "SAP Hyper Automation"],
    storage: ["Decision rule metadata"],
    logs: ["minotaur-decision-engine.request", "decision.evaluated", "rule.matched"],
    aiNote: "Decision Engine receives traffic through /proxy/minotaur/decision.",
    risk: "Decision errors can affect both Cortexflow and SAP automation paths.",
  },
  {
    id: "mca-core",
    name: "MCA Core API",
    icon: Database,
    status: "valid",
    runtime: `${normalizeGatewayBaseUrl(product.hostBaseUrl) || "Gateway"}/proxy/minotaur/api`,
    owner: "Minotaur Platform",
    health: "Gateway route",
    latency: "Proxied",
    load: 53,
    version: "Core API",
    responsibilities: ["Core Minotaur API", "Shared business data", "Application metadata", "Tenant context"],
    dependencies: ["GatewayRBAC", "PostgreSQL", "Dispatcher"],
    storage: ["Core application data"],
    logs: ["minotaur-mca-core.request", "core.api.called", "tenant.context.resolved"],
    aiNote: "MCA Core API is the shared API exposed by /proxy/minotaur/api.",
    risk: "Core API failures can appear as product-wide issues because multiple apps depend on it.",
  },
  {
    id: "extractor",
    name: "Extractor",
    icon: FileSearch,
    status: "valid",
    runtime: `${normalizeGatewayBaseUrl(product.hostBaseUrl) || "Gateway"}/proxy/minotaur/ext`,
    owner: "Minotaur Platform",
    health: "Gateway route",
    latency: "Proxied",
    load: 45,
    version: "Extractor",
    responsibilities: ["Document extraction", "Data parsing", "Payload enrichment", "Extraction results"],
    dependencies: ["GatewayRBAC", "Cortexflow", "MCA Core API"],
    storage: ["Extraction jobs", "parsed payloads"],
    logs: ["minotaur-extractor.request", "document.extracted", "payload.enriched"],
    aiNote: "Extractor is reached by GatewayRBAC at /proxy/minotaur/ext.",
    risk: "Extraction latency can slow workflows if large payloads are proxied through the gateway.",
  },
  {
    id: "notifications",
    name: "Notification Service",
    icon: Globe2,
    status: "valid",
    runtime: `${normalizeGatewayBaseUrl(product.hostBaseUrl) || "Gateway"}/proxy/minotaur/notif`,
    owner: "Minotaur Platform",
    health: "Gateway route",
    latency: "Proxied",
    load: 39,
    version: "Notifications",
    responsibilities: ["Workflow notifications", "Automation alerts", "Delivery status", "User messaging"],
    dependencies: ["GatewayRBAC", "Dispatcher", "SAP Hyper Automation"],
    storage: ["Notification queue", "delivery records"],
    logs: ["minotaur-notif.request", "notification.sent", "delivery.status.updated"],
    aiNote: "Notification Service receives traffic through /proxy/minotaur/notif.",
    risk: "Delivery failures may not block the workflow but can hide important operational events.",
  },
]

const aiFindings = [
  {
    title: "Gateway audit stream depends on ACT token",
    confidence: "92%",
    severity: "High",
    signal: "The gateway audit endpoint is protected by authn and audit:read authorization.",
    action: "Store a gateway access token in localStorage as gatewayAccessToken before opening this product screen.",
  },
  {
    title: "Host Base URL is the routing source",
    confidence: "84%",
    severity: "Medium",
    signal: "Product diagnostics call the gateway configured in product.host_base_url.",
    action: "Keep each product Host Base URL aligned with the deployed GatewayRBAC endpoint.",
  },
  {
    title: "CORS must allow Licentra origins",
    confidence: "88%",
    severity: "Medium",
    signal: "Local and deployed frontend domains both call the same gateway audit endpoint.",
    action: "Use FRONT_HOST=* in the gateway for development, or replace it later with a comma-separated allow-list.",
  },
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

const normalizeGatewayBaseUrl = (value) => {
  const trimmed = String(value || "").trim()

  if (!trimmed) {
    return ""
  }

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `http://${trimmed}`
  return withProtocol.replace(/\/+$/, "")
}

const joinGatewayUrl = (baseUrl, path) => {
  return `${normalizeGatewayBaseUrl(baseUrl)}/${String(path).replace(/^\/+/, "")}`
}

const getGatewayAccessToken = () => {
  if (typeof window === "undefined") {
    return ""
  }

  return (
    window.localStorage.getItem("gatewayAccessToken") ||
    window.localStorage.getItem("gatewayACT") ||
    window.sessionStorage.getItem("gatewayAccessToken") ||
    window.sessionStorage.getItem("gatewayACT") ||
    ""
  )
}

const inferGatewayLogLevel = (log) => {
  const text = `${log.action || ""} ${log.resource || ""}`.toLowerCase()

  if (/(fail|error|denied|forbidden|expired|invalid)/.test(text)) {
    return "ERROR"
  }

  if (/(delete|remove|logout|revoke|disable|update)/.test(text)) {
    return "WARN"
  }

  return "INFO"
}

const formatGatewayLogTime = (value) => {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return "--:--:--"
  }

  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })
}

const getGatewayLogService = (log) => {
  const actionPrefix = String(log.action || "").split(".")[0]
  const resourcePrefix = String(log.resource || "").split(":")[0]

  return actionPrefix || resourcePrefix || "gateway"
}

const normalizeGatewayAuditLog = (log) => {
  const level = inferGatewayLogLevel(log)
  const service = getGatewayLogService(log)
  const metadata = log.metadata && typeof log.metadata === "object" ? log.metadata : null
  const metadataSummary = metadata?.via ? ` via ${metadata.via}` : ""
  const actor = log.actor?.email || (log.actorId ? `actor:${log.actorId}` : "system")

  return {
    id: log.id,
    time: formatGatewayLogTime(log.createdAt || log.created_at),
    level,
    service,
    message: `${log.action || "audit.event"} on ${log.resource || "gateway"} by ${actor}${metadataSummary}`,
    trace: log.requestId || log.request_id || `audit-${log.id}`,
    raw: log,
  }
}

const fetchGatewayAuditLogs = async (hostBaseUrl, { signal } = {}) => {
  const baseUrl = normalizeGatewayBaseUrl(hostBaseUrl)

  if (!baseUrl) {
    return { logs: [], total: 0, error: "Product Host Base URL is not configured." }
  }

  const token = getGatewayAccessToken()

  if (!token) {
    return {
      logs: [],
      total: 0,
      error: "Gateway audit logs require a gateway access token in localStorage key gatewayAccessToken.",
    }
  }

  const response = await fetch(joinGatewayUrl(baseUrl, "/audit-log?page=1&pageSize=12"), {
    method: "GET",
    signal,
    headers: {
      Accept: "application/json",
      ACT: token,
    },
  })

  if (!response.ok) {
    const text = await response.text()
    const message = response.status === 401 || response.status === 403
      ? "Gateway rejected the audit log request. Check that gatewayAccessToken is valid and has audit:read permission."
      : text || `Gateway audit log request failed with status ${response.status}.`

    throw new Error(message)
  }

  const payload = await response.json()
  const auditRows = Array.isArray(payload.logs) ? payload.logs : []

  return {
    logs: auditRows.map(normalizeGatewayAuditLog),
    total: Number(payload.total || auditRows.length),
    error: null,
  }
}

const buildGatewayLogClusters = (logs) => {
  const clustersByAction = new Map()

  logs.forEach((log) => {
    const action = log.raw?.action || log.service || "gateway"
    const current = clustersByAction.get(action) || {
      label: action,
      count: 0,
      level: log.level.toLowerCase(),
      trace: log.trace,
      summary: log.message,
    }

    current.count += 1
    if (log.level === "ERROR") current.level = "error"
    else if (log.level === "WARN" && current.level !== "error") current.level = "warn"
    clustersByAction.set(action, current)
  })

  return Array.from(clustersByAction.values())
    .sort((left, right) => right.count - left.count)
    .slice(0, 4)
    .map((cluster) => ({ ...cluster, count: String(cluster.count) }))
}

const buildProductSignalCards = ({ product, gatewayLogs, gatewayLogState }) => [
  {
    label: "Gateway Host",
    value: product.hostBaseUrl ? "Configured" : "Missing",
    detail: product.hostBaseUrl || "Set Host Base URL on the product",
    icon: Network,
    tone: product.hostBaseUrl ? "text-success" : "text-warning",
  },
  {
    label: "Audit Events",
    value: gatewayLogState.loading ? "..." : String(gatewayLogState.total || gatewayLogs.length),
    detail: "Read from gateway audit_logs",
    icon: Terminal,
    tone: "text-primary",
  },
  {
    label: "Gateway Auth",
    value: getGatewayAccessToken() ? "Token set" : "Token missing",
    detail: "Uses ACT header with audit:read",
    icon: ShieldCheck,
    tone: getGatewayAccessToken() ? "text-success" : "text-warning",
  },
  {
    label: "Proxy Routes",
    value: String(gatewayProxyRoutes.length),
    detail: "Minotaur and external-service routes",
    icon: Server,
    tone: "text-accent",
  },
]

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
                <Badge className="bg-accent/10 text-accent border-accent/30">
                  Gateway: {product.hostBaseUrl || "Not configured"}
                </Badge>
                <Badge className="bg-secondary/70 text-muted-foreground border-border">Release {product.release}</Badge>
                <Badge className="bg-success/10 text-success border-success/30">Production</Badge>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {product.hostBaseUrl ? (
              <Button variant="outline" className="border-border bg-transparent" asChild>
                <a href={product.hostBaseUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Gateway
                </a>
              </Button>
            ) : (
              <Button variant="outline" className="border-border bg-transparent" disabled>
                <ExternalLink className="w-4 h-4 mr-2" />
                Gateway Missing
              </Button>
            )}
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

function LogCommandCenter({ logs }) {
  const clusters = buildGatewayLogClusters(logs)

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
          {clusters.length > 0 ? (
            clusters.map((cluster) => (
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
            ))
          ) : (
            <div className="p-4 rounded-lg bg-secondary/30 border border-border text-sm text-muted-foreground">
              No gateway audit clusters are available yet.
            </div>
          )}
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

function LiveLogStream({ logs, state, hostBaseUrl, onRefresh }) {
  return (
    <Card className="glass border-border">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-foreground flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Live Log Stream
          </CardTitle>
          <Button variant="outline" size="sm" className="border-border bg-transparent" onClick={onRefresh} disabled={state.loading || !hostBaseUrl}>
            <RefreshCw className={`w-4 h-4 mr-2 ${state.loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span>Source:</span>
          <code className="text-primary break-all">{hostBaseUrl ? `${normalizeGatewayBaseUrl(hostBaseUrl)}/audit-log` : "No Host Base URL"}</code>
        </div>

        {state.error && (
          <div className="p-3 rounded-lg border border-warning/30 bg-warning/10 text-sm text-warning">
            {state.error}
          </div>
        )}

        {state.loading && (
          <div className="p-4 rounded-lg code-panel border border-border text-sm text-muted-foreground">
            Loading gateway audit logs...
          </div>
        )}

        {!state.loading && logs.length === 0 && !state.error && (
          <div className="p-4 rounded-lg code-panel border border-border text-sm text-muted-foreground">
            No gateway audit logs returned for this product yet.
          </div>
        )}

        {!state.loading && logs.map((log) => (
          <div key={`${log.time}-${log.trace}-${log.id}`} className="grid grid-cols-1 lg:grid-cols-[84px_74px_110px_1fr_140px] gap-3 p-3 rounded-lg code-panel border border-border font-mono text-xs">
            <span className="text-muted-foreground">{log.time}</span>
            <span className={`px-2 py-0.5 rounded border text-center ${levelClassName[log.level]}`}>{log.level}</span>
            <span className="text-accent">{log.service}</span>
            <span>{log.message}</span>
            <span className="text-primary truncate" title={log.trace}>{log.trace}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function MicroserviceArchitecture({ services }) {
  const [selectedServiceId, setSelectedServiceId] = useState(services[0]?.id || "gateway")
  const selectedService = services.find((service) => service.id === selectedServiceId) || services[0]
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
          {services.map((service) => {
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

function ServiceHealthPanel({ services }) {
  const serviceLoad = services.map((service) => ({
    service: service.name.replace(" Service", "").replace("API ", ""),
    load: service.load,
  }))

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
          {services.slice(0, 4).map((service) => (
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
  const [productRecord, setProductRecord] = useState(null)
  const [gatewayLogs, setGatewayLogs] = useState([])
  const [gatewayLogState, setGatewayLogState] = useState({ loading: false, error: null, total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchProduct = async () => {
    setLoading(true)
    setError(null)

    try {
      const { data } = await productsApi.get(id)
      setProductRecord(data)
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to load product details"))
    } finally {
      setLoading(false)
    }
  }

  const loadGatewayLogs = async ({ signal } = {}) => {
    const hostBaseUrl = productRecord?.host_base_url

    setGatewayLogState((current) => ({ ...current, loading: true, error: null }))

    try {
      const result = await fetchGatewayAuditLogs(hostBaseUrl, { signal })

      setGatewayLogs(result.logs)
      setGatewayLogState({
        loading: false,
        error: result.error,
        total: result.total,
      })
    } catch (err) {
      if (err.name === "AbortError") {
        return
      }

      setGatewayLogs([])
      setGatewayLogState({
        loading: false,
        error: err.message || "Failed to load gateway audit logs.",
        total: 0,
      })
    }
  }

  useEffect(() => {
    fetchProduct()
  }, [id])

  useEffect(() => {
    if (!productRecord) {
      setGatewayLogs([])
      setGatewayLogState({ loading: false, error: null, total: 0 })
      return
    }

    const controller = new AbortController()
    loadGatewayLogs({ signal: controller.signal })

    return () => controller.abort()
  }, [productRecord?.host_base_url])

  if (loading) {
    return (
      <div className="min-h-screen">
        <AdminHeader title="Product Details" subtitle={`Product #${id}`} />
        <div className="p-6">
          <LoadingState message="Loading product details..." />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <AdminHeader title="Product Details" subtitle={`Product #${id}`} />
        <div className="p-6 space-y-6">
          <Button variant="ghost" asChild>
            <Link to="/admin/products">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Products
            </Link>
          </Button>
          <ErrorState message={error} onRetry={fetchProduct} />
        </div>
      </div>
    )
  }

  if (!productRecord) {
    return (
      <div className="min-h-screen">
        <AdminHeader title="Product Details" subtitle={`Product #${id}`} />
        <div className="p-6">
          <EmptyState message="Product not found" />
        </div>
      </div>
    )
  }

  const product = {
    ...productProfile,
    id: productRecord.id || id,
    name: productRecord.name || productProfile.name,
    tenantId: productRecord.tenant_id || productProfile.tenantId,
    hostBaseUrl: productRecord.host_base_url || productProfile.hostBaseUrl,
    runtime: productRecord.description || productProfile.runtime,
    release: productRecord.slug || productProfile.release,
  }
  const gatewayServices = buildGatewayMicroservices(product)
  const productSignalCards = buildProductSignalCards({ product, gatewayLogs, gatewayLogState })

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
          {productSignalCards.map((item) => (
            <SignalCard key={item.label} item={item} />
          ))}
        </div>

        <MicroserviceArchitecture services={gatewayServices} />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <TrafficPanel />
            <AiAnalysisGrid />
            <LiveLogStream
              logs={gatewayLogs}
              state={gatewayLogState}
              hostBaseUrl={product.hostBaseUrl}
              onRefresh={() => loadGatewayLogs()}
            />
          </div>

          <div className="space-y-6">
            <LogCommandCenter logs={gatewayLogs} />
            <ServiceHealthPanel services={gatewayServices} />
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
