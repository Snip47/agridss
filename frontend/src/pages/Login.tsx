import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'

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
    catch (err: any) { setError(err?.response?.data?.detail || 'Sign in failed. Please check your details.') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex" style={{ background:'var(--bg)' }}>
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-96 p-10 flex-shrink-0"
        style={{ background:'var(--sidebar-bg)' }}>
        <div>
          <div className="text-3xl mb-2">🌾</div>
          <h1 className="text-2xl font-bold text-white mb-2" style={{ fontFamily:'Lora, serif' }}>AgriDSS Kenya</h1>
          <p className="text-sm" style={{ color:'rgba(220,252,231,0.7)' }}>Agricultural Decision Support System for Kenyan farmers</p>
        </div>
        <div className="space-y-4">
          {[
            { emoji:'🌱', text:'60+ crops with planting guides' },
            { emoji:'🐄', text:'18 livestock types with breed info' },
            { emoji:'🦠', text:'56 diseases with treatment guides' },
            { emoji:'🤖', text:'AI advisor with photo diagnosis' },
            { emoji:'📍', text:'All 47 Kenya counties covered' },
          ].map(({ emoji, text }) => (
            <div key={text} className="flex items-center gap-3">
              <span className="text-xl">{emoji}</span>
              <span className="text-sm" style={{ color:'rgba(220,252,231,0.8)' }}>{text}</span>
            </div>
          ))}
        </div>
        <p className="text-xs" style={{ color:'rgba(220,252,231,0.4)' }}>© 2024 AgriDSS Kenya</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="lg:hidden text-center mb-8">
            <div className="text-4xl mb-2">🌾</div>
            <h1 className="text-2xl font-bold" style={{ fontFamily:'Lora, serif', color:'var(--text)' }}>AgriDSS Kenya</h1>
          </div>

          <h2 className="text-xl font-semibold mb-1" style={{ fontFamily:'Lora, serif', color:'var(--text)' }}>Welcome back</h2>
          <p className="text-sm mb-6" style={{ color:'var(--text-muted)' }}>Sign in to your account to continue</p>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg mb-4 text-sm"
              style={{ background:'#fef2f2', border:'1px solid #fecaca', color:'#dc2626' }}>
              <AlertCircle className="w-4 h-4 flex-shrink-0"/>{error}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color:'var(--text)' }}>Email address</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required
                placeholder="you@gmail.com" autoComplete="email"
                className="w-full px-3 py-2.5 text-sm rounded-lg outline-none transition-all"
                style={{ border:'1px solid var(--border)', background:'white', color:'var(--text)' }}
                onFocus={e=>(e.target.style.borderColor='#16a34a')}
                onBlur={e=>(e.target.style.borderColor='var(--border)')}/>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color:'var(--text)' }}>Password</label>
              <div className="relative">
                <input type={showPassword?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} required
                  placeholder="Your password" autoComplete="current-password"
                  className="w-full px-3 py-2.5 text-sm rounded-lg outline-none transition-all"
                  style={{ border:'1px solid var(--border)', background:'white', color:'var(--text)', paddingRight:'2.75rem' }}
                  onFocus={e=>(e.target.style.borderColor='#16a34a')}
                  onBlur={e=>(e.target.style.borderColor='var(--border)')}/>
                <button type="button" onClick={()=>setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5" style={{ color:'var(--text-muted)' }}>
                  {showPassword?<EyeOff className="w-4 h-4"/>:<Eye className="w-4 h-4"/>}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-60"
              style={{ background:'var(--green)' }}
              onMouseEnter={e=>!loading&&(e.currentTarget.style.background='#15803d')}
              onMouseLeave={e=>(e.currentTarget.style.background='var(--green)')}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-sm mt-5" style={{ color:'var(--text-muted)' }}>
            New to AgriDSS?{' '}
            <Link to="/register" className="font-semibold" style={{ color:'var(--green)' }}>Create account</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
