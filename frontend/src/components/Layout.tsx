import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { LayoutDashboard, Sprout, Beef, Bug, Bot, Settings, LogOut, Leaf, MapPin } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { PAGE_BG_MAP, getBackground } from '../lib/backgroundImages'

const nav = [
  { to:'/', icon:LayoutDashboard, label:'Dashboard', exact:true },
  { to:'/climate', icon:MapPin, label:'Climate & Location' },
  { to:'/crops', icon:Sprout, label:'Crop Advisor' },
  { to:'/livestock', icon:Beef, label:'Livestock Advisor' },
  { to:'/diseases', icon:Bug, label:'Disease Diagnosis' },
  { to:'/ai', icon:Bot, label:'AI Farm Advisor' },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [bgImage, setBgImage] = useState('')
  const [opacity, setOpacity] = useState(1)
  const prevPath = useRef('')

  useEffect(() => {
    if (prevPath.current === location.pathname) return
    prevPath.current = location.pathname
    setOpacity(0)
    setTimeout(() => {
      const pageKey = PAGE_BG_MAP[location.pathname] || 'dashboard'
      setBgImage(getBackground(pageKey))
      setOpacity(1)
    }, 300)
  }, [location.pathname])

  useEffect(() => {
    const pageKey = PAGE_BG_MAP[location.pathname] || 'dashboard'
    setBgImage(getBackground(pageKey))
  }, [])

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="flex min-h-screen">

      {/* FULL PAGE BACKGROUND */}
      <div className="fixed inset-0 z-0" style={{ transition:'opacity 0.5s ease', opacity }}>
        {bgImage && (
          <img src={bgImage} alt="" className="absolute inset-0 w-full h-full object-cover"/>
        )}
        {/* Dark overlay so text is readable */}
        <div className="absolute inset-0" style={{ background:'rgba(0,0,0,0.58)' }}/>
      </div>

      {/* SIDEBAR - glass */}
      <aside className="w-64 flex flex-col fixed h-full z-20"
        style={{ background:'rgba(0,0,0,0.42)', backdropFilter:'blur(24px)', borderRight:'1px solid rgba(255,255,255,0.09)' }}>

        <div className="px-5 py-5" style={{ borderBottom:'1px solid rgba(255,255,255,0.09)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background:'rgba(34,197,94,0.9)' }}>
              <Leaf className="w-5 h-5 text-white"/>
            </div>
            <div>
              <div className="text-white font-bold text-sm leading-tight">AgriDSS Kenya</div>
              <div className="text-green-400 text-xs">Agricultural Advisor v2</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scrollbar-thin">
          {nav.map(({ to, icon:Icon, label, exact }) => (
            <NavLink key={to} to={to} end={exact}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'text-white'
                    : 'text-white/60 hover:text-white'
                }`
              }
              style={({ isActive }) => isActive ? {
                background:'rgba(255,255,255,0.18)',
                backdropFilter:'blur(8px)',
                border:'1px solid rgba(255,255,255,0.22)',
              } : {
                border:'1px solid transparent',
              }}>
              <Icon className="w-4 h-4 flex-shrink-0"/>{label}
            </NavLink>
          ))}
          {user?.role === 'admin' && (
            <NavLink to="/admin"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive ? 'text-white' : 'text-white/60 hover:text-white'
                }`
              }
              style={({ isActive }) => isActive ? {
                background:'rgba(255,255,255,0.18)',
                border:'1px solid rgba(255,255,255,0.22)',
              } : { border:'1px solid transparent' }}>
              <Settings className="w-4 h-4 flex-shrink-0"/>Admin Panel
            </NavLink>
          )}
        </nav>

        <div className="px-3 py-4" style={{ borderTop:'1px solid rgba(255,255,255,0.09)' }}>
          {user?.county && (
            <div className="px-3 py-2 mb-3 rounded-xl" style={{ background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)' }}>
              <div className="text-xs text-white/40">📍 Location</div>
              <div className="text-white/80 text-xs font-semibold mt-0.5">{user.county}</div>
              {(user as any).constituency && <div className="text-white/45 text-xs">{(user as any).constituency}</div>}
            </div>
          )}
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
              style={{ background:'rgba(34,197,94,0.8)' }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-semibold truncate">{user?.name}</div>
              <div className="text-white/40 text-xs capitalize">{user?.role}</div>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-white/50 hover:text-white rounded-xl text-sm transition-all"
            style={{ border:'1px solid transparent' }}
            onMouseEnter={e => (e.currentTarget.style.background='rgba(255,255,255,0.08)')}
            onMouseLeave={e => (e.currentTarget.style.background='transparent')}>
            <LogOut className="w-4 h-4"/> Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="ml-64 flex-1 min-h-screen relative z-10 overflow-y-auto scrollbar-thin">
        <div className="p-6 md:p-8 max-w-7xl">
          <Outlet/>
        </div>
      </main>
    </div>
  )
}
