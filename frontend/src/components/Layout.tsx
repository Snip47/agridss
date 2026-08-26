import { useState } from 'react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { LayoutDashboard, CloudSun, Sprout, Beef, Bug, Bot, Shield, LogOut, Menu, X, MapPin } from 'lucide-react'
import { getBackground } from '../lib/backgroundImages'

const nav = [
  { to:'/', icon:LayoutDashboard, label:'Dashboard', bg:'dashboard' },
  { to:'/climate', icon:CloudSun, label:'Climate & Location', bg:'climate' },
  { to:'/crops', icon:Sprout, label:'Crop Advisor', bg:'crops' },
  { to:'/livestock', icon:Beef, label:'Livestock Advisor', bg:'livestock' },
  { to:'/diseases', icon:Bug, label:'Disease Diagnosis', bg:'diseases' },
  { to:'/ai', icon:Bot, label:'AI Farm Advisor', bg:'ai' },
]

function getPageBg(pathname: string): string {
  if (pathname === '/') return getBackground('dashboard')
  if (pathname.startsWith('/climate')) return getBackground('climate')
  if (pathname.startsWith('/crops')) return getBackground('crops')
  if (pathname.startsWith('/livestock')) return getBackground('livestock')
  if (pathname.startsWith('/diseases')) return getBackground('diseases')
  if (pathname.startsWith('/ai')) return getBackground('ai')
  if (pathname.startsWith('/admin')) return getBackground('admin')
  return getBackground('dashboard')
}

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)

  const bgUrl = getPageBg(location.pathname)
  const doLogout = () => { logout(); navigate('/login') }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5" style={{ borderBottom:'1px solid rgba(255,255,255,0.1)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
            style={{ background:'rgba(34,197,94,0.25)', border:'1px solid rgba(34,197,94,0.4)' }}>🌾</div>
          <div>
            <div className="font-bold text-white text-sm">AgriDSS Kenya</div>
            <div className="text-xs" style={{ color:'rgba(255,255,255,0.4)' }}>Agricultural Advisor v2</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {nav.map(({ to, icon:Icon, label }) => (
          <NavLink key={to} to={to} end={to==='/'}
            onClick={()=>setOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
            style={({ isActive }) => isActive
              ? { background:'rgba(255,255,255,0.18)', color:'white', backdropFilter:'blur(10px)' }
              : { color:'rgba(255,255,255,0.55)' }
            }
            onMouseEnter={e=>(e.currentTarget.style.background='rgba(255,255,255,0.09)')}
            onMouseLeave={e=>{
              // only reset if not active
              if (!e.currentTarget.classList.contains('active'))
                e.currentTarget.style.background='transparent'
            }}>
            <Icon className="w-4 h-4 flex-shrink-0"/>
            <span>{label}</span>
          </NavLink>
        ))}

        {user?.role==='admin' && (
          <NavLink to="/admin" onClick={()=>setOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
            style={({ isActive }) => isActive
              ? { background:'rgba(255,255,255,0.18)', color:'white' }
              : { color:'rgba(255,255,255,0.55)' }
            }>
            <Shield className="w-4 h-4 flex-shrink-0"/>
            <span>Admin Panel</span>
          </NavLink>
        )}
      </nav>

      {/* User */}
      <div className="px-4 py-4" style={{ borderTop:'1px solid rgba(255,255,255,0.1)' }}>
        {user?.county && (
          <div className="flex items-center gap-1.5 mb-3 px-1">
            <MapPin className="w-3 h-3 flex-shrink-0" style={{ color:'rgba(255,255,255,0.4)' }}/>
            <span className="text-xs" style={{ color:'rgba(255,255,255,0.4)' }}>{user.county}</span>
            {(user as any).constituency && (
              <span className="text-xs" style={{ color:'rgba(255,255,255,0.3)' }}> · {(user as any).constituency}</span>
            )}
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
          <LogOut className="w-4 h-4"/>
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden" style={{ background:'#000' }}>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 flex-shrink-0 h-full relative z-10"
        style={{ background:'rgba(0,0,0,0.6)', backdropFilter:'blur(20px)', borderRight:'1px solid rgba(255,255,255,0.1)' }}>
        <SidebarContent/>
      </aside>

      {/* Mobile sidebar */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={()=>setOpen(false)}/>
          <aside className="relative w-64 h-full flex flex-col z-10"
            style={{ background:'rgba(0,0,0,0.85)', backdropFilter:'blur(20px)', borderRight:'1px solid rgba(255,255,255,0.1)' }}>
            <button onClick={()=>setOpen(false)} className="absolute top-4 right-4 text-white/50 hover:text-white">
              <X className="w-5 h-5"/>
            </button>
            <SidebarContent/>
          </aside>
        </div>
      )}

      {/* Main content with per-page background */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <img src={bgUrl} alt="" className="w-full h-full object-cover"
            style={{ transition:'opacity 0.5s ease' }}/>
          <div className="absolute inset-0" style={{ background:'rgba(0,0,0,0.55)' }}/>
        </div>

        {/* Mobile topbar */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 relative z-10"
          style={{ background:'rgba(0,0,0,0.4)', backdropFilter:'blur(20px)', borderBottom:'1px solid rgba(255,255,255,0.1)' }}>
          <button onClick={()=>setOpen(true)} className="text-white/70 hover:text-white">
            <Menu className="w-5 h-5"/>
          </button>
          <span className="font-bold text-white text-sm">🌾 AgriDSS Kenya</span>
        </div>

        <main className="flex-1 overflow-y-auto p-6 lg:p-8 relative z-10">
          <Outlet/>
        </main>
      </div>
    </div>
  )
}
