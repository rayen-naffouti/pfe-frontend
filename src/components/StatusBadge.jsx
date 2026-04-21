import { cn } from "@/lib/utils"

const statusConfig = {
  valid: { label: "Valid", className: "bg-success/10 text-success border-success/30" },
  expired: { label: "Expired", className: "bg-destructive/10 text-destructive border-destructive/30" },
  expiring: { label: "Expiring Soon", className: "bg-warning/10 text-warning border-warning/30" },
  trial: { label: "Trial", className: "bg-accent/10 text-accent border-accent/30" },
  disabled: { label: "Disabled", className: "bg-muted text-muted-foreground border-muted" },
}

export function StatusBadge({ status, className }) {
  const normalizedStatus = statusConfig[status] ? status : "disabled"
  const config = statusConfig[normalizedStatus]

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        config.className,
        className,
      )}
    >
      <span
        className={cn(
          "w-1.5 h-1.5 rounded-full mr-1.5",
          normalizedStatus === "valid" && "bg-success",
          normalizedStatus === "expired" && "bg-destructive",
          normalizedStatus === "expiring" && "bg-warning",
          normalizedStatus === "trial" && "bg-accent",
          normalizedStatus === "disabled" && "bg-muted-foreground",
        )}
      />
      {config.label}
    </span>
  )
}
