import { cn } from "@/lib/utils"

export function StatsCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  iconColor = "text-primary",
  className,
}) {
  return (
    <div
      className={cn(
        "glass rounded-xl p-6 transition-all duration-300 hover:scale-[1.02] hover:glow-blue group",
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
          {change && (
            <p
              className={cn(
                "text-sm font-medium",
                changeType === "positive" && "text-success",
                changeType === "negative" && "text-destructive",
                changeType === "neutral" && "text-muted-foreground",
              )}
            >
              {change}
            </p>
          )}
        </div>
        <div
          className={cn(
            "w-12 h-12 rounded-lg flex items-center justify-center bg-primary/10 transition-all duration-300 group-hover:scale-110",
            iconColor.includes("success") && "bg-success/10",
            iconColor.includes("warning") && "bg-warning/10",
            iconColor.includes("destructive") && "bg-destructive/10",
          )}
        >
          <Icon className={cn("w-6 h-6", iconColor)} />
        </div>
      </div>
    </div>
  )
}
