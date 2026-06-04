import { useState } from "react"
import { Check, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function LicenseKeyField({
  value,
  fallback = "N/A",
  className,
  codeClassName,
  buttonClassName,
  wrap = false,
}) {
  const [copied, setCopied] = useState(false)
  const displayValue = value || fallback

  const handleCopy = async (event) => {
    event.preventDefault()
    event.stopPropagation()

    if (!value) {
      return
    }

    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={cn("flex min-w-0 items-center gap-2", className)}>
      <code
        title={displayValue}
        className={cn(
          "min-w-0 flex-1 font-mono text-xs text-muted-foreground",
          wrap ? "break-all whitespace-pre-wrap" : "truncate",
          codeClassName,
        )}
      >
        {displayValue}
      </code>
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8 shrink-0", buttonClassName)}
          onClick={handleCopy}
          aria-label="Copy license key"
          title="Copy license key"
        >
          {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
        </Button>
      )}
    </div>
  )
}
