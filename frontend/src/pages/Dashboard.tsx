import { Link } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import PhotoHero from '../components/PhotoHero'

const bg = (img: string) => ({ backgroundImage: `linear-gradient(to top, rgba(0,0,0,.72), rgba(0,0,0,.18)), url(${img})` })

const cards = [
  { to: '/crops', img: '/images/crops.jpg', title: 'Browse crops', text: 'Varieties, planting months, soil needs, yields and market prices.', cta: 'Browse crops' },
  { to: '/livestock', img: '/images/livestock.jpg', title: 'Explore livestock', text: 'Breeds, feeding, housing and vaccination schedules for every species.', cta: 'Explore livestock' },
  { to: '/diseases', img: '/images/diseases.jpg', title: 'Diagnose diseases', text: 'Symptoms, treatment and prevention for crop and livestock diseases.', cta: 'View diseases' },
  { to: '/climate', img: '/images/climate.jpg', title: 'Check your climate', text: 'See the zone, rainfall and best crops for your county and ward.', cta: 'Analyze location' },
]

export default function Dashboard() {
  const { user } = useAuth()
  const first = user?.name?.split(' ')[0] || 'Farmer'

  return (
    <div className="wrap">
      <PhotoHero
        image="/images/ai.jpg"
        title="Farm smarter. Decide with confidence."
        subtitle={`Welcome, ${first}. AgriDSS Kenya gives you crop, livestock and disease guidance for your exact location, with an AI advisor in English and Swahili.`}
      />

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
    </div>
  )
}
