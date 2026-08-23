import { useState, useEffect } from 'react'
import api from '../lib/api'
import { Search, ChevronDown, ChevronUp, Droplets, Clock, Trash2, X } from 'lucide-react'
import { useAuth } from '../lib/auth'
import { getCropImage } from '../lib/itemImages'

interface Variety { name:string; type:string; maturity_days?:number; notes:string }
interface Crop { id:number; name:string; category:string; subcategory:string; varieties:Variety[]; suitable_aez:string[]; rainfall_min_mm:number; rainfall_max_mm:number; altitude_min_m:number; altitude_max_m:number; water_requirement:string; soil_types:string[]; planting_months:string[]; maturity_days:number; description:string; care_tips:string; expected_yield:string; market_price_ksh:string; diseases:string[]; best_counties:string[] }

const CATS = ['cereal','legume','vegetable','fruit','cash crop','flower']
const CAT_EMOJI:Record<string,string> = { cereal:'🌾', legume:'🫘', vegetable:'🥬', fruit:'🍎', 'cash crop':'💰', flower:'🌸' }
const WATER_COLOR:Record<string,string> = { low:'rgba(251,191,36,0.25)', moderate:'rgba(96,165,250,0.25)', high:'rgba(34,211,238,0.25)' }
const WATER_TEXT:Record<string,string> = { low:'#fbbf24', moderate:'#60a5fa', high:'#22d3ee' }

const G = ({ children, className='' }: { children:React.ReactNode; className?:string }) => (
  <div className={className} style={{ background:'rgba(0,0,0,0.38)', backdropFilter:'blur(18px)', border:'1px solid rgba(255,255,255,0.11)', borderRadius:'1rem' }}>{children}</div>
)

const Badge = ({ children, color='rgba(255,255,255,0.1)', text='rgba(255,255,255,0.7)' }: any) => (
  <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background:color, color:text, border:`1px solid ${color}` }}>{children}</span>
)

