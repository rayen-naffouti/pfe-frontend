"use client"

import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { AdminHeader } from "@/components/AdminHeader"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { EmptyState, ErrorState, LoadingState } from "@/components/DataState"
import { cn } from "@/lib/utils"
import { getApiErrorMessage, notificationsApi } from "@/lib/api"
import { formatNotificationTime, isNotificationUnread } from "@/lib/notifications"
import { Bell, AlertTriangle, XCircle, CheckCircle, Clock, ChevronRight, Trash2, Check } from "lucide-react"

const typeConfig = {
  warning: { icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10", border: "border-warning/30" },
  success: { icon: CheckCircle, color: "text-success", bg: "bg-success/10", border: "border-success/30" },
  error: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/30" },
  info: { icon: Bell, color: "text-primary", bg: "bg-primary/10", border: "border-primary/30" },
  scheduled: { icon: Clock, color: "text-accent", bg: "bg-accent/10", border: "border-accent/30" },
}

const filters = ["all", "unread", "scheduled", "warning", "error", "success", "info"]

const getConfig = (notification) => {
  if (notification.status === "scheduled") {
    return typeConfig.scheduled
  }

  return typeConfig[notification.type] || typeConfig.info
}

const getActionLabel = (notification) => {
  if (notification.license_id) {
    return "Open license"
  }

  if (notification.customer_id) {
    return "Open customer"
  }

  return "No linked record"
}

export default function NotificationsPage() {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [selectedNotification, setSelectedNotification] = useState(null)
  const [filter, setFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionError, setActionError] = useState(null)

  const fetchNotifications = async () => {
    setLoading(true)
    setError(null)

    try {
      const { data } = await notificationsApi.list({ limit: 100, include_scheduled: true })
      setNotifications(data.notifications || [])
      setUnreadCount(data.unread_count || 0)
      setSelectedNotification((current) =>
        current ? (data.notifications || []).find((item) => item.id === current.id) || null : null,
      )
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to load notifications"))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      if (filter === "all") return true
      if (filter === "unread") return isNotificationUnread(notification)
      if (filter === "scheduled") return notification.status === "scheduled"

      return notification.type === filter && notification.status !== "scheduled"
    })
  }, [filter, notifications])

  const updateNotification = (updatedNotification) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === updatedNotification.id ? { ...notification, ...updatedNotification } : notification,
      ),
    )
    setSelectedNotification((current) =>
      current?.id === updatedNotification.id ? { ...current, ...updatedNotification } : current,
    )
  }

  const markRead = async (notification) => {
    if (!isNotificationUnread(notification)) {
      return
    }

    const { data } = await notificationsApi.markRead(notification.id)
    updateNotification(data.notification)
    setUnreadCount((current) => Math.max(current - 1, 0))
  }

  const handleSelect = async (notification) => {
    setSelectedNotification(notification)
    setActionError(null)

    try {
      await markRead(notification)
    } catch (err) {
      setActionError(getApiErrorMessage(err, "Failed to mark notification as read"))
    }
  }

  const handleMarkAllRead = async () => {
    setActionError(null)

    try {
      await notificationsApi.markAllRead()
      await fetchNotifications()
    } catch (err) {
      setActionError(getApiErrorMessage(err, "Failed to mark notifications as read"))
    }
  }

  const handleDismiss = async (notification) => {
    setActionError(null)

    try {
      await notificationsApi.dismiss(notification.id)
      setNotifications((current) => current.filter((item) => item.id !== notification.id))
      setSelectedNotification((current) => (current?.id === notification.id ? null : current))
      if (isNotificationUnread(notification)) {
        setUnreadCount((current) => Math.max(current - 1, 0))
      }
    } catch (err) {
      setActionError(getApiErrorMessage(err, "Failed to dismiss notification"))
    }
  }

  const handleTakeAction = (notification) => {
    if (notification.license_id) {
      navigate(`/admin/licenses/${notification.license_id}`)
      return
    }

    if (notification.customer_id) {
      navigate(`/admin/customers/${notification.customer_id}`)
    }
  }

  return (
    <div className="min-h-screen">
      <AdminHeader title="Notifications Center" subtitle="View and manage all system notifications" />

      <div className="p-6">
        {loading && <LoadingState message="Loading notifications..." />}

        {error && !loading && <ErrorState message={error} onRetry={fetchNotifications} />}

        {actionError && !loading && (
          <div className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
            {actionError}
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              <div className="flex flex-wrap gap-2">
                {filters.map((item) => (
                  <Button
                    key={item}
                    variant="outline"
                    size="sm"
                    onClick={() => setFilter(item)}
                    className={cn(
                      "border-border capitalize",
                      filter === item && "bg-primary/10 text-primary border-primary/30",
                    )}
                  >
                    {item}
                    {item === "unread" && unreadCount > 0 && (
                      <Badge className="ml-2 bg-destructive text-destructive-foreground">{unreadCount}</Badge>
                    )}
                  </Button>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto text-muted-foreground"
                  disabled={unreadCount === 0}
                  onClick={handleMarkAllRead}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Mark all read
                </Button>
              </div>

              <div className="space-y-3">
                {filteredNotifications.length === 0 ? (
                  <EmptyState message="No notifications found" />
                ) : (
                  filteredNotifications.map((notification) => {
                    const config = getConfig(notification)
                    const Icon = config.icon
                    const unread = isNotificationUnread(notification)

                    return (
                      <Card
                        key={notification.id}
                        className={cn(
                          "glass border-border cursor-pointer transition-all duration-200 hover:scale-[1.01]",
                          unread && "border-l-4 border-l-primary",
                          selectedNotification?.id === notification.id && "ring-1 ring-primary",
                        )}
                        onClick={() => handleSelect(notification)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", config.bg)}>
                              <Icon className={cn("w-5 h-5", config.color)} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <div className="min-w-0">
                                  <h4 className={cn("truncate font-medium", unread ? "text-foreground" : "text-muted-foreground")}>
                                    {notification.title}
                                  </h4>
                                  {(notification.customer_username || notification.product_name) && (
                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                      {[notification.customer_username, notification.product_name].filter(Boolean).join(" - ")}
                                    </p>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="whitespace-nowrap text-xs text-muted-foreground">
                                    {formatNotificationTime(notification)}
                                  </span>
                                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                </div>
                              </div>
                              <p className="mt-1 truncate text-sm text-muted-foreground">{notification.message}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })
                )}
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-24">
                {selectedNotification ? (
                  <Card className="glass border-border">
                    <CardContent className="space-y-4 p-6">
                      {(() => {
                        const config = getConfig(selectedNotification)
                        const Icon = config.icon
                        const canOpenRecord = Boolean(selectedNotification.license_id || selectedNotification.customer_id)

                        return (
                          <>
                            <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center", config.bg)}>
                              <Icon className={cn("w-6 h-6", config.color)} />
                            </div>
                            <div>
                              <Badge className={cn(config.bg, config.color, config.border, "mb-2")}>
                                {selectedNotification.status === "scheduled" ? "scheduled" : selectedNotification.type}
                              </Badge>
                              <h3 className="text-lg font-semibold text-foreground">{selectedNotification.title}</h3>
                              <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                {formatNotificationTime(selectedNotification)}
                              </p>
                            </div>
                            <p className="whitespace-pre-wrap text-foreground">{selectedNotification.message}</p>
                            <div className="rounded-lg border border-border bg-secondary/30 p-3 text-sm text-muted-foreground">
                              <p>{selectedNotification.customer_username || selectedNotification.customer_email || "No customer"}</p>
                              <p>{selectedNotification.product_name || "No product"}</p>
                              {selectedNotification.license_id && <p>License #{selectedNotification.license_id}</p>}
                              {selectedNotification.email_to && <p>Email: {selectedNotification.email_to}</p>}
                              {selectedNotification.email_status && <p>Email status: {selectedNotification.email_status}</p>}
                            </div>
                            <div className="space-y-3 border-t border-border pt-4">
                              <Button
                                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                                disabled={!canOpenRecord}
                                onClick={() => handleTakeAction(selectedNotification)}
                              >
                                {getActionLabel(selectedNotification)}
                              </Button>
                              <Button
                                variant="outline"
                                className="w-full border-border bg-transparent"
                                onClick={() => handleDismiss(selectedNotification)}
                              >
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
        )}
      </div>
    </div>
  )
}
