import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import api from './api'

interface User { id:number; name:string; email:string; role:string; county?:string; constituency?:string; ward?:string; village?:string }
interface AuthCtx { user:User|null; login:(e:string,p:string)=>Promise<void>; register:(d:any)=>Promise<void>; logout:()=>void; loading:boolean }

const Ctx = createContext<AuthCtx>({} as AuthCtx)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User|null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = localStorage.getItem('token')
    if (t) api.get('/auth/me').then(r=>setUser(r.data)).catch(()=>localStorage.removeItem('token')).finally(()=>setLoading(false))
    else setLoading(false)
  }, [])

  const login = async (email:string, password:string) => {
    const r = await api.post('/auth/login', { email, password })
    localStorage.setItem('token', r.data.token); setUser(r.data.user)
  }
  const register = async (data:any) => {
    const r = await api.post('/auth/register', data)
    localStorage.setItem('token', r.data.token); setUser(r.data.user)
  }
  const logout = () => { localStorage.removeItem('token'); setUser(null) }

  return <Ctx.Provider value={{ user, login, register, logout, loading }}>{children}</Ctx.Provider>
}
export const useAuth = () => useContext(Ctx)
