import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { Leaf, AlertCircle, Eye, EyeOff } from 'lucide-react'
import api from '../lib/api'
import { getBackground } from '../lib/backgroundImages'

const bg = getBackground('login')

const inputStyle = { background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.18)', color:'white' }

export default function Register() {
  const [form, setForm] = useState({ name:'',email:'',password:'',county:'',constituency:'',ward:'',village:'',farm_size_acres:'' })
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
      setForm(f=>({...f,constituency:'',ward:''})); setConstituencies([]); setWards([])
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

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-8 relative overflow-hidden">
      <img src={bg} alt="" className="absolute inset-0 w-full h-full object-cover"/>
      <div className="absolute inset-0" style={{ background:'rgba(0,0,0,0.62)' }}/>

      <div className="w-full max-w-lg relative z-10">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-3"
            style={{ background:'rgba(34,197,94,0.25)', backdropFilter:'blur(20px)', border:'1px solid rgba(34,197,94,0.4)' }}>
            <Leaf className="w-8 h-8 text-green-400"/>
          </div>
          <h1 className="text-3xl font-black text-white">Join AgriDSS</h1>
          <p className="text-white/50 mt-1 text-sm">Create your farmer account</p>
        </div>

        <div className="rounded-2xl p-7" style={{ background:'rgba(0,0,0,0.45)', backdropFilter:'blur(24px)', border:'1px solid rgba(255,255,255,0.12)' }}>
          {error && (
            <div className="flex items-center gap-2 rounded-xl p-3 mb-4 text-sm text-red-300"
              style={{ background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.3)' }}>
              <AlertCircle className="w-4 h-4"/>{error}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-white/55 mb-1.5">Full Name</label>
              <input value={form.name} onChange={set('name')} required placeholder="John Kamau"
                className="w-full rounded-xl px-4 py-2.5 text-sm" style={inputStyle}/>
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/55 mb-1.5">Email</label>
              <input type="email" value={form.email} onChange={set('email')} required placeholder="you@email.com"
                className="w-full rounded-xl px-4 py-2.5 text-sm" style={inputStyle}/>
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/55 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPassword?'text':'password'} value={form.password} onChange={set('password')} required minLength={6}
                  placeholder="Min 6 characters"
                  className="w-full rounded-xl px-4 py-2.5 pr-11 text-sm" style={inputStyle}/>
                <button type="button" onClick={()=>setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70">
                  {showPassword?<EyeOff className="w-4 h-4"/>:<Eye className="w-4 h-4"/>}
                </button>
              </div>
            </div>

            <div style={{ borderTop:'1px solid rgba(255,255,255,0.08)', paddingTop:'1rem' }}>
              <p className="text-xs font-bold text-green-400 mb-3">📍 Your Location <span className="font-normal text-white/35">(for accurate recommendations)</span></p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  {key:'county',label:'County',options:counties,disabled:false,placeholder:'Select County'},
                  {key:'constituency',label:'Constituency',options:constituencies,disabled:!form.county,placeholder:form.county?'Select Constituency':'Select county first'},
                  {key:'ward',label:'Ward',options:wards,disabled:!form.constituency,placeholder:form.constituency?'Select Ward':'Select constituency first'},
                ].map(({key,label,options,disabled,placeholder})=>(
                  <div key={key}>
                    <label className="block text-xs font-semibold text-white/55 mb-1.5">{label}</label>
                    <select value={(form as any)[key]} onChange={set(key)} disabled={disabled}
                      className="w-full rounded-xl px-3 py-2.5 text-sm disabled:opacity-40 cursor-pointer"
                      style={inputStyle}>
                      <option value="">{placeholder}</option>
                      {options.map(o=><option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-semibold text-white/55 mb-1.5">Village/Area</label>
                  <input value={form.village} onChange={set('village')} placeholder="e.g. Githurai"
                    className="w-full rounded-xl px-3 py-2.5 text-sm" style={inputStyle}/>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-white/55 mb-1.5">Farm Size (acres)</label>
                  <input type="number" value={form.farm_size_acres} onChange={set('farm_size_acres')} step="0.5" min="0" placeholder="e.g. 2.5"
                    className="w-full rounded-xl px-3 py-2.5 text-sm" style={inputStyle}/>
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-50 mt-2"
              style={{ background:'rgba(34,197,94,0.85)', border:'1px solid rgba(34,197,94,0.5)' }}>
              {loading ? 'Creating account...' : 'Create My Account'}
            </button>
          </form>

          <p className="text-center text-xs text-white/40 mt-4">
            Already registered?{' '}
            <Link to="/login" className="text-green-400 font-semibold hover:text-green-300">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
