"use client"

import { useEffect, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { MinotaurLogo } from "@/components/MinotaurLogo"
import { ParticlesBackground } from "@/components/ParticlesBackground"
import { StatusBadge } from "@/components/StatusBadge"
import { ThemeToggle } from "@/components/ThemeToggle"
import { LicenseKeyField } from "@/components/LicenseKeyField"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Slider } from "@/components/ui/slider"
import { ErrorState, LoadingState } from "@/components/DataState"
import { cn } from "@/lib/utils"
import {
  Activity,
  ArrowLeft,
  Bot,
  Check,
  CreditCard,
  Eye,
  Gauge,
  Globe2,
  ImageIcon,
  Info,
  Layers,
  ListChecks,
  Loader2,
  Package,
  Server,
  Shield,
  Star,
} from "lucide-react"
import { customersApi, getApiErrorMessage, licensesApi, productsApi } from "@/lib/api"
import { formatDate, getLicenseStatus } from "@/lib/formatters"
import apiShapeImage from "./images/apiShape.png"
import dataShapeImage from "./images/dataShape.png"
import vectorDbShapeImage from "./images/vectorDbShape.png"

const plans = [
  {
    id: "standard",
    name: "Standard",
    price: 999,
    features: ["10 Activations", "Email Support", "Basic Analytics", "1 Year License"],
  },
  {
    id: "premium",
    name: "Premium",
    price: 2499,
    features: ["Unlimited Activations", "Priority Support", "Advanced Analytics", "API Access", "1 Year License"],
    popular: true,
  },
  {
    id: "custom",
    name: "Custom Modules",
    price: 0,
    features: ["Choose modules", "Custom usage limits", "Infrastructure sizing", "Pay only for selected capacity"],
  },
]

const moduleCatalog = [
  {
    id: "cortexflow",
    name: "Cortexflow",
    category: "Flow Platform",
    price: 650,
    icon: Layers,
    description: "Design integration flows, AI-assisted automations and reusable connectors.",
    submoduleLabel: "Shapes & Connectors",
    defaultSubModules: ["data-shapes", "ai-shapes"],
    submodules: [
      { id: "data-shapes", name: "Data Shapes", price: 90, description: "Map, transform and validate structured business data." },
      { id: "ai-shapes", name: "AI Shapes", price: 140, description: "Prompt, classify, summarize and extract insights inside flows." },
      { id: "boomi-shapes", name: "Boomi Shapes", price: 120, description: "Boomi-compatible process blocks and connector patterns." },
      { id: "vectordb-shapes", name: "VectorDB Shapes", price: 130, description: "Index, search and retrieve semantic data from vector stores." },
      { id: "api-connector-shapes", name: "API Connector Shapes", price: 80, description: "REST, webhook and authenticated endpoint connectors." },
      { id: "event-stream-shapes", name: "Event Stream Shapes", price: 110, description: "Event intake, routing, replay and retry patterns." },
    ],
  },
  {
    id: "sap-hyper-automation",
    name: "SAP Hyper Automation",
    category: "Enterprise Automation",
    price: 780,
    icon: Gauge,
    description: "Automate SAP workflows, documents and operational handoffs.",
    submoduleLabel: "Automation Packs",
    defaultSubModules: ["sap-workflow-bot", "invoice-automation"],
    submodules: [
      { id: "sap-workflow-bot", name: "SAP Workflow Bot", price: 160, description: "Guided SAP task execution with approval-aware steps." },
      { id: "invoice-automation", name: "Invoice Automation", price: 190, description: "Capture, validate and route invoice data for finance teams." },
      { id: "purchase-order-automation", name: "Purchase Order Automation", price: 170, description: "Generate and reconcile purchase-order workflows." },
      { id: "successfactors-sync", name: "SuccessFactors Sync", price: 130, description: "Keep HR records and employee lifecycle events aligned." },
      { id: "sap-connector-pack", name: "SAP Connector Pack", price: 150, description: "Prebuilt connectors for common SAP service endpoints." },
    ],
  },
  {
    id: "forge",
    name: "Forge",
    category: "Builder Platform",
    price: 540,
    icon: Package,
    description: "Build internal tools, extensions and customer-facing app modules.",
    submoduleLabel: "Build Tools",
    defaultSubModules: ["app-builder", "workflow-engine"],
    submodules: [
      { id: "app-builder", name: "App Builder", price: 120, description: "Compose screens, actions and data-backed interfaces." },
      { id: "workflow-engine", name: "Workflow Engine", price: 150, description: "Model approvals, branching logic and scheduled jobs." },
      { id: "api-sdk", name: "API SDK", price: 90, description: "Developer SDKs and generated integration clients." },
      { id: "extension-marketplace", name: "Extension Marketplace", price: 110, description: "Package and publish reusable extensions." },
      { id: "role-builder", name: "Role Builder", price: 80, description: "Define module-specific roles, scopes and permissions." },
    ],
  },
  {
    id: "notification-center",
    name: "Notification Center",
    category: "Engagement",
    price: 410,
    icon: Activity,
    description: "Centralize transactional messages, alerts and product notifications.",
    submoduleLabel: "Channels & Rules",
    defaultSubModules: ["email-orchestration", "in-app-inbox"],
    submodules: [
      { id: "email-orchestration", name: "Email Orchestration", price: 80, description: "Template, queue and deliver lifecycle emails." },
      { id: "sms-gateway", name: "SMS Gateway", price: 90, description: "Send phone alerts with delivery tracking." },
      { id: "web-push", name: "Web Push", price: 70, description: "Browser push notifications for important product events." },
      { id: "in-app-inbox", name: "In-App Inbox", price: 85, description: "Persistent notifications inside the product experience." },
      { id: "alert-rules", name: "Alert Rules", price: 95, description: "Trigger notifications from thresholds, incidents and renewals." },
    ],
  },
  {
    id: "ai-workspace",
    name: "AI Workspace",
    category: "AI Operations",
    price: 720,
    icon: Bot,
    description: "Create, monitor and govern AI assistants for product operations.",
    submoduleLabel: "AI Capabilities",
    defaultSubModules: ["prompt-studio", "knowledge-base-rag"],
    submodules: [
      { id: "prompt-studio", name: "Prompt Studio", price: 130, description: "Version prompts and compare outputs across use cases." },
      { id: "agent-builder", name: "Agent Builder", price: 180, description: "Build task-focused AI agents with action tools." },
      { id: "knowledge-base-rag", name: "Knowledge Base RAG", price: 170, description: "Ground answers with product docs, tickets and logs." },
      { id: "evaluation-suite", name: "Evaluation Suite", price: 120, description: "Score AI quality, regressions and answer safety." },
      { id: "ai-audit-logs", name: "AI Audit Logs", price: 100, description: "Trace prompts, responses and user decisions." },
    ],
  },
]