export default function CropAdvisor() {
  const { user } = useAuth()
  const [crops, setCrops] = useState<Crop[]>([])
  const [filters, setFilters] = useState({ category:'', search:'' })
  const [selected, setSelected] = useState<Crop|null>(null)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState<number|null>(null)

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

  return (
    <div className="slide-up">
      <div className="mb-5">
        <h1 className="text-3xl font-black text-white drop-shadow-2xl">🌱 Crop Advisor</h1>
        <p className="text-white/45 mt-1 text-sm">{crops.length} crops — varieties, planting calendars, yields and market prices</p>
      </div>

      {/* Filters */}
      <G className="p-4 mb-5">
        <div className="flex flex-wrap gap-2 mb-3">
          <button onClick={()=>setFilters(f=>({...f,category:''}))}
            className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
            style={!filters.category?{background:'rgba(34,197,94,0.7)',color:'white',border:'1px solid rgba(34,197,94,0.5)'}:{background:'rgba(255,255,255,0.07)',color:'rgba(255,255,255,0.6)',border:'1px solid rgba(255,255,255,0.12)'}}>
            All
          </button>
          {CATS.map(c=>(
            <button key={c} onClick={()=>setFilters(f=>({...f,category:c}))}
              className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all capitalize"
              style={filters.category===c?{background:'rgba(34,197,94,0.7)',color:'white',border:'1px solid rgba(34,197,94,0.5)'}:{background:'rgba(255,255,255,0.07)',color:'rgba(255,255,255,0.6)',border:'1px solid rgba(255,255,255,0.12)'}}>
              {CAT_EMOJI[c]} {c}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-white/35"/>
            <input placeholder="Search crops..." value={filters.search}
              onChange={e=>setFilters(f=>({...f,search:e.target.value}))}
              onKeyDown={e=>e.key==='Enter'&&fetchCrops()}
              className="w-full pl-9 rounded-xl px-3 py-2 text-sm"
              style={{ background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.18)', color:'white' }}/>
          </div>
          <button onClick={fetchCrops} className="px-4 py-2 rounded-xl text-sm font-bold text-white"
            style={{ background:'rgba(34,197,94,0.7)', border:'1px solid rgba(34,197,94,0.5)' }}>Search</button>
        </div>
      </G>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Crop grid */}
        <div className="lg:col-span-1 space-y-2 max-h-[75vh] overflow-y-auto scrollbar-thin pr-1">
          {loading && <div className="text-center py-8 text-white/40">Loading...</div>}
          {!loading && crops.length===0 && <G className="py-8 text-center text-white/40">No crops found.</G>}
          {crops.map(crop=>(
            <div key={crop.id} onClick={()=>setSelected(crop)}
              className="rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:scale-[1.02]"
              style={selected?.id===crop.id
                ?{border:'2px solid rgba(34,197,94,0.7)',backdropFilter:'blur(16px)',background:'rgba(34,197,94,0.1)'}
                :{border:'1px solid rgba(255,255,255,0.1)',backdropFilter:'blur(16px)',background:'rgba(0,0,0,0.32)'}}>
              <div className="flex items-center gap-3 p-3">
                {/* Real crop image thumbnail */}
                <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                  <img
                    src={getCropImage(crop.name)}
                    alt={crop.name}
                    className="w-full h-full object-cover"
                    onError={e=>{(e.target as HTMLImageElement).src='https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=200&q=80'}}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-white text-sm">{crop.name}</div>
                  <div className="text-xs text-white/45 capitalize">{CAT_EMOJI[crop.category]} {crop.category}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs" style={{ color:WATER_TEXT[crop.water_requirement]||'white' }}>
                      <Droplets className="w-3 h-3 inline mr-0.5"/>{crop.water_requirement}
                    </span>
                    <span className="text-xs text-white/35"><Clock className="w-3 h-3 inline mr-0.5"/>{crop.maturity_days}d</span>
                  </div>
                </div>
                {user?.role==='admin' && (
                  <button onClick={e=>{e.stopPropagation();deleteCrop(crop.id)}} disabled={deleting===crop.id}
                    className="p-1.5 rounded-lg text-red-400 hover:text-red-300 flex-shrink-0"
                    style={{ background:'rgba(239,68,68,0.1)' }}>
                    <Trash2 className="w-3.5 h-3.5"/>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Crop detail */}
        <div className="lg:col-span-2">
          {selected ? (
            <G className="overflow-hidden">
              {/* Hero image */}
              <div className="relative h-56 overflow-hidden">
                <img
                  src={getCropImage(selected.name)}
                  alt={selected.name}
                  className="w-full h-full object-cover"
                  onError={e=>{(e.target as HTMLImageElement).src='https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&q=80'}}
                />
                <div className="absolute inset-0" style={{ background:'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.1) 100%)' }}/>
                <button onClick={()=>setSelected(null)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background:'rgba(0,0,0,0.5)' }}>
                  <X className="w-4 h-4 text-white"/>
                </button>
                <div className="absolute bottom-4 left-5 right-5">
                  <h2 className="font-black text-white text-2xl drop-shadow-lg">{selected.name}</h2>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold capitalize"
                      style={{ background:'rgba(34,197,94,0.7)', color:'white' }}>
                      {CAT_EMOJI[selected.category]} {selected.category}
                    </span>
                    {selected.subcategory && (
                      <span className="text-xs text-white/60">{selected.subcategory}</span>
                    )}
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background:WATER_COLOR[selected.water_requirement]||'rgba(255,255,255,0.1)', color:WATER_TEXT[selected.water_requirement]||'white' }}>
                      <Droplets className="w-3 h-3 inline mr-0.5"/>{selected.water_requirement} water
                    </span>
                    <span className="text-xs text-white/50"><Clock className="w-3 h-3 inline mr-0.5"/>{selected.maturity_days} days to harvest</span>
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-4 max-h-[55vh] overflow-y-auto scrollbar-thin">
                {/* Description */}
                <p className="text-sm text-white/75 leading-relaxed">{selected.description}</p>

                {/* Key facts grid */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label:'Expected Yield', val:selected.expected_yield, icon:'📦' },
                    { label:'Market Price', val:selected.market_price_ksh, icon:'💰' },
                    { label:'Rainfall Needed', val:`${selected.rainfall_min_mm}–${selected.rainfall_max_mm}mm/year`, icon:'🌧️' },
                    { label:'Altitude Range', val:`${selected.altitude_min_m}–${selected.altitude_max_m}m`, icon:'⛰️' },
                  ].map(({ label, val, icon }) => val ? (
                    <div key={label} className="p-3 rounded-xl" style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)' }}>
                      <div className="text-xs text-white/40 mb-0.5">{icon} {label}</div>
                      <div className="text-sm font-bold text-white">{val}</div>
                    </div>
                  ) : null)}
                </div>

                {/* Where to plant */}
                {selected.suitable_aez?.length>0 && (
                  <div>
                    <h4 className="text-xs font-black text-white/50 uppercase tracking-wider mb-2">🌍 Where to Grow</h4>
                    <div className="flex flex-wrap gap-1">
                      {selected.suitable_aez.map(z=><Badge key={z} color="rgba(96,165,250,0.2)" text="#93c5fd">{z}</Badge>)}
                    </div>
                  </div>
                )}

                {/* Best counties */}
                {selected.best_counties?.length>0 && (
                  <div>
                    <h4 className="text-xs font-black text-white/50 uppercase tracking-wider mb-2">📍 Best Counties in Kenya</h4>
                    <div className="flex flex-wrap gap-1">
                      {selected.best_counties.map(c=><Badge key={c} color="rgba(167,139,250,0.2)" text="#c4b5fd">{c}</Badge>)}
                    </div>
                  </div>
                )}

                {/* Soil types */}
                {selected.soil_types?.length>0 && (
                  <div>
                    <h4 className="text-xs font-black text-white/50 uppercase tracking-wider mb-2">🏔️ Soil Types</h4>
                    <div className="flex flex-wrap gap-1">
                      {selected.soil_types.map(s=><Badge key={s} color="rgba(251,191,36,0.2)" text="#fde68a">{s}</Badge>)}
                    </div>
                  </div>
                )}

                {/* Planting months */}
                {selected.planting_months?.length>0 && (
                  <div>
                    <h4 className="text-xs font-black text-white/50 uppercase tracking-wider mb-2">📅 Planting Months</h4>
                    <div className="flex flex-wrap gap-1">
                      {selected.planting_months.map(m=><Badge key={m} color="rgba(34,197,94,0.2)" text="#4ade80">{m}</Badge>)}
                    </div>
                  </div>
                )}

                {/* Varieties */}
                {selected.varieties?.length>0 && (
                  <div>
                    <h4 className="text-xs font-black text-emerald-400 uppercase tracking-wider mb-2">🌱 Varieties & Cultivars</h4>
                    <div className="grid grid-cols-1 gap-2">
                      {selected.varieties.map((v,i)=>(
                        <div key={i} className="p-3 rounded-xl" style={{ background:'rgba(34,197,94,0.08)', border:'1px solid rgba(34,197,94,0.2)' }}>
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-bold text-white text-sm">{v.name}</span>
                            <Badge color="rgba(34,197,94,0.2)" text="#4ade80">{v.type}</Badge>
                            {v.maturity_days && <span className="text-xs text-white/35">{v.maturity_days} days</span>}
                          </div>
                          <p className="text-xs text-white/60 leading-relaxed">{v.notes}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Care tips */}
                <div>
                  <h4 className="text-xs font-black text-white/50 uppercase tracking-wider mb-2">🌿 Care Tips</h4>
                  <p className="text-sm text-white/70 leading-relaxed">{selected.care_tips}</p>
                </div>

                {/* Diseases */}
                {selected.diseases?.length>0 && (
                  <div>
                    <h4 className="text-xs font-black text-red-400 uppercase tracking-wider mb-2">⚠️ Watch Out For</h4>
                    <div className="flex flex-wrap gap-1">
                      {selected.diseases.map(d=><Badge key={d} color="rgba(239,68,68,0.15)" text="#fca5a5">{d}</Badge>)}
                    </div>
                  </div>
                )}
              </div>
            </G>
          ) : (
            <G className="h-full flex items-center justify-center py-24">
              <div className="text-center">
                <div className="text-6xl mb-4">🌾</div>
                <h3 className="font-bold text-white/40 text-lg">Select a Crop</h3>
                <p className="text-white/25 text-sm mt-1">Click any crop to see full details, varieties and growing guide</p>
              </div>
            </G>
          )}
        </div>
      </div>
    </div>
  )
}
