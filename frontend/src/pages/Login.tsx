import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { Leaf, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { getBackground } from '../lib/backgroundImages'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('')
    if (!email || !password) { setError('Please enter your email and password'); return }
    setLoading(true)
    try { await login(email, password); navigate('/') }
    catch (err: any) { setError(err?.response?.data?.detail || 'Invalid email or password.') }
    finally { setLoading(false) }
  }

  const iStyle = {
    background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.18)',
    color:'white', borderRadius:'0.75rem', padding:'0.65rem 0.85rem',
    fontSize:'0.875rem', width:'100%', outline:'none'
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <img src={getBackground('login')} alt="" className="absolute inset-0 w-full h-full object-cover"/>
      <div className="absolute inset-0" style={{ background:'rgba(0,0,0,0.6)' }}/>

      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{ background:'rgba(34,197,94,0.25)', backdropFilter:'blur(20px)', border:'1px solid rgba(34,197,94,0.4)' }}>
            <Leaf className="w-7 h-7 text-green-400"/>
          </div>
          <h1 className="text-3xl font-black text-white">AgriDSS Kenya</h1>
          <p className="text-white/45 mt-1 text-sm">Agricultural Decision Support System</p>
        </div>

        <div className="rounded-2xl p-6" style={{ background:'rgba(0,0,0,0.48)', backdropFilter:'blur(24px)', border:'1px solid rgba(255,255,255,0.12)' }}>
          {error && (
            <div className="flex items-center gap-2 rounded-xl p-3 mb-4 text-sm text-red-300"
              style={{ background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.3)' }}>
              <AlertCircle className="w-4 h-4 flex-shrink-0"/>{error}
            </div>
          )}
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-white/55 mb-1.5">Email Address</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required
                placeholder="you@gmail.com" style={iStyle}
                onFocus={e=>(e.target.style.borderColor='rgba(34,197,94,0.6)')}
                onBlur={e=>(e.target.style.borderColor='rgba(255,255,255,0.18)')}/>
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/55 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPassword?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} required
                  placeholder="Your password" style={{ ...iStyle, paddingRight:'2.75rem' }}
                  onFocus={e=>(e.target.style.borderColor='rgba(34,197,94,0.6)')}
                  onBlur={e=>(e.target.style.borderColor='rgba(255,255,255,0.18)')}/>
                <button type="button" onClick={()=>setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-white/40 hover:text-white/70">
                  {showPassword?<EyeOff className="w-4 h-4"/>:<Eye className="w-4 h-4"/>}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-50"
              style={{ background:'rgba(34,197,94,0.8)', border:'1px solid rgba(34,197,94,0.5)' }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <p className="text-center text-xs text-white/35 mt-4">
            New to AgriDSS?{' '}
            <Link to="/register" className="text-green-400 font-semibold hover:text-green-300">Create account</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
