import api from "./axios"

export const getApiErrorMessage = (error, fallback = "Something went wrong") => {
  return error.response?.data?.message || error.response?.data?.error || error.message || fallback
}

export const authApi = {
  login: (payload) => api.post("/auth/login", payload),
  register: (payload) => api.post("/auth/register", payload),
  profile: () => api.get("/auth/profile"),
  resendActivation: (payload) => api.post("/auth/account-activation/resend", payload),
  validateActivationToken: (token) => api.get("/auth/account-activation/validate", { params: { token } }),
  activateAccount: (payload) => api.post("/auth/account-activation", payload),
  forgotPassword: (payload) => api.post("/auth/forgot-password", payload),
  validateResetToken: (token) => api.get("/auth/reset-password/validate", { params: { token } }),
  resetPassword: (payload) => api.post("/auth/reset-password", payload),
}

export const customersApi = {
  register: (payload) => api.post("/customers/register", payload),
  list: () => api.get("/customers"),
  get: (id) => api.get(`/customers/${id}`),
  current: () => api.get("/customer"),
  licenses: (customerId) => api.get(`/customers/${customerId}/licenses`),
  payments: (customerId) => api.get(`/customers/${customerId}/payments`),
}

export const productsApi = {
  list: () => api.get("/products"),
  get: (id) => api.get(`/products/${id}`),
  create: (payload) => api.post("/products", payload),
}

export const licensesApi = {
  list: () => api.get("/licenses"),
  get: (id) => api.get(`/licenses/${id}`),
  create: (payload) => api.post("/licenses", payload),
  checkout: (payload) => api.post("/licenses/checkout", payload),
  history: (licenseId) => api.get(`/licenses/${licenseId}/history`),
}

export const paymentsApi = {
  create: (payload) => api.post("/payments", payload),
}

export const automationApi = {
  get: () => api.get("/automation"),
  update: (payload) => api.put("/automation", payload),
}

export const notificationsApi = {
  list: (params = {}) => api.get("/notifications", { params }),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch("/notifications/read-all"),
  dismiss: (id) => api.patch(`/notifications/${id}/dismiss`),
}
