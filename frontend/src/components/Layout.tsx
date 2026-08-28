import { useState, useEffect } from 'react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { LayoutDashboard, CloudSun, Sprout, Beef, Bug, Bot, Shield, LogOut, Menu, X, MapPin } from 'lucide-react'
import { getImageForPath, getGradientForPath } from '../lib/backgroundImages'

const nav = [
  { to:'/', icon:LayoutDashboard, label:'Dashboard' },
  { to:'/climate', icon:CloudSun, label:'Climate & Location' },
  { to:'/crops', icon:Sprout, label:'Crop Advisor' },
  { to:'/livestock', icon:Beef, label:'Livestock Advisor' },
  { to:'/diseases', icon:Bug, label:'Disease Diagnosis' },
  { to:'/ai', icon:Bot, label:'AI Farm Advisor' },
]

// AgriDSS Logo SVG component
function AgriDSSLogo({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="10" fill="rgba(34,197,94,0.25)" stroke="rgba(34,197,94,0.5)" strokeWidth="1"/>
      {/* Leaf shape */}
      <path d="M20 8 C20 8, 30 12, 30 22 C30 28, 25 32, 20 32 C20 32, 20 20, 12 16 C16 12, 20 8, 20 8Z"
        fill="rgba(34,197,94,0.9)" opacity="0.9"/>
      {/* Stem */}
      <path d="M20 32 C20 32, 18 28, 14 26" stroke="rgba(34,197,94,0.7)" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Kenya flag stripe hint */}
      <rect x="8" y="19" width="6" height="1.5" rx="0.75" fill="white" opacity="0.6"/>
    </svg>
  )
}

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)
  const [imgError, setImgError] = useState(false)

  const gradient = getGradientForPath(location.pathname)
  const imgUrl   = getImageForPath(location.pathname)

  useEffect(() => { setImgLoaded(false); setImgError(false) }, [location.pathname])

  const doLogout = () => { logout(); navigate('/login') }

  const activeStyle: React.CSSProperties = {
    display:'flex', alignItems:'center', gap:'0.75rem',
    padding:'0.625rem 0.75rem', borderRadius:'0.75rem',
    fontSize:'0.875rem', fontWeight:500,
    background:'rgba(255,255,255,0.18)', color:'white', backdropFilter:'blur(10px)'
  }
  const inactiveStyle: React.CSSProperties = {
    display:'flex', alignItems:'center', gap:'0.75rem',
    padding:'0.625rem 0.75rem', borderRadius:'0.75rem',
    fontSize:'0.875rem', fontWeight:500, color:'rgba(255,255,255,0.55)'
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5" style={{ borderBottom:'1px solid rgba(255,255,255,0.1)' }}>
        <div className="flex items-center gap-3">
          <AgriDSSLogo size={38}/>
          <div>
            <div className="font-black text-white text-sm tracking-wide">AgriDSS Kenya</div>
            <div className="text-xs" style={{ color:'rgba(255,255,255,0.4)' }}>Agricultural Advisor v2</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {nav.map(({ to, icon:Icon, label }) => (
          <NavLink key={to} to={to} end={to==='/'}
            onClick={()=>setOpen(false)}
            style={({ isActive }) => isActive ? activeStyle : inactiveStyle}>
            <Icon className="w-4 h-4 flex-shrink-0"/>
            <span>{label}</span>
          </NavLink>
        ))}
        {user?.role==='admin' && (
          <NavLink to="/admin" onClick={()=>setOpen(false)}
            style={({ isActive }) => isActive ? activeStyle : inactiveStyle}>
            <Shield className="w-4 h-4 flex-shrink-0"/>
            <span>Admin Panel</span>
          </NavLink>
        )}
      </nav>

      {/* User section */}
      <div className="px-4 py-4" style={{ borderTop:'1px solid rgba(255,255,255,0.1)' }}>
        {user?.county && (
          <div className="flex items-center gap-1.5 mb-3 px-1">
            <MapPin className="w-3 h-3 flex-shrink-0" style={{ color:'rgba(255,255,255,0.4)' }}/>
            <span className="text-xs truncate" style={{ color:'rgba(255,255,255,0.4)' }}>
              {user.county}{(user as any).constituency ? ` · ${(user as any).constituency}` : ''}
            </span>
          </div>
        )}
        <div className="flex items-center gap-3 mb-3 px-1">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
            style={{ background:'rgba(34,197,94,0.4)', border:'1px solid rgba(34,197,94,0.5)' }}>
            {user?.name?.[0]?.toUpperCase()||'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-white truncate">{user?.name}</div>
            <div className="text-xs capitalize" style={{ color:'rgba(255,255,255,0.4)' }}>{user?.role}</div>
          </div>
        </div>
        <button onClick={doLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all"
          style={{ color:'rgba(255,255,255,0.45)' }}
          onMouseEnter={e=>(e.currentTarget.style.background='rgba(255,255,255,0.08)')}
          onMouseLeave={e=>(e.currentTarget.style.background='transparent')}>
          <LogOut className="w-4 h-4"/>Sign Out
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden" style={{ background:'#000' }}>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 flex-shrink-0 h-full relative z-10"
        style={{ background:'rgba(0,0,0,0.65)', backdropFilter:'blur(20px)', borderRight:'1px solid rgba(255,255,255,0.1)' }}>
        <SidebarContent/>
      </aside>

      {/* Mobile sidebar */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={()=>setOpen(false)}/>
          <aside className="relative w-64 h-full flex flex-col z-10"
            style={{ background:'rgba(0,0,0,0.9)', backdropFilter:'blur(20px)', borderRight:'1px solid rgba(255,255,255,0.1)' }}>
            <button onClick={()=>setOpen(false)} className="absolute top-4 right-4 text-white/50 hover:text-white">
              <X className="w-5 h-5"/>
            </button>
            <SidebarContent/>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Gradient always visible first */}
        <div className="absolute inset-0 z-0" style={{ background:gradient }}/>

        {/* Background photo fades in */}
        {!imgError && (
          <img key={imgUrl} src={imgUrl} alt=""
            className="absolute inset-0 w-full h-full object-cover z-0"
            style={{ opacity:imgLoaded?1:0, transition:'opacity 0.7s ease' }}
            onLoad={()=>setImgLoaded(true)}
            onError={()=>setImgError(true)}/>
        )}

        {/* Dark overlay */}
        <div className="absolute inset-0 z-0" style={{ background:'rgba(0,0,0,0.52)' }}/>

        {/* Mobile topbar */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 relative z-10"
          style={{ background:'rgba(0,0,0,0.45)', backdropFilter:'blur(20px)', borderBottom:'1px solid rgba(255,255,255,0.1)' }}>
          <button onClick={()=>setOpen(true)} className="text-white/70 hover:text-white">
            <Menu className="w-5 h-5"/>
          </button>
          <AgriDSSLogo size={28}/>
          <span className="font-bold text-white text-sm">AgriDSS Kenya</span>
        </div>

        <main className="flex-1 overflow-y-auto p-6 lg:p-8 relative z-10">
          <Outlet/>
        </main>
      </div>
    </div>
  )
}
