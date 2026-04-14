import { clearSession, getToken } from './auth'

export const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'https://veto-care.vercel.app/api'

export async function apiRequest(path, options = {}) {
  const headers = {
    ...(options.headers || {})
  }

  if (!options.skipAuth) {
    const token = getToken()
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
  }

  if (options.body && !(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json'
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers
  })

  const rawText = await response.text()
  let payload = rawText
  try {
    payload = rawText ? JSON.parse(rawText) : null
  } catch {
  }

  if (!response.ok) {
    const message = payload?.message || payload?.error || `Request failed with status ${response.status}`

    if (response.status === 401) {
      clearSession()
    }

    throw new Error(message)
  }

  return payload
}
