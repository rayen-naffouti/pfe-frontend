import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { AlertTriangle, Check, CheckCircle2, Eye, EyeOff, Loader2, Lock } from "lucide-react"
import { MinotaurLogo } from "@/components/MinotaurLogo"
import { ParticlesBackground } from "@/components/ParticlesBackground"
import { ThemeToggle } from "@/components/ThemeToggle"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authApi, getApiErrorMessage } from "@/lib/api"
import { clearAuthSession } from "@/lib/auth"

const getCharacterGroupCount = (value) => {
  return [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((pattern) => pattern.test(value)).length
}

export default function ResetPasswordPage() {
  const [token] = useState(() => new URLSearchParams(window.location.search).get("token") || "")
  const [validating, setValidating] = useState(true)
  const [tokenValid, setTokenValid] = useState(false)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [completed, setCompleted] = useState(false)

  const requirements = useMemo(
    () => ({
      length: password.length >= 10,
      groups: getCharacterGroupCount(password) >= 3,
      matches: Boolean(password) && password === confirmPassword,
    }),
    [confirmPassword, password],
  )

  useEffect(() => {
    window.history.replaceState({}, document.title, window.location.pathname)

    if (!token) {
      setValidating(false)
      setTokenValid(false)
      return
    }

    authApi
      .validateResetToken(token)
      .then(() => setTokenValid(true))
      .catch(() => setTokenValid(false))
      .finally(() => setValidating(false))
  }, [token])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError("")

    if (!requirements.length || !requirements.groups) {
      setError("Choose a stronger password before continuing")
      return
    }

    if (!requirements.matches) {
      setError("Passwords do not match")
      return
    }

    setSubmitting(true)

    try {
      await authApi.resetPassword({ token, password })
      clearAuthSession()
      setCompleted(true)
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to reset the password"))
    } finally {
      setSubmitting(false)
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
              {completed ? "Password updated" : "Create a new password"}
            </h1>
            {!completed && !validating && tokenValid && (
              <p className="mt-2 text-sm text-muted-foreground">This secure reset link can only be used once.</p>
            )}
          </div>

          {validating && (
            <div className="flex items-center justify-center gap-3 py-8 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              Validating secure link...
            </div>
          )}

          {!validating && !tokenValid && !completed && (
            <div className="space-y-6">
              <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                  <span>This reset link is invalid, expired, or has already been used.</span>
                </div>
              </div>
              <Button asChild className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                <Link to="/forgot-password">Request another link</Link>
              </Button>
            </div>
          )}

          {!validating && tokenValid && !completed && (
            <form className="space-y-5" onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="new-password">New password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="bg-input pl-10 pr-10 border-border focus:border-primary focus:ring-primary"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    title={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="confirm-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className="bg-input pl-10 border-border focus:border-primary focus:ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-2 rounded-lg border border-border bg-secondary/30 p-3 text-xs text-muted-foreground">
                <p className={requirements.length ? "text-success" : undefined}>
                  <Check className="mr-2 inline h-3.5 w-3.5" />At least 10 characters
                </p>
                <p className={requirements.groups ? "text-success" : undefined}>
                  <Check className="mr-2 inline h-3.5 w-3.5" />Three character types
                </p>
                <p className={requirements.matches ? "text-success" : undefined}>
                  <Check className="mr-2 inline h-3.5 w-3.5" />Passwords match
                </p>
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-primary py-6 font-semibold text-primary-foreground hover:bg-primary/90"
              >
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
                {submitting ? "Updating..." : "Set new password"}
              </Button>
            </form>
          )}

          {completed && (
            <div className="space-y-6">
              <div className="rounded-lg border border-success/40 bg-success/10 p-4 text-sm text-success">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                  <span>Your password was changed and existing sessions were revoked.</span>
                </div>
              </div>
              <Button asChild className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                <Link to="/login">Sign in with new password</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
