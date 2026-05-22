export const normalizeAuthRole = (role) => {
  return role === "admin" ? "admin" : "user"
}

export const decodeJwtPayload = (token) => {
  if (!token) {
    return null
  }

  const [, payloadBase64] = token.split(".")

  if (!payloadBase64) {
    return null
  }

  try {
    const normalized = payloadBase64.replace(/-/g, "+").replace(/_/g, "/")
    const padding = "=".repeat((4 - (normalized.length % 4)) % 4)
    const binary = globalThis.atob(`${normalized}${padding}`)
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
    const payloadJson = new TextDecoder().decode(bytes)

    return JSON.parse(payloadJson)
  } catch {
    return null
  }
}

export const getAuthRole = (token = localStorage.getItem("token")) => {
  const storedRole = localStorage.getItem("authRole")
  const payloadRole = decodeJwtPayload(token)?.role

  return normalizeAuthRole(storedRole || payloadRole)
}

export const getDefaultRouteForRole = (role) => {
  return normalizeAuthRole(role) === "admin" ? "/admin/dashboard" : "/portal"
}

export const isTokenExpired = (token) => {
  const exp = decodeJwtPayload(token)?.exp

  if (!exp) {
    return false
  }

  return exp * 1000 <= Date.now()
}

export const hasAuthSession = (token = localStorage.getItem("token")) => {
  return Boolean(token) && !isTokenExpired(token)
}

export const setAuthSession = ({ token, account }) => {
  localStorage.setItem("token", token)

  const role = normalizeAuthRole(account?.role || decodeJwtPayload(token)?.role)
  localStorage.setItem("authRole", role)

  return role
}

export const clearAuthSession = () => {
  localStorage.removeItem("token")
  localStorage.removeItem("authRole")
}
