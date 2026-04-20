"use client"

import { useState } from "react"
import { AdminHeader } from "@/components/AdminHeader"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Bell, AlertTriangle, XCircle, CheckCircle, Clock, ChevronRight, Trash2, Check } from "lucide-react"

const notifications = [
  {
    id: 1,
    type: "warning",
    title: "License Expiring Soon",
    message: "Acme Corporation's Enterprise Suite license expires in 3 days",
    timestamp: "2 hours ago",
    read: false,
  },
  {
    id: 2,
    type: "warning",
    title: "License Expiring Soon",
    message: "TechStart Inc. trial license expires tomorrow",
    timestamp: "5 hours ago",
    read: false,
  },
  {
    id: 3,
    type: "success",
    title: "Renewal Completed",
    message: "GlobalTech Ltd. successfully renewed for 1 year",
    timestamp: "1 day ago",
    read: true,
  },
  {
    id: 4,
    type: "error",
    title: "Activation Failed",
    message: "Failed activation attempt for LIC-2024-089 from unknown device",
    timestamp: "1 day ago",
    read: false,
  },
  {
    id: 5,
    type: "info",
    title: "New Customer Registration",
    message: "CloudNine Tech has registered and created their first license",
    timestamp: "2 days ago",
    read: true,
  },
  {
    id: 6,
    type: "error",
    title: "Payment Failed",
    message: "Renewal payment failed for DataFlow Systems",
    timestamp: "3 days ago",
    read: true,
  },
]

const typeConfig = {
  warning: { icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10", border: "border-warning/30" },
  success: { icon: CheckCircle, color: "text-success", bg: "bg-success/10", border: "border-success/30" },
  error: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/30" },
  info: { icon: Bell, color: "text-primary", bg: "bg-primary/10", border: "border-primary/30" },
}

export default function NotificationsPage() {
  const [selectedNotification, setSelectedNotification] = useState(null)
  const [filter, setFilter] = useState("all")

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "all") return true
    if (filter === "unread") return !n.read
    return n.type === filter
  })

  return (
    <div className="min-h-screen">
      <AdminHeader title="Notifications Center" subtitle="View and manage all system notifications" />

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex flex-wrap gap-2">
              {["all", "unread", "warning", "error", "success", "info"].map((f) => (
                <Button
                  key={f}
                  variant="outline"
                  size="sm"
                  onClick={() => setFilter(f)}
                  className={cn(
                    "border-border capitalize",
                    filter === f && "bg-primary/10 text-primary border-primary/30",
                  )}
                >
                  {f}
                  {f === "unread" && (
                    <Badge className="ml-2 bg-destructive text-destructive-foreground">
                      {notifications.filter((n) => !n.read).length}
                    </Badge>
                  )}
                </Button>
              ))}
              <Button variant="ghost" size="sm" className="ml-auto text-muted-foreground">
                <Check className="w-4 h-4 mr-2" />
                Mark all read
              </Button>
            </div>

            <div className="space-y-3">
              {filteredNotifications.map((notification) => {
                const config = typeConfig[notification.type]
                const Icon = config.icon
                return (
                  <Card
                    key={notification.id}
                    className={cn(
                      "glass border-border cursor-pointer transition-all duration-200 hover:scale-[1.01]",
                      !notification.read && "border-l-4 border-l-primary",
                      selectedNotification?.id === notification.id && "ring-1 ring-primary",
                    )}
                    onClick={() => setSelectedNotification(notification)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", config.bg)}>
                          <Icon className={cn("w-5 h-5", config.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h4
                              className={cn(
                                "font-medium",
                                !notification.read ? "text-foreground" : "text-muted-foreground",
                              )}
                            >
                              {notification.title}
                            </h4>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {notification.timestamp}
                              </span>
                              <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1 truncate">{notification.message}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24">
              {selectedNotification ? (
                <Card className="glass border-border">
                  <CardContent className="p-6 space-y-4">
                    {(() => {
                      const config = typeConfig[selectedNotification.type]
                      const Icon = config.icon
                      return (
                        <>
                          <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center", config.bg)}>
                            <Icon className={cn("w-6 h-6", config.color)} />
                          </div>
                          <div>
                            <Badge className={cn(config.bg, config.color, config.border, "mb-2")}>
                              {selectedNotification.type}
                            </Badge>
                            <h3 className="text-lg font-semibold text-foreground">{selectedNotification.title}</h3>
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                              <Clock className="w-3 h-3" />
                              {selectedNotification.timestamp}
                            </p>
                          </div>
                          <p className="text-foreground">{selectedNotification.message}</p>
                          <div className="pt-4 border-t border-border space-y-3">
                            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                              Take Action
                            </Button>
                            <Button variant="outline" className="w-full border-border bg-transparent">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Dismiss
                            </Button>
                          </div>
                        </>
                      )
                    })()}
                  </CardContent>
                </Card>
              ) : (
                <Card className="glass border-border">
                  <CardContent className="p-6 text-center">
                    <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Select a notification to view details</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
