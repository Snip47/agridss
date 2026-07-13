import { useState, useEffect } from 'react'
import api from '../lib/api'
import { Sprout, Search, ChevronDown, ChevronUp, Droplets, Clock, Trash2 } from 'lucide-react'
import { useAuth } from '../lib/auth'
import PageBackdrop, { BACKDROPS } from '../components/PageBackdrop'

interface Variety { name:string; type:string; maturity_days?:number; notes:string }
interface Crop { id:number; name:string; category:string; subcategory:string; varieties:Variety[]; suitable_aez:string[]; rainfall_min_mm:number; rainfall_max_mm:number; altitude_min_m:number; altitude_max_m:number; water_requirement:string; soil_types:string[]; planting_months:string[]; maturity_days:number; description:string; care_tips:string; expected_yield:string; market_price_ksh:string; diseases:string[]; best_counties:string[] }

const CATS = ['cereal','legume','vegetable','fruit','cash crop']
const WATER_COLOR:Record<string,string> = {low:'bg-yellow-100 text-yellow-700',moderate:'bg-blue-100 text-blue-700',high:'bg-sky-100 text-sky-700'}

export default function CropAdvisor() {
  const { user } = useAuth()
  const [crops, setCrops] = useState<Crop[]>([])
  const [filters, setFilters] = useState({category:'',search:''})
  const [expanded, setExpanded] = useState<number|null>(null)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState<number|null>(null)

  const fetch = async () => {
    setLoading(true)
    const p: any = {}
    if (filters.category) p.category = filters.category
    if (filters.search) p.search = filters.search
    const r = await api.get('/crops/', {params:p})
    setCrops(r.data); setLoading(false)
  }

  useEffect(()=>{ fetch() }, [filters.category])

  const deleteCrop = async (id:number) => {
    if (!confirm('Delete this crop?')) return
    setDeleting(id)
    await api.delete(`/crops/${id}`)
    setCrops(c=>c.filter(x=>x.id!==id))
    setDeleting(null)
  }

  return (
    <>
      <PageBackdrop image={BACKDROPS.crops} overlay="from-leaf-900/70 via-emerald-950/50 to-earth-900/75" />
      
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-earth-800 flex items-center gap-2"><Sprout className="w-6 h-6 text-leaf-600"/> Crop Advisor</h1>
        <p className="text-earth-500 mt-1 text-sm">{crops.length > 0 ? `${crops.length} crops` : 'All crops'} with specific varieties, planting guides, and market info.</p>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-earth-100 mb-5">
        <div className="flex gap-3 flex-wrap">
          <div className="flex gap-2 flex-wrap">
            <button onClick={()=>setFilters(f=>({...f,category:''}))}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${!filters.category?'bg-leaf-600 text-white':'bg-earth-100 text-earth-600 hover:bg-earth-200'}`}>
              All
            </button>
            {CATS.map(c=>(
              <button key={c} onClick={()=>setFilters(f=>({...f,category:c}))}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${filters.category===c?'bg-leaf-600 text-white':'bg-earth-100 text-earth-600 hover:bg-earth-200'}`}>
                {c}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <Search className="w-4 h-4 text-earth-400"/>
            <input placeholder="Search crops..." value={filters.search} onChange={e=>setFilters(f=>({...f,search:e.target.value}))}
              onKeyDown={e=>e.key==='Enter'&&fetch()}
              className="border border-earth-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-leaf-500 w-48"/>
            <button onClick={fetch} className="bg-leaf-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-leaf-700">Search</button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-earth-400">Loading crops...</div>
      ) : crops.length === 0 ? (
        <div className="text-center py-16 text-earth-400 bg-white rounded-xl border border-earth-100">No crops found for these filters.</div>
      ) : (
        <div className="space-y-2">
          {crops.map(crop=>(
            <div key={crop.id} className="bg-white rounded-xl shadow-sm border border-earth-100 overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-earth-50 transition-colors"
                onClick={()=>setExpanded(expanded===crop.id?null:crop.id)}>
                <div className="w-9 h-9 rounded-lg bg-leaf-100 flex items-center justify-center flex-shrink-0">
                  <Sprout className="w-4 h-4 text-leaf-600"/>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-earth-800 text-sm">{crop.name}</div>
                  <div className="text-xs text-earth-400 truncate">{crop.description}</div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-earth-500 capitalize hidden md:block bg-earth-100 px-2 py-0.5 rounded-full">{crop.subcategory||crop.category}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${WATER_COLOR[crop.water_requirement]||'bg-earth-100 text-earth-600'}`}>
                    <Droplets className="w-3 h-3 inline mr-0.5"/>{crop.water_requirement}
                  </span>
                  <span className="text-xs text-earth-400 flex items-center gap-0.5 hidden md:flex"><Clock className="w-3 h-3"/>{crop.maturity_days}d</span>
                  {user?.role==='admin' && (
                    <button onClick={e=>{e.stopPropagation();deleteCrop(crop.id)}} disabled={deleting===crop.id}
                      className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                      <Trash2 className="w-4 h-4"/>
                    </button>
                  )}
                  {expanded===crop.id?<ChevronUp className="w-4 h-4 text-earth-400"/>:<ChevronDown className="w-4 h-4 text-earth-400"/>}
                </div>
              </div>

              {expanded===crop.id && (
                <div className="px-5 pb-5 border-t border-earth-100 pt-4">
                  {/* Varieties */}
                  {crop.varieties?.length>0 && (
                    <div className="mb-4">
                      <h4 className="text-xs font-bold text-earth-600 uppercase mb-2">🌱 Varieties & Cultivars</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {crop.varieties.map((v,i)=>(
                          <div key={i} className="bg-leaf-50 border border-leaf-100 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-leaf-800 text-sm">{v.name}</span>
                              <span className="text-xs bg-leaf-200 text-leaf-700 px-1.5 py-0.5 rounded">{v.type}</span>
                              {v.maturity_days && <span className="text-xs text-leaf-600 ml-auto">{v.maturity_days} days</span>}
                            </div>
                            <p className="text-xs text-leaf-700">{v.notes}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {crop.suitable_aez?.length>0 && (
                      <div>
                        <h4 className="text-xs font-bold text-earth-600 uppercase mb-2">Agro-Ecological Zones</h4>
                        <div className="flex flex-wrap gap-1">
                          {crop.suitable_aez.map(z=><span key={z} className="text-xs bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full">{z}</span>)}
                        </div>
                      </div>
                    )}
                    {crop.soil_types?.length>0 && (
                      <div>
                        <h4 className="text-xs font-bold text-earth-600 uppercase mb-2">Soil Types</h4>
                        <div className="flex flex-wrap gap-1">
                          {crop.soil_types.map(s=><span key={s} className="text-xs bg-earth-100 text-earth-600 px-2 py-0.5 rounded-full">{s}</span>)}
                        </div>
                      </div>
                    )}
                    {crop.planting_months?.length>0 && (
                      <div>
                        <h4 className="text-xs font-bold text-earth-600 uppercase mb-2">Planting Months</h4>
                        <div className="flex flex-wrap gap-1">
                          {crop.planting_months.map(m=><span key={m} className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{m}</span>)}
                        </div>
                      </div>
                    )}
                    <div>
                      <h4 className="text-xs font-bold text-earth-600 uppercase mb-2">Altitude Range</h4>
                      <p className="text-sm text-earth-700">{crop.altitude_min_m}m — {crop.altitude_max_m}m asl</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-earth-600 uppercase mb-2">Expected Yield</h4>
                      <p className="text-sm text-earth-700">{crop.expected_yield}</p>
                    </div>
                    {crop.market_price_ksh && (
                      <div>
                        <h4 className="text-xs font-bold text-earth-600 uppercase mb-2">Market Price (KSh)</h4>
                        <p className="text-sm text-earth-700">{crop.market_price_ksh}</p>
                      </div>
                    )}
                    <div className="md:col-span-2">
                      <h4 className="text-xs font-bold text-earth-600 uppercase mb-2">Care Tips</h4>
                      <p className="text-sm text-earth-700 leading-relaxed">{crop.care_tips}</p>
                    </div>
                    {crop.best_counties?.length>0 && (
                      <div className="md:col-span-2">
                        <h4 className="text-xs font-bold text-earth-600 uppercase mb-2">Best Counties</h4>
                        <div className="flex flex-wrap gap-1">
                          {crop.best_counties.map(c=><span key={c} className="text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full">{c}</span>)}
                        </div>
                      </div>
                    )}
                    {crop.diseases?.length>0 && (
                      <div className="md:col-span-2">
                        <h4 className="text-xs font-bold text-red-500 uppercase mb-2">⚠️ Common Diseases/Pests</h4>
                        <div className="flex flex-wrap gap-1">
                          {crop.diseases.map(d=><span key={d} className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full">{d}</span>)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
    </>
  )
}
