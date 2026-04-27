import api from "./axios"

export const getApiErrorMessage = (error, fallback = "Something went wrong") => {
  return error.response?.data?.message || error.response?.data?.error || error.message || fallback
}

export const authApi = {
  login: (payload) => api.post("/auth/login", payload),
  register: (payload) => api.post("/auth/register", payload),
  profile: () => api.get("/auth/profile"),
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