const durations = [
  { id: "1y", label: "1 Year", multiplier: 1 },
  { id: "2y", label: "2 Years", multiplier: 1.8, discount: "10% off" },
  { id: "3y", label: "3 Years", multiplier: 2.5, discount: "17% off" },
]

const submoduleDetails = {
  "data-shapes": {
    useCase: "For teams that need dependable data mapping between apps, databases and operational tools.",
    capabilities: ["Visual field mapping and transform rules", "Schema validation before a flow runs", "Reusable templates for repeat integrations"],
    outcomes: ["Cleaner payloads before production", "Less manual correction work for support teams"],
    screenshots: [
      { title: "Schema mapper", caption: "Match source fields to target fields with validation warnings.", src: dataShapeImage },
      { title: "Validation report", caption: "Review sample records, rejected values and accepted transforms." },
    ],
  },
  "ai-shapes": {
    useCase: "For workflows that need AI decisions, classification, summarization or extraction inside a process.",
    capabilities: ["Prompt blocks with input and output controls", "Classification and extraction steps", "Human review routing for sensitive results"],
    outcomes: ["Faster document and ticket handling", "Consistent AI behavior across repeat workflows"],
    screenshots: [
      { title: "AI step builder", caption: "Configure prompts, inputs, expected outputs and review paths." },
      { title: "Result inspector", caption: "Inspect confidence, source data and final AI output." },
    ],
  },
  "boomi-shapes": {
    useCase: "For teams migrating or mirroring Boomi-style process patterns in a licensed workflow setup.",
    capabilities: ["Boomi-compatible process blocks", "Connector pattern templates", "Process execution checkpoints"],
    outcomes: ["Familiar workflow building for integration teams", "Lower migration friction from existing Boomi designs"],
    screenshots: [
      { title: "Boomi-style canvas", caption: "Build process blocks with clear start, action and decision paths." },
      { title: "Connector pattern view", caption: "Reuse common connection patterns without rebuilding each flow." },
    ],
  },
  "vectordb-shapes": {
    useCase: "For products that search documents, tickets, policies or product content with semantic retrieval.",
    capabilities: ["Vector index setup", "Similarity search blocks", "Retrieval filters for tenant and product scope"],
    outcomes: ["Better search relevance", "Faster access to knowledge inside workflows"],
    screenshots: [
      { title: "Vector index setup", caption: "Define source collections, embedding rules and refresh cadence.", src: vectorDbShapeImage },
      { title: "Semantic search test", caption: "Preview matched records, scores and metadata filters." },
    ],
  },
  "api-connector-shapes": {
    useCase: "For teams that connect flows to REST APIs, webhooks and authenticated external services.",
    capabilities: ["REST request configuration", "Webhook triggers", "Auth headers and retry controls"],
    outcomes: ["Fewer custom connector builds", "More reliable endpoint handoffs"],
    screenshots: [
      { title: "API request setup", caption: "Configure method, URL, headers, body and expected response.", src: apiShapeImage },
      { title: "Webhook monitor", caption: "Track payload delivery, retries and failed calls." },
    ],
  },
  "event-stream-shapes": {
    useCase: "For products that need event intake, routing, replay and recovery across high-volume workflows.",
    capabilities: ["Event topic routing", "Replay and retry paths", "Dead-letter visibility for failed events"],
    outcomes: ["Higher resilience during traffic spikes", "Clearer debugging for missed events"],
    screenshots: [
      { title: "Event routing board", caption: "Route event types to actions, queues and fallback branches." },
      { title: "Replay console", caption: "Replay failed events after fixes without losing context." },
    ],
  },
  "sap-workflow-bot": {
    useCase: "For guided SAP task execution where approvals, handoffs and auditability matter.",
    capabilities: ["SAP-aware task sequences", "Approval gates", "Execution status tracking"],
    outcomes: ["Less manual SAP navigation", "Clearer ownership for operational handoffs"],
    screenshots: [
      { title: "SAP task runner", caption: "Run guided steps with required approvals and audit notes." },
      { title: "Approval timeline", caption: "See pending approvals, owners and completed SAP actions." },
    ],
  },
  "invoice-automation": {
    useCase: "For finance teams that capture invoice details, validate fields and route exceptions.",
    capabilities: ["Invoice data extraction", "Validation against rules", "Exception routing for finance review"],
    outcomes: ["Faster invoice processing", "Fewer payment delays from missing data"],
    screenshots: [
      { title: "Invoice capture", caption: "Extract supplier, total, line items and tax fields." },
      { title: "Exception queue", caption: "Route mismatches to finance reviewers with evidence." },
    ],
  },
  "purchase-order-automation": {
    useCase: "For procurement teams that create, reconcile and track purchase-order workflows.",
    capabilities: ["PO generation steps", "Three-way matching support", "Reconciliation status tracking"],
    outcomes: ["Cleaner procurement handoffs", "Reduced mismatch resolution time"],
    screenshots: [
      { title: "PO workflow", caption: "Create request, approval and reconciliation steps in one flow." },
      { title: "Matching review", caption: "Compare invoice, receipt and purchase-order details." },
    ],
  },
  "successfactors-sync": {
    useCase: "For HR teams that need employee lifecycle data synchronized with operational systems.",
    capabilities: ["Employee record synchronization", "Lifecycle event triggers", "Field mapping for HR profiles"],
    outcomes: ["Better HR data consistency", "Faster onboarding and offboarding flows"],
    screenshots: [
      { title: "HR sync rules", caption: "Choose fields, lifecycle events and destination systems." },
      { title: "Sync health", caption: "Monitor successful updates, warnings and failed records." },
    ],
  },
  "sap-connector-pack": {
    useCase: "For teams that need reusable SAP endpoint connectors without rebuilding integration plumbing.",
    capabilities: ["Prebuilt SAP service connectors", "Credential and tenant scoping", "Request and response templates"],
    outcomes: ["Quicker SAP integration setup", "More consistent connector governance"],
    screenshots: [
      { title: "Connector library", caption: "Select prebuilt SAP connectors by service and purpose." },
      { title: "Connection health", caption: "Review auth status, last sync and service warnings." },
    ],
  },
  "app-builder": {
    useCase: "For building internal tools, admin screens and customer-facing modules with data-backed actions.",
    capabilities: ["Screen composition", "Action buttons and forms", "Data-bound tables and detail views"],
    outcomes: ["Faster internal tool delivery", "Less dependence on one-off frontend work"],
    screenshots: [
      { title: "Screen builder", caption: "Compose forms, tables and action areas from reusable blocks." },
      { title: "Data binding panel", caption: "Connect UI fields to APIs, tables and workflow actions." },
    ],
  },
  "workflow-engine": {
    useCase: "For modeling approvals, branching logic, scheduled jobs and recurring operational processes.",
    capabilities: ["Visual workflow steps", "Branching and approvals", "Schedules and background jobs"],
    outcomes: ["Repeatable business processes", "Fewer manual status checks"],
    screenshots: [
      { title: "Workflow designer", caption: "Build steps, decisions, approvals and automated actions." },
      { title: "Run history", caption: "Inspect completed, pending and failed workflow runs." },
    ],
  },
  "api-sdk": {
    useCase: "For developer teams that need generated clients and clear integration helpers.",
    capabilities: ["Generated API clients", "Endpoint examples", "Auth and error-handling helpers"],
    outcomes: ["Faster developer onboarding", "More consistent API usage across teams"],
    screenshots: [
      { title: "SDK explorer", caption: "Browse generated methods, request shapes and examples." },
      { title: "Integration sample", caption: "Copy working snippets for common API operations." },
    ],
  },
  "extension-marketplace": {
    useCase: "For teams packaging reusable extensions, templates and add-ons for customer or internal use.",
    capabilities: ["Extension packaging", "Version publishing", "Marketplace listing controls"],
    outcomes: ["Reusable app capabilities", "Cleaner release management for add-ons"],
    screenshots: [
      { title: "Extension catalog", caption: "List extensions by category, version and install status." },
      { title: "Publish flow", caption: "Package, review and publish new extension versions." },
    ],
  },
  "role-builder": {
    useCase: "For administrators defining module-specific roles, scopes and access boundaries.",
    capabilities: ["Role templates", "Permission scopes", "Access review visibility"],
    outcomes: ["Safer customer and team access", "Simpler permission reviews"],
    screenshots: [
      { title: "Permission matrix", caption: "Assign view, edit, approve and admin scopes per module." },
      { title: "Role preview", caption: "Preview what each role can access before publishing." },
    ],
  },
  "email-orchestration": {
    useCase: "For teams managing lifecycle emails, product notifications and transactional messages.",
    capabilities: ["Template management", "Queue and delivery tracking", "Audience and event triggers"],
    outcomes: ["More reliable email delivery", "Clearer message governance"],
    screenshots: [
      { title: "Template studio", caption: "Edit content, variables and trigger rules in one place." },
      { title: "Delivery queue", caption: "Track sent, pending, bounced and failed email events." },
    ],
  },
  "sms-gateway": {
    useCase: "For time-sensitive phone alerts, verification messages and operational notifications.",
    capabilities: ["SMS templates", "Provider routing", "Delivery receipt tracking"],
    outcomes: ["Faster critical alerts", "Better visibility into failed phone delivery"],
    screenshots: [
      { title: "SMS campaign setup", caption: "Configure message text, recipients and delivery provider." },
      { title: "Delivery receipts", caption: "Monitor delivered, failed and pending phone alerts." },
    ],
  },
  "web-push": {
    useCase: "For browser push notifications tied to important product events.",
    capabilities: ["Push subscription management", "Event-triggered notifications", "Delivery and opt-in reporting"],
    outcomes: ["More immediate product updates", "Better reach for active browser users"],
    screenshots: [
      { title: "Push rule setup", caption: "Trigger browser notifications from product events." },
      { title: "Opt-in analytics", caption: "Review subscriptions, sends and delivery rates." },
    ],
  },
  "in-app-inbox": {
    useCase: "For persistent notifications that users can review inside the product experience.",
    capabilities: ["Inbox message types", "Read and unread states", "Actionable notification links"],
    outcomes: ["Fewer missed product messages", "A cleaner record of user-facing alerts"],
    screenshots: [
      { title: "Inbox preview", caption: "Review message cards, priorities and user actions." },
      { title: "Message composer", caption: "Create in-app messages with audience and expiration rules." },
    ],
  },
  "alert-rules": {
    useCase: "For triggering notifications from thresholds, incidents, failed jobs and renewal events.",
    capabilities: ["Threshold rules", "Incident routing", "Renewal and failure triggers"],
    outcomes: ["Earlier response to issues", "Less manual monitoring for account teams"],
    screenshots: [
      { title: "Rule builder", caption: "Define conditions, severity, recipients and escalation paths." },
      { title: "Alert timeline", caption: "See triggered alerts, owners and resolution status." },
    ],
  },
  "prompt-studio": {
    useCase: "For teams that need prompt versioning, testing and controlled AI behavior.",
    capabilities: ["Prompt versions", "Side-by-side output tests", "Input and output guardrails"],
    outcomes: ["More predictable AI responses", "Faster iteration for AI use cases"],
    screenshots: [
      { title: "Prompt editor", caption: "Version prompts with test data and expected outputs." },
      { title: "Comparison view", caption: "Compare outputs across prompt versions before release." },
    ],
  },
  "agent-builder": {
    useCase: "For building AI agents that can take task-focused actions with controlled tools.",
    capabilities: ["Agent instructions", "Tool and action binding", "Approval checks for risky steps"],
    outcomes: ["Automated task support", "Better control over AI actions"],
    screenshots: [
      { title: "Agent setup", caption: "Define agent goals, tools, guardrails and escalation rules." },
      { title: "Action trace", caption: "Inspect tool calls, decisions and handoff points." },
    ],
  },
  "knowledge-base-rag": {
    useCase: "For grounding AI answers in product docs, tickets, policies and operational knowledge.",
    capabilities: ["Knowledge source ingestion", "Retrieval filters", "Source citation controls"],
    outcomes: ["Answers grounded in approved content", "Less repeated support research"],
    screenshots: [
      { title: "Knowledge sources", caption: "Connect docs, tickets and files for retrieval." },
      { title: "Answer grounding", caption: "Preview retrieved sources and answer confidence." },
    ],
  },
  "evaluation-suite": {
    useCase: "For scoring AI quality, regressions, safety and answer usefulness before releases.",
    capabilities: ["Test sets and rubrics", "Regression comparisons", "Safety and quality scoring"],
    outcomes: ["Lower AI release risk", "Clearer evidence for model or prompt changes"],
    screenshots: [
      { title: "Evaluation run", caption: "Score answers across quality, safety and accuracy checks." },
      { title: "Regression report", caption: "Compare new results against previous releases." },
    ],
  },
  "ai-audit-logs": {
    useCase: "For tracing prompts, responses, tool calls and user decisions for governance.",
    capabilities: ["Prompt and response history", "Tool-call audit trails", "User decision tracking"],
    outcomes: ["Stronger AI governance", "Faster investigation of AI-assisted decisions"],
    screenshots: [
      { title: "Audit timeline", caption: "Trace prompts, responses, actions and reviewers." },
      { title: "Governance filters", caption: "Filter AI activity by user, tenant, model and risk." },
    ],
  },
}

