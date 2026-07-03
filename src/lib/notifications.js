const DEFAULT_POLL_INTERVAL_MS = 30000

export const getNotificationPollInterval = () => {
  const value = Number(import.meta.env.VITE_NOTIFICATIONS_POLL_INTERVAL_MS)

  if (!Number.isFinite(value) || value <= 0) {
    return DEFAULT_POLL_INTERVAL_MS
  }

  return Math.max(value, 10000)
}

export const getNotificationDate = (notification) => {
  const value = notification?.sent_at || notification?.scheduled_for || notification?.created_at
  const date = value ? new Date(value) : null

  return date && !Number.isNaN(date.getTime()) ? date : null
}

export const formatNotificationTime = (notification) => {
  const date = getNotificationDate(notification)

  if (!date) {
    return "Unknown time"
  }

  if (notification?.status === "scheduled") {
    return `Scheduled ${date.toLocaleString()}`
  }

  const diffMs = Date.now() - date.getTime()
  const minuteMs = 60_000
  const hourMs = 60 * minuteMs
  const dayMs = 24 * hourMs

  if (diffMs < minuteMs) {
    return "Just now"
  }

  if (diffMs < hourMs) {
    const minutes = Math.floor(diffMs / minuteMs)
    return `${minutes} min ago`
  }

  if (diffMs < dayMs) {
    const hours = Math.floor(diffMs / hourMs)
    return `${hours} hr ago`
  }

  if (diffMs < 7 * dayMs) {
    const days = Math.floor(diffMs / dayMs)
    return `${days} day${days === 1 ? "" : "s"} ago`
  }

  return date.toLocaleDateString()
}

export const isNotificationUnread = (notification) => {
  return !notification?.read_at && notification?.status !== "scheduled"
}
