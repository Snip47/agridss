import { useState, useEffect } from 'react'
import api from '../lib/api'
import { useAuth } from '../lib/auth'
import { Link } from 'react-router-dom'
import { MapPin, ChevronRight, AlertTriangle } from 'lucide-react'

interface AnalysisResult {
  county: string; constituency: string; zone: string; zone_name: string
  altitude: number; rainfall: number; temperature: string
  dry_months: string[]; soil_types: string[]; planting_months: string[]
  best_crops: string[]; best_livestock: string[]; challenges: string[]
  recommended_crops: any[]; recommended_livestock: any[]
  description: string
}

const G = ({ children, className='' }: { children:React.ReactNode; className?:string }) => (
  <div className={className} style={{ background:'rgba(0,0,0,0.38)', backdropFilter:'blur(18px)', border:'1px solid rgba(255,255,255,0.11)', borderRadius:'1rem' }}>{children}</div>
)

const Badge = ({ children, color='rgba(255,255,255,0.1)', text='rgba(255,255,255,0.7)' }: any) => (
  <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background:color, color:text }}>{children}</span>
)

const CAT_EMOJI: Record<string,string> = { cereal:'🌾', legume:'🫘', vegetable:'🥬', fruit:'🍎', 'cash crop':'💰', flower:'🌸' }
const ANIMAL_EMOJI: Record<string,string> = { cattle:'🐄', goat:'🐐', sheep:'🐑', poultry:'🐔', rabbit:'🐇', pig:'🐷', fish:'🐟', bees:'🐝', camel:'🐪', donkey:'🫏', duck:'🦆', quail:'🐦', ostrich:'🦜' }

