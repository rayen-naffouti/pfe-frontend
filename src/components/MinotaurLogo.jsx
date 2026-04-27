import { cn } from "@/lib/utils"

export function MinotaurLogo({ className, size = "md", glowing = false }) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  }

  return (
    <div className={cn("relative", className)}>
      <svg
        viewBox="0 0 100 100"
        className={sizeClasses[size]}
        style={glowing ? { filter: "drop-shadow(0 0 10px var(--glow))" } : undefined}
      >
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--primary)" />
            <stop offset="50%" stopColor="var(--accent)" />
            <stop offset="100%" stopColor="var(--primary)" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          d="M50 5 L90 25 L90 55 Q90 85 50 95 Q10 85 10 55 L10 25 Z"
          fill="var(--card)"
          stroke="url(#logoGradient)"
          strokeWidth="2"
          filter={glowing ? "url(#glow)" : undefined}
        />
        <path d="M30 35 Q20 20 15 30 Q20 35 30 40 Z" fill="url(#logoGradient)" />
        <path d="M70 35 Q80 20 85 30 Q80 35 70 40 Z" fill="url(#logoGradient)" />
        <ellipse cx="50" cy="55" rx="20" ry="25" fill="url(#logoGradient)" opacity="0.8" />
        <circle cx="42" cy="48" r="4" fill="var(--background)" />
        <circle cx="58" cy="48" r="4" fill="var(--background)" />
        <circle cx="43" cy="47" r="1.5" fill="var(--accent)" />
        <circle cx="59" cy="47" r="1.5" fill="var(--accent)" />
        <ellipse cx="50" cy="65" rx="8" ry="5" fill="none" stroke="url(#logoGradient)" strokeWidth="2" />
        <circle cx="50" cy="75" r="3" fill="var(--background)" />
        <rect x="48" y="75" width="4" height="6" fill="var(--background)" />
      </svg>
      {glowing && (
        <div className="absolute inset-0 animate-pulse-glow">
          <svg viewBox="0 0 100 100" className={sizeClasses[size]}>
            <path
              d="M50 5 L90 25 L90 55 Q90 85 50 95 Q10 85 10 55 L10 25 Z"
              fill="none"
              stroke="var(--glow)"
              strokeWidth="4"
            />
          </svg>
        </div>
      )}
    </div>
  )
}
