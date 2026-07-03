import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { AlertTriangle, CheckCircle2, Loader2, Mail } from "lucide-react"
import { MinotaurLogo } from "@/components/MinotaurLogo"
import { ParticlesBackground } from "@/components/ParticlesBackground"
import { ThemeToggle } from "@/components/ThemeToggle"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authApi, getApiErrorMessage } from "@/lib/api"
import { clearAuthSession } from "@/lib/auth"

export default function ActivateAccountPage() {
  const [token] = useState(() => new URLSearchParams(window.location.search).get("token") || "")
  const [status, setStatus] = useState("working")
  const [error, setError] = useState("")
  const [resendEmail, setResendEmail] = useState("")
  const [resendMessage, setResendMessage] = useState("")
  const [resending, setResending] = useState(false)

  useEffect(() => {
    window.history.replaceState({}, document.title, window.location.pathname)

    if (!token) {
      setStatus("invalid")
      setError("This activation link is missing its secure token")
      return
    }

    let cancelled = false

    const activate = async () => {
      try {
        await authApi.validateActivationToken(token)
        await authApi.activateAccount({ token })
        clearAuthSession()

        if (!cancelled) {
          setStatus("completed")
        }
      } catch (err) {
        if (!cancelled) {
          setError(getApiErrorMessage(err, "This activation link is invalid or has expired"))
          setStatus("invalid")
        }
      }
    }

    activate()

    return () => {
      cancelled = true
    }
  }, [token])

  const handleResend = async (event) => {
    event.preventDefault()
    setResending(true)
    setResendMessage("")
    setError("")

    try {
      const { data } = await authApi.resendActivation({ email: resendEmail })
      setResendMessage(data.message)
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to request a new activation link"))
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <ParticlesBackground />
      <div className="absolute inset-0 auth-radial-bg" />
      <ThemeToggle className="absolute right-6 top-6 z-20 glass-strong" />

      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="glass-strong rounded-2xl p-8 neon-border">
          <div className="flex flex-col items-center mb-8 text-center">
            <MinotaurLogo size="lg" glowing />
            <h1 className="mt-4 text-2xl font-bold text-foreground">
              {status === "completed" ? "Account activated" : "Activating account"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {status === "completed"
                ? "Your email address has been confirmed."
                : "We are checking your secure activation link."}
            </p>
          </div>

          {status === "working" && (
            <div className="flex items-center justify-center gap-3 py-8 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              Activating your account...
            </div>
          )}

          {status === "completed" && (
            <div className="space-y-6">
              <div className="rounded-lg border border-success/40 bg-success/10 p-4 text-sm text-success">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                  <span>Your account is active. Sign in to access the Licentra portal.</span>
                </div>
              </div>
              <Button asChild className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                <Link to="/login">Sign in</Link>
              </Button>
            </div>
          )}

          {status === "invalid" && (
            <div className="space-y-6">
              <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                  <span>{error || "This activation link is invalid, expired, or has already been used."}</span>
                </div>
              </div>

              <form className="space-y-4" onSubmit={handleResend}>
                {resendMessage && (
                  <div className="rounded-lg border border-primary/30 bg-primary/10 p-3 text-sm text-primary">
                    {resendMessage}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="activation-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="activation-email"
                      type="email"
                      required
                      placeholder="user@company.com"
                      value={resendEmail}
                      onChange={(event) => setResendEmail(event.target.value)}
                      className="bg-input pl-10 border-border focus:border-primary focus:ring-primary"
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={resending}
                  className="w-full bg-primary py-6 font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  {resending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {resending ? "Sending..." : "Send new activation link"}
                </Button>
              </form>

              <Button asChild variant="outline" className="w-full">
                <Link to="/login">Back to login</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
