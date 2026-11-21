import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import { useAuth } from '../lib/auth'
import LocationDetector from '../components/LocationDetector'
import type { DetectedLocation } from '../lib/useAutoLocation'
import PhotoHero from '../components/PhotoHero'

export default function ClimateAdvisor() {
  const { user, updateProfile } = useAuth()
  const saved: DetectedLocation | null = user?.county
    ? { county: user.county, constituency: user.constituency || '', ward: user.ward || '' }
    : null

  const [loc, setLoc] = useState<DetectedLocation | null>(saved)
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const analyze = async (l: DetectedLocation) => {
    setError(''); setLoading(true); setResult(null)
    try {
      const r = await api.get('/climate/analyze', { params: { county: l.county, constituency: l.constituency } })
      setResult(r.data)
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Analysis failed. Please try again.')
    }
    setLoading(false)
  }

  // Use the location saved on the profile straight away.
  useEffect(() => { if (saved) analyze(saved) }, [])

  // A fresh GPS detection: analyse it and keep the profile up to date.
  const onDetected = (l: DetectedLocation) => {
    setLoc(l)
    analyze(l)
    if (!saved || saved.county !== l.county || saved.constituency !== l.constituency || saved.ward !== l.ward) {
      updateProfile({ county: l.county, constituency: l.constituency, ward: l.ward }).catch(() => {})
    }
  }

  const place = result ? [loc?.ward, result.constituency || loc?.constituency, result.county].filter(Boolean).join(', ') : ''

  return (
    <div className="wrap">
      <PhotoHero compact image="/images/climate.jpg" title="Climate and location" subtitle="Switch on your location to see the climate zone and the crops and livestock that suit your farm." />

      <div className="card card-pad" style={{ marginTop: 16 }}>
        <LocationDetector value={loc} onDetected={onDetected} />
        {error && <div className="alert alert-error" style={{ marginTop: 14, marginBottom: 0 }}>{error}</div>}
      </div>

      {loading && <div className="empty card" style={{ marginTop: 16 }}>Analyzing your location...</div>}
      {!result && !loading && !error && <div className="empty card" style={{ marginTop: 16 }}>Tap Detect my location to see the climate, crops and livestock for your farm.</div>}

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
