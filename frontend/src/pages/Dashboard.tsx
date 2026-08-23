import { useEffect, useState } from 'react'
import { useAuth } from '../lib/auth'
import api from '../lib/api'
import { Sprout, Beef, Bug, Leaf, ArrowRight, CloudSun, Bot } from 'lucide-react'
import { Link } from 'react-router-dom'

interface Stats { crops:number; animals:number; diseases:number; users:number }

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<Stats|null>(null)
  useEffect(() => { api.get('/dashboard/stats').then(r=>setStats(r.data)).catch(()=>{}) }, [])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="fade-in max-w-4xl">
      {/* Greeting */}
      <div className="mb-8">
        <p className="text-sm font-medium mb-1" style={{ color:'var(--text-muted)' }}>{greeting} 👋</p>
        <h1 className="text-3xl font-bold" style={{ fontFamily:'Lora, serif', color:'var(--text)' }}>
          {user?.name?.split(' ')[0] || 'Farmer'}
        </h1>
        {user?.county && (
          <p className="text-sm mt-1" style={{ color:'var(--text-muted)' }}>
            📍 {user.county}{user.constituency ? `, ${user.constituency}` : ''}
          </p>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label:'Crops', val:stats?.crops??'—', icon:'🌱', color:'#16a34a', bg:'#f0fdf4', border:'#bbf7d0' },
          { label:'Livestock', val:stats?.animals??'—', icon:'🐄', color:'#d97706', bg:'#fffbeb', border:'#fde68a' },
          { label:'Diseases', val:stats?.diseases??'—', icon:'🦠', color:'#dc2626', bg:'#fef2f2', border:'#fecaca' },
          { label:'Farmers', val:stats?.users??'—', icon:'👨‍🌾', color:'#7c3aed', bg:'#faf5ff', border:'#e9d5ff' },
        ].map(({ label, val, icon, color, bg, border }) => (
          <div key={label} className="rounded-xl p-4" style={{ background:bg, border:`1px solid ${border}` }}>
            <div className="text-2xl mb-1">{icon}</div>
            <div className="text-2xl font-bold" style={{ color }}>{val}</div>
            <div className="text-xs font-medium mt-0.5" style={{ color:'var(--text-muted)' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3" style={{ fontFamily:'Lora, serif', color:'var(--text)' }}>
          What do you need today?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { to:'/crops', icon:Sprout, emoji:'🌱', label:'Crop Advisor', desc:'Find the right crops for your land', color:'#16a34a', bg:'#f0fdf4', border:'#bbf7d0' },
            { to:'/livestock', icon:Beef, emoji:'🐄', label:'Livestock Advisor', desc:'Breeds, feeding and market info', color:'#d97706', bg:'#fffbeb', border:'#fde68a' },
            { to:'/diseases', icon:Bug, emoji:'🦠', label:'Disease Diagnosis', desc:'Identify and treat crop and animal diseases', color:'#dc2626', bg:'#fef2f2', border:'#fecaca' },
            { to:'/climate', icon:CloudSun, emoji:'🌍', label:'Climate Analysis', desc:'Rainfall, altitude and soil for your area', color:'#0369a1', bg:'#f0f9ff', border:'#bae6fd' },
            { to:'/ai', icon:Bot, emoji:'🤖', label:'AI Farm Advisor', desc:'Ask any farming question or upload a photo', color:'#7c3aed', bg:'#faf5ff', border:'#e9d5ff' },
          ].map(({ to, emoji, label, desc, color, bg, border }) => (
            <Link key={to} to={to}
              className="flex items-center gap-4 p-4 rounded-xl transition-all duration-150 group"
              style={{ background:bg, border:`1px solid ${border}`, textDecoration:'none' }}
              onMouseEnter={e=>(e.currentTarget.style.transform='translateY(-1px)')}
              onMouseLeave={e=>(e.currentTarget.style.transform='translateY(0)')}>
              <div className="text-3xl flex-shrink-0">{emoji}</div>
              <div className="flex-1">
                <div className="font-semibold text-sm" style={{ color }}>{label}</div>
                <div className="text-xs mt-0.5" style={{ color:'var(--text-muted)' }}>{desc}</div>
              </div>
              <ArrowRight className="w-4 h-4 opacity-30 group-hover:opacity-60 transition-opacity flex-shrink-0" style={{ color }}/>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer note */}
      <p className="text-xs" style={{ color:'var(--text-muted)' }}>
        🇰🇪 AgriDSS Kenya covers all 47 counties · {stats?.crops||60}+ crops · {stats?.animals||18} livestock types · {stats?.diseases||56} diseases
      </p>
    </div>
  )
}
