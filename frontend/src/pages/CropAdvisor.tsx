import { useState, useEffect } from 'react'
import api from '../lib/api'
import { Sprout, Search, ChevronDown, ChevronUp, Droplets, Clock, Trash2 } from 'lucide-react'
import { useAuth } from '../lib/auth'

interface Variety { name:string; type:string; maturity_days?:number; notes:string }
interface Crop { id:number; name:string; category:string; subcategory:string; varieties:Variety[]; suitable_aez:string[]; rainfall_min_mm:number; rainfall_max_mm:number; altitude_min_m:number; altitude_max_m:number; water_requirement:string; soil_types:string[]; planting_months:string[]; maturity_days:number; description:string; care_tips:string; expected_yield:string; market_price_ksh:string; diseases:string[]; best_counties:string[] }

const CATS = ['cereal','legume','vegetable','fruit','cash crop']
const WATER_COLOR:Record<string,string> = { low:'bg-yellow-400/20 text-yellow-300 border-yellow-400/30', moderate:'bg-blue-400/20 text-blue-300 border-blue-400/30', high:'bg-cyan-400/20 text-cyan-300 border-cyan-400/30' }

const Glass = ({ children, className='' }: { children:React.ReactNode; className?:string }) => (
  <div className={`rounded-2xl border border-white/15 ${className}`} style={{ background:'rgba(0,0,0,0.38)', backdropFilter:'blur(16px)' }}>{children}</div>
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
    const p: any = {}
    if (filters.category) p.category = filters.category
    if (filters.search) p.search = filters.search
    const r = await api.get('/crops/', { params: p })
    setCrops(r.data); setLoading(false)
  }

  useEffect(() => { fetchCrops() }, [filters.category])

  const deleteCrop = async (id: number) => {
    if (!confirm('Delete this crop?')) return
    setDeleting(id)
    await api.delete(`/crops/${id}`)
    setCrops(c => c.filter(x => x.id !== id))
    setDeleting(null)
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-4xl font-extrabold text-white flex items-center gap-3 drop-shadow-2xl">
          <Sprout className="w-9 h-9 text-emerald-400"/> Crop Advisor
        </h1>
        <p className="text-white/60 mt-2">{crops.length} crops with varieties, planting calendars, yields and market prices.</p>
      </div>

      <Glass className="p-4 mb-5">
        <div className="flex flex-wrap gap-2 mb-3">
          <button onClick={() => setFilters(f => ({ ...f, category:'' }))}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${!filters.category ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-white/8 text-white/65 border-white/15 hover:bg-white/15 hover:text-white'}`}>
            All Crops
          </button>
          {CATS.map(c => (
            <button key={c} onClick={() => setFilters(f => ({ ...f, category:c }))}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border capitalize ${filters.category===c ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-white/8 text-white/65 border-white/15 hover:bg-white/15 hover:text-white'}`}>
              {c}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-white/40"/>
            <input placeholder="Search crops by name..." value={filters.search} onChange={e => setFilters(f => ({ ...f, search:e.target.value }))}
              onKeyDown={e => e.key==='Enter' && fetchCrops()}
              className="w-full pl-9 bg-white/8 border border-white/20 rounded-xl px-3 py-2 text-sm text-white placeholder-white/35 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/50"/>
          </div>
          <button onClick={fetchCrops} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
            Search
          </button>
        </div>
      </Glass>

      {loading ? (
        <div className="text-center py-16 text-white/50 text-lg">Loading crops...</div>
      ) : (
        <div className="space-y-2">
          {crops.length===0 && (
            <Glass className="py-16 text-center text-white/40">No crops found for these filters.</Glass>
          )}
          {crops.map(crop => (
            <Glass key={crop.id} className="overflow-hidden hover:border-white/25 transition-all duration-200">
              <div className="flex items-center gap-3 px-5 py-4 cursor-pointer" onClick={() => setExpanded(expanded===crop.id ? null : crop.id)}>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center flex-shrink-0">
                  <Sprout className="w-5 h-5 text-emerald-400"/>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-white text-sm">{crop.name}</div>
                  <div className="text-xs text-white/45 truncate">{crop.description}</div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${WATER_COLOR[crop.water_requirement]||'bg-white/10 text-white/60 border-white/20'}`}>
                    <Droplets className="w-3 h-3 inline mr-0.5"/>{crop.water_requirement}
                  </span>
                  <span className="text-xs text-white/40 hidden md:flex items-center gap-0.5">
                    <Clock className="w-3 h-3"/>{crop.maturity_days}d
                  </span>
                  {user?.role==='admin' && (
                    <button onClick={e => { e.stopPropagation(); deleteCrop(crop.id) }} disabled={deleting===crop.id}
                      className="p-1 text-red-400 hover:text-red-300 rounded transition-colors">
                      <Trash2 className="w-4 h-4"/>
                    </button>
                  )}
                  {expanded===crop.id ? <ChevronUp className="w-4 h-4 text-white/40"/> : <ChevronDown className="w-4 h-4 text-white/40"/>}
                </div>
              </div>

              {expanded===crop.id && (
                <div className="px-5 pb-5 border-t border-white/10 pt-4">
                  {crop.varieties?.length > 0 && (
                    <div className="mb-5">
                      <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wide mb-3">🌱 Varieties & Cultivars</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {crop.varieties.map((v, i) => (
                          <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-3 hover:border-emerald-400/30 transition-colors">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-white text-sm">{v.name}</span>
                              <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full">{v.type}</span>
                              {v.maturity_days && <span className="text-xs text-white/40 ml-auto">{v.maturity_days}d</span>}
                            </div>
                            <p className="text-xs text-white/55 leading-relaxed">{v.notes}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {crop.suitable_aez?.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold text-white/45 uppercase tracking-wide mb-2">AEZ Zones</h4>
                        <div className="flex flex-wrap gap-1">
                          {crop.suitable_aez.map(z => <span key={z} className="text-xs bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded-full">{z}</span>)}
                        </div>
                      </div>
                    )}
                    {crop.soil_types?.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold text-white/45 uppercase tracking-wide mb-2">Soil Types</h4>
                        <div className="flex flex-wrap gap-1">
                          {crop.soil_types.map(s => <span key={s} className="text-xs bg-amber-500/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full">{s}</span>)}
                        </div>
                      </div>
                    )}
                    {crop.planting_months?.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold text-white/45 uppercase tracking-wide mb-2">Planting Months</h4>
                        <div className="flex flex-wrap gap-1">
                          {crop.planting_months.map(m => <span key={m} className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full">{m}</span>)}
                        </div>
                      </div>
                    )}
                    <div>
                      <h4 className="text-xs font-bold text-white/45 uppercase tracking-wide mb-2">Expected Yield</h4>
                      <p className="text-sm text-white/80">{crop.expected_yield}</p>
                    </div>
                    {crop.market_price_ksh && (
                      <div>
                        <h4 className="text-xs font-bold text-white/45 uppercase tracking-wide mb-2">Market Price (KSh)</h4>
                        <p className="text-sm text-white/80">{crop.market_price_ksh}</p>
                      </div>
                    )}
                    <div className="md:col-span-2">
                      <h4 className="text-xs font-bold text-white/45 uppercase tracking-wide mb-2">Care Tips</h4>
                      <p className="text-sm text-white/70 leading-relaxed">{crop.care_tips}</p>
                    </div>
                    {crop.best_counties?.length > 0 && (
                      <div className="md:col-span-2">
                        <h4 className="text-xs font-bold text-white/45 uppercase tracking-wide mb-2">Best Counties</h4>
                        <div className="flex flex-wrap gap-1">
                          {crop.best_counties.map(c => <span key={c} className="text-xs bg-yellow-500/20 text-yellow-300 border border-yellow-400/30 px-2 py-0.5 rounded-full">{c}</span>)}
                        </div>
                      </div>
                    )}
                    {crop.diseases?.length > 0 && (
                      <div className="md:col-span-2">
                        <h4 className="text-xs font-bold text-red-400 uppercase tracking-wide mb-2">⚠️ Common Diseases/Pests</h4>
                        <div className="flex flex-wrap gap-1">
                          {crop.diseases.map(d => <span key={d} className="text-xs bg-red-500/20 text-red-300 border border-red-400/30 px-2 py-0.5 rounded-full">{d}</span>)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Glass>
          ))}
        </div>
      )}
    </div>
  )
}
