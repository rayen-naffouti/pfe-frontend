export const formatDate = (value, fallback = "N/A") => {
  if (!value) {
    return fallback
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return fallback
  }

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export const formatDateTime = (value, fallback = "N/A") => {
  if (!value) {
    return fallback
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return fallback
  }

  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export const formatCurrency = (amount, currency = "USD") => {
  const numericAmount = Number(amount)

  if (Number.isNaN(numericAmount)) {
    return "N/A"
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(numericAmount)
}

export const getLicenseStatus = (license) => {
  const rawStatus = license?.status?.toLowerCase()

  if (rawStatus === "disabled" || rawStatus === "expired" || rawStatus === "trial") {
    return rawStatus
  }

  if (license?.expiration_at) {
    const expirationDate = new Date(license.expiration_at)

    if (!Number.isNaN(expirationDate.getTime())) {
      const now = new Date()
      const daysUntilExpiration = (expirationDate.getTime() - now.getTime()) / 86_400_000

      if (daysUntilExpiration < 0) {
        return "expired"
      }

      if (daysUntilExpiration <= 30) {
        return "expiring"
      }
    }
  }

  return rawStatus === "active" || rawStatus === "valid" ? "valid" : rawStatus || "valid"
}

export const slugify = (value) => {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}
