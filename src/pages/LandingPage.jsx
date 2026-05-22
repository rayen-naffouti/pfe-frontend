import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ThemeToggle"
import { getAuthRole, getDefaultRouteForRole, hasAuthSession } from "@/lib/auth"
import {
  ArrowRight,
  BarChart3,
  Blocks,
  Building2,
  CheckCircle2,
  ChevronRight,
  CloudCog,
  Code2,
  Database,
  Fingerprint,
  KeyRound,
  Layers3,
  LockKeyhole,
  Network,
  Route,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Users,
  Workflow,
} from "lucide-react"

const avaxiaAssets = {
  logo: "/assets/avaxia/avaxia-logo.svg",
  hero: "/assets/avaxia/hero-innovation.jpg",
  company: "/assets/avaxia/company-team.jpg",
  innovation: "/assets/avaxia/ai-innovation.jpg",
  development: "/assets/avaxia/services-development.jpg",
  products: "/assets/avaxia/products.jpg",
}

const navItems = [
  { label: "Home", href: "#home" },
  { label: "Company", href: "#company" },
  { label: "Development", href: "#development" },
  { label: "Products", href: "#products" },
  { label: "Platform", href: "#platform" },
  { label: "Contact", href: "#contact" },
]

const trustHighlights = [
  { label: "Secure by Design", icon: ShieldCheck },
  { label: "Scalable Architecture", icon: CloudCog },
  { label: "Real-time Visibility", icon: BarChart3 },
]

const companyHighlights = [
  { label: "Technology consulting", icon: Building2 },
  { label: "SAP solutions", icon: Blocks },
  { label: "System integration", icon: Network },
  { label: "Infrastructure", icon: CloudCog },
  { label: "Data and automation", icon: Database },
]

const developmentFocus = [
  { label: "Platform engineering", icon: Code2 },
  { label: "API ecosystems", icon: Route },
  { label: "Business automation", icon: Workflow },
  { label: "Analytics dashboards", icon: BarChart3 },
  { label: "Enterprise integrations", icon: Network },
  { label: "Product innovation", icon: Sparkles },
]

const products = [
  {
    title: "Gateway App",
    description: "Routes requests, validates identity, applies RBAC, and redirects traffic to the right microservice.",
    icon: Route,
  },
  {
    title: "License Management App",
    description: "Generates licenses, assigns products, activates modules, and manages customer entitlements.",
    icon: KeyRound,
  },
  {
    title: "Access Governance",
    description: "Centralizes authorization rules for customers, products, modules, and private services.",
    icon: ShieldCheck,
  },
  {
    title: "Subscription Control",
    description: "Manages plans, renewals, validity periods, and customer-specific subscription models.",
    icon: SlidersHorizontal,
  },
  {
    title: "Monitoring & Insights",
    description: "Tracks license usage, active subscriptions, expiring access, and gateway activity.",
    icon: BarChart3,
  },
]

const workflowSteps = [
  { label: "Client Request", icon: Users },
  { label: "Gateway Verification", icon: Route },
  { label: "License Check", icon: KeyRound },
  { label: "Module Validation", icon: Layers3 },
  { label: "Target Service", icon: CloudCog },
]

const platformOverviewItems = [
  { label: "Customers", description: "Centralize customer accounts and access profiles.", icon: Users },
  { label: "Products", description: "Connect each product to modules and gateway rules.", icon: Blocks },
  { label: "Licenses", description: "Generate and validate secure license keys.", icon: KeyRound },
  { label: "Subscriptions", description: "Control plans, renewals, and access periods.", icon: SlidersHorizontal },
  { label: "Modules", description: "Enable or disable feature groups per customer.", icon: Layers3 },
  { label: "Gateway Rules", description: "Enforce access before requests reach services.", icon: ShieldCheck },
]

const licenseActions = [
  "Generate licenses",
  "Assign products",
  "Activate modules",
  "Define subscription plans",
  "Manage entitlements",
  "Control usage",
]

const licenseFormFields = [
  { label: "Customer", value: "AVAXIA Client" },
  { label: "Product", value: "Gateway Services" },
  { label: "Subscription Plan", value: "Professional" },
  { label: "Enabled Modules", value: "Reporting, API, Monitoring" },
  { label: "Expiration Date", value: "2027-06-30" },
  { label: "Usage Limits", value: "250k requests / month" },
]

