import { AlertTriangle, Inbox, Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export function LoadingState({ message = "Loading..." }) {
  return (
    <Card className="glass border-border">
      <CardContent className="p-8 flex items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
        <span>{message}</span>
      </CardContent>
    </Card>
  )
}

export function ErrorState({ message = "Something went wrong", onRetry }) {
  return (
    <Card className="glass border-destructive/30 bg-destructive/5">
      <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
          <p className="text-sm text-destructive">{message}</p>
        </div>
        {onRetry && (
          <Button variant="outline" className="border-border bg-transparent" onClick={onRetry}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

export function EmptyState({ message = "No data found" }) {
  return (
    <Card className="glass border-border">
      <CardContent className="p-8 flex flex-col items-center justify-center gap-3 text-center text-muted-foreground">
        <Inbox className="w-8 h-8 text-primary" />
        <p>{message}</p>
      </CardContent>
    </Card>
  )
}
