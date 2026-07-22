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
    if (token) {
      api.get('/auth/me').then(r => setUser(r.data)).catch(() => localStorage.removeItem('token')).finally(() => setLoading(false))
    } else setLoading(false)
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