export default function ClimateAdvisor() {
  const { user } = useAuth()
  const [counties, setCounties] = useState<string[]>([])
  const [constituencies, setConstituencies] = useState<string[]>([])
  const [wards, setWards] = useState<string[]>([])
  const [county, setCounty] = useState('')
  const [constituency, setConstituency] = useState('')
  const [ward, setWard] = useState('')
  const [result, setResult] = useState<AnalysisResult|null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [analyzed, setAnalyzed] = useState(false)

  // Load counties on mount
  useEffect(() => {
    api.get('/location/counties').then(r => {
      if (Array.isArray(r.data)) setCounties(r.data)
    }).catch(() => {})
  }, [])

  // Pre-fill from user profile
  useEffect(() => {
    if (user?.county) setCounty(user.county)
    if ((user as any)?.constituency) setConstituency((user as any).constituency)
  }, [user])

  // Load constituencies when county changes
  useEffect(() => {
    if (!county) return
    setConstituencies([]); setWards([]); setConstituency(''); setWard('')
    api.get('/location/constituencies', { params: { county } }).then(r => {
      const data = r.data
      if (Array.isArray(data)) setConstituencies(data)
      else if (typeof data === 'object') setConstituencies(Object.keys(data))
    }).catch(() => {})
  }, [county])

  // Load wards when constituency changes
  useEffect(() => {
    if (!county || !constituency) return
    setWards([]); setWard('')
    api.get('/location/wards', { params: { county, constituency } }).then(r => {
      if (Array.isArray(r.data)) setWards(r.data)
    }).catch(() => {})
  }, [constituency])

  const analyze = async () => {
    if (!county) { setError('Please select a county first'); return }
    setError(''); setLoading(true); setResult(null)
    try {
      const r = await api.get('/climate/analyze', { params: { county, constituency } })
      setResult(r.data)
      setAnalyzed(true)
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Analysis failed. Please try again.')
    }
    setLoading(false)
  }

  const sStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)',
    color: 'white', borderRadius: '0.75rem', padding: '0.6rem 0.85rem',
    fontSize: '0.875rem', width: '100%', outline: 'none', cursor: 'pointer'
  }

  return (
    <div className="slide-up max-w-5xl">
      <div className="mb-6">
        <h1 className="text-3xl font-black text-white drop-shadow-2xl">Climate & Location</h1>
        <p className="text-white/45 mt-1 text-sm">Get crop and livestock recommendations for your exact location</p>
      </div>

      {/* Location selector */}
      <G className="p-5 mb-5">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-4 h-4 text-blue-400"/>
          <span className="font-bold text-white text-sm">Select Your Location</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div>
            <label className="block text-xs text-white/45 mb-1.5">County *</label>
            <select value={county} onChange={e=>setCounty(e.target.value)} style={sStyle}>
              <option value="">Select County</option>
              {counties.map(c=><option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-white/45 mb-1.5">Constituency</label>
            <select value={constituency} onChange={e=>setConstituency(e.target.value)}
              disabled={constituencies.length===0}
              style={{ ...sStyle, opacity: constituencies.length===0 ? 0.4 : 1 }}>
              <option value="">Select Constituency</option>
              {constituencies.map(c=><option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-white/45 mb-1.5">Ward</label>
            <select value={ward} onChange={e=>setWard(e.target.value)}
              disabled={wards.length===0}
              style={{ ...sStyle, opacity: wards.length===0 ? 0.4 : 1 }}>
              <option value="">Select Ward</option>
              {wards.map(w=><option key={w} value={w}>{w}</option>)}
            </select>
          </div>
        </div>
        {error && (
          <p className="text-sm text-red-400 mb-3">{error}</p>
        )}
        <button onClick={analyze} disabled={!county || loading}
          className="px-6 py-2.5 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-40"
          style={{ background:'rgba(34,197,94,0.8)', border:'1px solid rgba(34,197,94,0.5)' }}>
          {loading ? 'Analyzing...' : 'Analyze Location'}
        </button>
      </G>

      {/* Loading */}
      {loading && (
        <G className="p-8 text-center">
          <p className="text-white/50 text-sm">Analyzing your location...</p>
        </G>
      )}

      {/* Results */}
      {result && !loading && (
        <div className="space-y-4">

          {/* Zone summary */}
          <G className="p-5">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                style={{ background:'rgba(34,197,94,0.15)', border:'1px solid rgba(34,197,94,0.3)' }}>🌍</div>
              <div className="flex-1">
                <h2 className="text-xl font-black text-white">
                  {result.constituency ? `${result.constituency}, ` : ''}{result.county}
                </h2>
                <p className="text-sm text-green-400 font-semibold mt-0.5">{result.zone_name}</p>
                <p className="text-sm text-white/55 mt-1">{result.description}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              {[
                { label:'Altitude', val:`${result.altitude}m`, icon:'⛰️' },
                { label:'Annual Rainfall', val:`${result.rainfall}mm`, icon:'🌧️' },
                { label:'Temperature', val:result.temperature, icon:'🌡️' },
                { label:'Dry Months', val:(result.dry_months||[]).join(', ')||'None', icon:'☀️' },
              ].map(({ label, val, icon }) => (
                <div key={label} className="p-3 rounded-xl" style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)' }}>
                  <div className="text-xs text-white/40 mb-1">{icon} {label}</div>
                  <div className="text-sm font-bold text-white">{val}</div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-white/40 mb-2">🏔️ Soil Types</p>
                <div className="flex flex-wrap gap-1">
                  {(result.soil_types||[]).map(s=><Badge key={s} color="rgba(251,191,36,0.2)" text="#fde68a">{s}</Badge>)}
                </div>
              </div>
              <div>
                <p className="text-xs text-white/40 mb-2">📅 Best Planting Months</p>
                <div className="flex flex-wrap gap-1">
                  {(result.planting_months||[]).map(m=><Badge key={m} color="rgba(34,197,94,0.2)" text="#4ade80">{m}</Badge>)}
                </div>
              </div>
            </div>
          </G>

          {/* Challenges */}
          {(result.challenges||[]).length > 0 && (
            <G className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-4 h-4 text-red-400"/>
                <h3 className="font-bold text-white">Farming Challenges in This Area</h3>
              </div>
              <div className="space-y-2">
                {result.challenges.map((c, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl"
                    style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.18)' }}>
                    <span className="text-red-400 text-xs font-bold mt-0.5 flex-shrink-0">{i+1}.</span>
                    <p className="text-sm text-white/75 leading-relaxed">{c}</p>
                  </div>
                ))}
              </div>
            </G>
          )}

          {/* Recommended Crops */}
          <G className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white">
                Recommended Crops
                <span className="ml-2 text-xs text-white/40 font-normal">({(result.recommended_crops||[]).length} matched)</span>
              </h3>
              <Link to="/crops" className="text-xs text-green-400 font-semibold flex items-center gap-1 hover:text-green-300">
                Browse all <ChevronRight className="w-3 h-3"/>
              </Link>
            </div>

            {(result.recommended_crops||[]).length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                {result.recommended_crops.map(crop => (
                  <Link key={crop.id} to="/crops"
                    className="p-3 rounded-xl transition-all hover:scale-[1.02]"
                    style={{ background:'rgba(34,197,94,0.08)', border:'1px solid rgba(34,197,94,0.2)', textDecoration:'none' }}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xl">{CAT_EMOJI[crop.category]||'🌿'}</span>
                      <span className="font-semibold text-white text-sm">{crop.name}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge color="rgba(34,197,94,0.2)" text="#4ade80">{crop.category}</Badge>
                      <span className="text-xs text-white/35">{crop.maturity_days} days</span>
                    </div>
                    {crop.market_price_ksh && (
                      <p className="text-xs text-amber-400 mt-1 font-medium">KSh {crop.market_price_ksh}</p>
                    )}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-white/40 mb-3">Run the seed to populate crop data, then results will appear here.</p>
            )}

            <div className="pt-3" style={{ borderTop:'1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-xs text-white/40 mb-2">All crops suited to this zone:</p>
              <div className="flex flex-wrap gap-1">
                {(result.best_crops||[]).map(c=><Badge key={c} color="rgba(34,197,94,0.12)" text="#86efac">{c}</Badge>)}
              </div>
            </div>
          </G>

          {/* Recommended Livestock */}
          <G className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white">
                Recommended Livestock
                <span className="ml-2 text-xs text-white/40 font-normal">({(result.recommended_livestock||[]).length} matched)</span>
              </h3>
              <Link to="/livestock" className="text-xs text-amber-400 font-semibold flex items-center gap-1 hover:text-amber-300">
                Browse all <ChevronRight className="w-3 h-3"/>
              </Link>
            </div>

            {(result.recommended_livestock||[]).length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
                {result.recommended_livestock.map(animal => (
                  <Link key={animal.id} to="/livestock"
                    className="p-3 rounded-xl transition-all hover:scale-[1.02]"
                    style={{ background:'rgba(251,191,36,0.08)', border:'1px solid rgba(251,191,36,0.2)', textDecoration:'none' }}>
                    <div className="text-2xl mb-1">{ANIMAL_EMOJI[animal.category]||'🐾'}</div>
                    <div className="font-semibold text-white text-sm">{animal.name}</div>
                    <Badge color="rgba(251,191,36,0.2)" text="#fbbf24">{animal.purpose}</Badge>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-white/40 mb-3">Run the seed to populate livestock data.</p>
            )}

            <div className="pt-3" style={{ borderTop:'1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-xs text-white/40 mb-2">All livestock suited to this zone:</p>
              <div className="flex flex-wrap gap-1">
                {(result.best_livestock||[]).map(a=><Badge key={a} color="rgba(251,191,36,0.12)" text="#fde68a">{a}</Badge>)}
              </div>
            </div>
          </G>
        </div>
      )}

      {/* Empty state */}
      {!result && !loading && (
        <G className="p-10 text-center">
          <div className="text-5xl mb-4">🌍</div>
          <h3 className="font-bold text-white mb-2">Select Your Location</h3>
          <p className="text-sm text-white/40">Choose your county and click Analyze to get personalized crop and livestock recommendations</p>
        </G>
      )}
    </div>
  )
}
