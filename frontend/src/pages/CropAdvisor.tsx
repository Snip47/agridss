import { useState, useEffect } from 'react'
import api from '../lib/api'
import { Sprout, Search, ChevronDown, ChevronUp, Droplets, Clock, Trash2 } from 'lucide-react'
import { useAuth } from '../lib/auth'
import { getCropImage } from '../lib/itemImages'

interface Variety { name:string; type:string; maturity_days?:number; notes:string }
interface Crop { id:number; name:string; category:string; subcategory:string; varieties:Variety[]; suitable_aez:string[]; rainfall_min_mm:number; rainfall_max_mm:number; altitude_min_m:number; altitude_max_m:number; water_requirement:string; soil_types:string[]; planting_months:string[]; maturity_days:number; description:string; care_tips:string; expected_yield:string; market_price_ksh:string; diseases:string[]; best_counties:string[] }

const CATS = ['cereal','legume','vegetable','fruit','cash crop']
const WATER_COLOR:Record<string,string> = {
  low:'rgba(251,191,36,0.2)',
  moderate:'rgba(96,165,250,0.2)',
  high:'rgba(34,211,238,0.2)'
}
const WATER_TEXT:Record<string,string> = {
  low:'#fbbf24', moderate:'#60a5fa', high:'#22d3ee'
}

const G = ({ children, className='' }: { children:React.ReactNode; className?:string }) => (
  <div className={className} style={{ background:'rgba(0,0,0,0.38)', backdropFilter:'blur(18px)', border:'1px solid rgba(255,255,255,0.11)', borderRadius:'1rem' }}>{children}</div>
)

