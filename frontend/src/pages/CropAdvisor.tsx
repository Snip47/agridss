import { useState, useEffect } from 'react'
import api from '../lib/api'
import { Search, Droplets, Clock, Trash2, X } from 'lucide-react'
import { useAuth } from '../lib/auth'
import { getCropImage } from '../lib/itemImages'

interface Variety { name:string; type:string; maturity_days?:number; notes:string }
interface Crop { id:number; name:string; category:string; subcategory:string; varieties:Variety[]; suitable_aez:string[]; rainfall_min_mm:number; rainfall_max_mm:number; altitude_min_m:number; altitude_max_m:number; water_requirement:string; soil_types:string[]; planting_months:string[]; maturity_days:number; description:string; care_tips:string; expected_yield:string; market_price_ksh:string; diseases:string[]; best_counties:string[] }

const CATS = ['cereal','legume','vegetable','fruit','cash crop','flower']
const CAT_EMOJI:Record<string,string> = { cereal:'🌾', legume:'🫘', vegetable:'🥬', fruit:'🍎', 'cash crop':'💰', flower:'🌸' }
const WATER_TEXT:Record<string,string> = { low:'#d97706', moderate:'#2563eb', high:'#0891b2' }
const FALLBACK = 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&q=80&fit=crop'

const Badge = ({ children, bg='#f3f4f6', text='#374151' }: any) => (
  <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background:bg, color:text }}>{children}</span>
)

