import { useState, useEffect } from 'react'
import api from '../lib/api'
import { useAuth } from '../lib/auth'
import { Navigate } from 'react-router-dom'
import { Settings, Sprout, Beef, Bug, Users, CheckCircle, AlertCircle, Plus } from 'lucide-react'

type Tab = 'crops'|'livestock'|'diseases'|'users'

const G = ({ children, className='' }: { children:React.ReactNode; className?:string }) => (
  <div className={className} style={{ background:'rgba(0,0,0,0.38)', backdropFilter:'blur(18px)', border:'1px solid rgba(255,255,255,0.11)', borderRadius:'1rem' }}>{children}</div>
)

const inputStyle = { background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.18)', color:'white', borderRadius:'0.75rem', padding:'0.5rem 0.75rem', fontSize:'0.875rem', width:'100%' }

const Field = ({ label, value, onChange, textarea, type='text', placeholder='' }:
  { label:string; value:string; onChange:(v:string)=>void; textarea?:boolean; type?:string; placeholder?:string }) => (
  <div>
    <label className="block text-xs font-semibold text-white/50 mb-1.5">{label}</label>
    {textarea
      ? <textarea value={value} onChange={e=>onChange(e.target.value)} rows={3} placeholder={placeholder} style={{...inputStyle,resize:'vertical'}}/>
      : <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={inputStyle}/>
    }
  </div>
)

