import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { Leaf, AlertCircle, Eye, EyeOff, CheckCircle } from 'lucide-react'
import api from '../lib/api'
import { getBackground } from '../lib/backgroundImages'

const bg = getBackground('login')

const BLOCKED_DOMAINS = [
  'mailinator.com','guerrillamail.com','temp-mail.org','throwaway.email',
  'fakeinbox.com','trashmail.com','yopmail.com','tempmail.com','getnada.com',
]

function validateEmail(email: string): string {
  if (!email) return ''
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  if (!regex.test(email)) return 'Please enter a valid email (e.g. yourname@gmail.com)'
  const domain = email.split('@')[1]?.toLowerCase()
  if (!domain) return 'Invalid email format'
  if (domain === 'agridss.co.ke') return 'This domain is reserved. Use your personal email.'
  if (BLOCKED_DOMAINS.includes(domain)) return 'Please use a real email (gmail.com, yahoo.com, outlook.com)'
  const parts = domain.split('.')
  if (parts.length < 2 || parts[parts.length-1].length < 2) return 'Invalid email domain'
  return ''
}

const iStyle = {
  background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.18)',
  color:'white', borderRadius:'0.75rem', padding:'0.6rem 0.75rem',
  fontSize:'0.875rem', width:'100%'
}

export default function Register() {
  const [form, setForm] = useState({ name:'',email:'',password:'',county:'',constituency:'',ward:'',village:'',farm_size_acres:'' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [emailError, setEmailError] = useState('')
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
      setForm(f=>({...f,constituency:'',ward:''})); setConstituencies([]); setWards([])
    }
  }, [form.county])
  useEffect(() => {
    if (form.county && form.constituency) {
      api.get('/location/wards',{params:{county:form.county,constituency:form.constituency}}).then(r=>setWards(r.data)).catch(()=>{})
      setForm(f=>({...f,ward:''})); setWards([])
    }
  }, [form.constituency])

  const set = (k:string) => (e:React.ChangeEvent<HTMLInputElement|HTMLSelectElement>) => {
    setForm(f=>({...f,[k]:e.target.value}))
    if (k==='email') setEmailError(validateEmail(e.target.value))
  }

  const submit = async (e:React.FormEvent) => {
    e.preventDefault(); setError('')
    const emailErr = validateEmail(form.email)
    if (emailErr) { setEmailError(emailErr); return }
    if (!form.name.trim() || form.name.trim().length < 2) { setError('Please enter your full name'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    try { await register(form); navigate('/') }
    catch (err:any) { setError(err?.response?.data?.detail || 'Registration failed. Please try again.') }
    finally { setLoading(false) }
  }

  const emailOk = form.email && !emailError

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-8 relative overflow-hidden">
      <img src={bg} alt="" className="absolute inset-0 w-full h-full object-cover"/>
      <div className="absolute inset-0" style={{ background:'rgba(0,0,0,0.65)' }}/>

      <div className="w-full max-w-lg relative z-10">
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-3"
            style={{ background:'rgba(34,197,94,0.25)', backdropFilter:'blur(20px)', border:'1px solid rgba(34,197,94,0.4)' }}>
            <Leaf className="w-7 h-7 text-green-400"/>
          </div>
          <h1 className="text-3xl font-black text-white">Join AgriDSS</h1>
          <p className="text-white/45 mt-1 text-sm">Create your farmer account</p>
        </div>

        <div className="rounded-2xl p-6" style={{ background:'rgba(0,0,0,0.48)', backdropFilter:'blur(24px)', border:'1px solid rgba(255,255,255,0.12)' }}>
          {error && (
            <div className="flex items-center gap-2 rounded-xl p-3 mb-4 text-sm text-red-300"
              style={{ background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.3)' }}>
              <AlertCircle className="w-4 h-4 flex-shrink-0"/>{error}
            </div>
          )}

          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-white/55 mb-1.5">Full Name *</label>
              <input value={form.name} onChange={set('name')} required placeholder="e.g. John Kamau" style={iStyle}/>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/55 mb-1.5">Email Address *</label>
              <div className="relative">
                <input type="email" value={form.email} onChange={set('email')} required
                  placeholder="yourname@gmail.com"
                  style={{ ...iStyle, paddingRight:'2.5rem',
                    borderColor: emailError ? 'rgba(239,68,68,0.6)' : emailOk ? 'rgba(34,197,94,0.6)' : 'rgba(255,255,255,0.18)' }}/>
                {emailOk && <CheckCircle className="absolute right-3 top-2.5 w-4 h-4 text-green-400"/>}
              </div>
              {emailError && (
                <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3"/> {emailError}
                </p>
              )}
              {emailOk && <p className="text-xs text-green-400 mt-1">✓ Valid email address</p>}
              <p className="text-xs text-white/30 mt-1">Use a real email — gmail.com, yahoo.com, outlook.com etc.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/55 mb-1.5">Password *</label>
              <div className="relative">
                <input type={showPassword?'text':'password'} value={form.password} onChange={set('password')}
                  required minLength={6} placeholder="Minimum 6 characters"
                  style={{ ...iStyle, paddingRight:'2.75rem' }}/>
                <button type="button" onClick={()=>setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-white/40 hover:text-white/70">
                  {showPassword?<EyeOff className="w-4 h-4"/>:<Eye className="w-4 h-4"/>}
                </button>
              </div>
            </div>

            <div style={{ borderTop:'1px solid rgba(255,255,255,0.08)', paddingTop:'0.75rem' }}>
              <p className="text-xs font-bold text-green-400 mb-2">📍 Your Farm Location <span className="font-normal text-white/30">(for accurate recommendations)</span></p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key:'county', label:'County', options:counties, disabled:false, placeholder:'Select County' },
                  { key:'constituency', label:'Constituency', options:constituencies, disabled:!form.county, placeholder:form.county?'Select Constituency':'Select county first' },
                  { key:'ward', label:'Ward', options:wards, disabled:!form.constituency, placeholder:form.constituency?'Select Ward':'Select constituency first' },
                ].map(({ key, label, options, disabled, placeholder }) => (
                  <div key={key}>
                    <label className="block text-xs font-semibold text-white/45 mb-1">{label}</label>
                    <select value={(form as any)[key]} onChange={set(key)} disabled={disabled}
                      style={{ ...iStyle, opacity:disabled?0.4:1, cursor:disabled?'not-allowed':'pointer' }}>
                      <option value="">{placeholder}</option>
                      {options.map(o=><option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-semibold text-white/45 mb-1">Village/Area</label>
                  <input value={form.village} onChange={set('village')} placeholder="e.g. Githurai" style={iStyle}/>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-white/45 mb-1">Farm Size (acres)</label>
                  <input type="number" value={form.farm_size_acres} onChange={set('farm_size_acres')}
                    step="0.5" min="0" placeholder="e.g. 2.5" style={iStyle}/>
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading || !!emailError}
              className="w-full py-3 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-40"
              style={{ background:'rgba(34,197,94,0.85)', border:'1px solid rgba(34,197,94,0.5)' }}>
              {loading ? 'Creating account...' : 'Create My Account'}
            </button>
          </form>

          <p className="text-center text-xs text-white/35 mt-4">
            Already registered?{' '}
            <Link to="/login" className="text-green-400 font-semibold hover:text-green-300">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
