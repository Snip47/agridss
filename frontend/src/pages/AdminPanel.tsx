import { useState, useEffect } from 'react'
import api from '../lib/api'
import { useAuth } from '../lib/auth'
import { Navigate } from 'react-router-dom'
import { Settings, Sprout, Beef, Bug, Users, CheckCircle, AlertCircle, Trash2, Plus, X } from 'lucide-react'

type Tab = 'crops'|'livestock'|'diseases'|'users'

function Toast({ msg, type }: { msg:string; type:'success'|'error' }) {
  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${type==='success'?'bg-leaf-600 text-white':'bg-red-600 text-white'}`}>
      {type==='success' ? <CheckCircle className="w-4 h-4"/> : <AlertCircle className="w-4 h-4"/>}
      {msg}
    </div>
  )
}

const inputCls = "w-full border border-earth-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-leaf-500"
const labelCls = "block text-xs font-semibold text-earth-600 mb-1"

function Field({ label, value, onChange, textarea, type='text', placeholder='' }:
  { label:string; value:string; onChange:(v:string)=>void; textarea?:boolean; type?:string; placeholder?:string }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {textarea
        ? <textarea value={value} onChange={e=>onChange(e.target.value)} rows={3} placeholder={placeholder} className={inputCls}/>
        : <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} className={inputCls}/>
      }
    </div>
  )
}

export default function AdminPanel() {
  const { user } = useAuth()
  const [tab, setTab] = useState<Tab>('crops')
  const [toast, setToast] = useState<{msg:string;type:'success'|'error'}|null>(null)
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState<any[]>([])

  const notify = (msg:string, type:'success'|'error') => {
    setToast({msg,type}); setTimeout(()=>setToast(null), 3500)
  }

  useEffect(() => {
    if (tab === 'users') api.get('/dashboard/users').then(r=>setUsers(r.data)).catch(()=>{})
  }, [tab])

  if (user?.role !== 'admin') return <Navigate to="/"/>

  // ─── Crop form ───
  const [crop, setCrop] = useState({
    name:'', category:'cereal', subcategory:'', description:'', care_tips:'',
    expected_yield:'', market_price_ksh:'', water_requirement:'moderate',
    maturity_days:'90', rainfall_min_mm:'400', rainfall_max_mm:'1600',
    altitude_min_m:'0', altitude_max_m:'3000',
    suitable_aez:'', soil_types:'', planting_months:'', diseases:'', best_counties:'',
  })

  const addCrop = async () => {
    if (!crop.name) return notify('Crop name is required','error')
    setLoading(true)
    try {
      await api.post('/crops/', {
        ...crop,
        maturity_days: parseInt(crop.maturity_days)||90,
        rainfall_min_mm: parseInt(crop.rainfall_min_mm)||400,
        rainfall_max_mm: parseInt(crop.rainfall_max_mm)||1600,
        altitude_min_m: parseInt(crop.altitude_min_m)||0,
        altitude_max_m: parseInt(crop.altitude_max_m)||3000,
        suitable_aez: crop.suitable_aez.split(',').map(s=>s.trim()).filter(Boolean),
        soil_types: crop.soil_types.split(',').map(s=>s.trim()).filter(Boolean),
        planting_months: crop.planting_months.split(',').map(s=>s.trim()).filter(Boolean),
        diseases: crop.diseases.split(',').map(s=>s.trim()).filter(Boolean),
        best_counties: crop.best_counties.split(',').map(s=>s.trim()).filter(Boolean),
        varieties: [],
      })
      notify('Crop added successfully!','success')
      setCrop(c=>({...c, name:'', description:'', care_tips:'', expected_yield:'', market_price_ksh:''}))
    } catch { notify('Failed to add crop','error') }
    setLoading(false)
  }

  // ─── Animal form ───
  const [animal, setAnimal] = useState({
    name:'', category:'cattle', purpose:'dairy', description:'',
    feeding_guide:'', housing_requirements:'', breeding_info:'', market_info:'',
    water_requirement:'', space_required:'', suitable_aez:'', common_diseases:'',
  })

  const addAnimal = async () => {
    if (!animal.name) return notify('Animal name is required','error')
    setLoading(true)
    try {
      await api.post('/livestock/', {
        ...animal,
        suitable_aez: animal.suitable_aez.split(',').map(s=>s.trim()).filter(Boolean),
        common_diseases: animal.common_diseases.split(',').map(s=>s.trim()).filter(Boolean),
        breeds: [], vaccination_schedule: [],
      })
      notify('Animal added!','success')
      setAnimal(a=>({...a,name:'',description:'',feeding_guide:'',housing_requirements:'',breeding_info:'',market_info:''}))
    } catch { notify('Failed to add animal','error') }
    setLoading(false)
  }

  // ─── Disease form ───
  const [disease, setDisease] = useState({
    name:'', type:'crop', affects:'', symptoms:'',
    causes:'', treatment:'', prevention:'', severity:'medium',
  })

  const addDisease = async () => {
    if (!disease.name) return notify('Disease name is required','error')
    setLoading(true)
    try {
      await api.post('/diseases/', disease)
      notify('Disease added!','success')
      setDisease(d=>({...d,name:'',affects:'',symptoms:'',causes:'',treatment:'',prevention:''}))
    } catch { notify('Failed to add disease','error') }
    setLoading(false)
  }

  const tabs = [
    { id:'crops' as Tab, icon:Sprout, label:'Crops' },
    { id:'livestock' as Tab, icon:Beef, label:'Livestock' },
    { id:'diseases' as Tab, icon:Bug, label:'Diseases' },
    { id:'users' as Tab, icon:Users, label:'Users' },
  ]

  const btnCls = (color:string) =>
    `${color} text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors disabled:opacity-50 flex items-center gap-2`

  return (
    <div>
      {toast && <Toast msg={toast.msg} type={toast.type}/>}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-earth-800 flex items-center gap-2"><Settings className="w-6 h-6 text-earth-600"/> Admin Panel</h1>
        <p className="text-earth-500 mt-1 text-sm">Manage AgriDSS knowledge base — add, view, and delete crops, livestock, diseases, and users.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-earth-100 overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-earth-100">
          {tabs.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-colors ${tab===t.id?'border-leaf-500 text-leaf-700':'border-transparent text-earth-400 hover:text-earth-600'}`}>
              <t.icon className="w-4 h-4"/>{t.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* CROPS */}
          {tab==='crops' && (
            <div className="max-w-2xl">
              <h2 className="font-bold text-earth-800 mb-4 flex items-center gap-2"><Plus className="w-4 h-4"/> Add New Crop</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Crop Name *" value={crop.name} onChange={v=>setCrop(c=>({...c,name:v}))} placeholder="e.g. Cassava (Muhogo)"/>
                  <div>
                    <label className={labelCls}>Category</label>
                    <select value={crop.category} onChange={e=>setCrop(c=>({...c,category:e.target.value}))} className={inputCls}>
                      {['cereal','legume','vegetable','fruit','cash crop'].map(o=><option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                  <Field label="Sub-category" value={crop.subcategory} onChange={v=>setCrop(c=>({...c,subcategory:v}))} placeholder="e.g. root vegetable"/>
                  <div>
                    <label className={labelCls}>Water Requirement</label>
                    <select value={crop.water_requirement} onChange={e=>setCrop(c=>({...c,water_requirement:e.target.value}))} className={inputCls}>
                      {['low','moderate','high'].map(o=><option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <Field label="Maturity Days" value={crop.maturity_days} onChange={v=>setCrop(c=>({...c,maturity_days:v}))} type="number"/>
                  <Field label="Min Rainfall (mm)" value={crop.rainfall_min_mm} onChange={v=>setCrop(c=>({...c,rainfall_min_mm:v}))} type="number"/>
                  <Field label="Max Rainfall (mm)" value={crop.rainfall_max_mm} onChange={v=>setCrop(c=>({...c,rainfall_max_mm:v}))} type="number"/>
                  <Field label="Min Altitude (m)" value={crop.altitude_min_m} onChange={v=>setCrop(c=>({...c,altitude_min_m:v}))} type="number"/>
                  <Field label="Max Altitude (m)" value={crop.altitude_max_m} onChange={v=>setCrop(c=>({...c,altitude_max_m:v}))} type="number"/>
                </div>
                <Field label="Suitable AEZ Codes (comma-separated, e.g. LH2,LH3,UM2)" value={crop.suitable_aez} onChange={v=>setCrop(c=>({...c,suitable_aez:v}))} placeholder="LH2,LH3,UM2"/>
                <Field label="Soil Types (comma-separated)" value={crop.soil_types} onChange={v=>setCrop(c=>({...c,soil_types:v}))} placeholder="loam, clay loam, sandy loam"/>
                <Field label="Planting Months (comma-separated)" value={crop.planting_months} onChange={v=>setCrop(c=>({...c,planting_months:v}))} placeholder="March, April, October"/>
                <Field label="Description" value={crop.description} onChange={v=>setCrop(c=>({...c,description:v}))} textarea placeholder="Brief description of this crop..."/>
                <Field label="Care Tips" value={crop.care_tips} onChange={v=>setCrop(c=>({...c,care_tips:v}))} textarea placeholder="Fertilizer, spacing, pest control tips..."/>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Expected Yield" value={crop.expected_yield} onChange={v=>setCrop(c=>({...c,expected_yield:v}))} placeholder="e.g. 20-40 bags/acre"/>
                  <Field label="Market Price (KSh)" value={crop.market_price_ksh} onChange={v=>setCrop(c=>({...c,market_price_ksh:v}))} placeholder="e.g. 3000-4500 per 90kg bag"/>
                </div>
                <Field label="Common Diseases/Pests (comma-separated)" value={crop.diseases} onChange={v=>setCrop(c=>({...c,diseases:v}))} placeholder="Late Blight, Aphids, Stalk Borer"/>
                <Field label="Best Counties (comma-separated)" value={crop.best_counties} onChange={v=>setCrop(c=>({...c,best_counties:v}))} placeholder="Nakuru, Nyandarua, Meru"/>
                <button onClick={addCrop} disabled={loading} className={btnCls('bg-leaf-600 hover:bg-leaf-700')}>
                  <Plus className="w-4 h-4"/>{loading?'Adding...':'Add Crop'}
                </button>
              </div>
            </div>
          )}

          {/* LIVESTOCK */}
          {tab==='livestock' && (
            <div className="max-w-2xl">
              <h2 className="font-bold text-earth-800 mb-4 flex items-center gap-2"><Plus className="w-4 h-4"/> Add New Animal</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Animal Name *" value={animal.name} onChange={v=>setAnimal(a=>({...a,name:v}))} placeholder="e.g. Sheep (Kondoo)"/>
                  <div>
                    <label className={labelCls}>Category</label>
                    <select value={animal.category} onChange={e=>setAnimal(a=>({...a,category:e.target.value}))} className={inputCls}>
                      {['cattle','goat','sheep','poultry','rabbit','pig','fish','bees','camel','donkey'].map(o=><option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Purpose</label>
                    <select value={animal.purpose} onChange={e=>setAnimal(a=>({...a,purpose:e.target.value}))} className={inputCls}>
                      {['dairy','meat','eggs','dual','honey/pollination','draft/transport','meat/wool'].map(o=><option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                  <Field label="Water Requirement" value={animal.water_requirement} onChange={v=>setAnimal(a=>({...a,water_requirement:v}))} placeholder="e.g. 60-80 litres/day"/>
                  <Field label="Space Required" value={animal.space_required} onChange={v=>setAnimal(a=>({...a,space_required:v}))} placeholder="e.g. 3x4m per animal"/>
                </div>
                <Field label="Suitable AEZ Codes" value={animal.suitable_aez} onChange={v=>setAnimal(a=>({...a,suitable_aez:v}))} placeholder="LH2,LH3,UM2 or All zones"/>
                <Field label="Description" value={animal.description} onChange={v=>setAnimal(a=>({...a,description:v}))} textarea placeholder="Brief description..."/>
                <Field label="Feeding Guide" value={animal.feeding_guide} onChange={v=>setAnimal(a=>({...a,feeding_guide:v}))} textarea placeholder="What and how much to feed..."/>
                <Field label="Housing Requirements" value={animal.housing_requirements} onChange={v=>setAnimal(a=>({...a,housing_requirements:v}))} textarea placeholder="Housing size, type, features..."/>
                <Field label="Breeding Information" value={animal.breeding_info} onChange={v=>setAnimal(a=>({...a,breeding_info:v}))} textarea placeholder="Mating, gestation, weaning..."/>
                <Field label="Market Information" value={animal.market_info} onChange={v=>setAnimal(a=>({...a,market_info:v}))} textarea placeholder="Price, markets, buyers..."/>
                <Field label="Common Diseases (comma-separated)" value={animal.common_diseases} onChange={v=>setAnimal(a=>({...a,common_diseases:v}))} placeholder="ECF, Mastitis, Worms"/>
                <button onClick={addAnimal} disabled={loading} className={btnCls('bg-earth-600 hover:bg-earth-700')}>
                  <Plus className="w-4 h-4"/>{loading?'Adding...':'Add Animal'}
                </button>
              </div>
            </div>
          )}

          {/* DISEASES */}
          {tab==='diseases' && (
            <div className="max-w-2xl">
              <h2 className="font-bold text-earth-800 mb-4 flex items-center gap-2"><Plus className="w-4 h-4"/> Add New Disease</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Disease Name *" value={disease.name} onChange={v=>setDisease(d=>({...d,name:v}))} placeholder="e.g. Cassava Mosaic Virus"/>
                  <div>
                    <label className={labelCls}>Type</label>
                    <select value={disease.type} onChange={e=>setDisease(d=>({...d,type:e.target.value}))} className={inputCls}>
                      <option value="crop">Crop Disease</option>
                      <option value="livestock">Livestock Disease</option>
                    </select>
                  </div>
                  <Field label="Affects" value={disease.affects} onChange={v=>setDisease(d=>({...d,affects:v}))} placeholder="e.g. Cassava, Maize"/>
                  <div>
                    <label className={labelCls}>Severity</label>
                    <select value={disease.severity} onChange={e=>setDisease(d=>({...d,severity:e.target.value}))} className={inputCls}>
                      {['low','medium','high','critical'].map(o=><option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                </div>
                <Field label="Symptoms" value={disease.symptoms} onChange={v=>setDisease(d=>({...d,symptoms:v}))} textarea placeholder="List visible symptoms..."/>
                <Field label="Causes" value={disease.causes} onChange={v=>setDisease(d=>({...d,causes:v}))} textarea placeholder="Pathogen, vector, conditions..."/>
                <Field label="Treatment" value={disease.treatment} onChange={v=>setDisease(d=>({...d,treatment:v}))} textarea placeholder="Specific treatment including product names and doses..."/>
                <Field label="Prevention" value={disease.prevention} onChange={v=>setDisease(d=>({...d,prevention:v}))} textarea placeholder="Prevention measures and good practices..."/>
                <button onClick={addDisease} disabled={loading} className={btnCls('bg-red-600 hover:bg-red-700')}>
                  <Plus className="w-4 h-4"/>{loading?'Adding...':'Add Disease'}
                </button>
              </div>
            </div>
          )}

          {/* USERS */}
          {tab==='users' && (
            <div>
              <h2 className="font-bold text-earth-800 mb-4">Registered Farmers & Admins ({users.length})</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-earth-100">
                      {['#','Name','Email','Role','County','Joined'].map(h=>(
                        <th key={h} className="text-left text-xs font-semibold text-earth-500 uppercase py-2 px-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u,i)=>(
                      <tr key={u.id} className="border-b border-earth-50 hover:bg-earth-50">
                        <td className="py-2.5 px-3 text-earth-400 text-xs">{i+1}</td>
                        <td className="py-2.5 px-3 font-medium text-earth-800">{u.name}</td>
                        <td className="py-2.5 px-3 text-earth-500">{u.email}</td>
                        <td className="py-2.5 px-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${u.role==='admin'?'bg-earth-200 text-earth-700':'bg-leaf-100 text-leaf-700'}`}>{u.role}</span>
                        </td>
                        <td className="py-2.5 px-3 text-earth-500">{u.county||'—'}</td>
                        <td className="py-2.5 px-3 text-earth-400 text-xs">{new Date(u.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {users.length===0 && <p className="text-center text-earth-400 py-8 text-sm">No users found.</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