export default function AdminPanel() {
  const { user } = useAuth()
  const [tab, setTab] = useState<Tab>('crops')
  const [toast, setToast] = useState<{msg:string;type:'success'|'error'}|null>(null)
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState<any[]>([])

  const notify = (msg:string, type:'success'|'error') => { setToast({msg,type}); setTimeout(()=>setToast(null),3500) }

  useEffect(() => {
    if (tab==='users') api.get('/dashboard/users').then(r=>setUsers(r.data)).catch(()=>{})
  }, [tab])

  if (user?.role!=='admin') return <Navigate to="/"/>

  const [crop, setCrop] = useState({ name:'',category:'cereal',subcategory:'',description:'',care_tips:'',expected_yield:'',market_price_ksh:'',water_requirement:'moderate',maturity_days:'90',rainfall_min_mm:'400',rainfall_max_mm:'1600',altitude_min_m:'0',altitude_max_m:'3000',suitable_aez:'',soil_types:'',planting_months:'',diseases:'',best_counties:'' })
  const [animal, setAnimal] = useState({ name:'',category:'cattle',purpose:'dairy',description:'',feeding_guide:'',housing_requirements:'',breeding_info:'',market_info:'',water_requirement:'',space_required:'',suitable_aez:'',common_diseases:'' })
  const [disease, setDisease] = useState({ name:'',type:'crop',affects:'',symptoms:'',causes:'',treatment:'',prevention:'',severity:'medium' })

  const addCrop = async () => {
    if (!crop.name) return notify('Crop name is required','error')
    setLoading(true)
    try {
      await api.post('/crops/', { ...crop, maturity_days:parseInt(crop.maturity_days)||90, rainfall_min_mm:parseInt(crop.rainfall_min_mm)||400, rainfall_max_mm:parseInt(crop.rainfall_max_mm)||1600, altitude_min_m:parseInt(crop.altitude_min_m)||0, altitude_max_m:parseInt(crop.altitude_max_m)||3000, suitable_aez:crop.suitable_aez.split(',').map(s=>s.trim()).filter(Boolean), soil_types:crop.soil_types.split(',').map(s=>s.trim()).filter(Boolean), planting_months:crop.planting_months.split(',').map(s=>s.trim()).filter(Boolean), diseases:crop.diseases.split(',').map(s=>s.trim()).filter(Boolean), best_counties:crop.best_counties.split(',').map(s=>s.trim()).filter(Boolean), varieties:[] })
      notify('Crop added!','success')
      setCrop(c=>({...c,name:'',description:'',care_tips:'',expected_yield:'',market_price_ksh:''}))
    } catch { notify('Failed to add crop','error') }
    setLoading(false)
  }

  const addAnimal = async () => {
    if (!animal.name) return notify('Animal name is required','error')
    setLoading(true)
    try {
      await api.post('/livestock/', { ...animal, suitable_aez:animal.suitable_aez.split(',').map(s=>s.trim()).filter(Boolean), common_diseases:animal.common_diseases.split(',').map(s=>s.trim()).filter(Boolean), breeds:[], vaccination_schedule:[] })
      notify('Animal added!','success')
      setAnimal(a=>({...a,name:'',description:'',feeding_guide:'',housing_requirements:'',breeding_info:'',market_info:''}))
    } catch { notify('Failed to add animal','error') }
    setLoading(false)
  }

  const addDisease = async () => {
    if (!disease.name) return notify('Disease name is required','error')
    setLoading(true)
    try { await api.post('/diseases/', disease); notify('Disease added!','success'); setDisease(d=>({...d,name:'',affects:'',symptoms:'',causes:'',treatment:'',prevention:''})) }
    catch { notify('Failed to add disease','error') }
    setLoading(false)
  }

  const tabs = [{ id:'crops' as Tab,icon:Sprout,label:'Crops',color:'text-green-400' },{ id:'livestock' as Tab,icon:Beef,label:'Livestock',color:'text-amber-400' },{ id:'diseases' as Tab,icon:Bug,label:'Diseases',color:'text-red-400' },{ id:'users' as Tab,icon:Users,label:'Users',color:'text-blue-400' }]

  const btnColors:Record<Tab,string> = { crops:'rgba(34,197,94,0.7)', livestock:'rgba(251,191,36,0.7)', diseases:'rgba(239,68,68,0.7)', users:'rgba(96,165,250,0.7)' }

  return (
    <div className="slide-up">
      {toast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-white shadow-2xl"
          style={toast.type==='success'?{background:'rgba(34,197,94,0.85)',border:'1px solid rgba(34,197,94,0.5)'}:{background:'rgba(239,68,68,0.85)',border:'1px solid rgba(239,68,68,0.5)'}}>
          {toast.type==='success'?<CheckCircle className="w-4 h-4"/>:<AlertCircle className="w-4 h-4"/>}
          {toast.msg}
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-4xl font-black text-white flex items-center gap-3 drop-shadow-2xl">
          <Settings className="w-9 h-9 text-white/60"/> Admin Panel
        </h1>
        <p className="text-white/55 mt-2">Manage the AgriDSS knowledge base — crops, livestock, diseases and users.</p>
      </div>

      <G className="overflow-hidden">
        {/* Tabs */}
        <div className="flex" style={{ borderBottom:'1px solid rgba(255,255,255,0.09)' }}>
          {tabs.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-bold transition-all ${tab===t.id?`${t.color}`:'text-white/40 hover:text-white/65'}`}
              style={tab===t.id?{borderBottom:`2px solid currentColor`}:{borderBottom:'2px solid transparent'}}>
              <t.icon className="w-4 h-4"/>{t.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {tab==='crops' && (
            <div className="max-w-2xl space-y-4">
              <h2 className="font-bold text-white flex items-center gap-2"><Plus className="w-4 h-4 text-green-400"/> Add New Crop</h2>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Crop Name *" value={crop.name} onChange={v=>setCrop(c=>({...c,name:v}))} placeholder="e.g. Cassava (Muhogo)"/>
                <div><label className="block text-xs font-semibold text-white/50 mb-1.5">Category</label>
                  <select value={crop.category} onChange={e=>setCrop(c=>({...c,category:e.target.value}))} style={inputStyle}>
                    {['cereal','legume','vegetable','fruit','cash crop'].map(o=><option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <Field label="Sub-category" value={crop.subcategory} onChange={v=>setCrop(c=>({...c,subcategory:v}))} placeholder="e.g. root vegetable"/>
                <div><label className="block text-xs font-semibold text-white/50 mb-1.5">Water Requirement</label>
                  <select value={crop.water_requirement} onChange={e=>setCrop(c=>({...c,water_requirement:e.target.value}))} style={inputStyle}>
                    {['low','moderate','high'].map(o=><option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <Field label="Maturity Days" value={crop.maturity_days} onChange={v=>setCrop(c=>({...c,maturity_days:v}))} type="number"/>
                <Field label="Min Rainfall (mm)" value={crop.rainfall_min_mm} onChange={v=>setCrop(c=>({...c,rainfall_min_mm:v}))} type="number"/>
                <Field label="Max Rainfall (mm)" value={crop.rainfall_max_mm} onChange={v=>setCrop(c=>({...c,rainfall_max_mm:v}))} type="number"/>
              </div>
              <Field label="AEZ Codes (comma-separated e.g. LH2,LH3,UM2)" value={crop.suitable_aez} onChange={v=>setCrop(c=>({...c,suitable_aez:v}))} placeholder="LH2,LH3,UM2"/>
              <Field label="Soil Types (comma-separated)" value={crop.soil_types} onChange={v=>setCrop(c=>({...c,soil_types:v}))} placeholder="loam, clay loam, sandy loam"/>
              <Field label="Planting Months (comma-separated)" value={crop.planting_months} onChange={v=>setCrop(c=>({...c,planting_months:v}))} placeholder="March, April, October"/>
              <Field label="Description" value={crop.description} onChange={v=>setCrop(c=>({...c,description:v}))} textarea placeholder="Brief description..."/>
              <Field label="Care Tips" value={crop.care_tips} onChange={v=>setCrop(c=>({...c,care_tips:v}))} textarea placeholder="Fertilizer, spacing, pest control..."/>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Expected Yield" value={crop.expected_yield} onChange={v=>setCrop(c=>({...c,expected_yield:v}))} placeholder="e.g. 20-40 bags/acre"/>
                <Field label="Market Price (KSh)" value={crop.market_price_ksh} onChange={v=>setCrop(c=>({...c,market_price_ksh:v}))} placeholder="e.g. 3000-4500 per 90kg"/>
              </div>
              <Field label="Common Diseases (comma-separated)" value={crop.diseases} onChange={v=>setCrop(c=>({...c,diseases:v}))} placeholder="Late Blight, Aphids, Stalk Borer"/>
              <Field label="Best Counties (comma-separated)" value={crop.best_counties} onChange={v=>setCrop(c=>({...c,best_counties:v}))} placeholder="Nakuru, Nyandarua, Meru"/>
              <button onClick={addCrop} disabled={loading} className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-50"
                style={{ background:btnColors[tab], border:'1px solid rgba(255,255,255,0.2)' }}>
                <Plus className="w-4 h-4"/>{loading?'Adding...':'Add Crop'}
              </button>
            </div>
          )}

          {tab==='livestock' && (
            <div className="max-w-2xl space-y-4">
              <h2 className="font-bold text-white flex items-center gap-2"><Plus className="w-4 h-4 text-amber-400"/> Add New Animal</h2>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Animal Name *" value={animal.name} onChange={v=>setAnimal(a=>({...a,name:v}))} placeholder="e.g. Sheep (Kondoo)"/>
                <div><label className="block text-xs font-semibold text-white/50 mb-1.5">Category</label>
                  <select value={animal.category} onChange={e=>setAnimal(a=>({...a,category:e.target.value}))} style={inputStyle}>
                    {['cattle','goat','sheep','poultry','rabbit','pig','fish','bees','camel','donkey'].map(o=><option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div><label className="block text-xs font-semibold text-white/50 mb-1.5">Purpose</label>
                  <select value={animal.purpose} onChange={e=>setAnimal(a=>({...a,purpose:e.target.value}))} style={inputStyle}>
                    {['dairy','meat','eggs','dual','honey/pollination','draft/transport','meat/wool'].map(o=><option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <Field label="Water Requirement" value={animal.water_requirement} onChange={v=>setAnimal(a=>({...a,water_requirement:v}))} placeholder="e.g. 60-80L/day"/>
                <Field label="Space Required" value={animal.space_required} onChange={v=>setAnimal(a=>({...a,space_required:v}))} placeholder="e.g. 3x4m per animal"/>
              </div>
              <Field label="AEZ Zones (comma-separated or 'All zones')" value={animal.suitable_aez} onChange={v=>setAnimal(a=>({...a,suitable_aez:v}))} placeholder="LH2,LH3,UM2"/>
              <Field label="Description" value={animal.description} onChange={v=>setAnimal(a=>({...a,description:v}))} textarea placeholder="Brief description..."/>
              <Field label="Feeding Guide" value={animal.feeding_guide} onChange={v=>setAnimal(a=>({...a,feeding_guide:v}))} textarea placeholder="What and how much to feed..."/>
              <Field label="Housing Requirements" value={animal.housing_requirements} onChange={v=>setAnimal(a=>({...a,housing_requirements:v}))} textarea placeholder="Housing size, type, features..."/>
              <Field label="Breeding Information" value={animal.breeding_info} onChange={v=>setAnimal(a=>({...a,breeding_info:v}))} textarea placeholder="Mating, gestation, weaning..."/>
              <Field label="Market Information" value={animal.market_info} onChange={v=>setAnimal(a=>({...a,market_info:v}))} textarea placeholder="Price, markets, buyers..."/>
              <Field label="Common Diseases (comma-separated)" value={animal.common_diseases} onChange={v=>setAnimal(a=>({...a,common_diseases:v}))} placeholder="ECF, Mastitis, Worms"/>
              <button onClick={addAnimal} disabled={loading} className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-50"
                style={{ background:btnColors[tab], border:'1px solid rgba(255,255,255,0.2)' }}>
                <Plus className="w-4 h-4"/>{loading?'Adding...':'Add Animal'}
              </button>
            </div>
          )}

          {tab==='diseases' && (
            <div className="max-w-2xl space-y-4">
              <h2 className="font-bold text-white flex items-center gap-2"><Plus className="w-4 h-4 text-red-400"/> Add New Disease</h2>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Disease Name *" value={disease.name} onChange={v=>setDisease(d=>({...d,name:v}))} placeholder="e.g. Cassava Mosaic Virus"/>
                <div><label className="block text-xs font-semibold text-white/50 mb-1.5">Type</label>
                  <select value={disease.type} onChange={e=>setDisease(d=>({...d,type:e.target.value}))} style={inputStyle}>
                    <option value="crop">Crop Disease</option>
                    <option value="livestock">Livestock Disease</option>
                  </select>
                </div>
                <Field label="Affects" value={disease.affects} onChange={v=>setDisease(d=>({...d,affects:v}))} placeholder="e.g. Cassava, Maize"/>
                <div><label className="block text-xs font-semibold text-white/50 mb-1.5">Severity</label>
                  <select value={disease.severity} onChange={e=>setDisease(d=>({...d,severity:e.target.value}))} style={inputStyle}>
                    {['low','medium','high','critical'].map(o=><option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              </div>
              <Field label="Symptoms" value={disease.symptoms} onChange={v=>setDisease(d=>({...d,symptoms:v}))} textarea placeholder="List visible symptoms..."/>
              <Field label="Causes" value={disease.causes} onChange={v=>setDisease(d=>({...d,causes:v}))} textarea placeholder="Pathogen, vector, conditions..."/>
              <Field label="Treatment" value={disease.treatment} onChange={v=>setDisease(d=>({...d,treatment:v}))} textarea placeholder="Treatment with product names and doses..."/>
              <Field label="Prevention" value={disease.prevention} onChange={v=>setDisease(d=>({...d,prevention:v}))} textarea placeholder="Prevention measures..."/>
              <button onClick={addDisease} disabled={loading} className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-50"
                style={{ background:btnColors[tab], border:'1px solid rgba(255,255,255,0.2)' }}>
                <Plus className="w-4 h-4"/>{loading?'Adding...':'Add Disease'}
              </button>
            </div>
          )}

          {tab==='users' && (
            <div>
              <h2 className="font-bold text-white mb-4">Registered Users ({users.length})</h2>
              <div className="overflow-x-auto rounded-xl" style={{ border:'1px solid rgba(255,255,255,0.09)' }}>
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.09)', background:'rgba(255,255,255,0.04)' }}>
                      {['#','Name','Email','Role','County','Joined'].map(h=>(
                        <th key={h} className="text-left text-xs font-bold text-white/40 uppercase py-3 px-4">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u,i)=>(
                      <tr key={u.id} style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}
                        onMouseEnter={e=>(e.currentTarget.style.background='rgba(255,255,255,0.04)')}
                        onMouseLeave={e=>(e.currentTarget.style.background='transparent')}>
                        <td className="py-3 px-4 text-white/30 text-xs">{i+1}</td>
                        <td className="py-3 px-4 font-semibold text-white">{u.name}</td>
                        <td className="py-3 px-4 text-white/55">{u.email}</td>
                        <td className="py-3 px-4">
                          <span className="text-xs px-2 py-0.5 rounded-full font-semibold capitalize"
                            style={u.role==='admin'?{background:'rgba(251,191,36,0.2)',color:'#fbbf24',border:'1px solid rgba(251,191,36,0.3)'}:{background:'rgba(34,197,94,0.2)',color:'#4ade80',border:'1px solid rgba(34,197,94,0.3)'}}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-white/45">{u.county||'—'}</td>
                        <td className="py-3 px-4 text-white/30 text-xs">{new Date(u.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {users.length===0 && <div className="text-center py-10 text-white/30 text-sm">No users found.</div>}
              </div>
            </div>
          )}
        </div>
      </G>
    </div>
  )
}
