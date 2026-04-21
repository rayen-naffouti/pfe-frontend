"use client"

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { MinotaurLogo } from "@/components/MinotaurLogo"
import { ParticlesBackground } from "@/components/ParticlesBackground"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { EmptyState, ErrorState, LoadingState } from "@/components/DataState"
import { cn } from "@/lib/utils"
import { ArrowLeft, Check, CreditCard, Loader2, Star, Shield } from "lucide-react"
import { customersApi, getApiErrorMessage, paymentsApi } from "@/lib/api"

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
]

const durations = [
  { id: "1y", label: "1 Year", multiplier: 1 },
  { id: "2y", label: "2 Years", multiplier: 1.8, discount: "10% off" },
  { id: "3y", label: "3 Years", multiplier: 2.5, discount: "17% off" },
]

export default function RenewalPage() {
  const [selectedPlan, setSelectedPlan] = useState("premium")
  const [selectedDuration, setSelectedDuration] = useState("1y")
  const [step, setStep] = useState(1)
  const [customer, setCustomer] = useState(null)
  const [licenses, setLicenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [paymentError, setPaymentError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [recordedPayment, setRecordedPayment] = useState(null)

  const plan = plans.find((p) => p.id === selectedPlan)
  const duration = durations.find((d) => d.id === selectedDuration)
  const totalPrice = plan.price * duration.multiplier
  const primaryLicense = licenses[0]

  const fetchRenewalContext = async () => {
    setLoading(true)
    setLoadError(null)

    try {
      const customerResponse = await customersApi.current()
      const licensesResponse = await customersApi.licenses(customerResponse.data.id)
      setCustomer(customerResponse.data)
      setLicenses(licensesResponse.data)
    } catch (err) {
      setLoadError(getApiErrorMessage(err, "Failed to load renewal data"))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRenewalContext()
  }, [])

  const handlePayment = async () => {
    setPaymentError(null)

    if (!customer || !primaryLicense) {
      setPaymentError("A customer and license are required to record a payment")
      return
    }

    setSubmitting(true)

    try {
      const { data } = await paymentsApi.create({
        customer_id: customer.id,
        license_id: primaryLicense.id,
        amount: totalPrice.toFixed(2),
        currency: "USD",
        method: "card",
        status: "paid",
      })
      setRecordedPayment(data.payment)
      setStep(3)
    } catch (err) {
      setPaymentError(getApiErrorMessage(err, "Failed to record payment"))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen relative">
      <ParticlesBackground />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_oklch(0.18_0.04_250)_0%,_oklch(0.13_0.02_260)_70%)]" />

      <header className="relative z-10 glass-strong border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MinotaurLogo size="sm" glowing />
            <span className="font-bold text-foreground uppercase">Licentra</span>
          </div>
          <Button variant="ghost" asChild>
            <Link to="/portal">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Portal
            </Link>
          </Button>
        </div>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-6 py-8">
        {loading && <LoadingState message="Loading renewal data..." />}

        {loadError && !loading && <ErrorState message={loadError} onRetry={fetchRenewalContext} />}

        {!loading && !loadError && !primaryLicense && <EmptyState message="No license found for renewal" />}

        {!loading && !loadError && primaryLicense && (
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
              <h1 className="text-2xl font-bold text-foreground">Choose Your Plan</h1>
              <p className="text-muted-foreground">Select the plan that best fits your needs</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      <span className="text-3xl font-bold text-foreground">${p.price}</span>
                      <span className="text-muted-foreground">/year</span>
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
              <h1 className="text-2xl font-bold text-foreground">Payment Details</h1>
              <p className="text-muted-foreground">Enter your payment information</p>
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
                    <span className="text-muted-foreground">{plan.name} Plan</span>
                    <span className="text-foreground">${plan.price}</span>
                  </div>
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
                disabled={submitting}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground glow-blue"
              >
                {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                {submitting ? "Recording..." : "Complete Payment"}
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
              <h1 className="text-2xl font-bold text-foreground mb-2">Payment Recorded!</h1>
              <p className="text-muted-foreground">Your renewal payment has been recorded successfully</p>
              {recordedPayment && (
                <p className="text-xs text-muted-foreground mt-2">Payment #{recordedPayment.id} recorded</p>
              )}
            </div>

            <Card className="glass border-border neon-border max-w-md mx-auto">
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Plan</span>
                  <span className="text-foreground font-medium">{plan.name}</span>
                </div>
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
                  <span className="text-foreground font-medium">Pending license update</span>
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