const benefits = [
  { title: "Centralized Control", description: "One place to manage product access, subscriptions, licenses, and module activation.", icon: SlidersHorizontal },
  { title: "Better Security", description: "Gateway decisions are enforced before users reach private services.", icon: LockKeyhole },
  { title: "Flexible Subscriptions", description: "Support standard, professional, enterprise, and custom customer plans.", icon: Layers3 },
  { title: "Customer Permissions", description: "Adapt access rules to each customer, product, and contract.", icon: Fingerprint },
  { title: "Scalable Model", description: "A cleaner foundation for growing products, services, and subscription logic.", icon: CloudCog },
  { title: "Better Visibility", description: "Track license health, gateway usage, subscription activity, and expiring access.", icon: BarChart3 },
]

const dashboardMetrics = [
  { label: "Total Customers", value: "128" },
  { label: "Active Licenses", value: "342" },
  { label: "Active Subscriptions", value: "276" },
  { label: "Enabled Modules", value: "84" },
  { label: "Gateway Requests", value: "1.2M" },
  { label: "Expiring Licenses", value: "18" },
]

const footerGroups = [
  { title: "Company", links: ["About AVAXIA", "Development Department", "Digital transformation"] },
  { title: "Products", links: ["Gateway App", "License Management", "Monitoring & Insights"] },
  { title: "Platform", links: ["Subscriptions", "Module Access", "Gateway Rules"] },
]

function AvaxiaLogo() {
  return (
    <div className="flex h-11 w-24 items-center rounded-lg bg-white px-2 shadow-sm ring-1 ring-border sm:w-28">
      <img src={avaxiaAssets.logo} alt="AVAXIA Group logo" className="h-8 w-full object-contain" />
    </div>
  )
}

function SectionIntro({ eyebrow, title, description, centered = false, className = "" }) {
  return (
    <div className={`${centered ? "mx-auto text-center" : ""} max-w-3xl ${className}`}>
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
      <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground md:text-5xl">{title}</h2>
      {description && <p className="mt-5 text-base leading-8 text-muted-foreground md:text-lg">{description}</p>}
    </div>
  )
}

