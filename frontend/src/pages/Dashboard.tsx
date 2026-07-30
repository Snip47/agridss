import { useEffect, useState } from 'react'
import { useAuth } from '../lib/auth'
import api from '../lib/api'
import { Sprout, Beef, Bug, Leaf, MapPin, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

interface Stats { crops:number; animals:number; diseases:number; users:number }

const G = ({ children, className='' }: { children:React.ReactNode; className?:string }) => (
  <div className={className} style={{ background:'rgba(0,0,0,0.35)', backdropFilter:'blur(18px)', border:'1px solid rgba(255,255,255,0.11)', borderRadius:'1rem' }}>{children}</div>
)

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<Stats|null>(null)
  useEffect(() => { api.get('/dashboard/stats').then(r=>setStats(r.data)).catch(()=>{}) }, [])

  const cards = [
    { label:'Crops', val:stats?.crops??'—', icon:Sprout, c:'rgba(34,197,94,0.18)', bc:'rgba(34,197,94,0.35)', tc:'#4ade80', to:'/crops' },
    { label:'Livestock', val:stats?.animals??'—', icon:Beef, c:'rgba(251,191,36,0.18)', bc:'rgba(251,191,36,0.35)', tc:'#fbbf24', to:'/livestock' },
    { label:'Diseases', val:stats?.diseases??'—', icon:Bug, c:'rgba(239,68,68,0.18)', bc:'rgba(239,68,68,0.35)', tc:'#f87171', to:'/diseases' },
    { label:'Farmers', val:stats?.users??'—', icon:Leaf, c:'rgba(96,165,250,0.18)', bc:'rgba(96,165,250,0.35)', tc:'#60a5fa', to:'/' },
  ]

  const quickLinks = [
    { label:'Climate & Location Analysis', to:'/climate', icon:'🌍' },
    { label:'Crop Advisor', to:'/crops', icon:'🌱' },
    { label:'Livestock Advisor', to:'/livestock', icon:'🐄' },
    { label:'Disease Diagnosis', to:'/diseases', icon:'🦠' },
    { label:'AI Farm Advisor', to:'/ai', icon:'🤖' },
  ]

  return (
    <div className="slide-up">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white drop-shadow-2xl">Welcome, {user?.name?.split(' ')[0]}</h1>
        <p className="text-white/45 mt-1 text-sm">AgriDSS Kenya — Agricultural Decision Support System</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cards.map(({ label, val, icon:Icon, c, bc, tc, to }) => (
          <Link key={label} to={to} className="rounded-2xl p-5 transition-all duration-200 hover:scale-105"
            style={{ background:c, border:`1px solid ${bc}`, backdropFilter:'blur(16px)' }}>
            <Icon className="w-6 h-6 mb-3" style={{ color:tc }}/>
            <div className="text-4xl font-black text-white mb-1">{val}</div>
            <div className="text-xs text-white/50 font-medium">{label}</div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <G className="lg:col-span-2 p-6">
          <h2 className="font-bold text-white mb-4 text-sm">Quick Access</h2>
          <div className="space-y-2">
            {quickLinks.map(({ label, to, icon }) => (
              <Link key={to} to={to}
                className="flex items-center justify-between px-4 py-3 rounded-xl text-white text-sm font-medium transition-all duration-200"
                style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.09)' }}
                onMouseEnter={e=>(e.currentTarget.style.background='rgba(255,255,255,0.12)')}
                onMouseLeave={e=>(e.currentTarget.style.background='rgba(255,255,255,0.06)')}>
                <span>{icon} {label}</span>
                <ArrowRight className="w-4 h-4 opacity-40"/>
              </Link>
            ))}
          </div>
        </G>

        <G className="p-6">
          {user?.county ? (
            <>
              <h2 className="font-bold text-white mb-4 text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-400"/> Your Location
              </h2>
              <div className="space-y-2">
                {[['County',user.county],['Constituency',(user as any).constituency],['Ward',(user as any).ward]].map(([label,val])=>
                  val ? (
                    <div key={label} className="px-3 py-2 rounded-xl" style={{ background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)' }}>
                      <span className="text-xs text-white/40">{label} </span>
                      <span className="text-sm font-bold text-white">{val}</span>
                    </div>
                  ) : null
                )}
                <Link to="/climate" className="flex items-center gap-1 text-xs text-blue-300 font-semibold hover:underline mt-2">
                  View climate analysis <ArrowRight className="w-3 h-3"/>
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-6">
              <div className="text-4xl mb-3">🇰🇪</div>
              <div className="text-white/60 text-sm">47 Counties · All Kenya crops and livestock</div>
            </div>
          )}
        </G>
      </div>
    </div>
  )
}
