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

const G = ({ children, className='' }: { children:React.ReactNode; className?:string }) => (
  <div className={className} style={{ background:'rgba(0,0,0,0.38)', backdropFilter:'blur(18px)', border:'1px solid rgba(255,255,255,0.11)', borderRadius:'1rem' }}>{children}</div>
)

const selStyle = { background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.18)', color:'white', borderRadius:'0.75rem', padding:'0.5rem 0.75rem', fontSize:'0.875rem', width:'100%' }

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
      const r = await api.get('/location/climate', { params:{ county:sel.county, constituency:sel.constituency } })
      setClimate(r.data)
    } catch (e:any) { setError(e?.response?.data?.detail || 'Failed to load climate data') }
    setLoading(false)
  }

  return (
    <div className="slide-up">
      <div className="mb-6">
        <h1 className="text-4xl font-black text-white flex items-center gap-3 drop-shadow-2xl">
          <MapPin className="w-9 h-9 text-blue-400"/> Climate & Location
        </h1>
        <p className="text-white/55 mt-2">Select your exact location to get climate analysis and crop/livestock recommendations.</p>
      </div>

      <G className="p-5 mb-6">
        <h2 className="font-bold text-white mb-4 text-sm">📍 Select Your Location</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-semibold text-white/50 mb-1.5">County *</label>
            <select value={sel.county} onChange={e=>setSel(s=>({...s,county:e.target.value}))} style={selStyle}>
              <option value="">Select County</option>
              {counties.map(c=><option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-white/50 mb-1.5">Constituency *</label>
            <select value={sel.constituency} onChange={e=>setSel(s=>({...s,constituency:e.target.value}))} style={{...selStyle, opacity:!sel.county?0.4:1}} disabled={!sel.county}>
              <option value="">Select Constituency</option>
              {constituencies.map(c=><option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-white/50 mb-1.5">Ward</label>
            <select value={sel.ward} onChange={e=>setSel(s=>({...s,ward:e.target.value}))} style={{...selStyle, opacity:!sel.constituency?0.4:1}} disabled={!sel.constituency}>
              <option value="">Select Ward</option>
              {wards.map(w=><option key={w} value={w}>{w}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={analyze} disabled={!sel.county||!sel.constituency||loading}
              className="w-full py-2 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-40 flex items-center justify-center gap-2"
              style={{ background:'rgba(96,165,250,0.7)', border:'1px solid rgba(96,165,250,0.5)' }}>
              {loading?<><Loader2 className="w-4 h-4 animate-spin"/>Analyzing...</>:'🔍 Analyze Location'}
            </button>
          </div>
        </div>
        {error && <div className="mt-3 text-red-300 text-sm p-3 rounded-xl" style={{ background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.3)' }}>{error}</div>}
      </G>

      {climate && (
        <div className="space-y-5">
          {/* Climate Summary */}
          <div className="rounded-2xl p-6 text-white" style={{ background:'rgba(14,78,120,0.55)', backdropFilter:'blur(18px)', border:'1px solid rgba(96,165,250,0.3)' }}>
            <div className="flex items-start gap-4">
              <div className="text-5xl">🌍</div>
              <div className="flex-1">
                <div className="font-black text-2xl">{climate.constituency}, {climate.county}</div>
                <div className="text-blue-200 text-sm mt-0.5">{climate.aez_name} — Zone {climate.climate_zone}</div>
                <p className="text-blue-100/80 text-sm mt-2 leading-relaxed">{climate.aez_description}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
              {[
                {icon:Mountain,label:'Altitude',val:`${climate.altitude_m}m asl`},
                {icon:Droplets,label:'Annual Rainfall',val:`${climate.rainfall_mm_annual}mm`},
                {icon:Thermometer,label:'Temperature',val:climate.temperature_range},
                {icon:Sun,label:'Dry Months',val:climate.dry_months.length?climate.dry_months.slice(0,3).join(', ')+(climate.dry_months.length>3?'...':''):'None'},
              ].map(({icon:Icon,label,val})=>(
                <div key={label} className="p-3 rounded-xl" style={{ background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.15)' }}>
                  <Icon className="w-4 h-4 text-blue-200 mb-1"/>
                  <div className="text-xs text-blue-200/70">{label}</div>
                  <div className="text-sm font-bold text-white">{val}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <G className="p-5">
              <h3 className="font-bold text-white mb-3 text-sm">🏔️ Soil Types</h3>
              <div className="flex flex-wrap gap-2">
                {climate.soil_types.map(s=>(
                  <span key={s} className="px-3 py-1 rounded-full text-xs font-medium" style={{ background:'rgba(251,191,36,0.15)', color:'#fbbf24', border:'1px solid rgba(251,191,36,0.3)' }}>{s}</span>
                ))}
              </div>
            </G>
            <G className="p-5">
              <h3 className="font-bold text-white mb-3 text-sm">📅 Best Planting Months</h3>
              <div className="flex flex-wrap gap-2">
                {climate.good_planting_months.map(m=>(
                  <span key={m} className="px-3 py-1 rounded-full text-xs font-medium" style={{ background:'rgba(34,197,94,0.15)', color:'#4ade80', border:'1px solid rgba(34,197,94,0.3)' }}>{m}</span>
                ))}
              </div>
            </G>
          </div>

          <G className="p-5">
            <h3 className="font-bold text-white mb-3 text-sm">💡 Farming Advice for This Zone</h3>
            <div className="space-y-2">
              {climate.farming_advice.map((a,i)=>(
                <div key={i} className="text-sm text-white/75 px-4 py-2.5 rounded-xl" style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.09)' }}>{a}</div>
              ))}
            </div>
          </G>

          {/* Recommended crops */}
          <G className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white text-sm flex items-center gap-2"><Sprout className="w-4 h-4 text-green-400"/> Recommended Crops ({climate.recommended_crops.length})</h3>
              <Link to="/crops" className="text-xs text-green-400 font-semibold flex items-center gap-1 hover:underline">View all<ArrowRight className="w-3 h-3"/></Link>
            </div>
            {climate.recommended_crops.length===0 ? (
              <p className="text-sm text-white/40">No crops matched. <Link to="/crops" className="text-green-400 underline">Browse all crops</Link></p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {climate.recommended_crops.map(crop=>(
                  <div key={crop.id} className="p-3 rounded-xl transition-all" style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.09)' }}>
                    <div className="font-bold text-white text-sm">{crop.name}</div>
                    <div className="text-xs text-white/45 capitalize mb-2">{crop.category} · {crop.maturity_days}d · {crop.water_requirement} water</div>
                    {crop.varieties?.length>0 && (
                      <div className="flex flex-wrap gap-1">
                        {crop.varieties.slice(0,2).map((v:any)=>(
                          <span key={v.name} className="text-xs px-2 py-0.5 rounded-full" style={{ background:'rgba(34,197,94,0.15)', color:'#4ade80', border:'1px solid rgba(34,197,94,0.25)' }}>{v.name}</span>
                        ))}
                      </div>
                    )}
                    <div className="text-xs text-white/35 mt-1.5">{crop.expected_yield}</div>
                  </div>
                ))}
              </div>
            )}
          </G>

          {/* Recommended animals */}
          <G className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white text-sm flex items-center gap-2"><Beef className="w-4 h-4 text-amber-400"/> Recommended Livestock ({climate.recommended_animals.length})</h3>
              <Link to="/livestock" className="text-xs text-amber-400 font-semibold flex items-center gap-1 hover:underline">View all<ArrowRight className="w-3 h-3"/></Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {climate.recommended_animals.map(a=>(
                <div key={a.id} className="p-3 rounded-xl" style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.09)' }}>
                  <div className="font-bold text-white text-sm">{a.name}</div>
                  <div className="text-xs text-white/45 capitalize mb-2">{a.category} · {a.purpose}</div>
                  {a.breeds?.length>0 && (
                    <div className="flex flex-wrap gap-1">
                      {a.breeds.slice(0,2).map((b:any)=>(
                        <span key={b.name} className="text-xs px-2 py-0.5 rounded-full" style={{ background:'rgba(251,191,36,0.15)', color:'#fbbf24', border:'1px solid rgba(251,191,36,0.25)' }}>{b.name}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </G>
        </div>
      )}

      {!climate && !loading && (
        <G className="py-20 text-center">
          <div className="text-7xl mb-4">🗺️</div>
          <h3 className="font-bold text-white/50 text-lg">Select Your Location Above</h3>
          <p className="text-white/30 text-sm mt-2 max-w-sm mx-auto">Choose county and constituency to see your climate zone, recommended crops and livestock.</p>
        </G>
      )}
    </div>
  )
}
