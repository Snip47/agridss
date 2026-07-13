import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { LayoutDashboard, Sprout, Beef, Bug, Bot, Settings, LogOut, Leaf, MapPin } from 'lucide-react'

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
  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar stays solid so nav is always readable over the themed backdrops */}
      <aside className="w-64 bg-leaf-800/95 backdrop-blur-md flex flex-col fixed h-full z-20 shadow-2xl border-r border-leaf-900/40">
        <div className="px-5 py-4 border-b border-leaf-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-leaf-500 rounded-xl flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white"/>
            </div>
            <div>
              <div className="text-white font-bold text-base leading-none">AgriDSS Kenya</div>
              <div className="text-leaf-300 text-xs mt-0.5">Agricultural Advisor v2.0</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {nav.map(({ to, icon:Icon, label, exact }) => (
            <NavLink key={to} to={to} end={exact}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-leaf-600 text-white shadow-sm' : 'text-leaf-200 hover:bg-leaf-700 hover:text-white'
                }`}>
              <Icon className="w-4 h-4 flex-shrink-0"/>{label}
            </NavLink>
          ))}
          {user?.role === 'admin' && (
            <NavLink to="/admin"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mt-1 ${
                  isActive ? 'bg-earth-600 text-white' : 'text-leaf-200 hover:bg-leaf-700 hover:text-white'
                }`}>
              <Settings className="w-4 h-4 flex-shrink-0"/>Admin Panel
            </NavLink>
          )}
        </nav>

        <div className="px-3 py-3 border-t border-leaf-700">
          {user?.county && (
            <div className="px-3 py-2 mb-2 bg-leaf-900 rounded-lg">
              <div className="text-xs text-leaf-400">📍 Location</div>
              <div className="text-leaf-200 text-xs font-medium">{user.county} {user.constituency ? `• ${user.constituency}` : ''}</div>
            </div>
          )}
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-earth-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-medium truncate">{user?.name}</div>
              <div className="text-leaf-400 text-xs capitalize">{user?.role}</div>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-leaf-300 hover:text-white hover:bg-leaf-700 rounded-lg text-sm transition-colors">
            <LogOut className="w-4 h-4"/> Sign Out
          </button>
        </div>
      </aside>

      {/* Main is transparent — PageBackdrop on each page fills the background */}
      <main className="ml-64 flex-1 min-h-screen overflow-x-hidden relative">
        <div className="p-6 md:p-8 max-w-7xl relative z-0">
          <Outlet/>
        </div>
      </main>
    </div>
  )
}
