import { useState } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, CheckCircle2, Loader2, Mail, Send } from "lucide-react"
import { MinotaurLogo } from "@/components/MinotaurLogo"
import { ParticlesBackground } from "@/components/ParticlesBackground"
import { ThemeToggle } from "@/components/ThemeToggle"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authApi, getApiErrorMessage } from "@/lib/api"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError("")
    setMessage("")

    try {
      const { data } = await authApi.forgotPassword({ email })
      setMessage(data.message)
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to request a password reset"))
    } finally {
      setLoading(false)
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
            <h1 className="mt-4 text-2xl font-bold text-foreground">Reset your password</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Enter the email associated with your Licentra account.
            </p>
          </div>

          {message ? (
            <div className="space-y-6">
              <div className="rounded-lg border border-success/40 bg-success/10 p-4 text-sm text-success">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                  <span>{message}</span>
                </div>
              </div>
              <Button asChild className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                <Link to="/login">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Return to sign in
                </Link>
              </Button>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="reset-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@company.com"
                    className="bg-input pl-10 border-border focus:border-primary focus:ring-primary"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary py-6 font-semibold text-primary-foreground hover:bg-primary/90"
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                {loading ? "Sending..." : "Send secure reset link"}
              </Button>

              <Link
                to="/login"
                className="flex items-center justify-center text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to sign in
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