function ImagePanel({ src, alt, label, caption, className = "", imageClassName = "" }) {
  return (
    <figure className={`relative overflow-hidden rounded-[1.75rem] border border-border bg-card shadow-2xl shadow-black/10 ${className}`}>
      <img src={src} alt={alt} loading="lazy" className={`h-full w-full object-cover ${imageClassName}`} />
      <div className="absolute inset-0 bg-gradient-to-t from-[#071a32]/76 via-[#071a32]/12 to-transparent" />
      {(label || caption) && (
        <figcaption className="absolute bottom-0 left-0 right-0 p-6 text-white">
          {label && <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/80">{label}</p>}
          {caption && <p className="mt-2 max-w-md text-xl font-semibold leading-7">{caption}</p>}
        </figcaption>
      )}
    </figure>
  )
}

function HighlightPill({ item }) {
  const Icon = item.icon

  return (
    <div className="flex items-center gap-3 rounded-full border border-border bg-card/80 px-4 py-2.5 shadow-sm">
      <Icon className="h-4 w-4 text-primary" />
      <span className="text-sm font-medium text-foreground">{item.label}</span>
    </div>
  )
}

function HeroPreview() {
  return (
    <div className="relative min-h-[34rem]">
      <ImagePanel
        src={avaxiaAssets.hero}
        alt="AVAXIA innovation workspace"
        className="absolute inset-x-6 top-0 h-[25rem] md:inset-x-0"
        imageClassName="scale-105"
      />

      <div className="absolute bottom-0 left-0 right-0 mx-auto max-w-[31rem] rounded-[1.5rem] border border-border bg-card/92 p-5 shadow-2xl backdrop-blur-xl md:left-auto md:right-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-foreground">Platform overview</p>
            <p className="mt-1 text-xs text-muted-foreground">Licenses, modules, subscriptions</p>
          </div>
          <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">Live</span>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-3">
          {[
            ["Customers", "128"],
            ["Licenses", "342"],
            ["Products", "16"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-border bg-background/70 p-3">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="mt-2 text-2xl font-semibold text-primary">{value}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 space-y-3">
          {["Gateway verified", "License active", "Reporting module enabled"].map((item) => (
            <div key={item} className="flex items-center justify-between rounded-xl bg-secondary/45 px-4 py-3">
              <span className="text-sm text-foreground">{item}</span>
              <CheckCircle2 className="h-4 w-4 text-success" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function PlatformOverviewVisual() {
  return (
    <div className="relative min-h-[34rem] overflow-hidden rounded-[2rem] border border-border bg-card shadow-2xl">
      <img src={avaxiaAssets.innovation} alt="AVAXIA innovation technology visual" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-br from-background/94 via-background/74 to-primary/20" />
      <div className="relative flex h-full min-h-[34rem] flex-col justify-between p-6">
        <div className="max-w-sm rounded-2xl border border-border bg-card/88 p-5 shadow-xl backdrop-blur">
          <p className="text-sm font-semibold text-foreground">Administration workspace</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Customers, products, subscriptions, modules, and gateway rules managed from one control layer.</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {["Customers", "Products", "Licenses", "Gateway"].map((item, index) => (
            <div key={item} className="rounded-2xl border border-border bg-card/84 p-4 backdrop-blur">
              <p className="text-xs text-muted-foreground">{item}</p>
              <p className="mt-2 text-2xl font-semibold text-primary">{[128, 16, 342, "1.2M"][index]}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ProductSolution({ item, featured = false }) {
  const Icon = item.icon

  return (
    <article
      className={
        featured
          ? "relative overflow-hidden rounded-[1.75rem] border border-border bg-card p-7 shadow-xl md:min-h-[25rem]"
          : "rounded-[1.25rem] border border-border bg-card/76 p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:bg-card hover:shadow-xl"
      }
    >
      {featured && (
        <>
          <img src={avaxiaAssets.products} alt="AVAXIA product ecosystem" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#071a32]/86 via-[#071a32]/62 to-[#071a32]/25" />
        </>
      )}
      <div className="relative">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/12 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <h3 className={featured ? "text-2xl font-semibold text-white" : "text-xl font-semibold text-foreground"}>{item.title}</h3>
        <p className={featured ? "mt-4 max-w-md text-sm leading-7 text-white/78" : "mt-3 text-sm leading-7 text-muted-foreground"}>
          {item.description}
        </p>
        <a href="#platform" className={featured ? "mt-8 inline-flex items-center text-sm font-semibold text-white" : "mt-6 inline-flex items-center text-sm font-semibold text-primary"}>
          Learn more
          <ChevronRight className="ml-1 h-4 w-4" />
        </a>
      </div>
    </article>
  )
}

function WorkflowStep({ step, index }) {
  const Icon = step.icon

  return (
    <div className="relative flex min-w-[12rem] flex-1 flex-col items-center text-center">
      <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-card text-primary shadow-lg">
        <Icon className="h-6 w-6" />
      </div>
      <p className="mt-4 text-sm font-semibold text-foreground">{step.label}</p>
      <span className="mt-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">Step {index + 1}</span>
    </div>
  )
}

function LicenseGenerationForm() {
  return (
    <div className="relative overflow-hidden rounded-[1.75rem] border border-border bg-card p-5 shadow-2xl">
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-primary/10 to-transparent" />
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <p className="text-sm font-semibold text-foreground">Generate customer license</p>
          <p className="mt-1 text-xs text-muted-foreground">Secure key based on plan, modules, and usage rules</p>
        </div>
        <KeyRound className="h-5 w-5 text-primary" />
      </div>
      <div className="relative mt-5 space-y-3">
        {licenseFormFields.map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between rounded-xl bg-secondary/45 px-4 py-3">
            <span className="text-sm text-muted-foreground">{label}</span>
            <span className="text-sm font-semibold text-foreground">{value}</span>
          </div>
        ))}
      </div>
      <div className="mt-5 rounded-2xl border border-border bg-background/65 p-4">
        <p className="mb-3 text-sm font-semibold text-foreground">Generated license preview</p>
        <div className="rounded-xl bg-secondary/45 p-3 font-mono text-xs leading-6 text-muted-foreground">
          LIC-AVX-GTW-PRO-2027
          <br />
          modules: reporting, api, monitoring
          <br />
          status: ready
        </div>
      </div>
      <Button className="mt-5 w-full bg-primary text-primary-foreground hover:bg-primary/90">
        Generate License
      </Button>
    </div>
  )
}

function BenefitBlock({ item }) {
  const Icon = item.icon

  return (
    <article className="rounded-[1.25rem] border border-border bg-card/74 p-6 shadow-sm">
      <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
      <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.description}</p>
    </article>
  )
}

function GatewayFlowPanel() {
  return (
    <div className="rounded-[2rem] border border-border bg-background/78 p-6 shadow-xl">
      <div className="overflow-x-auto">
        <div className="relative flex min-w-[56rem] items-start justify-between gap-4">
          <div className="absolute left-14 right-14 top-7 h-px bg-border" />
          {workflowSteps.map((step, index) => <WorkflowStep key={step.label} step={step} index={index} />)}
        </div>
      </div>
    </div>
  )
}

function DashboardPreview() {
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-border bg-card shadow-2xl">
      <img src={avaxiaAssets.innovation} alt="AVAXIA innovation analytics background" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-br from-background/96 via-background/90 to-background/60" />
      <div className="relative grid gap-8 p-6 lg:grid-cols-[1fr_22rem] lg:p-8">
        <div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-foreground">License intelligence</p>
              <p className="mt-1 text-sm text-muted-foreground">Operational visibility across platform access</p>
            </div>
            <BarChart3 className="h-6 w-6 text-primary" />
          </div>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {dashboardMetrics.map((metric) => (
              <div key={metric.label} className="rounded-2xl border border-border bg-card/78 p-4 backdrop-blur">
                <p className="text-xs text-muted-foreground">{metric.label}</p>
                <p className="mt-3 text-3xl font-semibold text-foreground">{metric.value}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[1.5rem] border border-border bg-background/72 p-5 backdrop-blur">
          <p className="text-sm font-semibold text-foreground">Access health</p>
          <div className="mt-5 space-y-4">
            {[
              ["Valid licenses", "89%"],
              ["Active modules", "74%"],
              ["Gateway checks", "96%"],
            ].map(([label, value]) => (
              <div key={label}>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-semibold text-foreground">{value}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full rounded-full bg-primary" style={{ width: value }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LandingPage() {
  const token = localStorage.getItem("token")
  const workspaceHref = hasAuthSession(token) ? getDefaultRouteForRole(getAuthRole(token)) : "/login"
  const [isPastHero, setIsPastHero] = useState(false)

  useEffect(() => {
    const updateHeaderState = () => {
      const hero = document.getElementById("home")
      const header = document.getElementById("landing-header")

      if (!hero) {
        setIsPastHero(window.scrollY > window.innerHeight)
        return
      }

      const headerHeight = header?.offsetHeight ?? 0
      const heroBottom = hero.offsetTop + hero.offsetHeight

      setIsPastHero(window.scrollY + headerHeight >= heroBottom)
    }

    updateHeaderState()
    window.addEventListener("scroll", updateHeaderState, { passive: true })
    window.addEventListener("resize", updateHeaderState)

    return () => {
      window.removeEventListener("scroll", updateHeaderState)
      window.removeEventListener("resize", updateHeaderState)
    }
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header
        id="landing-header"
        className={`fixed left-0 right-0 top-0 z-50 border-b transition-all duration-500 ${
          isPastHero
            ? "border-border bg-background/86 shadow-sm backdrop-blur-xl"
            : "border-transparent bg-transparent backdrop-blur-0"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" className="flex items-center gap-3">
            <AvaxiaLogo />
            <span className={`hidden text-sm font-semibold transition-colors sm:inline ${isPastHero ? "text-foreground" : "text-white"}`}>
              Development Department
            </span>
          </Link>

          <nav className={`hidden items-center gap-7 text-sm font-medium transition-colors lg:flex ${isPastHero ? "text-muted-foreground" : "text-white/78"}`}>
            {navItems.map((item) => (
              <a key={item.href} href={item.href} className={isPastHero ? "transition-colors hover:text-primary" : "transition-colors hover:text-white"}>
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle className={isPastHero ? "" : "border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white"} />
            <Button
              asChild
              className={
                isPastHero
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "border border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white"
              }
            >
              <Link to={workspaceHref}>Open Platform</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section id="home" className="relative isolate flex min-h-[100svh] w-full items-center overflow-hidden">
          <img src={avaxiaAssets.hero} alt="AVAXIA digital transformation background" className="absolute inset-0 -z-20 h-full w-full object-cover" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#06172b]/94 via-[#082b4b]/78 to-[#06172b]/42" />
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_78%_30%,rgba(69,159,255,0.26),transparent_32%)]" />
          <div className="absolute bottom-0 left-0 right-0 -z-10 h-36 bg-gradient-to-t from-background to-transparent" />

          <div className="grid w-full grid-cols-1 items-center gap-12 px-6 py-12 sm:px-8 sm:py-16 lg:grid-cols-[minmax(0,0.95fr)_minmax(32rem,0.85fr)] lg:px-14 xl:px-20 2xl:px-24">
            <div>
              <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white shadow-sm backdrop-blur">
                AVAXIA Group | Development Department
              </span>
              <h1 className="mt-8 max-w-5xl text-5xl font-semibold tracking-tight text-white md:text-7xl">
                Centralized License & Subscription Management Platform
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-white/78 md:text-xl">
                A unified platform to manage customer licenses, product subscriptions, module-based access, and gateway access rules with security and control.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <a href="#platform">Explore Platform</a>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white">
                  <a href="#products">
                    View Products
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
              <div className="mt-10 flex flex-wrap gap-3">
                {trustHighlights.map((item) => <HighlightPill key={item.label} item={item} />)}
              </div>
            </div>

            <HeroPreview />
          </div>
        </section>

        <section id="company" className="px-6 py-24">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <ImagePanel
              src={avaxiaAssets.development}
              alt="AVAXIA services and technology consulting"
              label="AVAXIA Group"
              caption="Technology consulting, transformation, and enterprise delivery."
              className="h-[34rem]"
            />
            <div>
              <SectionIntro
                eyebrow="Company Overview"
                title="A technology partner for digital transformation"
                description="AVAXIA Group supports companies through technology consulting, SAP solutions, system integration, infrastructure, automation, data solutions, and innovative digital services."
              />
              <div className="mt-8 flex flex-wrap gap-3">
                {companyHighlights.map((item) => <HighlightPill key={item.label} item={item} />)}
              </div>
              <div className="mt-10 border-l border-primary/30 pl-6">
                <p className="max-w-2xl text-xl leading-9 text-foreground">
                  The platform presented here extends that mission: helping teams control product access with the same structure expected from enterprise systems.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="development" className="px-6 py-24">
          <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-border bg-card shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="p-8 md:p-12">
                <SectionIntro
                  eyebrow="Development Department"
                  title="Building internal platforms and enterprise applications"
                  description="The Development Department builds digital platforms, APIs, internal tools, automation systems, dashboards, and enterprise applications that support business operations and customer needs."
                />
                <div className="mt-9 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {developmentFocus.map((item) => {
                    const Icon = item.icon

                    return (
                      <div key={item.label} className="flex items-center gap-3 rounded-2xl bg-secondary/40 px-4 py-3">
                        <Icon className="h-5 w-5 text-primary" />
                        <span className="text-sm font-medium text-foreground">{item.label}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
              <div className="relative min-h-[28rem]">
                <img src={avaxiaAssets.company} alt="AVAXIA development team collaboration" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#071a32]/76 via-transparent to-transparent" />
              </div>
            </div>
          </div>
        </section>

        <section id="products" className="px-6 py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
              <SectionIntro
                eyebrow="Products & Solutions"
                title="A focused ecosystem for secure access"
                description="The platform connects gateway traffic, license decisions, customer subscriptions, and module-based access into one operational model."
              />
              <p className="max-w-md text-sm leading-7 text-muted-foreground">
                Built for product teams that need controlled access, clear entitlement logic, and scalable subscription management.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.05fr_1.3fr]">
              <ProductSolution item={products[0]} featured />
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {products.slice(1).map((item) => <ProductSolution key={item.title} item={item} />)}
              </div>
            </div>
          </div>
        </section>

        <section id="platform" className="bg-card/35 px-6 py-24">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 lg:grid-cols-[1fr_0.92fr] lg:items-center">
            <div>
              <SectionIntro
                eyebrow="Platform Overview"
                title="One operating layer for customers, licenses, modules, and gateway rules"
                description="Administrators manage customers, products, licenses, subscriptions, modules, feature access, and gateway access rules from one centralized interface."
              />
              <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {platformOverviewItems.map((item) => {
                  const Icon = item.icon

                  return (
                    <article key={item.label} className="rounded-2xl border border-border bg-card/76 p-5 shadow-sm">
                      <Icon className="mb-4 h-5 w-5 text-primary" />
                      <h3 className="font-semibold text-foreground">{item.label}</h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
                    </article>
                  )
                })}
              </div>
            </div>
            <PlatformOverviewVisual />
          </div>
        </section>

        <section className="px-6 py-24">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <SectionIntro
                eyebrow="License Generation"
                title="Create secure licenses from clear business inputs"
                description="The license generation workflow converts customer, product, plan, modules, expiration, and usage limits into a controlled authorization key."
              />
              <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {licenseActions.map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-2xl border border-border bg-card/75 px-4 py-3">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <span className="text-sm font-medium text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <LicenseGenerationForm />
          </div>
        </section>

        <section className="bg-card/35 px-6 py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
              <ImagePanel
                src={avaxiaAssets.innovation}
                alt="AVAXIA secure gateway and innovation visual"
                label="Gateway Integration"
                caption="License-aware access before service traffic is released."
                className="h-[22rem]"
              />
              <SectionIntro
                eyebrow="Gateway Integration Flow"
                title="From client request to authorized service"
                description="The gateway app handles authentication, RBAC, request validation, routing, and license-based access checks before redirecting the request to the correct service."
              />
            </div>
            <GatewayFlowPanel />
          </div>
        </section>

        <section className="px-6 py-24">
          <div className="mx-auto max-w-7xl">
            <SectionIntro
              eyebrow="Benefits"
              title="Built for control, clarity, and growth"
              description="A practical operating layer for companies that manage multiple products, customers, subscriptions, and access levels."
              centered
            />
            <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {benefits.map((item) => <BenefitBlock key={item.title} item={item} />)}
            </div>
          </div>
        </section>

        <section className="bg-card/35 px-6 py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
              <SectionIntro
                eyebrow="Dashboard Preview"
                title="A cleaner view of licenses, subscriptions, and gateway activity"
                description="The dashboard gives administrators visibility into customers, active licenses, enabled modules, expiring access, and gateway request activity."
              />
              <Button asChild variant="outline" className="w-fit border-border bg-background/60">
                <Link to={workspaceHref}>
                  Open Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <DashboardPreview />
          </div>
        </section>

        <section id="contact" className="px-6 py-24">
          <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-border bg-card shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="p-8 md:p-12">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Access Platform</p>
                <h2 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight text-foreground md:text-6xl">
                  Manage product access with confidence
                </h2>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
                  Secure, flexible, and scalable control for licenses, subscriptions, modules, and customer access.
                </p>
                <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                  <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Link to={workspaceHref}>Open Platform</Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="border-border bg-background/60">
                    <a href="#contact">Schedule a Demo</a>
                  </Button>
                </div>
              </div>
              <div className="relative min-h-[24rem]">
                <img src={avaxiaAssets.products} alt="AVAXIA products and platforms" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#071a32]/72 via-transparent to-transparent" />
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-card/35 px-6 py-12">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <AvaxiaLogo />
            <p className="mt-5 max-w-sm text-sm leading-7 text-muted-foreground">
              AVAXIA Group supports digital transformation through consulting, enterprise solutions, integrations, automation, and digital product delivery.
            </p>
            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              <p>Website: avaxiagroup.com</p>
              <p>Contact: AVAXIA Development Department</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {footerGroups.map((group) => (
              <div key={group.title}>
                <h3 className="font-semibold text-foreground">{group.title}</h3>
                <ul className="mt-4 space-y-3">
                  {group.links.map((link) => (
                    <li key={link}>
                      <a href="#home" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
