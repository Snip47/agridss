import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { Leaf, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { getBackground } from '../lib/backgroundImages'

const bg = getBackground('login')

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true)
    try { await login(email, password); navigate('/') }
    catch { setError('Invalid email or password') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      <img src={bg} alt="" className="absolute inset-0 w-full h-full object-cover"/>
      <div className="absolute inset-0" style={{ background:'rgba(0,0,0,0.60)' }}/>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4 shadow-2xl"
            style={{ background:'rgba(34,197,94,0.25)', backdropFilter:'blur(20px)', border:'1px solid rgba(34,197,94,0.4)' }}>
            <Leaf className="w-10 h-10 text-green-400"/>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight drop-shadow-2xl">AgriDSS</h1>
          <p className="text-white/60 mt-1 text-sm">Kenya Agricultural Decision Support System</p>
          <div className="flex items-center justify-center gap-4 mt-3 text-xs text-white/45">
            <span>🌾 40+ Crops</span><span>🐄 14+ Livestock</span><span>🤖 AI Advisor</span>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8" style={{ background:'rgba(0,0,0,0.45)', backdropFilter:'blur(24px)', border:'1px solid rgba(255,255,255,0.12)' }}>
          <h2 className="text-xl font-bold text-white mb-6">Sign in to your account</h2>

          {error && (
            <div className="flex items-center gap-2 rounded-xl p-3 mb-4 text-sm text-red-300"
              style={{ background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.3)' }}>
              <AlertCircle className="w-4 h-4 flex-shrink-0"/>{error}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-white/60 mb-2">Email Address</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required
                placeholder="your@email.com"
                className="w-full rounded-xl px-4 py-3 text-sm transition-all"
                style={{ background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.18)', color:'white' }}/>
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/60 mb-2">Password</label>
              <div className="relative">
                <input type={showPassword?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} required
                  placeholder="Enter your password"
                  className="w-full rounded-xl px-4 py-3 pr-11 text-sm transition-all"
                  style={{ background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.18)', color:'white' }}/>
                <button type="button" onClick={()=>setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors">
                  {showPassword?<EyeOff className="w-4 h-4"/>:<Eye className="w-4 h-4"/>}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-50"
              style={{ background:'rgba(34,197,94,0.85)', border:'1px solid rgba(34,197,94,0.5)' }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-xs text-white/40 mt-5">
            No account?{' '}
            <Link to="/register" className="text-green-400 font-semibold hover:text-green-300 transition-colors">
              Register as Farmer
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
