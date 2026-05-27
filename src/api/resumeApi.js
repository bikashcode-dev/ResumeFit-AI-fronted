import axios from 'axios'

const baseURL =
  import.meta.env.VITE_API_URL?.trim() ||
  'https://resumefit-ai-backend.onrender.com'

const api = axios.create({
  baseURL,
  timeout: 180000,
})

const FRIENDLY_ERRORS = {
  ECONNABORTED:
    'The request timed out. The backend may be waking up. Please wait a moment and try again.',
  ERR_NETWORK:
    'Cannot reach the backend. Check your connection or try again shortly. Render cold starts can take a minute.',
  500: 'The server encountered an error. Please try again.',
  503: 'The backend is unavailable or warming up. Please try again shortly.',
  422: 'The request could not be processed. Please check your input.',
  400: 'Invalid request. Please review your input.',
  413: 'The file is too large. Please use a smaller PDF or DOCX.',
}

export function getFriendlyError(err) {
  if (err?.code === 'ERR_CANCELED' || err?.name === 'CanceledError') {
    return 'Request cancelled.'
  }
  if (err?.code === 'ECONNABORTED') return FRIENDLY_ERRORS.ECONNABORTED
  if (err?.code === 'ERR_NETWORK') return FRIENDLY_ERRORS.ERR_NETWORK
  const status = err?.response?.status
  if (status && FRIENDLY_ERRORS[status]) return FRIENDLY_ERRORS[status]
  const msg = err?.response?.data?.message || err?.response?.data?.error
  if (msg) return msg
  return 'Something went wrong. Please try again.'
}

function postConfig(signal) {
  return signal ? { signal } : undefined
}

export async function parseResume(file, signal) {
  const form = new FormData()
  form.append('file', file)
  const res = await api.post('/api/resume/parse', form, postConfig(signal))
  return res.data
}

export async function analyzeJobDescription(data, signal) {
  const res = await api.post('/api/job-descriptions/analyze', data, postConfig(signal))
  return res.data
}

export async function matchResume(data, signal) {
  const res = await api.post('/api/resume/match', data, postConfig(signal))
  return res.data
}

export async function getSuggestions(data, signal) {
  const res = await api.post('/api/resume/suggestions', data, postConfig(signal))
  return res.data
}

export async function optimizeResume(data, signal) {
  const res = await api.post('/api/resume/optimize', data, postConfig(signal))
  return res.data
}

export async function getVersions(data, signal) {
  const res = await api.post('/api/resume/versions', data, postConfig(signal))
  return res.data
}

export async function generateResume(data, signal) {
  const res = await api.post('/api/resume/builder/generate', data, postConfig(signal))
  return res.data
}

export async function assistSection(data, signal) {
  const res = await api.post('/api/resume/builder/assist-section', data, postConfig(signal))
  return res.data
}

export async function exportDocx(data) {
  const res = await api.post('/api/resume/export/docx', data, { responseType: 'blob' })
  return res.data
}

export async function exportPdf(style, data) {
  const res = await api.post(`/api/resume/export/pdf/${style}`, data, { responseType: 'blob' })
  return res.data
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export default api
