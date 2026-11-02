import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import { useAuth } from '../lib/auth'
import PhotoHero from '../components/PhotoHero'

const bg = (img: string) => ({ backgroundImage: `linear-gradient(to top, rgba(0,0,0,.72), rgba(0,0,0,.18)), url(${img})` })

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
  const cards = [
    { to: '/crops', img: '/images/crops.jpg', title: 'Browse crops', text: 'Varieties, planting months, soil needs, yields and market prices.', cta: 'Browse crops' },
    { to: '/livestock', img: '/images/livestock.jpg', title: 'Explore livestock', text: 'Breeds, feeding, housing and vaccination schedules for every species.', cta: 'Explore livestock' },
    { to: '/diseases', img: '/images/diseases.jpg', title: 'Diagnose diseases', text: 'Symptoms, treatment and prevention for crop and livestock diseases.', cta: 'View diseases' },
    { to: '/climate', img: '/images/climate.jpg', title: 'Check your climate', text: 'See the zone, rainfall and best crops for your county and ward.', cta: 'Analyze location' },
  ]

  return (
    <div className="wrap">
      <PhotoHero
        image="/images/ai.jpg"
        title="Farm smarter. Decide with confidence."
        subtitle={`Welcome, ${first}. AgriDSS Kenya gives you crop, livestock and disease guidance for your exact location, with an AI advisor in English and Swahili.`}
      >
        <Link to="/climate" className="btn btn-white">Analyze my location &rarr;</Link>
      </PhotoHero>

      <div className="section" style={{ paddingBottom: 0 }}>
        <div className="chips">
          {chips.map(c => <Link key={c.to} to={c.to} className="chip">{c.label}</Link>)}
        </div>
      </div>

      <div className="section">
        <div className="grid-2">
          {cards.map(c => (
            <Link key={c.to} to={c.to} className="photo-card" style={bg(c.img)}>
              <h3>{c.title}</h3>
              <p>{c.text}</p>
              <span>{c.cta} &rarr;</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="section" style={{ paddingTop: 0 }}>
        <Link to="/ai" className="photo-card" style={{ ...bg('/images/ai.jpg'), minHeight: 200 }}>
          <h3>Ask the AI farm advisor</h3>
          <p>Upload a photo of a sick crop or animal and get a diagnosis with treatment using products available in Kenya.</p>
          <span>Open advisor &rarr;</span>
        </Link>
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
  )
}
