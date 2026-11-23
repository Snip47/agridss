import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import api from './api'

interface User {
  id: number; name: string; email: string; role: string;
  county?: string; constituency?: string; ward?: string;
  village?: string; farm_size_acres?: string; profile_picture?: string;
}

interface AuthCtx {
  user: User | null; loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  updateProfile: (data: any) => Promise<void>;
}

const Ctx = createContext<AuthCtx>({} as AuthCtx)
export const useAuth = () => useContext(Ctx)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { setLoading(false); return }
    let cancelled = false
    const restore = async () => {
      for (let attempt = 0; attempt < 4; attempt++) {
        try {
          const r = await api.get('/auth/me')
          if (!cancelled) setUser(r.data)
          break
        } catch (e: any) {
          // Only an invalid or expired token signs the user out.
          if (e?.response?.status === 401) { localStorage.removeItem('token'); break }
          // The server may be waking up (free hosting) or the network may have dropped: wait and retry.
          await new Promise(res => setTimeout(res, 3000))
        }
      }
      if (!cancelled) setLoading(false)
    }
    restore()
    return () => { cancelled = true }
  }, [])

  const login = async (email: string, password: string) => {
    const r = await api.post('/auth/login', { email, password })
    localStorage.setItem('token', r.data.token)
    setUser(r.data.user)
  }

  const register = async (data: any) => {
    const r = await api.post('/auth/register', data)
    localStorage.setItem('token', r.data.token)
    setUser(r.data.user)
  }

  const logout = () => { localStorage.removeItem('token'); setUser(null) }

  const updateProfile = async (data: any) => {
    const r = await api.put('/auth/profile', data)
    setUser(r.data)
  }

  return <Ctx.Provider value={{ user, loading, login, register, logout, updateProfile }}>{children}</Ctx.Provider>
}