export default function CropAdvisor() {
  const { user } = useAuth()
  const [crops, setCrops] = useState<Crop[]>([])
  const [filters, setFilters] = useState({ category:'', search:'' })
  const [selected, setSelected] = useState<Crop|null>(null)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState<number|null>(null)
  const [imgErrors, setImgErrors] = useState<Record<number,boolean>>({})

  const fetchCrops = async () => {
    setLoading(true)
    const p:any = {}
    if (filters.category) p.category = filters.category
    if (filters.search) p.search = filters.search
    const r = await api.get('/crops/', { params:p })
    setCrops(r.data); setLoading(false)
  }

  useEffect(() => { fetchCrops() }, [filters.category])

  const deleteCrop = async (id:number) => {
    if (!confirm('Delete this crop?')) return
    setDeleting(id)
    await api.delete(`/crops/${id}`)
    setCrops(c=>c.filter(x=>x.id!==id))
    if (selected?.id===id) setSelected(null)
    setDeleting(null)
  }

  const handleImgError = (id:number, e:React.SyntheticEvent<HTMLImageElement>) => {
    setImgErrors(prev=>({...prev,[id]:true}));
    (e.target as HTMLImageElement).src = FALLBACK
  }

  return (
    <div className="fade-in max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1" style={{ fontFamily:'Lora, serif', color:'var(--text)' }}>🌱 Crop Advisor</h1>
        <p className="text-sm" style={{ color:'var(--text-muted)' }}>{crops.length} crops — varieties, planting calendars, yields and market prices</p>
      </div>

      {/* Filters */}
      <div className="p-4 rounded-xl mb-5" style={{ background:'white', border:'1px solid var(--border)' }}>
        <div className="flex flex-wrap gap-2 mb-3">
          <button onClick={()=>setFilters(f=>({...f,category:''}))}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={!filters.category?{background:'var(--green)',color:'white',border:'1px solid var(--green)'}:{background:'white',color:'var(--text-muted)',border:'1px solid var(--border)'}}>
            All
          </button>
          {CATS.map(c=>(
            <button key={c} onClick={()=>setFilters(f=>({...f,category:c}))}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize"
              style={filters.category===c?{background:'var(--green)',color:'white',border:'1px solid var(--green)'}:{background:'white',color:'var(--text-muted)',border:'1px solid var(--border)'}}>
              {CAT_EMOJI[c]} {c}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4" style={{ color:'var(--text-muted)' }}/>
            <input placeholder="Search crops..." value={filters.search}
              onChange={e=>setFilters(f=>({...f,search:e.target.value}))}
              onKeyDown={e=>e.key==='Enter'&&fetchCrops()}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg outline-none"
              style={{ border:'1px solid var(--border)', background:'var(--bg)', color:'var(--text)' }}
              onFocus={e=>(e.target.style.borderColor='#16a34a')}
              onBlur={e=>(e.target.style.borderColor='var(--border)')}/>
          </div>
          <button onClick={fetchCrops} className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ background:'var(--green)' }}>Search</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* List */}
        <div className="lg:col-span-2 space-y-2 max-h-[70vh] overflow-y-auto pr-1">
          {loading && <p className="text-center py-8 text-sm" style={{ color:'var(--text-muted)' }}>Loading...</p>}
          {!loading && crops.length===0 && <div className="text-center py-8 text-sm" style={{ color:'var(--text-muted)' }}>No crops found.</div>}
          {crops.map(crop=>(
            <div key={crop.id} onClick={()=>setSelected(crop)}
              className="rounded-xl cursor-pointer transition-all overflow-hidden"
              style={selected?.id===crop.id?{border:'2px solid var(--green)',background:'#f0fdf4'}:{border:'1px solid var(--border)',background:'white'}}
              onMouseEnter={e=>selected?.id!==crop.id&&(e.currentTarget.style.borderColor='#86efac')}
              onMouseLeave={e=>selected?.id!==crop.id&&(e.currentTarget.style.borderColor='var(--border)')}>
              <div className="flex items-center gap-3 p-3">
                {/* Real photo thumbnail */}
                <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                  <img
                    src={getCropImage(crop.name)}
                    alt={crop.name}
                    className="w-full h-full object-cover"
                    onError={e=>handleImgError(crop.id, e)}
                    loading="lazy"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm" style={{ color:'var(--text)' }}>{crop.name}</div>
                  <div className="text-xs capitalize mt-0.5" style={{ color:'var(--text-muted)' }}>{crop.subcategory||crop.category}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-medium" style={{ color:WATER_TEXT[crop.water_requirement]||'#374151' }}>
                      <Droplets className="w-3 h-3 inline mr-0.5"/>{crop.water_requirement}
                    </span>
                    <span className="text-xs" style={{ color:'var(--text-muted)' }}>
                      <Clock className="w-3 h-3 inline mr-0.5"/>{crop.maturity_days}d
                    </span>
                  </div>
                </div>
                {user?.role==='admin' && (
                  <button onClick={e=>{e.stopPropagation();deleteCrop(crop.id)}} disabled={deleting===crop.id}
                    className="p-1.5 rounded-lg flex-shrink-0" style={{ color:'#dc2626', background:'#fef2f2' }}>
                    <Trash2 className="w-3.5 h-3.5"/>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Detail */}
        <div className="lg:col-span-3">
          {selected ? (
            <div className="rounded-xl overflow-hidden" style={{ border:'1px solid var(--border)', background:'white' }}>
              {/* Hero photo */}
              <div className="relative h-52 overflow-hidden">
                <img
                  src={getCropImage(selected.name)}
                  alt={selected.name}
                  className="w-full h-full object-cover"
                  onError={e=>{ (e.target as HTMLImageElement).src = FALLBACK }}
                />
                <div className="absolute inset-0" style={{ background:'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)' }}/>
                <button onClick={()=>setSelected(null)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background:'rgba(255,255,255,0.9)' }}>
                  <X className="w-4 h-4" style={{ color:'var(--text)' }}/>
                </button>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h2 className="font-bold text-white text-xl leading-tight">{selected.name}</h2>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Badge bg="rgba(22,163,74,0.85)" text="white">{CAT_EMOJI[selected.category]} {selected.category}</Badge>
                    {selected.subcategory && <span className="text-xs text-white/70">{selected.subcategory}</span>}
                    <span className="text-xs text-white/70"><Clock className="w-3 h-3 inline mr-0.5"/>{selected.maturity_days} days</span>
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-4 max-h-[55vh] overflow-y-auto">
                <p className="text-sm leading-relaxed" style={{ color:'var(--text)' }}>{selected.description}</p>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label:'Expected Yield', val:selected.expected_yield, icon:'📦' },
                    { label:'Market Price', val:selected.market_price_ksh, icon:'💰' },
                    { label:'Rainfall', val:`${selected.rainfall_min_mm}–${selected.rainfall_max_mm}mm/yr`, icon:'🌧️' },
                    { label:'Altitude', val:`${selected.altitude_min_m}–${selected.altitude_max_m}m`, icon:'⛰️' },
                  ].filter(x=>x.val).map(({ label, val, icon }) => (
                    <div key={label} className="p-3 rounded-lg" style={{ background:'var(--bg)', border:'1px solid var(--border)' }}>
                      <div className="text-xs mb-0.5" style={{ color:'var(--text-muted)' }}>{icon} {label}</div>
                      <div className="text-sm font-semibold" style={{ color:'var(--text)' }}>{val}</div>
                    </div>
                  ))}
                </div>

                {selected.suitable_aez?.length>0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color:'var(--text-muted)' }}>🌍 Where to Grow</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selected.suitable_aez.map(z=><Badge key={z} bg="#eff6ff" text="#1d4ed8">{z}</Badge>)}
                    </div>
                  </div>
                )}

                {selected.best_counties?.length>0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color:'var(--text-muted)' }}>📍 Best Counties</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selected.best_counties.map(c=><Badge key={c} bg="#faf5ff" text="#7c3aed">{c}</Badge>)}
                    </div>
                  </div>
                )}

                {selected.soil_types?.length>0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color:'var(--text-muted)' }}>🏔️ Soil Types</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selected.soil_types.map(s=><Badge key={s} bg="#fffbeb" text="#d97706">{s}</Badge>)}
                    </div>
                  </div>
                )}

                {selected.planting_months?.length>0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color:'var(--text-muted)' }}>📅 Planting Months</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selected.planting_months.map(m=><Badge key={m} bg="#f0fdf4" text="#15803d">{m}</Badge>)}
                    </div>
                  </div>
                )}

                {selected.varieties?.length>0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color:'var(--green)' }}>🌱 Varieties</h4>
                    <div className="space-y-2">
                      {selected.varieties.map((v,i)=>(
                        <div key={i} className="p-3 rounded-lg" style={{ background:'#f0fdf4', border:'1px solid #bbf7d0' }}>
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-semibold text-sm" style={{ color:'var(--text)' }}>{v.name}</span>
                            <Badge bg="#dcfce7" text="#15803d">{v.type}</Badge>
                            {v.maturity_days && <span className="text-xs" style={{ color:'var(--text-muted)' }}>{v.maturity_days} days</span>}
                          </div>
                          <p className="text-xs leading-relaxed" style={{ color:'var(--text-muted)' }}>{v.notes}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color:'var(--text-muted)' }}>🌿 Care Tips</h4>
                  <p className="text-sm leading-relaxed" style={{ color:'var(--text)' }}>{selected.care_tips}</p>
                </div>

                {selected.diseases?.length>0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color:'#dc2626' }}>⚠️ Watch Out For</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selected.diseases.map(d=><Badge key={d} bg="#fef2f2" text="#dc2626">{d}</Badge>)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-xl flex items-center justify-center py-24"
              style={{ border:'1px dashed var(--border)', background:'white' }}>
              <div className="text-center">
                <div className="text-5xl mb-3">🌾</div>
                <h3 className="font-semibold mb-1" style={{ color:'var(--text)' }}>Select a Crop</h3>
                <p className="text-sm" style={{ color:'var(--text-muted)' }}>Click any crop to see full details and growing guide</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