export default function CropAdvisor() {
  const { user } = useAuth()
  const [crops, setCrops] = useState<Crop[]>([])
  const [filters, setFilters] = useState({ category:'', search:'' })
  const [expanded, setExpanded] = useState<number|null>(null)
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
    setDeleting(null)
  }

  return (
    <div className="slide-up">
      <div className="mb-6">
        <h1 className="text-4xl font-black text-white flex items-center gap-3 drop-shadow-2xl">
          <Sprout className="w-9 h-9 text-emerald-400"/> Crop Advisor
        </h1>
        <p className="text-white/55 mt-2">{crops.length} crops with varieties, planting calendars and market prices.</p>
      </div>

      {/* Filters */}
      <G className="p-4 mb-5">
        <div className="flex flex-wrap gap-2 mb-3">
          <button onClick={()=>setFilters(f=>({...f,category:''}))}
            className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
            style={!filters.category?{background:'rgba(34,197,94,0.7)',color:'white',border:'1px solid rgba(34,197,94,0.5)'}:{background:'rgba(255,255,255,0.07)',color:'rgba(255,255,255,0.6)',border:'1px solid rgba(255,255,255,0.12)'}}>
            All Crops
          </button>
          {CATS.map(c=>(
            <button key={c} onClick={()=>setFilters(f=>({...f,category:c}))}
              className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all capitalize"
              style={filters.category===c?{background:'rgba(34,197,94,0.7)',color:'white',border:'1px solid rgba(34,197,94,0.5)'}:{background:'rgba(255,255,255,0.07)',color:'rgba(255,255,255,0.6)',border:'1px solid rgba(255,255,255,0.12)'}}>
              {c}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-white/35"/>
            <input placeholder="Search crops..." value={filters.search} onChange={e=>setFilters(f=>({...f,search:e.target.value}))}
              onKeyDown={e=>e.key==='Enter'&&fetchCrops()}
              className="w-full pl-9 rounded-xl px-3 py-2 text-sm"
              style={{ background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.18)', color:'white' }}/>
          </div>
          <button onClick={fetchCrops} className="px-4 py-2 rounded-xl text-sm font-bold text-white"
            style={{ background:'rgba(34,197,94,0.7)', border:'1px solid rgba(34,197,94,0.5)' }}>
            Search
          </button>
        </div>
      </G>

      {loading ? (
        <div className="text-center py-16 text-white/50 text-lg">Loading crops...</div>
      ) : (
        <div className="space-y-2">
          {crops.length===0 && <G className="py-16 text-center text-white/40">No crops found.</G>}
          {crops.map(crop=>(
            <G key={crop.id} className="overflow-hidden hover:border-white/20 transition-all duration-200">
              {/* Crop header with image */}
              <div className="flex items-center gap-3 px-4 py-3 cursor-pointer"
                onClick={()=>setExpanded(expanded===crop.id?null:crop.id)}>
                {/* Crop image */}
                <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border border-white/15">
                  <img
                    src={getCropImage(crop.name)}
                    alt={crop.name}
                    className="w-full h-full object-cover"
                    onError={e=>{(e.target as HTMLImageElement).src='https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&q=80'}}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-white">{crop.name}</div>
                  <div className="text-xs text-white/45 truncate">{crop.description}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs px-2 py-0.5 rounded-full capitalize"
                      style={{ background:'rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.55)', border:'1px solid rgba(255,255,255,0.12)' }}>
                      {crop.subcategory||crop.category}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background:WATER_COLOR[crop.water_requirement]||'rgba(255,255,255,0.08)', color:WATER_TEXT[crop.water_requirement]||'white', border:'1px solid rgba(255,255,255,0.12)' }}>
                      <Droplets className="w-3 h-3 inline mr-0.5"/>{crop.water_requirement}
                    </span>
                    <span className="text-xs text-white/35 flex items-center gap-0.5">
                      <Clock className="w-3 h-3"/>{crop.maturity_days}d
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {user?.role==='admin' && (
                    <button onClick={e=>{e.stopPropagation();deleteCrop(crop.id)}} disabled={deleting===crop.id}
                      className="p-1.5 rounded-lg text-red-400 hover:text-red-300 transition-colors"
                      style={{ background:'rgba(239,68,68,0.1)' }}>
                      <Trash2 className="w-3.5 h-3.5"/>
                    </button>
                  )}
                  {expanded===crop.id?<ChevronUp className="w-4 h-4 text-white/40"/>:<ChevronDown className="w-4 h-4 text-white/40"/>}
                </div>
              </div>

              {/* Expanded details */}
              {expanded===crop.id && (
                <div className="px-5 pb-5 pt-3" style={{ borderTop:'1px solid rgba(255,255,255,0.08)' }}>
                  {/* Varieties with images */}
                  {crop.varieties?.length>0 && (
                    <div className="mb-5">
                      <h4 className="text-xs font-black text-emerald-400 uppercase tracking-wider mb-3">🌱 Varieties & Cultivars</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {crop.varieties.map((v,i)=>(
                          <div key={i} className="rounded-xl overflow-hidden transition-all hover:border-emerald-400/30"
                            style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.09)' }}>
                            {/* Variety image */}
                            <div className="h-28 overflow-hidden relative">
                              <img
                                src={getCropImage(crop.name)}
                                alt={v.name}
                                className="w-full h-full object-cover"
                                onError={e=>{(e.target as HTMLImageElement).src='https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&q=80'}}
                              />
                              <div className="absolute inset-0" style={{ background:'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)' }}/>
                              <div className="absolute bottom-2 left-3 right-3">
                                <div className="font-bold text-white text-sm">{v.name}</div>
                                <span className="text-xs px-1.5 py-0.5 rounded-full"
                                  style={{ background:'rgba(34,197,94,0.4)', color:'#a7f3d0', border:'1px solid rgba(34,197,94,0.3)' }}>
                                  {v.type}
                                </span>
                              </div>
                              {v.maturity_days && (
                                <div className="absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full font-bold"
                                  style={{ background:'rgba(0,0,0,0.6)', color:'white' }}>
                                  {v.maturity_days}d
                                </div>
                              )}
                            </div>
                            <div className="p-2.5">
                              <p className="text-xs text-white/55 leading-relaxed">{v.notes}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {crop.suitable_aez?.length>0 && (
                      <div>
                        <h4 className="text-xs font-black text-white/40 uppercase tracking-wider mb-2">AEZ Zones</h4>
                        <div className="flex flex-wrap gap-1">
                          {crop.suitable_aez.map(z=><span key={z} className="text-xs px-2 py-0.5 rounded-full" style={{ background:'rgba(96,165,250,0.15)', color:'#93c5fd', border:'1px solid rgba(96,165,250,0.25)' }}>{z}</span>)}
                        </div>
                      </div>
                    )}
                    {crop.soil_types?.length>0 && (
                      <div>
                        <h4 className="text-xs font-black text-white/40 uppercase tracking-wider mb-2">Soil Types</h4>
                        <div className="flex flex-wrap gap-1">
                          {crop.soil_types.map(s=><span key={s} className="text-xs px-2 py-0.5 rounded-full" style={{ background:'rgba(251,191,36,0.15)', color:'#fde68a', border:'1px solid rgba(251,191,36,0.25)' }}>{s}</span>)}
                        </div>
                      </div>
                    )}
                    {crop.planting_months?.length>0 && (
                      <div>
                        <h4 className="text-xs font-black text-white/40 uppercase tracking-wider mb-2">Planting Months</h4>
                        <div className="flex flex-wrap gap-1">
                          {crop.planting_months.map(m=><span key={m} className="text-xs px-2 py-0.5 rounded-full" style={{ background:'rgba(34,197,94,0.15)', color:'#a7f3d0', border:'1px solid rgba(34,197,94,0.25)' }}>{m}</span>)}
                        </div>
                      </div>
                    )}
                    <div>
                      <h4 className="text-xs font-black text-white/40 uppercase tracking-wider mb-2">Altitude Range</h4>
                      <p className="text-sm text-white/75">{crop.altitude_min_m}m — {crop.altitude_max_m}m asl</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-white/40 uppercase tracking-wider mb-2">Expected Yield</h4>
                      <p className="text-sm text-white/75">{crop.expected_yield}</p>
                    </div>
                    {crop.market_price_ksh && (
                      <div>
                        <h4 className="text-xs font-black text-white/40 uppercase tracking-wider mb-2">Market Price (KSh)</h4>
                        <p className="text-sm text-white/75">{crop.market_price_ksh}</p>
                      </div>
                    )}
                    <div className="md:col-span-2">
                      <h4 className="text-xs font-black text-white/40 uppercase tracking-wider mb-2">Care Tips</h4>
                      <p className="text-sm text-white/65 leading-relaxed">{crop.care_tips}</p>
                    </div>
                    {crop.best_counties?.length>0 && (
                      <div className="md:col-span-2">
                        <h4 className="text-xs font-black text-white/40 uppercase tracking-wider mb-2">Best Counties</h4>
                        <div className="flex flex-wrap gap-1">
                          {crop.best_counties.map(c=><span key={c} className="text-xs px-2 py-0.5 rounded-full" style={{ background:'rgba(167,139,250,0.15)', color:'#c4b5fd', border:'1px solid rgba(167,139,250,0.25)' }}>{c}</span>)}
                        </div>
                      </div>
                    )}
                    {crop.diseases?.length>0 && (
                      <div className="md:col-span-2">
                        <h4 className="text-xs font-black text-red-400 uppercase tracking-wider mb-2">⚠️ Common Diseases/Pests</h4>
                        <div className="flex flex-wrap gap-1">
                          {crop.diseases.map(d=><span key={d} className="text-xs px-2 py-0.5 rounded-full" style={{ background:'rgba(239,68,68,0.15)', color:'#fca5a5', border:'1px solid rgba(239,68,68,0.25)' }}>{d}</span>)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </G>
          ))}
        </div>
      )}
    </div>
  )
}
