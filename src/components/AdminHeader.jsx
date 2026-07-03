import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Bell, Search, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/ThemeToggle"
import { authApi, notificationsApi } from "@/lib/api"
import { clearAuthSession } from "@/lib/auth"
import { formatNotificationTime, getNotificationPollInterval, isNotificationUnread } from "@/lib/notifications"

export function AdminHeader({ title, subtitle }) {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [profileError, setProfileError] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const token = localStorage.getItem("token")

    if (!token) {
      return
    }

    authApi
      .profile()
      .then(({ data }) => {
        setProfile(data.user || data)
        setProfileError(null)
      })
      .catch(() => {
        setProfileError("Profile unavailable")
      })
  }, [])

  const fetchNotifications = async () => {
    try {
      const { data } = await notificationsApi.list({ limit: 3 })
      setNotifications(data.notifications || [])
      setUnreadCount(data.unread_count || 0)
    } catch {
      setNotifications([])
      setUnreadCount(0)
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("token")

    if (!token) {
      return undefined
    }

    fetchNotifications()
    const timer = window.setInterval(fetchNotifications, getNotificationPollInterval())

    return () => window.clearInterval(timer)
  }, [])

  const handleLogout = () => {
    clearAuthSession()
    navigate("/login")
  }

  const handleNotificationClick = async (notification) => {
    if (isNotificationUnread(notification)) {
      notificationsApi.markRead(notification.id).catch(() => {})
      setUnreadCount((current) => Math.max(current - 1, 0))
      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id ? { ...item, read_at: item.read_at || new Date().toISOString() } : item,
        ),
      )
    }

    navigate("/admin/notifications")
  }

  return (
    <header className="sticky top-0 z-40 glass-strong border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search..." className="w-64 pl-9 bg-input border-border focus:ring-primary" />
          </div>

          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 min-w-5 h-5 px-1 flex items-center justify-center bg-destructive text-destructive-foreground text-xs">
                    {Math.min(unreadCount, 99)}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 glass-strong border-border">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.length === 0 ? (
                <DropdownMenuItem disabled className="py-3 text-muted-foreground">
                  No notifications
                </DropdownMenuItem>
              ) : (
                notifications.map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    className="flex flex-col items-start gap-1 py-3"
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <span className={isNotificationUnread(notification) ? "font-semibold" : "font-medium"}>
                      {notification.title}
                    </span>
                    <span className="line-clamp-2 text-xs text-muted-foreground">{notification.message}</span>
                    <span className="text-xs text-muted-foreground">{formatNotificationTime(notification)}</span>
                  </DropdownMenuItem>
                ))
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/admin/notifications")}>View all notifications</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <span className="hidden md:block text-sm">{profile?.username || "Admin"}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-strong border-border">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>{profile?.email || profileError || "Profile"}</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={handleLogout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
