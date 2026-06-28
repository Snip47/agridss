import { useState, useEffect } from 'react'
import api from '../lib/api'
import { MapPin, Thermometer, Droplets, Mountain, Sprout, Beef, Loader2, ArrowRight, Sun } from 'lucide-react'
import { Link } from 'react-router-dom'

interface ClimateData {
  county:string; constituency:string; climate_zone:string; aez_name:string; aez_description:string;
  altitude_m:number; rainfall_mm_annual:number; temperature_range:string; soil_types:string[];
  dry_months:string[]; good_planting_months:string[];
  recommended_crops:any[]; recommended_animals:any[]; farming_advice:string[];
}

export default function ClimateAdvisor() {
  const [counties, setCounties] = useState<string[]>([])
  const [constituencies, setConstituencies] = useState<string[]>([])
  const [wards, setWards] = useState<string[]>([])
  const [sel, setSel] = useState({ county:'', constituency:'', ward:'' })
  const [climate, setClimate] = useState<ClimateData|null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { api.get('/location/counties').then(r=>setCounties(r.data)) }, [])
  useEffect(() => {
    if (sel.county) {
      api.get('/location/constituencies',{params:{county:sel.county}}).then(r=>setConstituencies(r.data))
      setSel(s=>({...s,constituency:'',ward:''})); setConstituencies([]); setWards([]); setClimate(null)
    }
  }, [sel.county])
  useEffect(() => {
    if (sel.county && sel.constituency) {
      api.get('/location/wards',{params:{county:sel.county,constituency:sel.constituency}}).then(r=>setWards(r.data))
      setSel(s=>({...s,ward:''})); setWards([])
    }
  }, [sel.constituency])

  const analyze = async () => {
    if (!sel.county || !sel.constituency) return
    setLoading(true); setError('')
    try {
      const r = await api.get('/location/climate', { params: { county:sel.county, constituency:sel.constituency } })
      setClimate(r.data)
    } catch (e:any) {
      setError(e?.response?.data?.detail || 'Failed to load climate data')
    }
    setLoading(false)
  }

  const selCls = "border border-earth-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-leaf-500 bg-white"

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-earth-800 flex items-center gap-2"><MapPin className="w-6 h-6 text-sky-600"/> Climate & Location Advisor</h1>
        <p className="text-earth-500 mt-1 text-sm">Select your exact location to get climate analysis, agro-ecological zone info, and specific crop & livestock recommendations.</p>
      </div>

      {/* Location selector */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-earth-100 mb-6">
        <h2 className="font-bold text-earth-800 mb-4 text-sm">📍 Select Your Location</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-semibold text-earth-600 mb-1">County</label>
            <select value={sel.county} onChange={e=>setSel(s=>({...s,county:e.target.value}))} className={selCls+" w-full"}>
              <option value="">Select County</option>
              {counties.map(c=><option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-earth-600 mb-1">Constituency</label>
            <select value={sel.constituency} onChange={e=>setSel(s=>({...s,constituency:e.target.value}))} className={selCls+" w-full"} disabled={!sel.county}>
              <option value="">Select Constituency</option>
              {constituencies.map(c=><option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-earth-600 mb-1">Ward (optional)</label>
            <select value={sel.ward} onChange={e=>setSel(s=>({...s,ward:e.target.value}))} className={selCls+" w-full"} disabled={!sel.constituency}>
              <option value="">Select Ward</option>
              {wards.map(w=><option key={w} value={w}>{w}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={analyze} disabled={!sel.county||!sel.constituency||loading}
              className="w-full bg-leaf-600 hover:bg-leaf-700 text-white font-semibold py-2 rounded-lg text-sm transition-colors disabled:opacity-40 flex items-center justify-center gap-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin"/>Analyzing...</> : '🔍 Analyze Location'}
            </button>
          </div>
        </div>
        {error && <div className="mt-3 text-red-600 text-sm bg-red-50 rounded-lg p-3">{error}</div>}
        {!sel.county && (
          <div className="mt-3 text-earth-400 text-xs">💡 Tip: Select your county, then constituency for accurate agro-ecological analysis. Ward selection gives even more specific results.</div>
        )}
      </div>

      {/* Results */}
      {climate && (
        <div className="space-y-5">
          {/* Climate summary */}
          <div className="bg-gradient-to-r from-sky-700 to-sky-600 rounded-xl p-6 text-white">
            <div className="flex items-start gap-4">
              <div className="text-4xl">🌍</div>
              <div className="flex-1">
                <div className="font-bold text-xl">{climate.constituency}, {climate.county}</div>
                <div className="text-sky-100 text-sm mt-0.5">{climate.aez_name} — Zone {climate.climate_zone}</div>
                <p className="text-sky-100 text-sm mt-2 leading-relaxed">{climate.aez_description}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
              {[
                {icon:Mountain, label:'Altitude', val:`${climate.altitude_m}m asl`},
                {icon:Droplets, label:'Annual Rainfall', val:`${climate.rainfall_mm_annual}mm`},
                {icon:Thermometer, label:'Temperature', val:climate.temperature_range},
                {icon:Sun, label:'Dry Months', val:climate.dry_months.length?climate.dry_months.join(', '):'None noted'},
              ].map(({icon:Icon,label,val})=>(
                <div key={label} className="bg-white/10 rounded-lg p-3">
                  <Icon className="w-4 h-4 text-sky-200 mb-1"/>
                  <div className="text-xs text-sky-200">{label}</div>
                  <div className="text-sm font-bold">{val}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Soil + planting */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-earth-100">
              <h3 className="font-bold text-earth-800 mb-3 text-sm">🏔️ Soil Types</h3>
              <div className="flex flex-wrap gap-2">
                {climate.soil_types.map(s=>(
                  <span key={s} className="bg-earth-100 text-earth-700 px-3 py-1 rounded-full text-xs font-medium">{s}</span>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-earth-100">
              <h3 className="font-bold text-earth-800 mb-3 text-sm">📅 Best Planting Months</h3>
              <div className="flex flex-wrap gap-2">
                {climate.good_planting_months.map(m=>(
                  <span key={m} className="bg-leaf-100 text-leaf-700 px-3 py-1 rounded-full text-xs font-medium">{m}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Farming advice */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-earth-100">
            <h3 className="font-bold text-earth-800 mb-3 text-sm">💡 Farming Advice for This Zone</h3>
            <div className="space-y-2">
              {climate.farming_advice.map((a,i)=>(
                <div key={i} className="text-sm text-earth-700 bg-earth-50 rounded-lg px-4 py-2.5">{a}</div>
              ))}
            </div>
          </div>

          {/* Recommended crops */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-earth-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-earth-800 text-sm flex items-center gap-2"><Sprout className="w-4 h-4 text-leaf-600"/> Recommended Crops ({climate.recommended_crops.length})</h3>
              <Link to="/crops" className="text-xs text-leaf-600 font-medium flex items-center gap-1 hover:underline">View all<ArrowRight className="w-3 h-3"/></Link>
            </div>
            {climate.recommended_crops.length === 0 ? (
              <p className="text-sm text-earth-400">No crops matched for this exact zone yet. <Link to="/crops" className="text-leaf-600 underline">Browse all crops</Link></p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {climate.recommended_crops.map(crop=>(
                  <div key={crop.id} className="border border-earth-100 rounded-lg p-3 hover:border-leaf-300 transition-colors">
                    <div className="font-semibold text-earth-800 text-sm">{crop.name}</div>
                    <div className="text-xs text-earth-400 capitalize mb-2">{crop.category} · {crop.maturity_days} days · {crop.water_requirement} water</div>
                    {crop.varieties?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {crop.varieties.slice(0,2).map((v:any)=>(
                          <span key={v.name} className="text-xs bg-leaf-50 text-leaf-700 px-2 py-0.5 rounded-full">{v.name}</span>
                        ))}
                      </div>
                    )}
                    <div className="text-xs text-earth-500 mt-1.5">{crop.expected_yield}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recommended animals */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-earth-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-earth-800 text-sm flex items-center gap-2"><Beef className="w-4 h-4 text-earth-600"/> Recommended Livestock ({climate.recommended_animals.length})</h3>
              <Link to="/livestock" className="text-xs text-earth-600 font-medium flex items-center gap-1 hover:underline">View all<ArrowRight className="w-3 h-3"/></Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {climate.recommended_animals.map(a=>(
                <div key={a.id} className="border border-earth-100 rounded-lg p-3 hover:border-earth-300 transition-colors">
                  <div className="font-semibold text-earth-800 text-sm">{a.name}</div>
                  <div className="text-xs text-earth-400 capitalize mb-2">{a.category} · {a.purpose}</div>
                  {a.breeds?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {a.breeds.slice(0,2).map((b:any)=>(
                        <span key={b.name} className="text-xs bg-earth-50 text-earth-600 px-2 py-0.5 rounded-full">{b.name}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!climate && !loading && (
        <div className="bg-white rounded-xl border border-earth-100 p-16 text-center">
          <div className="text-6xl mb-4">🗺️</div>
          <h3 className="font-bold text-earth-700 text-lg">Select Your Location Above</h3>
          <p className="text-earth-400 text-sm mt-2 max-w-sm mx-auto">Choose your county and constituency to see your agro-ecological zone, climate data, and best crops & livestock for your specific location.</p>
        </div>
      )}
    </div>
  )
}
