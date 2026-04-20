import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { MinotaurLogo } from "@/components/MinotaurLogo"
import { ParticlesBackground } from "@/components/ParticlesBackground"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lock, Mail, Shield, EyeOff } from "lucide-react"

export default function LoginPage() {
  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [code2fa, setCode2fa] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          code: code2fa,
        }),
      })


      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || "Login failed")
      }

      // Save token
      localStorage.setItem("token", data.token)

      // Redirect
      navigate("/admin/dashboard")
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <ParticlesBackground />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_oklch(0.2_0.05_250)_0%,_oklch(0.13_0.02_260)_70%)]" />

      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="glass-strong rounded-2xl p-8 neon-border">
          <div className="flex flex-col items-center mb-8">
            <MinotaurLogo size="lg" glowing />
            <h1 className="mt-4 text-2xl font-bold text-foreground glow-text uppercase">Licentra</h1>
            <p className="text-sm text-muted-foreground">License Management System</p>
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
            {/* ERROR MESSAGE */}
            {error && (
              <div className="p-3 rounded-lg text-red-400 border border-red-500/30 bg-red-500/10 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-input border-border focus:ring-primary focus:border-primary"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-input border-border focus:ring-primary focus:border-primary"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <EyeOff className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="2fa" className="text-foreground">
                2FA Code
              </Label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="2fa"
                  type="text"
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  value={code2fa}
                  onChange={(e) => setCode2fa(e.target.value)}
                  className="pl-10 bg-input border-border focus:ring-primary focus:border-primary tracking-widest"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-border bg-input text-primary focus:ring-primary" />
                <span className="text-muted-foreground">Remember me</span>
              </label>
              <a href="#" className="text-primary hover:text-primary/80 transition-colors">
                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="cursor-pointer w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 glow-blue transition-all duration-300 hover:scale-[1.02]"
            >
              {loading ? "Signing in..." : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Sign In Securely
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border">
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Shield className="w-4 h-4 text-primary" />
              <span>Protected by RSA-2048 & AES-256 encryption</span>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link to="/portal" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            Customer Portal Access →
          </Link>
        </div>
      </div>
    </div>
  )
}