const getSubModuleDetails = (module, subModule) => {
  const detail = submoduleDetails[subModule.id]

  if (detail) {
    return detail
  }

  return {
    useCase: `For teams that need ${subModule.name.toLowerCase()} capabilities inside ${module.name}.`,
    capabilities: [
      `${subModule.name} configuration`,
      "Operational tracking and validation",
      "Reusable settings for future workflows",
    ],
    outcomes: ["Clearer setup decisions", "Better visibility for account and support teams"],
    screenshots: [
      { title: `${subModule.name} workspace`, caption: "Configure the submodule and preview its key settings." },
      { title: `${subModule.name} status`, caption: "Review activity, issues and usage signals." },
    ],
  }
}

function ScreenshotPreview({ screenshot, index }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="flex items-center gap-1 border-b border-border bg-secondary/60 px-3 py-2">
        <span className="h-2 w-2 rounded-full bg-destructive/70" />
        <span className="h-2 w-2 rounded-full bg-warning/80" />
        <span className="h-2 w-2 rounded-full bg-success/80" />
        <span className="ml-2 truncate text-xs text-muted-foreground">{screenshot.title}</span>
      </div>
      <div className="space-y-3 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-foreground">{screenshot.title}</p>
            <p className="mt-1 text-xs text-muted-foreground">{screenshot.caption}</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <ImageIcon className="h-4 w-4 text-primary" />
          </div>
        </div>
        {screenshot.src ? (
          <div className="overflow-hidden rounded-md border border-border bg-background/40">
            <img
              src={screenshot.src}
              alt={`${screenshot.title} screenshot`}
              className="max-h-[28rem] w-full object-contain"
              loading="lazy"
            />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-2">
              {[0, 1, 2].map((item) => (
                <div key={item} className="rounded-md border border-border bg-background/40 p-2">
                  <div
                    className={cn(
                      "mb-2 h-1.5 rounded-full",
                      item === 0 && "bg-primary",
                      item === 1 && "bg-accent",
                      item === 2 && "bg-success",
                    )}
                    style={{ width: `${55 + item * 14 + index * 4}%` }}
                  />
                  <div className="h-2 rounded bg-muted" />
                  <div className="mt-1 h-2 w-2/3 rounded bg-muted" />
                </div>
              ))}
            </div>
            <div className="rounded-md border border-border bg-background/40 p-3">
              <div className="mb-3 flex items-center justify-between">
                <div className="h-2 w-28 rounded bg-muted" />
                <div className="h-5 w-16 rounded-full bg-primary/15" />
              </div>
              <div className="space-y-2">
                {[0, 1, 2].map((row) => (
                  <div key={row} className="grid grid-cols-[1fr_3rem] gap-3">
                    <div className="h-2 rounded bg-muted" />
                    <div className="h-2 rounded bg-muted" />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function SubModuleDetailSheet({ detail, isSelected, onClose, onToggleSelection }) {
  const open = Boolean(detail)
  const module = detail?.module
  const subModule = detail?.subModule
  const subModuleDetail = module && subModule ? getSubModuleDetails(module, subModule) : null
  const Icon = module?.icon || Package

  return (
    <Sheet open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      {module && subModule && subModuleDetail && (
        <SheetContent className="glass-strong border-border p-0 gap-0 w-full sm:max-w-2xl">
          <SheetHeader className="border-b border-border p-5 pr-12">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <SheetTitle className="text-xl">{subModule.name}</SheetTitle>
                <SheetDescription className="mt-1">
                  {module.name} - {module.submoduleLabel}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <div className="h-[calc(100vh-9.5rem)] overflow-y-auto">
            <div className="space-y-5 p-5">
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-normal text-primary">Submodule overview</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{subModule.description}</p>
                    <p className="mt-3 text-sm leading-6 text-foreground">{subModuleDetail.useCase}</p>
                  </div>
                  <div className="shrink-0 rounded-lg border border-border bg-background/40 p-3 text-right">
                    <p className="text-xs text-muted-foreground">Annual add-on</p>
                    <p className="text-2xl font-bold text-primary">${subModule.price}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{isSelected ? "Selected" : "Not selected"}</p>
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-3 flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-foreground">Screenshots</h3>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {subModuleDetail.screenshots.map((screenshot, index) => (
                    <ScreenshotPreview key={screenshot.title} screenshot={screenshot} index={index} />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-border bg-secondary/20 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <ListChecks className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold text-foreground">What it includes</h3>
                  </div>
                  <div className="space-y-3">
                    {subModuleDetail.capabilities.map((item) => (
                      <div key={item} className="flex gap-2 text-sm text-muted-foreground">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-secondary/20 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Info className="h-4 w-4 text-accent" />
                    <h3 className="font-semibold text-foreground">Client value</h3>
                  </div>
                  <div className="space-y-3">
                    {subModuleDetail.outcomes.map((item) => (
                      <div key={item} className="flex gap-2 text-sm text-muted-foreground">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 rounded-lg border border-border bg-card/60 p-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs text-muted-foreground">Module</p>
                  <p className="mt-1 text-sm font-medium text-foreground">{module.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Category</p>
                  <p className="mt-1 text-sm font-medium text-foreground">{module.category}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Plan impact</p>
                  <p className="mt-1 text-sm font-medium text-foreground">+${subModule.price}/year</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-border p-4">
            <Button
              type="button"
              onClick={onToggleSelection}
              className={cn(
                "w-full",
                isSelected
                  ? "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  : "bg-primary text-primary-foreground hover:bg-primary/90 glow-blue",
              )}
            >
              {isSelected ? "Remove from Plan" : "Add to Plan"}
            </Button>
          </div>
        </SheetContent>
      )}
    </Sheet>
  )
}

export default function RenewalPage() {
  const [searchParams] = useSearchParams()
  const [selectedPlan, setSelectedPlan] = useState("premium")
  const [selectedDuration, setSelectedDuration] = useState("1y")
  const [step, setStep] = useState(1)
  const [customer, setCustomer] = useState(null)
  const [licenses, setLicenses] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [paymentError, setPaymentError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [createdLicense, setCreatedLicense] = useState(null)
  const [recordedPayment, setRecordedPayment] = useState(null)
  const [selectedProductId, setSelectedProductId] = useState(null)
  const [selectedModules, setSelectedModules] = useState(["cortexflow"])
  const [selectedSubModules, setSelectedSubModules] = useState({
    cortexflow: ["data-shapes", "ai-shapes"],
  })
  const [monthlyRequests, setMonthlyRequests] = useState([500000])
  const [storageGb, setStorageGb] = useState([250])
  const [teamSeats, setTeamSeats] = useState([10])
  const [environments, setEnvironments] = useState([2])
  const [activeSubModuleDetail, setActiveSubModuleDetail] = useState(null)

  const requestedProductId = Number(searchParams.get("productId"))

  const plan = plans.find((p) => p.id === selectedPlan)
  const duration = durations.find((d) => d.id === selectedDuration)
  const isCustomPlan = selectedPlan === "custom"
  const selectedModuleItems = moduleCatalog.filter((module) => selectedModules.includes(module.id))
  const getSelectedSubModuleItems = (module) =>
    module.submodules.filter((subModule) => selectedSubModules[module.id]?.includes(subModule.id))
  const selectedSubModuleItems = selectedModuleItems.flatMap((module) =>
    getSelectedSubModuleItems(module).map((subModule) => ({
      ...subModule,
      moduleId: module.id,
      moduleName: module.name,
    })),
  )
  const moduleBaseSubtotal = selectedModuleItems.reduce((sum, module) => sum + module.price, 0)
  const subModuleSubtotal = selectedSubModuleItems.reduce((sum, subModule) => sum + subModule.price, 0)
  const moduleSubtotal = moduleBaseSubtotal + subModuleSubtotal
  const infraSubtotal =
    Math.ceil(monthlyRequests[0] / 100000) * 25 +
    storageGb[0] * 1.5 +
    teamSeats[0] * 18 +
    environments[0] * 120
  const yearlyBasePrice = isCustomPlan ? moduleSubtotal + infraSubtotal : plan.price
  const totalPrice = yearlyBasePrice * duration.multiplier
  const selectedProduct = products.find((product) => Number(product.id) === Number(selectedProductId))
  const selectedExistingLicense =
    licenses.find((license) => Number(license.product_id) === Number(selectedProductId)) || null
  const checkoutLabel = selectedExistingLicense ? "Renew / Upgrade" : "New Purchase"
  const activeSubModuleIsSelected = activeSubModuleDetail
    ? selectedSubModules[activeSubModuleDetail.module.id]?.includes(activeSubModuleDetail.subModule.id)
    : false

  const toggleModule = (moduleId) => {
    const module = moduleCatalog.find((item) => item.id === moduleId)

    if (selectedModules.includes(moduleId)) {
      setSelectedModules((current) => current.filter((id) => id !== moduleId))
      setSelectedSubModules((current) => {
        const nextSubModules = { ...current }
        delete nextSubModules[moduleId]
        return nextSubModules
      })
      return
    }

    setSelectedModules((current) => [...current, moduleId])
    setSelectedSubModules((current) => ({
      ...current,
      [moduleId]: current[moduleId]?.length ? current[moduleId] : module?.defaultSubModules || [],
    }))
  }

  const toggleSubModule = (moduleId, subModuleId) => {
    setSelectedSubModules((current) => {
      const currentSubModules = current[moduleId] || []
      const nextSubModules = currentSubModules.includes(subModuleId)
        ? currentSubModules.filter((id) => id !== subModuleId)
        : [...currentSubModules, subModuleId]

      return {
        ...current,
        [moduleId]: nextSubModules,
      }
    })
  }

  const openSubModuleDetail = (module, subModule) => {
    setActiveSubModuleDetail({ module, subModule })
  }

  const toggleActiveSubModule = () => {
    if (!activeSubModuleDetail) {
      return
    }

    toggleSubModule(activeSubModuleDetail.module.id, activeSubModuleDetail.subModule.id)
  }

  const getExpirationAt = () => {
    const currentExpiration = selectedExistingLicense?.expiration_at ? new Date(selectedExistingLicense.expiration_at) : null
    const now = new Date()
    const baseDate =
      currentExpiration && !Number.isNaN(currentExpiration.getTime()) && currentExpiration.getTime() > now.getTime()
        ? currentExpiration
        : now
    const expirationDate = new Date(baseDate)
    const yearsToAdd = selectedDuration === "2y" ? 2 : selectedDuration === "3y" ? 3 : 1

    expirationDate.setFullYear(expirationDate.getFullYear() + yearsToAdd)

    return expirationDate.toISOString()
  }

  const getPurchaseSummary = () => {
    if (!isCustomPlan) {
      return `${plan.name} plan for ${selectedProduct?.name || "selected product"}`
    }

    return [
      `${selectedModuleItems.length} modules`,
      `${selectedSubModuleItems.length} submodules`,
      `${monthlyRequests[0].toLocaleString()} req/month`,
      `${storageGb[0]} GB storage`,
      `${teamSeats[0]} seats`,
      `${environments[0]} envs`,
    ].join(" | ")
  }

  const getLicenseFeatures = () => {
    if (!isCustomPlan) {
      return plan.features
    }

    return selectedModuleItems.flatMap((module) => [
      module.name,
      ...getSelectedSubModuleItems(module).map((subModule) => `${module.name}: ${subModule.name}`),
    ])
  }

  const getCustomPlanFields = () => {
    if (!isCustomPlan) {
      return null
    }

    return {
      planId: plan.id,
      planName: plan.name,
      duration: {
        id: duration.id,
        label: duration.label,
        multiplier: duration.multiplier,
        discount: duration.discount || null,
      },
      selectedFields: {
        moduleIds: selectedModules,
        subModuleIdsByModule: selectedSubModules,
      },
      modules: selectedModuleItems.map((module) => ({
        id: module.id,
        name: module.name,
        category: module.category,
        basePrice: module.price,
        submoduleLabel: module.submoduleLabel,
        submodules: getSelectedSubModuleItems(module).map((subModule) => ({
          id: subModule.id,
          name: subModule.name,
          price: subModule.price,
          description: subModule.description,
        })),
      })),
      infrastructure: {
        monthlyRequests: monthlyRequests[0],
        storageGb: storageGb[0],
        teamSeats: teamSeats[0],
        environments: environments[0],
      },
      pricing: {
        moduleBaseSubtotal: Number(moduleBaseSubtotal.toFixed(2)),
        subModuleSubtotal: Number(subModuleSubtotal.toFixed(2)),
        infrastructureSubtotal: Number(infraSubtotal.toFixed(2)),
        yearlyBasePrice: Number(yearlyBasePrice.toFixed(2)),
        totalPrice: Number(totalPrice.toFixed(2)),
        currency: "USD",
      },
    }
  }

  const fetchRenewalContext = async () => {
    setLoading(true)
    setLoadError(null)

    try {
      const customerResponse = await customersApi.current()
      const [licensesResponse, productsResponse] = await Promise.all([
        customersApi.licenses(customerResponse.data.id),
        productsApi.list(),
      ])
      const nextLicenses = licensesResponse.data
      const nextProducts = productsResponse.data
      const fallbackProductId =
        requestedProductId && nextProducts.some((product) => Number(product.id) === requestedProductId)
          ? requestedProductId
          : nextLicenses[0]?.product_id
            ? Number(nextLicenses[0].product_id)
            : nextProducts[0]?.id

      setCustomer(customerResponse.data)
      setLicenses(nextLicenses)
      setProducts(nextProducts)
      setSelectedProductId(fallbackProductId ? Number(fallbackProductId) : null)
    } catch (err) {
      setLoadError(getApiErrorMessage(err, "Failed to load renewal data"))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRenewalContext()
  }, [requestedProductId])

  const handlePayment = async () => {
    setPaymentError(null)

    if (!customer || !selectedProduct) {
      setPaymentError("A customer and product are required to generate a license")
      return
    }

    setSubmitting(true)

    try {
      const customPlanFields = getCustomPlanFields()
      const checkoutPayload = {
        product_id: selectedProduct.id,
        expiration_at: getExpirationAt(),
        amount: totalPrice.toFixed(2),
        currency: "USD",
        method: "card",
        payment_status: "paid",
        license_status: "valid",
        plan_name: plan.name,
        duration_label: duration.label,
        purchase_summary: getPurchaseSummary(),
        features: getLicenseFeatures(),
      }

      if (customPlanFields) {
        checkoutPayload.custom_plan = customPlanFields
      }

      const { data } = await licensesApi.checkout(checkoutPayload)

      const normalizedLicense = {
        ...data.license,
        product_id: selectedProduct.id,
        product_name: selectedProduct.name,
        product_slug: selectedProduct.slug,
        product_description: selectedProduct.description,
      }

      setCreatedLicense(normalizedLicense)
      setRecordedPayment(data.payment)
      setLicenses((current) => [normalizedLicense, ...current.filter((license) => license.id !== normalizedLicense.id)])
      setStep(3)
    } catch (err) {
      setPaymentError(getApiErrorMessage(err, "Failed to generate the license"))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen relative">
      <ParticlesBackground />
      <div className="absolute inset-0 app-radial-bg" />

      <header className="relative z-10 glass-strong border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MinotaurLogo size="sm" glowing />
            <span className="font-bold text-foreground uppercase">Licentra</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" asChild>
              <Link to="/portal">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Portal
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-6 py-8">
        {loading && <LoadingState message="Loading renewal data..." />}

        {loadError && !loading && <ErrorState message={loadError} onRetry={fetchRenewalContext} />}

        {!loading && !loadError && (
        <>
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all",
                  step >= s ? "bg-primary text-primary-foreground glow-blue" : "bg-secondary text-muted-foreground",
                )}
              >
                {step > s ? <Check className="w-5 h-5" /> : s}
              </div>
              {s < 3 && (
                <div className={cn("w-20 h-1 mx-2 rounded transition-all", step > s ? "bg-primary" : "bg-secondary")} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Choose Plan */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-foreground">
                {selectedProduct ? `${checkoutLabel} ${selectedProduct.name}` : "Choose Your Product and Plan"}
              </h1>
              <p className="text-muted-foreground">
                Select a product first, then choose the plan that matches your license needs.
              </p>
            </div>

            <Card className="glass border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  Choose Product
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {products.length === 0 ? (
                  <div className="p-4 rounded-lg bg-secondary/30 border border-border text-sm text-muted-foreground">
                    No products are available for checkout right now.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {products.map((product) => {
                      const selected = Number(selectedProductId) === Number(product.id)
                      const productLicense =
                        licenses.find((license) => Number(license.product_id) === Number(product.id)) || null

                      return (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => setSelectedProductId(Number(product.id))}
                          className={cn(
                            "text-left p-4 rounded-lg border transition-all bg-secondary/30 hover:bg-secondary/50",
                            selected ? "border-primary bg-primary/10 glow-blue" : "border-border",
                          )}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                <Package className="w-5 h-5 text-primary" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-foreground">{product.name}</p>
                                <p className="text-xs text-muted-foreground mt-1">{product.slug}</p>
                              </div>
                            </div>
                            {productLicense ? (
                              <StatusBadge status={getLicenseStatus(productLicense)} className="shrink-0" />
                            ) : (
                              <span className="text-xs text-primary shrink-0">New Purchase</span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-3">
                            {product.description || "Web application with configurable license plans."}
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 text-sm">
                            <div className="p-3 rounded-lg bg-background/30 border border-border">
                              <p className="text-xs text-muted-foreground">Tenant ID</p>
                              <p className="text-foreground mt-1 break-all">{product.tenant_id || "Not assigned"}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-background/30 border border-border">
                              <p className="text-xs text-muted-foreground">Host Base URL</p>
                              <p className="text-foreground mt-1 break-all">{product.host_base_url || "Not configured"}</p>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {selectedProduct && (
              <Card className="glass border-primary/30 bg-primary/5">
                <CardContent className="p-5">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                        <Globe2 className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Selected Product</p>
                        <h2 className="text-xl font-bold text-foreground">{selectedProduct.name}</h2>
                        <p className="text-sm text-muted-foreground mt-1">
                          {selectedProduct.description || selectedProduct.slug}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p className="text-foreground font-medium text-right">{checkoutLabel}</p>
                      <p className="text-muted-foreground text-right">{selectedProduct.tenant_id || "No tenant ID"}</p>
                      <p className="text-muted-foreground text-right break-all">
                        {selectedProduct.host_base_url || "No host base URL"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((p) => (
                <Card
                  key={p.id}
                  className={cn(
                    "glass border-border cursor-pointer transition-all duration-300 hover:scale-[1.02]",
                    selectedPlan === p.id && "ring-2 ring-primary glow-blue",
                    p.popular && "relative",
                  )}
                  onClick={() => setSelectedPlan(p.id)}
                >
                  {p.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        Most Popular
                      </span>
                    </div>
                  )}
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-foreground">{p.name}</h3>
                      <div
                        className={cn(
                          "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                          selectedPlan === p.id ? "border-primary bg-primary" : "border-muted-foreground",
                        )}
                      >
                        {selectedPlan === p.id && <Check className="w-4 h-4 text-primary-foreground" />}
                      </div>
                    </div>
                    <div className="mb-4">
                      {p.id === "custom" ? (
                        <>
                          <span className="text-3xl font-bold text-foreground">Build</span>
                          <span className="text-muted-foreground"> your plan</span>
                        </>
                      ) : (
                        <>
                          <span className="text-3xl font-bold text-foreground">${p.price}</span>
                          <span className="text-muted-foreground">/year</span>
                        </>
                      )}
                    </div>
                    <ul className="space-y-2">
                      {p.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Check className="w-4 h-4 text-success" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>

            {isCustomPlan && (
              <div className="space-y-6">
                <Card className="glass border-border">
                  <CardHeader>
                    <CardTitle className="text-foreground flex items-center gap-2">
                      <Package className="w-5 h-5 text-primary" />
                      Choose Modules
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {moduleCatalog.map((module) => {
                        const Icon = module.icon
                        const selected = selectedModules.includes(module.id)
                        const selectedCount = selectedSubModules[module.id]?.length || 0

                        return (
                          <button
                            key={module.id}
                            type="button"
                            onClick={() => toggleModule(module.id)}
                            className={cn(
                              "text-left p-4 rounded-lg border transition-all bg-secondary/30 hover:bg-secondary/50",
                              selected && "border-primary bg-primary/10 glow-blue",
                              !selected && "border-border",
                            )}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                  <Icon className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                  <p className="font-semibold text-foreground">{module.name}</p>
                                  <p className="text-xs text-primary">{module.category}</p>
                                </div>
                              </div>
                              <div
                                className={cn(
                                  "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0",
                                  selected ? "border-primary bg-primary" : "border-muted-foreground",
                                )}
                              >
                                {selected && <Check className="w-4 h-4 text-primary-foreground" />}
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mt-3">{module.description}</p>
                            <div className="flex items-end justify-between gap-3 mt-4">
                              <div>
                                <p className="text-xs text-muted-foreground">Base price</p>
                                <p className="text-lg font-bold text-foreground">${module.price}/year</p>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {selected ? selectedCount : module.submodules.length} {selected ? "selected" : "options"}
                              </span>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>

                {selectedModuleItems.length > 0 && (
                  <Card className="glass border-border">
                    <CardHeader>
                      <CardTitle className="text-foreground flex items-center gap-2">
                        <Layers className="w-5 h-5 text-primary" />
                        Configure Submodules
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      {selectedModuleItems.map((module) => {
                        const Icon = module.icon
                        const selectedSubModuleIds = selectedSubModules[module.id] || []

                        return (
                          <div key={module.id} className="rounded-lg border border-border bg-secondary/20 p-4 space-y-4">
                            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                  <Icon className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                  <p className="font-semibold text-foreground">{module.name}</p>
                                  <p className="text-xs text-muted-foreground">{module.submoduleLabel}</p>
                                </div>
                              </div>
                              <div className="text-sm text-primary font-medium">
                                {selectedSubModuleIds.length} of {module.submodules.length} selected
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {module.submodules.map((subModule) => {
                                const selected = selectedSubModuleIds.includes(subModule.id)

                                return (
                                  <div
                                    key={subModule.id}
                                    className={cn(
                                      "overflow-hidden rounded-lg border transition-all bg-background/30",
                                      selected && "border-primary bg-primary/10",
                                      !selected && "border-border",
                                    )}
                                  >
                                    <button
                                      type="button"
                                      onClick={() => toggleSubModule(module.id, subModule.id)}
                                      className="w-full p-3 text-left transition-colors hover:bg-secondary/50"
                                    >
                                      <div className="flex items-start justify-between gap-3">
                                        <div>
                                          <p className="font-medium text-foreground">{subModule.name}</p>
                                          <p className="text-xs text-muted-foreground mt-1">{subModule.description}</p>
                                        </div>
                                        <div
                                          className={cn(
                                            "w-5 h-5 rounded-full border flex items-center justify-center shrink-0",
                                            selected ? "border-primary bg-primary" : "border-muted-foreground",
                                          )}
                                        >
                                          {selected && <Check className="w-3 h-3 text-primary-foreground" />}
                                        </div>
                                      </div>
                                    </button>
                                    <div className="flex items-center justify-between gap-3 border-t border-border px-3 py-2">
                                      <p className="text-sm font-semibold text-primary">+${subModule.price}/year</p>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => openSubModuleDetail(module, subModule)}
                                        className="h-8 px-2 text-primary"
                                      >
                                        <Eye className="h-4 w-4" />
                                        Details
                                      </Button>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })}
                    </CardContent>
                  </Card>
                )}

                <Card className="glass border-border">
                  <CardHeader>
                    <CardTitle className="text-foreground flex items-center gap-2">
                      <Server className="w-5 h-5 text-primary" />
                      Infrastructure Selection
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label className="text-foreground">Monthly Requests</Label>
                          <span className="text-sm font-mono text-primary">{monthlyRequests[0].toLocaleString()}</span>
                        </div>
                        <Slider
                          value={monthlyRequests}
                          onValueChange={setMonthlyRequests}
                          min={100000}
                          max={5000000}
                          step={100000}
                        />
                        <p className="text-xs text-muted-foreground">Controls API throughput and traffic capacity.</p>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label className="text-foreground">Data Storage</Label>
                          <span className="text-sm font-mono text-primary">{storageGb[0]} GB</span>
                        </div>
                        <Slider value={storageGb} onValueChange={setStorageGb} min={50} max={2000} step={50} />
                        <p className="text-xs text-muted-foreground">Used for logs, audit data, customer files and reports.</p>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label className="text-foreground">Team Seats</Label>
                          <span className="text-sm font-mono text-primary">{teamSeats[0]} users</span>
                        </div>
                        <Slider value={teamSeats} onValueChange={setTeamSeats} min={1} max={100} step={1} />
                        <p className="text-xs text-muted-foreground">Admin, support and customer-success access.</p>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label className="text-foreground">Environments</Label>
                          <span className="text-sm font-mono text-primary">{environments[0]}</span>
                        </div>
                        <Slider value={environments} onValueChange={setEnvironments} min={1} max={6} step={1} />
                        <p className="text-xs text-muted-foreground">Production, staging, sandbox and regional deployments.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass border-primary/30 bg-primary/5">
                  <CardContent className="p-5">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Selected Modules</p>
                        <p className="text-2xl font-bold text-foreground">{selectedModuleItems.length}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Module Base</p>
                        <p className="text-2xl font-bold text-foreground">${moduleBaseSubtotal.toFixed(0)}/year</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Submodules</p>
                        <p className="text-2xl font-bold text-foreground">${subModuleSubtotal.toFixed(0)}/year</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Infrastructure Subtotal</p>
                        <p className="text-2xl font-bold text-foreground">${infraSubtotal.toFixed(0)}/year</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <Card className="glass border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Select Duration</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={selectedDuration}
                  onValueChange={setSelectedDuration}
                  className="grid grid-cols-3 gap-4"
                >
                  {durations.map((d) => (
                    <Label
                      key={d.id}
                      className={cn(
                        "flex flex-col items-center p-4 rounded-lg border cursor-pointer transition-all",
                        selectedDuration === d.id
                          ? "border-primary bg-primary/10"
                          : "border-border hover:bg-secondary/50",
                      )}
                    >
                      <RadioGroupItem value={d.id} className="sr-only" />
                      <span className="font-semibold text-foreground">{d.label}</span>
                      {d.discount && <span className="text-xs text-success mt-1">{d.discount}</span>}
                    </Label>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>

            <Button
              onClick={() => setStep(2)}
              disabled={!selectedProduct || (isCustomPlan && selectedModules.length === 0)}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground glow-blue py-6"
            >
              Continue to Payment
            </Button>
          </div>
        )}

        {/* Step 2: Payment */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-foreground">Review and Confirm</h1>
              <p className="text-muted-foreground">
                {selectedProduct ? `Generate a license for ${selectedProduct.name}` : "Confirm your payment details"}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card className="glass border-border">
                  <CardHeader>
                    <CardTitle className="text-foreground flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-primary" />
                      Payment Method
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Card Number</Label>
                      <Input placeholder="1234 5678 9012 3456" className="bg-input border-border" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Expiry Date</Label>
                        <Input placeholder="MM/YY" className="bg-input border-border" />
                      </div>
                      <div className="space-y-2">
                        <Label>CVC</Label>
                        <Input placeholder="123" className="bg-input border-border" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Cardholder Name</Label>
                      <Input placeholder="John Doe" className="bg-input border-border" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="glass border-border neon-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Product</span>
                    <span className="text-foreground">{selectedProduct?.name || "No product selected"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Flow</span>
                    <span className="text-foreground">{checkoutLabel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{plan.name} Plan</span>
                    <span className="text-foreground">${yearlyBasePrice.toFixed(0)}</span>
                  </div>
                  {isCustomPlan && (
                    <>
                      <div className="space-y-2 rounded-lg bg-secondary/30 border border-border p-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Module base</span>
                          <span className="text-foreground">${moduleBaseSubtotal.toFixed(0)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Submodules</span>
                          <span className="text-foreground">${subModuleSubtotal.toFixed(0)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Infrastructure</span>
                          <span className="text-foreground">${infraSubtotal.toFixed(0)}</span>
                        </div>
                        <div className="pt-2 border-t border-border text-xs text-muted-foreground space-y-1">
                          <p>{monthlyRequests[0].toLocaleString()} requests/month</p>
                          <p>{storageGb[0]} GB storage · {teamSeats[0]} seats · {environments[0]} envs</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {selectedModuleItems.map((module) => {
                          const selectedSubModulesForModule = getSelectedSubModuleItems(module)

                          return (
                            <div key={module.id} className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">{module.name}</span>
                                <span className="text-foreground">${module.price}</span>
                              </div>
                              {selectedSubModulesForModule.map((subModule) => (
                                <div key={subModule.id} className="flex justify-between gap-3 pl-3 text-xs">
                                  <span className="text-muted-foreground">{subModule.name}</span>
                                  <span className="text-foreground">${subModule.price}</span>
                                </div>
                              ))}
                            </div>
                          )
                        })}
                      </div>
                    </>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="text-foreground">{duration.label}</span>
                  </div>
                  {duration.discount && (
                    <div className="flex justify-between text-success">
                      <span>Discount</span>
                      <span>-{duration.discount}</span>
                    </div>
                  )}
                  <div className="pt-4 border-t border-border">
                    <div className="flex justify-between">
                      <span className="font-semibold text-foreground">Total</span>
                      <span className="text-2xl font-bold text-primary">${totalPrice.toFixed(0)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1 border-border bg-transparent">
                Back
              </Button>
              {paymentError && <p className="flex-1 text-sm text-destructive self-center">{paymentError}</p>}
              <Button
                onClick={handlePayment}
                disabled={submitting || !selectedProduct}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground glow-blue"
              >
                {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                {submitting ? "Generating..." : "Generate License"}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto animate-pulse">
              <Check className="w-10 h-10 text-success" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">License Generated!</h1>
              <p className="text-muted-foreground">
                Your {selectedProduct?.name || "selected"} plan has been submitted and the backend generated the license.
              </p>
              {recordedPayment && (
                <p className="text-xs text-muted-foreground mt-2">Payment #{recordedPayment.id} recorded</p>
              )}
            </div>

            <Card className="glass border-border neon-border max-w-md mx-auto">
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Product</span>
                  <span className="text-foreground font-medium">{selectedProduct?.name || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Plan</span>
                  <span className="text-foreground font-medium">{plan.name}</span>
                </div>
                {isCustomPlan && (
                  <div className="space-y-2 rounded-lg bg-secondary/30 border border-border p-3 text-left">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Modules</span>
                      <span className="text-foreground font-medium">{selectedModuleItems.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Submodules</span>
                      <span className="text-foreground font-medium">{selectedSubModuleItems.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Requests</span>
                      <span className="text-foreground font-medium">{monthlyRequests[0].toLocaleString()}/month</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Storage</span>
                      <span className="text-foreground font-medium">{storageGb[0]} GB</span>
                    </div>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="text-foreground font-medium">{duration.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount Paid</span>
                  <span className="text-primary font-bold">${totalPrice.toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">New Expiry</span>
                  <span className="text-foreground font-medium">
                    {createdLicense?.expiration_at ? formatDate(createdLicense.expiration_at) : "Pending"}
                  </span>
                </div>
                <div className="space-y-2 rounded-lg bg-secondary/30 border border-border p-3 text-left">
                  <p className="text-xs text-muted-foreground">Generated License Key</p>
                  <LicenseKeyField value={createdLicense?.license_key} codeClassName="text-foreground" />
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Shield className="w-4 h-4" />
              <span>A receipt has been sent to your email</span>
            </div>

            <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground glow-blue">
              <Link to="/portal">Return to Dashboard</Link>
            </Button>
          </div>
        )}
        </>
        )}
      </main>
      <SubModuleDetailSheet
        detail={activeSubModuleDetail}
        isSelected={Boolean(activeSubModuleIsSelected)}
        onClose={() => setActiveSubModuleDetail(null)}
        onToggleSelection={toggleActiveSubModule}
      />
    </div>
  )
}
