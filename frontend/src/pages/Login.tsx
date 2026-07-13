import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { Leaf, AlertCircle, Eye, EyeOff } from 'lucide-react'
import PageBackdrop, { BACKDROPS } from '../components/PageBackdrop'

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
    catch { setError('Invalid email or password. Try admin@agridss.co.ke / Admin@1234') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
        <PageBackdrop image={BACKDROPS.auth} overlay="from-leaf-950/85 via-leaf-900/70 to-earth-900/85" />
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-xl mb-4">
            <Leaf className="w-10 h-10 text-leaf-600"/>
          </div>
          <h1 className="text-4xl font-extrabold text-white">AgriDSS</h1>
          <p className="text-leaf-200 mt-1 text-sm">Kenya Agricultural Decision Support System</p>
          <div className="flex items-center justify-center gap-4 mt-3 text-xs text-leaf-300">
            <span>🌾 40+ Crops</span><span>🐄 14+ Livestock</span><span>🤖 AI Advisor</span>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-bold text-earth-800 mb-5">Sign in to your account</h2>
          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded-lg p-3 mb-4 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0"/>{error}
            </div>
          )}
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-earth-700 mb-1">Email Address</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required
                placeholder="your@email.com"
                className="w-full border border-earth-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-leaf-500"/>
            </div>
            <div>
              <label className="block text-xs font-semibold text-earth-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e=>setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  className="w-full border border-earth-200 rounded-lg px-4 py-2.5 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-leaf-500"/>
                <button
                  type="button"
                  onClick={()=>setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-earth-400 hover:text-earth-600 transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-leaf-600 hover:bg-leaf-700 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50 text-sm">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <p className="text-center text-xs text-earth-500 mt-4">
            No account? <Link to="/register" className="text-leaf-600 font-semibold hover:underline">Register as Farmer</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
