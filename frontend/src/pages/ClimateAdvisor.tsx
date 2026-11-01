import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import { KENYA_LOCATIONS, COUNTY_NAMES } from '../lib/kenyaLocations'

export default function ClimateAdvisor() {
  const [county, setCounty] = useState('')
  const [constituency, setConstituency] = useState('')
  const [ward, setWard] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const constituencies = county && KENYA_LOCATIONS[county] ? Object.keys(KENYA_LOCATIONS[county]).sort() : []
  const wards = county && constituency && KENYA_LOCATIONS[county]?.[constituency] ? [...KENYA_LOCATIONS[county][constituency]].sort() : []

  const analyze = async () => {
    if (!county) { setError('Please select a county first'); return }
    setError(''); setLoading(true); setResult(null)
    try {
      const r = await api.get('/climate/analyze', { params: { county, constituency } })
      setResult(r.data)
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Analysis failed. Please try again.')
    }
    setLoading(false)
  }

  const place = result ? [ward, result.constituency, result.county].filter(Boolean).join(', ') : ''

  return (
    <div className="wrap">
      <div className="page-head">
        <h1>Climate and location</h1>
        <p>Select your location to see the climate zone and the crops and livestock that suit it.</p>
      </div>

      <div className="card card-pad" style={{ marginTop: 16 }}>
        <div className="form-grid three">
          <div>
            <label className="label">County</label>
            <select className="select" value={county} onChange={e => { setCounty(e.target.value); setConstituency(''); setWard(''); setResult(null) }}>
              <option value="">Select county</option>
              {COUNTY_NAMES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Constituency</label>
            <select className="select" value={constituency} onChange={e => { setConstituency(e.target.value); setWard('') }} disabled={!county}>
              <option value="">Select constituency</option>
              {constituencies.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Ward</label>
            <select className="select" value={ward} onChange={e => setWard(e.target.value)} disabled={!constituency}>
              <option value="">Select ward</option>
              {wards.map(w => <option key={w} value={w}>{w}</option>)}
            </select>
          </div>
        </div>
        {error && <div className="alert alert-error" style={{ marginTop: 14, marginBottom: 0 }}>{error}</div>}
        <div style={{ marginTop: 16 }}>
          <button className="btn btn-primary" onClick={analyze} disabled={!county || loading}>{loading ? 'Analyzing...' : 'Analyze location'}</button>
        </div>
      </div>

      {!result && !loading && <div className="empty card" style={{ marginTop: 16 }}>Choose a county, then click Analyze location.</div>}

      {result && (
        <div className="fade" style={{ marginTop: 16, display: 'grid', gap: 16 }}>
          <div className="card card-pad">
            <h2 style={{ fontSize: 22, fontWeight: 800 }}>{place}</h2>
            <p style={{ color: 'var(--g)', fontWeight: 600, marginTop: 4 }}>{result.zone_name} (zone {result.zone})</p>
            <p className="prose" style={{ marginTop: 6 }}>{result.description}</p>
            <div className="kv" style={{ marginTop: 16 }}>
              <div><div className="k">Altitude</div><div className="v">{result.altitude} m</div></div>
              <div><div className="k">Annual rainfall</div><div className="v">{result.rainfall} mm</div></div>
              <div><div className="k">Temperature</div><div className="v">{result.temperature}</div></div>
              <div><div className="k">Dry months</div><div className="v">{(result.dry_months || []).join(', ') || 'None'}</div></div>
            </div>
            <div className="block-title">Soil types</div>
            <div className="badges">{(result.soil_types || []).map((s: string) => <span key={s} className="badge badge-amber">{s}</span>)}</div>
            <div className="block-title">Best planting months</div>
            <div className="badges">{(result.planting_months || []).map((m: string) => <span key={m} className="badge badge-green">{m}</span>)}</div>
          </div>

          <div className="card card-pad">
            <h3 style={{ fontSize: 18, marginBottom: 12 }}>Farming challenges in this area</h3>
            {(result.challenges || []).map((c: string, i: number) => (
              <div key={i} className="numbered"><b>{i + 1}.</b><span>{c}</span></div>
            ))}
          </div>

          <div className="card card-pad">
            <div className="section-head" style={{ marginBottom: 12 }}>
              <h3 style={{ fontSize: 18 }}>Recommended crops</h3>
              <Link to="/crops" className="link-green">Browse all &rarr;</Link>
            </div>
            {(result.recommended_crops || []).length > 0 && (
              <div className="grid-3" style={{ marginBottom: 14 }}>
                {result.recommended_crops.map((c: any) => (
                  <Link to="/crops" key={c.id} className="row-item card-hover" style={{ margin: 0 }}>
                    <div className="t">{c.name}</div>
                    <div className="d" style={{ textTransform: 'capitalize' }}>{c.category} - {c.maturity_days} days</div>
                    {c.market_price_ksh && <div style={{ color: 'var(--g)', fontWeight: 700, fontSize: 13, marginTop: 4 }}>KSh {c.market_price_ksh}</div>}
                  </Link>
                ))}
              </div>
            )}
            <div className="d" style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 6 }}>Suited to this zone</div>
            <div className="badges">{(result.best_crops || []).map((c: string) => <span key={c} className="badge badge-green">{c}</span>)}</div>
          </div>

          <div className="card card-pad">
            <div className="section-head" style={{ marginBottom: 12 }}>
              <h3 style={{ fontSize: 18 }}>Recommended livestock</h3>
              <Link to="/livestock" className="link-green">Browse all &rarr;</Link>
            </div>
            {(result.recommended_livestock || []).length > 0 && (
              <div className="grid-3" style={{ marginBottom: 14 }}>
                {result.recommended_livestock.map((a: any) => (
                  <Link to="/livestock" key={a.id} className="row-item card-hover" style={{ margin: 0 }}>
                    <div className="t">{a.name}</div>
                    <div className="d" style={{ textTransform: 'capitalize' }}>{a.category} - {a.purpose}</div>
                  </Link>
                ))}
              </div>
            )}
            <div className="d" style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 6 }}>Suited to this zone</div>
            <div className="badges">{(result.best_livestock || []).map((a: string) => <span key={a} className="badge badge-amber">{a}</span>)}</div>
          </div>
        </div>
      )}
    </div>
  )
}
