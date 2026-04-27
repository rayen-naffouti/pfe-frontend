"use client"

import { useEffect, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { MinotaurLogo } from "@/components/MinotaurLogo"
import { ParticlesBackground } from "@/components/ParticlesBackground"
import { StatusBadge } from "@/components/StatusBadge"
import { ThemeToggle } from "@/components/ThemeToggle"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { ErrorState, LoadingState } from "@/components/DataState"
import { cn } from "@/lib/utils"
import {
  Activity,
  ArrowLeft,
  Bot,
  Check,
  CreditCard,
  Gauge,
  Globe2,
  Layers,
  Loader2,
  Package,
  Server,
  Shield,
  Star,
} from "lucide-react"
import { customersApi, getApiErrorMessage, licensesApi, productsApi } from "@/lib/api"
import { formatDate, getLicenseStatus } from "@/lib/formatters"

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
      const { data } = await licensesApi.checkout({
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
      })

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
                                  <button
                                    key={subModule.id}
                                    type="button"
                                    onClick={() => toggleSubModule(module.id, subModule.id)}
                                    className={cn(
                                      "text-left p-3 rounded-lg border transition-all bg-background/30 hover:bg-secondary/50",
                                      selected && "border-primary bg-primary/10",
                                      !selected && "border-border",
                                    )}
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
                                    <p className="text-sm font-semibold text-primary mt-3">+${subModule.price}/year</p>
                                  </button>
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
                  <code className="block text-xs text-foreground break-all">{createdLicense?.license_key || "N/A"}</code>
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
    </div>
  )
}
