import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { Leaf, AlertCircle, Eye, EyeOff } from 'lucide-react'
import api from '../lib/api'
import PageBackdrop, { BACKDROPS } from '../components/PageBackdrop'

export default function Register() {
  const [form, setForm] = useState({ name:'', email:'', password:'', county:'', constituency:'', ward:'', village:'', farm_size_acres:'' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [counties, setCounties] = useState<string[]>([])
  const [constituencies, setConstituencies] = useState<string[]>([])
  const [wards, setWards] = useState<string[]>([])
  const { register } = useAuth()
  const navigate = useNavigate()

  useEffect(() => { api.get('/location/counties').then(r=>setCounties(r.data)).catch(()=>{}) }, [])

  useEffect(() => {
    if (form.county) {
      api.get('/location/constituencies',{params:{county:form.county}}).then(r=>setConstituencies(r.data)).catch(()=>{})
      setForm(f=>({...f,constituency:'',ward:''}))
      setConstituencies([]); setWards([])
    }
  }, [form.county])

  useEffect(() => {
    if (form.county && form.constituency) {
      api.get('/location/wards',{params:{county:form.county,constituency:form.constituency}}).then(r=>setWards(r.data)).catch(()=>{})
      setForm(f=>({...f,ward:''})); setWards([])
    }
  }, [form.constituency])

  const set = (k:string) => (e:React.ChangeEvent<HTMLInputElement|HTMLSelectElement>) => setForm(f=>({...f,[k]:e.target.value}))

  const submit = async (e:React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true)
    try { await register(form); navigate('/') }
    catch (err:any) { setError(err?.response?.data?.detail || 'Registration failed') }
    finally { setLoading(false) }
  }

  const inputCls = "w-full border border-earth-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-leaf-500"
  const labelCls = "block text-xs font-semibold text-earth-700 mb-1"

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
        <PageBackdrop image={BACKDROPS.auth} overlay="from-leaf-950/85 via-leaf-900/70 to-earth-900/85" />
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-xl mb-3">
            <Leaf className="w-8 h-8 text-leaf-600"/>
          </div>
          <h1 className="text-3xl font-extrabold text-white">Join AgriDSS</h1>
          <p className="text-leaf-200 mt-1 text-sm">Create your farmer account</p>
        </div>
        <div className="bg-white rounded-2xl shadow-2xl p-7">
          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded-lg p-3 mb-4 text-sm">
              <AlertCircle className="w-4 h-4"/>{error}
            </div>
          )}
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className={labelCls}>Full Name</label>
              <input value={form.name} onChange={set('name')} required placeholder="John Kamau" className={inputCls}/>
            </div>
            <div>
              <label className={labelCls}>Email Address</label>
              <input type="email" value={form.email} onChange={set('email')} required placeholder="you@email.com" className={inputCls}/>
            </div>
            <div>
              <label className={labelCls}>Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={set('password')}
                  required
                  minLength={6}
                  placeholder="Min 6 characters"
                  className={`${inputCls} pr-11`}/>
                <button
                  type="button"
                  onClick={()=>setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-earth-400 hover:text-earth-600 transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                </button>
              </div>
              <p className="text-xs text-earth-400 mt-1">At least 6 characters</p>
            </div>

            <div className="border-t border-earth-100 pt-3">
              <p className="text-xs font-bold text-leaf-700 mb-3">📍 Your Location <span className="font-normal text-earth-400">(for accurate farm recommendations)</span></p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>County *</label>
                  <select value={form.county} onChange={set('county')} className={inputCls}>
                    <option value="">Select County</option>
                    {counties.map(c=><option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Constituency *</label>
                  <select value={form.constituency} onChange={set('constituency')} className={inputCls} disabled={!form.county}>
                    <option value="">{form.county ? 'Select Constituency' : 'Select county first'}</option>
                    {constituencies.map(c=><option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Ward</label>
                  <select value={form.ward} onChange={set('ward')} className={inputCls} disabled={!form.constituency}>
                    <option value="">{form.constituency ? 'Select Ward' : 'Select constituency first'}</option>
                    {wards.map(w=><option key={w} value={w}>{w}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Village/Area</label>
                  <input value={form.village} onChange={set('village')} placeholder="e.g. Githurai" className={inputCls}/>
                </div>
                <div className="col-span-2">
                  <label className={labelCls}>Farm Size (acres)</label>
                  <input type="number" value={form.farm_size_acres} onChange={set('farm_size_acres')} step="0.5" min="0" placeholder="e.g. 2.5" className={inputCls}/>
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-leaf-600 hover:bg-leaf-700 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50 text-sm mt-2">
              {loading ? 'Creating account...' : 'Create My Account'}
            </button>
          </form>
          <p className="text-center text-xs text-earth-500 mt-4">
            Already registered? <Link to="/login" className="text-leaf-600 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
