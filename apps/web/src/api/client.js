/**
 * Axios client singleton.
 * - Reads BASE_URL from env (Vite: VITE_API_URL) with same-origin fallback
 * - Attaches Bearer token from localStorage on every request
 * - Intercepts 401 responses → clears auth and redirects to /login
 */
import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || (
  window.location.origin === 'http://localhost:5173'
    ? 'http://localhost:8000'
    : ''
)

const client = axios.create({ baseURL: BASE_URL })

// ── Request interceptor: attach JWT ──────────────────────────────
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Response interceptor: handle 401 globally ────────────────────
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('nama')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default client
