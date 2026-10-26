const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  const sessionId = typeof window !== 'undefined' ? localStorage.getItem('taskdesk_session_id') : null

  const headers = {
    'Content-Type': 'application/json',
    ...(sessionId ? { 'x-session-id': sessionId, 'Authorization': `Bearer ${sessionId}` } : {}),
    ...(options.headers || {}),
  }

  const config = {
    ...options,
    headers,
    credentials: 'include',
  }

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body)
  }

  const response = await fetch(url, config)
  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const errorMsg = data.error || (data.errors && data.errors[0]?.msg) || 'Something went wrong'
    const error = new Error(errorMsg)
    error.status = response.status
    error.data = data
    throw error
  }

  return data
}

export const api = {
  get: (endpoint, options) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options) => request(endpoint, { ...options, method: 'POST', body }),
  put: (endpoint, body, options) => request(endpoint, { ...options, method: 'PUT', body }),
  delete: (endpoint, options) => request(endpoint, { ...options, method: 'DELETE' }),
}

export default api
