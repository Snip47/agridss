import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import {
  LayoutDashboard, CloudSun, Sprout, Beef, Bug,
  Bot, Shield, LogOut, Menu, X, MapPin, ChevronRight
} from 'lucide-react'

const nav = [
  { to:'/', icon:LayoutDashboard, label:'Dashboard' },
  { to:'/climate', icon:CloudSun, label:'Climate & Location' },
  { to:'/crops', icon:Sprout, label:'Crop Advisor' },
  { to:'/livestock', icon:Beef, label:'Livestock Advisor' },
  { to:'/diseases', icon:Bug, label:'Disease Diagnosis' },
  { to:'/ai', icon:Bot, label:'AI Farm Advisor' },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const doLogout = () => { logout(); navigate('/login') }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b" style={{ borderColor:'rgba(255,255,255,0.1)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg font-bold"
            style={{ background:'rgba(255,255,255,0.15)' }}>🌾</div>
          <div>
            <div className="font-bold text-white text-sm leading-tight">AgriDSS Kenya</div>
            <div className="text-xs" style={{ color:'var(--sidebar-muted)' }}>Farm Decision System</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {nav.map(({ to, icon:Icon, label }) => (
          <NavLink key={to} to={to} end={to==='/'} onClick={()=>setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'text-white'
                  : 'hover:text-white'
              }`
            }
            style={({ isActive }) => isActive
              ? { background:'rgba(255,255,255,0.18)', color:'white' }
              : { color:'var(--sidebar-muted)' }
            }>
            {({ isActive }) => (
              <>
                <Icon className="w-4 h-4 flex-shrink-0"/>
                <span>{label}</span>
                {isActive && <ChevronRight className="w-3 h-3 ml-auto opacity-60"/>}
              </>
            )}
          </NavLink>
        ))}

        {user?.role==='admin' && (
          <NavLink to="/admin" onClick={()=>setOpen(false)}
            className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150`}
            style={({ isActive }) => isActive
              ? { background:'rgba(255,255,255,0.18)', color:'white' }
              : { color:'var(--sidebar-muted)' }
            }>
            {({ isActive }) => (
              <>
                <Shield className="w-4 h-4 flex-shrink-0"/>
                <span>Admin Panel</span>
                {isActive && <ChevronRight className="w-3 h-3 ml-auto opacity-60"/>}
              </>
            )}
          </NavLink>
        )}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t" style={{ borderColor:'rgba(255,255,255,0.1)' }}>
        {user?.county && (
          <div className="flex items-center gap-1.5 mb-3 px-1">
            <MapPin className="w-3 h-3 flex-shrink-0" style={{ color:'var(--sidebar-muted)' }}/>
            <span className="text-xs" style={{ color:'var(--sidebar-muted)' }}>{user.county}</span>
          </div>
        )}
        <div className="flex items-center gap-3 px-1 mb-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
            style={{ background:'rgba(255,255,255,0.2)' }}>
            {user?.name?.[0]?.toUpperCase()||'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-white truncate">{user?.name}</div>
            <div className="text-xs capitalize" style={{ color:'var(--sidebar-muted)' }}>{user?.role}</div>
          </div>
        </div>
        <button onClick={doLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all"
          style={{ color:'var(--sidebar-muted)' }}
          onMouseEnter={e=>(e.currentTarget.style.background='rgba(255,255,255,0.1)')}
          onMouseLeave={e=>(e.currentTarget.style.background='transparent')}>
          <LogOut className="w-4 h-4"/>
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden" style={{ background:'var(--bg)' }}>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 flex-shrink-0 h-full"
        style={{ background:'var(--sidebar-bg)' }}>
        <SidebarContent/>
      </aside>

      {/* Mobile sidebar */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={()=>setOpen(false)}/>
          <aside className="relative w-64 h-full flex flex-col" style={{ background:'var(--sidebar-bg)' }}>
            <button onClick={()=>setOpen(false)} className="absolute top-4 right-4 text-white/60 hover:text-white">
              <X className="w-5 h-5"/>
            </button>
            <SidebarContent/>
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile topbar */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b"
          style={{ background:'var(--sidebar-bg)', borderColor:'rgba(255,255,255,0.1)' }}>
          <button onClick={()=>setOpen(true)} className="text-white/70 hover:text-white">
            <Menu className="w-5 h-5"/>
          </button>
          <span className="font-bold text-white text-sm">AgriDSS Kenya</span>
        </div>

        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <Outlet/>
        </main>
      </div>
    </div>
  )
}
