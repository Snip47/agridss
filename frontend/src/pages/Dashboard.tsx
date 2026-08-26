import { useEffect, useState } from 'react'
import { useAuth } from '../lib/auth'
import api from '../lib/api'
import { Sprout, Beef, Bug, Leaf, ArrowRight, CloudSun, Bot } from 'lucide-react'
import { Link } from 'react-router-dom'

interface Stats { crops:number; animals:number; diseases:number; users:number }

const G = ({ children, className='' }: { children:React.ReactNode; className?:string }) => (
  <div className={className} style={{ background:'rgba(0,0,0,0.38)', backdropFilter:'blur(18px)', border:'1px solid rgba(255,255,255,0.11)', borderRadius:'1rem' }}>{children}</div>
)

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<Stats|null>(null)
  useEffect(() => { api.get('/dashboard/stats').then(r=>setStats(r.data)).catch(()=>{}) }, [])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="slide-up max-w-4xl">
      <div className="mb-8">
        <p className="text-sm font-medium mb-1 text-white/50">{greeting} 👋</p>
        <h1 className="text-3xl font-black text-white drop-shadow-2xl">{user?.name?.split(' ')[0] || 'Farmer'}</h1>
        {user?.county && (
          <p className="text-sm mt-1 text-white/40">📍 {user.county}{(user as any).constituency ? `, ${(user as any).constituency}` : ''}</p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label:'Crops', val:stats?.crops??'—', icon:Sprout, color:'rgba(34,197,94,0.8)', bg:'rgba(34,197,94,0.15)', border:'rgba(34,197,94,0.3)', to:'/crops' },
          { label:'Livestock', val:stats?.animals??'—', icon:Beef, color:'rgba(251,191,36,0.8)', bg:'rgba(251,191,36,0.15)', border:'rgba(251,191,36,0.3)', to:'/livestock' },
          { label:'Diseases', val:stats?.diseases??'—', icon:Bug, color:'rgba(239,68,68,0.8)', bg:'rgba(239,68,68,0.15)', border:'rgba(239,68,68,0.3)', to:'/diseases' },
          { label:'Farmers', val:stats?.users??'—', icon:Leaf, color:'rgba(96,165,250,0.8)', bg:'rgba(96,165,250,0.15)', border:'rgba(96,165,250,0.3)', to:'/' },
        ].map(({ label, val, icon:Icon, color, bg, border, to }) => (
          <Link key={label} to={to}
            className="rounded-2xl p-5 transition-all duration-200 hover:scale-105"
            style={{ background:bg, border:`1px solid ${border}`, backdropFilter:'blur(16px)', textDecoration:'none' }}>
            <Icon className="w-6 h-6 mb-3" style={{ color }}/>
            <div className="text-4xl font-black text-white mb-1">{val}</div>
            <div className="text-xs text-white/50 font-medium">{label}</div>
          </Link>
        ))}
      </div>

      {/* Quick links */}
      <G className="p-6 mb-4">
        <h2 className="font-bold text-white mb-4 text-sm">Quick Access</h2>
        <div className="space-y-2">
          {[
            { label:'Climate & Location Analysis', to:'/climate', icon:'🌍' },
            { label:'Crop Advisor', to:'/crops', icon:'🌱' },
            { label:'Livestock Advisor', to:'/livestock', icon:'🐄' },
            { label:'Disease Diagnosis', to:'/diseases', icon:'🦠' },
            { label:'AI Farm Advisor', to:'/ai', icon:'🤖' },
          ].map(({ label, to, icon }) => (
            <Link key={to} to={to}
              className="flex items-center justify-between px-4 py-3 rounded-xl text-white text-sm font-medium transition-all duration-200"
              style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.09)', textDecoration:'none' }}
              onMouseEnter={e=>(e.currentTarget.style.background='rgba(255,255,255,0.12)')}
              onMouseLeave={e=>(e.currentTarget.style.background='rgba(255,255,255,0.06)')}>
              <span>{icon} {label}</span>
              <ArrowRight className="w-4 h-4 opacity-40"/>
            </Link>
          ))}
        </div>
      </G>
    </div>
  )
}
