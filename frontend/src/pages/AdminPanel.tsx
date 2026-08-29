import { useState, useEffect } from 'react'
import api from '../lib/api'
import { Trash2, Users, Sprout, Beef, Bug, Plus, X, AlertTriangle, Shield } from 'lucide-react'

interface User { id:number; name:string; email:string; role:string; county?:string; constituency?:string; created_at:string }
interface Stats { crops:number; animals:number; diseases:number; users:number }

const G = ({ children, className='' }: { children:React.ReactNode; className?:string }) => (
  <div className={className} style={{ background:'rgba(0,0,0,0.38)', backdropFilter:'blur(18px)', border:'1px solid rgba(255,255,255,0.11)', borderRadius:'1rem' }}>{children}</div>
)

const Badge = ({ children, color='rgba(255,255,255,0.1)', text='rgba(255,255,255,0.7)' }: any) => (
  <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background:color, color:text }}>{children}</span>
)

export default function AdminPanel() {
  const [tab, setTab] = useState<'users'|'add'>('users')
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<Stats|null>(null)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState<number|null>(null)
  const [confirmDelete, setConfirmDelete] = useState<User|null>(null)
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')

  // Add forms
  const [cropForm, setCropForm] = useState({ name:'', category:'cereal', description:'', care_tips:'', expected_yield:'', market_price_ksh:'' })
  const [animalForm, setAnimalForm] = useState({ name:'', category:'cattle', purpose:'dairy', description:'', feeding_guide:'', housing_requirements:'' })
  const [diseaseForm, setDiseaseForm] = useState({ name:'', type:'crop', affects:'', symptoms:'', causes:'', treatment:'', prevention:'', severity:'medium' })

  useEffect(() => {
    fetchUsers()
    api.get('/dashboard/stats').then(r=>setStats(r.data)).catch(()=>{})
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const r = await api.get('/dashboard/users')
      setUsers(r.data)
    } catch { setError('Failed to load users') }
    setLoading(false)
  }

  const handleDeleteUser = async (user: User) => {
    setDeleting(user.id)
    try {
      await api.delete(`/dashboard/users/${user.id}`)
      setUsers(u => u.filter(x => x.id !== user.id))
      setConfirmDelete(null)
      setMsg(`User "${user.name}" deleted successfully.`)
      setTimeout(() => setMsg(''), 3000)
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Failed to delete user')
      setTimeout(() => setError(''), 3000)
    }
    setDeleting(null)
  }

  const addCrop = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post('/crops/', { ...cropForm, varieties:[], suitable_aez:[], soil_types:[], planting_months:[], diseases:[], best_counties:[], rainfall_min_mm:400, rainfall_max_mm:1200, altitude_min_m:0, altitude_max_m:2000, water_requirement:'moderate', maturity_days:90, subcategory:'' })
      setMsg('Crop added!'); setCropForm({ name:'', category:'cereal', description:'', care_tips:'', expected_yield:'', market_price_ksh:'' })
      setTimeout(() => setMsg(''), 3000)
    } catch (e:any) { setError(e?.response?.data?.detail || 'Failed'); setTimeout(()=>setError(''),3000) }
  }

  const addAnimal = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post('/livestock/', { ...animalForm, breeds:[], suitable_aez:[], vaccination_schedule:[], common_diseases:[], breeding_info:'', market_info:'', water_requirement:'', space_required:'' })
      setMsg('Livestock added!'); setAnimalForm({ name:'', category:'cattle', purpose:'dairy', description:'', feeding_guide:'', housing_requirements:'' })
      setTimeout(() => setMsg(''), 3000)
    } catch (e:any) { setError(e?.response?.data?.detail || 'Failed'); setTimeout(()=>setError(''),3000) }
  }

  const addDisease = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post('/diseases/', diseaseForm)
      setMsg('Disease added!'); setDiseaseForm({ name:'', type:'crop', affects:'', symptoms:'', causes:'', treatment:'', prevention:'', severity:'medium' })
      setTimeout(() => setMsg(''), 3000)
    } catch (e:any) { setError(e?.response?.data?.detail || 'Failed'); setTimeout(()=>setError(''),3000) }
  }

  const iStyle = {
    background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.15)',
    color:'white', borderRadius:'0.75rem', padding:'0.6rem 0.85rem',
    fontSize:'0.875rem', width:'100%', outline:'none'
  }
  const sStyle = { ...iStyle, cursor:'pointer' }

  return (
    <div className="slide-up">
      <div className="mb-6 flex items-center gap-3">
        <Shield className="w-7 h-7 text-purple-400"/>
        <div>
          <h1 className="text-3xl font-black text-white">Admin Panel</h1>
          <p className="text-white/45 text-sm">Manage users, crops, livestock and diseases</p>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label:'Crops', val:stats.crops, icon:'🌱', color:'rgba(34,197,94,0.7)' },
            { label:'Livestock', val:stats.animals, icon:'🐄', color:'rgba(251,191,36,0.7)' },
            { label:'Diseases', val:stats.diseases, icon:'🦠', color:'rgba(239,68,68,0.7)' },
            { label:'Users', val:stats.users, icon:'👥', color:'rgba(96,165,250,0.7)' },
          ].map(({ label, val, icon, color }) => (
            <div key={label} className="p-4 rounded-xl text-center"
              style={{ background:'rgba(0,0,0,0.35)', backdropFilter:'blur(16px)', border:'1px solid rgba(255,255,255,0.1)' }}>
              <div className="text-2xl mb-1">{icon}</div>
              <div className="text-2xl font-black text-white">{val}</div>
              <div className="text-xs text-white/45">{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Alerts */}
      {msg && (
        <div className="mb-4 px-4 py-3 rounded-xl text-sm font-medium text-green-300"
          style={{ background:'rgba(34,197,94,0.15)', border:'1px solid rgba(34,197,94,0.3)' }}>
          ✅ {msg}
        </div>
      )}
      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl text-sm font-medium text-red-300"
          style={{ background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.3)' }}>
          ❌ {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {[
          { id:'users', label:'👥 Users', icon:Users },
          { id:'add', label:'➕ Add Data', icon:Plus },
        ].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id as any)}
            className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
            style={tab===t.id
              ?{background:'rgba(168,85,247,0.7)',color:'white',border:'1px solid rgba(168,85,247,0.5)'}
              :{background:'rgba(255,255,255,0.07)',color:'rgba(255,255,255,0.6)',border:'1px solid rgba(255,255,255,0.12)'}}>
            {t.label}
          </button>
        ))}
      </div>

      {/* USERS TAB */}
      {tab==='users' && (
        <G className="overflow-hidden">
          <div className="p-4 border-b" style={{ borderColor:'rgba(255,255,255,0.08)' }}>
            <h2 className="font-bold text-white">Registered Users</h2>
            <p className="text-xs text-white/40 mt-0.5">{users.length} total users · Admin accounts cannot be deleted</p>
          </div>
          {loading ? (
            <div className="p-8 text-center text-white/40 text-sm">Loading users...</div>
          ) : (
            <div className="divide-y" style={{ divideColor:'rgba(255,255,255,0.06)' }}>
              {users.map(u=>(
                <div key={u.id} className="flex items-center justify-between px-4 py-3 gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                      style={{ background: u.role==='admin' ? 'rgba(168,85,247,0.5)' : 'rgba(34,197,94,0.4)', border:`1px solid ${u.role==='admin'?'rgba(168,85,247,0.5)':'rgba(34,197,94,0.4)'}` }}>
                      {u.name?.[0]?.toUpperCase()||'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-white text-sm">{u.name}</span>
                        <Badge
                          color={u.role==='admin'?'rgba(168,85,247,0.25)':'rgba(34,197,94,0.2)'}
                          text={u.role==='admin'?'#c084fc':'#4ade80'}>
                          {u.role}
                        </Badge>
                      </div>
                      <div className="text-xs text-white/40 truncate">{u.email}</div>
                      {u.county && <div className="text-xs text-white/30">📍 {u.county}{u.constituency?`, ${u.constituency}`:''}</div>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-white/25 hidden sm:block">
                      {new Date(u.created_at).toLocaleDateString('en-KE',{day:'numeric',month:'short',year:'2-digit'})}
                    </span>
                    {u.role !== 'admin' ? (
                      <button
                        onClick={()=>setConfirmDelete(u)}
                        disabled={deleting===u.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                        style={{ background:'rgba(239,68,68,0.15)', color:'#f87171', border:'1px solid rgba(239,68,68,0.3)' }}
                        onMouseEnter={e=>(e.currentTarget.style.background='rgba(239,68,68,0.3)')}
                        onMouseLeave={e=>(e.currentTarget.style.background='rgba(239,68,68,0.15)')}>
                        <Trash2 className="w-3.5 h-3.5"/>
                        Delete
                      </button>
                    ) : (
                      <span className="text-xs text-white/20 px-3 py-1.5">Protected</span>
                    )}
                  </div>
                </div>
              ))}
              {users.length===0 && (
                <div className="p-8 text-center text-white/40 text-sm">No users found.</div>
              )}
            </div>
          )}
        </G>
      )}

      {/* ADD DATA TAB */}
      {tab==='add' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Add Crop */}
          <G className="p-5">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <Sprout className="w-4 h-4 text-green-400"/> Add Crop
            </h3>
            <form onSubmit={addCrop} className="space-y-3">
              {[
                { k:'name', ph:'Crop name e.g. Yam' },
                { k:'description', ph:'Brief description' },
                { k:'care_tips', ph:'Care tips' },
                { k:'expected_yield', ph:'Expected yield' },
                { k:'market_price_ksh', ph:'Market price (KSh)' },
              ].map(({ k, ph }) => (
                <input key={k} value={(cropForm as any)[k]} onChange={e=>setCropForm(f=>({...f,[k]:e.target.value}))}
                  placeholder={ph} required={k==='name'} style={iStyle}/>
              ))}
              <select value={cropForm.category} onChange={e=>setCropForm(f=>({...f,category:e.target.value}))} style={sStyle}>
                {['cereal','legume','vegetable','fruit','cash crop','flower'].map(c=><option key={c} value={c}>{c}</option>)}
              </select>
              <button type="submit" className="w-full py-2.5 rounded-xl font-bold text-sm text-white"
                style={{ background:'rgba(34,197,94,0.7)', border:'1px solid rgba(34,197,94,0.5)' }}>
                Add Crop
              </button>
            </form>
          </G>

          {/* Add Livestock */}
          <G className="p-5">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <Beef className="w-4 h-4 text-amber-400"/> Add Livestock
            </h3>
            <form onSubmit={addAnimal} className="space-y-3">
              {[
                { k:'name', ph:'Animal name e.g. Goat' },
                { k:'description', ph:'Brief description' },
                { k:'feeding_guide', ph:'Feeding guide' },
                { k:'housing_requirements', ph:'Housing requirements' },
              ].map(({ k, ph }) => (
                <input key={k} value={(animalForm as any)[k]} onChange={e=>setAnimalForm(f=>({...f,[k]:e.target.value}))}
                  placeholder={ph} required={k==='name'} style={iStyle}/>
              ))}
              <select value={animalForm.category} onChange={e=>setAnimalForm(f=>({...f,category:e.target.value}))} style={sStyle}>
                {['cattle','goat','sheep','poultry','rabbit','pig','fish','bees','camel','donkey','duck','quail','ostrich'].map(c=><option key={c} value={c}>{c}</option>)}
              </select>
              <select value={animalForm.purpose} onChange={e=>setAnimalForm(f=>({...f,purpose:e.target.value}))} style={sStyle}>
                {['dairy','meat','dual','eggs','honey','draft/transport'].map(p=><option key={p} value={p}>{p}</option>)}
              </select>
              <button type="submit" className="w-full py-2.5 rounded-xl font-bold text-sm text-white"
                style={{ background:'rgba(251,191,36,0.7)', border:'1px solid rgba(251,191,36,0.5)' }}>
                Add Livestock
              </button>
            </form>
          </G>

          {/* Add Disease */}
          <G className="p-5">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <Bug className="w-4 h-4 text-red-400"/> Add Disease
            </h3>
            <form onSubmit={addDisease} className="space-y-3">
              {[
                { k:'name', ph:'Disease name' },
                { k:'affects', ph:'Affects e.g. Maize, Cattle' },
                { k:'symptoms', ph:'Symptoms' },
                { k:'causes', ph:'Causes' },
                { k:'treatment', ph:'Treatment' },
                { k:'prevention', ph:'Prevention' },
              ].map(({ k, ph }) => (
                <input key={k} value={(diseaseForm as any)[k]} onChange={e=>setDiseaseForm(f=>({...f,[k]:e.target.value}))}
                  placeholder={ph} required={k==='name'} style={iStyle}/>
              ))}
              <div className="grid grid-cols-2 gap-2">
                <select value={diseaseForm.type} onChange={e=>setDiseaseForm(f=>({...f,type:e.target.value}))} style={sStyle}>
                  <option value="crop">Crop</option>
                  <option value="livestock">Livestock</option>
                </select>
                <select value={diseaseForm.severity} onChange={e=>setDiseaseForm(f=>({...f,severity:e.target.value}))} style={sStyle}>
                  {['low','medium','high','critical'].map(s=><option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <button type="submit" className="w-full py-2.5 rounded-xl font-bold text-sm text-white"
                style={{ background:'rgba(239,68,68,0.7)', border:'1px solid rgba(239,68,68,0.5)' }}>
                Add Disease
              </button>
            </form>
          </G>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={()=>setConfirmDelete(null)}/>
          <div className="relative w-full max-w-sm rounded-2xl p-6 z-10"
            style={{ background:'rgba(20,20,30,0.95)', border:'1px solid rgba(239,68,68,0.4)', backdropFilter:'blur(20px)' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background:'rgba(239,68,68,0.2)' }}>
                <AlertTriangle className="w-5 h-5 text-red-400"/>
              </div>
              <div>
                <h3 className="font-bold text-white">Delete User</h3>
                <p className="text-xs text-white/40">This cannot be undone</p>
              </div>
              <button onClick={()=>setConfirmDelete(null)} className="ml-auto text-white/40 hover:text-white">
                <X className="w-5 h-5"/>
              </button>
            </div>
            <div className="p-3 rounded-xl mb-4" style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)' }}>
              <div className="font-semibold text-white text-sm">{confirmDelete.name}</div>
              <div className="text-xs text-white/45">{confirmDelete.email}</div>
              {confirmDelete.county && <div className="text-xs text-white/30 mt-0.5">📍 {confirmDelete.county}</div>}
            </div>
            <p className="text-sm text-white/60 mb-5">
              Are you sure you want to permanently delete this farmer account? All their data will be removed.
            </p>
            <div className="flex gap-3">
              <button onClick={()=>setConfirmDelete(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white/60 transition-all"
                style={{ background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.1)' }}>
                Cancel
              </button>
              <button onClick={()=>handleDeleteUser(confirmDelete)}
                disabled={deleting===confirmDelete.id}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all flex items-center justify-center gap-2"
                style={{ background:'rgba(239,68,68,0.8)', border:'1px solid rgba(239,68,68,0.5)' }}>
                <Trash2 className="w-4 h-4"/>
                {deleting===confirmDelete.id ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
