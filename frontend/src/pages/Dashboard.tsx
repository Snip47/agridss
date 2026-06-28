import { useEffect, useState } from 'react'
import { useAuth } from '../lib/auth'
import api from '../lib/api'
import { Sprout, Beef, Bug, Bot, Clock, MapPin, TrendingUp, Leaf, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

interface Stats { crops:number; animals:number; diseases:number; users:number; recent_activity:any[] }

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<Stats|null>(null)

  useEffect(() => { api.get('/dashboard/stats').then(r=>setStats(r.data)).catch(()=>{}) }, [])

  const cards = [
    { label:'Crops in Database', val:stats?.crops??'—', icon:Sprout, bg:'bg-leaf-100', text:'text-leaf-700', to:'/crops' },
    { label:'Livestock Types', val:stats?.animals??'—', icon:Beef, bg:'bg-earth-100', text:'text-earth-700', to:'/livestock' },
    { label:'Diseases Indexed', val:stats?.diseases??'—', icon:Bug, bg:'bg-red-100', text:'text-red-700', to:'/diseases' },
    { label:'Registered Farmers', val:stats?.users??'—', icon:Leaf, bg:'bg-sky-100', text:'text-sky-700', to:'/' },
  ]

  const quickLinks = [
    { label:'🌍 Check climate & crops for my location', to:'/climate', color:'bg-sky-50 hover:bg-sky-100 text-sky-800' },
    { label:'🌱 Browse all crop varieties', to:'/crops', color:'bg-leaf-50 hover:bg-leaf-100 text-leaf-800' },
    { label:'🐄 Get livestock care guides', to:'/livestock', color:'bg-earth-50 hover:bg-earth-100 text-earth-800' },
    { label:'🦠 Diagnose crop or animal disease', to:'/diseases', color:'bg-red-50 hover:bg-red-100 text-red-800' },
    { label:'🤖 Ask AI farming question (Free)', to:'/ai', color:'bg-purple-50 hover:bg-purple-100 text-purple-800' },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-earth-800">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
        <p className="text-earth-500 mt-1 text-sm">Kenya Agricultural Decision Support System — AI-powered farming intelligence.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cards.map(({ label, val, icon:Icon, bg, text, to }) => (
          <Link key={label} to={to} className="bg-white rounded-xl p-5 shadow-sm border border-earth-100 hover:shadow-md transition-shadow">
            <div className={`inline-flex p-2.5 rounded-lg ${bg} mb-3`}><Icon className={`w-5 h-5 ${text}`}/></div>
            <div className="text-3xl font-extrabold text-earth-800">{val}</div>
            <div className="text-xs text-earth-500 mt-1">{label}</div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        {/* Quick actions */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-earth-100">
          <h2 className="font-bold text-earth-800 mb-4 flex items-center gap-2 text-sm"><TrendingUp className="w-4 h-4 text-leaf-600"/> Quick Actions</h2>
          <div className="space-y-2">
            {quickLinks.map(({ label, to, color }) => (
              <Link key={to} to={to} className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors ${color}`}>
                {label}<ArrowRight className="w-4 h-4 opacity-50"/>
              </Link>
            ))}
          </div>
        </div>

        {/* Activity */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-earth-100">
          <h2 className="font-bold text-earth-800 mb-4 flex items-center gap-2 text-sm"><Clock className="w-4 h-4 text-leaf-600"/> Recent Activity</h2>
          {stats?.recent_activity?.length ? (
            <div className="space-y-3">
              {stats.recent_activity.slice(0,6).map((l,i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 mt-2 rounded-full bg-leaf-400 flex-shrink-0"/>
                  <div>
                    <div className="text-xs text-earth-700 font-medium capitalize">{l.action.replace(/_/g,' ')}</div>
                    <div className="text-xs text-earth-400 truncate max-w-[160px]">{l.details}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-earth-400 py-6 text-center">No activity yet.<br/>Start by exploring crops or livestock!</div>
          )}
        </div>
      </div>

      {/* User location info */}
      {user?.county && (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-earth-100 mb-5">
          <h2 className="font-bold text-earth-800 mb-3 flex items-center gap-2 text-sm"><MapPin className="w-4 h-4 text-sky-600"/> Your Farm Location</h2>
          <div className="flex items-center gap-4 flex-wrap">
            {[['County',user.county],['Constituency',user.constituency],['Ward',(user as any).ward],['Village',(user as any).village]].map(([label,val])=>
              val ? <div key={label} className="bg-sky-50 px-3 py-1.5 rounded-lg"><span className="text-xs text-sky-500">{label}: </span><span className="text-sm font-semibold text-sky-800">{val}</span></div> : null
            )}
            <Link to="/climate" className="flex items-center gap-1 text-xs text-sky-600 font-medium hover:underline ml-auto">
              View climate analysis <ArrowRight className="w-3 h-3"/>
            </Link>
          </div>
        </div>
      )}

      {/* Kenya banner */}
      <div className="bg-gradient-to-r from-leaf-700 to-leaf-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="text-4xl">🇰🇪</div>
          <div>
            <div className="font-bold text-base">Kenya-Focused Agriculture Intelligence</div>
            <div className="text-leaf-100 text-xs mt-1">47 Counties · County → Constituency → Ward location drill-down · 40+ Crop varieties · 14 Livestock species with specific breeds · Free AI Advisor (Google Gemini / Groq)</div>
          </div>
        </div>
      </div>
    </div>
  )
}
