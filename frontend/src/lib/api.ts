import axios from 'axios'

const raw = ((import.meta as any).env?.VITE_API_URL || 'https://agridss-backend.onrender.com').trim()
// The backend has no /api prefix, so drop it (and any trailing slash) if the env var includes one.
const baseURL = raw.replace(/\/+$/, '').replace(/\/api$/, '')

const api = axios.create({ baseURL })

api.interceptors.request.use(cfg => {
  const t = localStorage.getItem('token')
  if (t) cfg.headers.Authorization = `Bearer ${t}`
  return cfg
})

export default api