import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import { useAuth } from '../lib/auth'

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<any>(null)
  const [crops, setCrops] = useState<any[]>([])

  useEffect(() => {
    api.get('/dashboard/stats').then(r => setStats(r.data)).catch(() => {})
    api.get('/crops/').then(r => setCrops(Array.isArray(r.data) ? r.data.slice(0, 6) : [])).catch(() => {})
  }, [])

  const first = user?.name?.split(' ')[0] || 'Farmer'
  const chips = [
    { to: '/climate', label: 'Climate and location' },
    { to: '/crops', label: 'Crops' },
    { to: '/livestock', label: 'Livestock' },
    { to: '/diseases', label: 'Diseases' },
    { to: '/ai', label: 'AI farm advisor' },
  ]

  return (
    <div>
      <section className="hero">
        <div className="wrap">
          <h1>Farm smarter. Decide with confidence.</h1>
          <p>Welcome, {first}. AgriDSS Kenya gives you crop, livestock and disease guidance for your exact location, with an AI advisor in English and Swahili.</p>
          <Link to="/climate" className="btn btn-white">Analyze my location</Link>
        </div>
      </section>

      <div className="wrap">
        <div className="section" style={{ paddingBottom: 0 }}>
          <div className="chips">
            {chips.map(c => <Link key={c.to} to={c.to} className="chip">{c.label}</Link>)}
          </div>
        </div>

        <div className="section">
          <div className="grid-2">
            <Link to="/crops" className="promo">
              <h3>Browse crops</h3>
              <p>Varieties, planting months, soil needs, yields and market prices for crops grown across Kenya.</p>
              <span>Browse crops &rarr;</span>
            </Link>
            <Link to="/livestock" className="promo">
              <h3>Explore livestock</h3>
              <p>Breeds, feeding, housing, vaccination schedules and market information for every species.</p>
              <span>Explore livestock &rarr;</span>
            </Link>
          </div>
        </div>

        <div className="section" style={{ paddingTop: 0 }}>
          <div className="notice"><b>Photo diagnosis.</b> Open the AI farm advisor, upload a photo of a sick crop or animal and get a diagnosis with treatment using products available in Kenya.</div>
        </div>

        <div className="section">
          <div className="section-head"><h2>Knowledge base</h2></div>
          <div className="grid-4">
            {[['Crops', stats?.crops], ['Livestock types', stats?.animals], ['Diseases', stats?.diseases], ['Registered farmers', stats?.users]].map(([l, n]) => (
              <div key={l as string} className="card stat">
                <div className="n">{n ?? '-'}</div>
                <div className="l">{l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="section">
          <div className="section-head"><h2>Featured crops</h2><Link to="/crops" className="link-green">View all &rarr;</Link></div>
          {crops.length === 0 ? <div className="empty card">No crops loaded yet.</div> : (
            <div className="grid-3">
              {crops.map(c => (
                <Link to="/crops" key={c.id} className="card card-pad card-hover">
                  <div className="badges" style={{ marginBottom: 8 }}><span className="badge badge-green">{c.category}</span></div>
                  <h3>{c.name}</h3>
                  <p className="sub">{c.maturity_days} days to maturity</p>
                  {c.market_price_ksh && <p style={{ marginTop: 10, fontWeight: 700, color: 'var(--g)', fontSize: 14 }}>KSh {c.market_price_ksh}</p>}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
