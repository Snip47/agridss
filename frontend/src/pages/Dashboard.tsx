import { useEffect, useState } from 'react'
import { useAuth } from '../lib/auth'
import api from '../lib/api'
import { Sprout, Beef, Bug, Leaf, Clock, MapPin, TrendingUp, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

interface Stats { crops:number; animals:number; diseases:number; users:number; recent_activity:any[] }

const G = ({ children, className='' }: { children:React.ReactNode; className?:string }) => (
  <div className={className} style={{ background:'rgba(0,0,0,0.38)', backdropFilter:'blur(18px)', border:'1px solid rgba(255,255,255,0.11)', borderRadius:'1rem' }}>
    {children}
  </div>
)

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<Stats|null>(null)
  useEffect(() => { api.get('/dashboard/stats').then(r=>setStats(r.data)).catch(()=>{}) }, [])

  const cards = [
    { label:'Crops in Database', val:stats?.crops??'—', icon:Sprout, c:'rgba(34,197,94,0.18)', bc:'rgba(34,197,94,0.35)', tc:'#4ade80', to:'/crops' },
    { label:'Livestock Types', val:stats?.animals??'—', icon:Beef, c:'rgba(251,191,36,0.18)', bc:'rgba(251,191,36,0.35)', tc:'#fbbf24', to:'/livestock' },
    { label:'Diseases Indexed', val:stats?.diseases??'—', icon:Bug, c:'rgba(239,68,68,0.18)', bc:'rgba(239,68,68,0.35)', tc:'#f87171', to:'/diseases' },
    { label:'Registered Farmers', val:stats?.users??'—', icon:Leaf, c:'rgba(96,165,250,0.18)', bc:'rgba(96,165,250,0.35)', tc:'#60a5fa', to:'/' },
  ]

  const quickLinks = [
    { label:'🌍 Check climate & crops for my location', to:'/climate' },
    { label:'🌱 Browse all crop varieties & planting guides', to:'/crops' },
    { label:'🐄 Get livestock care & breed guides', to:'/livestock' },
    { label:'🦠 Diagnose crop or animal disease', to:'/diseases' },
    { label:'🤖 Ask AI farming question (Free — English & Swahili)', to:'/ai' },
  ]

  return (
    <div className="slide-up">
      <div className="mb-8">
        <h1 className="text-4xl font-black text-white drop-shadow-2xl">Welcome, {user?.name?.split(' ')[0]}! 👋</h1>
        <p className="text-white/55 mt-2">Kenya Agricultural Decision Support System — AI-powered farming intelligence.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cards.map(({ label, val, icon:Icon, c, bc, tc, to }) => (
          <Link key={label} to={to} className="rounded-2xl p-5 transition-all duration-200 hover:scale-105 hover:brightness-110"
            style={{ background:c, border:`1px solid ${bc}`, backdropFilter:'blur(16px)' }}>
            <Icon className="w-6 h-6 mb-3" style={{ color:tc }}/>
            <div className="text-4xl font-black text-white mb-1">{val}</div>
            <div className="text-xs text-white/50 font-medium">{label}</div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        <G className="lg:col-span-2 p-6">
          <h2 className="font-bold text-white mb-4 flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4 text-green-400"/> Quick Actions
          </h2>
          <div className="space-y-2">
            {quickLinks.map(({ label, to }) => (
              <Link key={to} to={to}
                className="flex items-center justify-between px-4 py-3 rounded-xl text-white text-sm font-medium transition-all duration-200"
                style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.09)' }}
                onMouseEnter={e=>(e.currentTarget.style.background='rgba(255,255,255,0.12)')}
                onMouseLeave={e=>(e.currentTarget.style.background='rgba(255,255,255,0.06)')}>
                {label}<ArrowRight className="w-4 h-4 opacity-40"/>
              </Link>
            ))}
          </div>
        </G>

        <G className="p-6">
          <h2 className="font-bold text-white mb-4 flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-green-400"/> Recent Activity
          </h2>
          {stats?.recent_activity?.length ? (
            <div className="space-y-3">
              {stats.recent_activity.slice(0,6).map((l,i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 mt-2 rounded-full bg-green-400 flex-shrink-0"/>
                  <div>
                    <div className="text-xs text-white font-medium capitalize">{l.action.replace(/_/g,' ')}</div>
                    <div className="text-xs text-white/35 truncate max-w-[160px]">{l.details}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-white/35 py-6 text-center">No activity yet.<br/>Start exploring!</div>
          )}
        </G>
      </div>

      {user?.county && (
        <G className="p-5 mb-5">
          <h2 className="font-bold text-white mb-3 flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-blue-400"/> Your Farm Location
          </h2>
          <div className="flex items-center gap-3 flex-wrap">
            {[['County',user.county],['Constituency',(user as any).constituency],['Ward',(user as any).ward],['Village',(user as any).village]].map(([label,val])=>
              val ? (
                <div key={label} className="px-3 py-1.5 rounded-xl" style={{ background:'rgba(255,255,255,0.09)', border:'1px solid rgba(255,255,255,0.12)' }}>
                  <span className="text-xs text-white/40">{label}: </span>
                  <span className="text-sm font-bold text-white">{val}</span>
                </div>
              ) : null
            )}
            <Link to="/climate" className="flex items-center gap-1 text-xs text-blue-300 font-semibold hover:underline ml-auto">
              View climate <ArrowRight className="w-3 h-3"/>
            </Link>
          </div>
        </G>
      )}

      <div className="rounded-2xl p-6 text-white" style={{ background:'rgba(5,70,25,0.55)', backdropFilter:'blur(16px)', border:'1px solid rgba(34,197,94,0.25)' }}>
        <div className="flex items-center gap-4">
          <div className="text-5xl">🇰🇪</div>
          <div>
            <div className="font-bold text-lg">Kenya-Focused Agriculture Intelligence</div>
            <div className="text-green-200 text-sm mt-1 leading-relaxed">47 Counties · County → Constituency → Ward · 40+ Crops with varieties · 14 Livestock species with breeds · Free AI in English & Swahili</div>
          </div>
        </div>
      </div>
    </div>
  )
}
