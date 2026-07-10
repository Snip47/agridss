import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { LayoutDashboard, Sprout, Beef, Bug, Bot, Settings, LogOut, Leaf, MapPin, Menu, X, Bell, User as UserIcon } from 'lucide-react'
import { useState } from 'react'

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* PREMIUM SIDEBAR */}
      <aside className={`w-72 bg-gradient-to-b from-slate-950 to-slate-900 border-r border-slate-700/50 flex flex-col fixed h-full z-20 shadow-2xl transition-all duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        
        {/* Logo Section - Premium */}
        <div className="px-6 py-6 border-b border-slate-700/30 bg-gradient-to-r from-green-600/10 to-emerald-600/10">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-11 h-11 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <Leaf className="w-6 h-6 text-white"/>
            </div>
            <div>
              <div className="text-white font-extrabold text-lg leading-tight tracking-tight">AgriDSS</div>
              <div className="text-emerald-400 text-xs font-semibold">KENYA v2.0</div>
            </div>
          </div>
          <div className="text-slate-400 text-xs mt-2 leading-relaxed">Agricultural Decision Support System</div>
        </div>

        {/* Navigation - Premium */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-widest px-3 mb-4">MAIN MENU</div>
          {nav.map(({ to, icon:Icon, label, exact }) => (
            <NavLink key={to} to={to} end={exact}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 group relative overflow-hidden ${
                  isActive 
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-600/20' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}>
              <div className={`transition-transform group-hover:scale-110 ${isActive ? 'scale-110' : ''}`}>
                <Icon className="w-5 h-5 flex-shrink-0"/>
              </div>
              <span className="flex-1">{label}</span>
              {isActive && <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>}
            </NavLink>
          ))}
          
          {user?.role === 'admin' && (
            <div className="mt-6 pt-6 border-t border-slate-700/30">
              <div className="text-slate-500 text-xs font-bold uppercase tracking-widest px-3 mb-3">ADMINISTRATION</div>
              <NavLink to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 group ${
                    isActive 
                      ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-amber-600/20' 
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}>
                <Settings className="w-5 h-5 flex-shrink-0 group-hover:rotate-90 transition-transform"/>
                <span>Admin Panel</span>
              </NavLink>
            </div>
          )}
        </nav>

        {/* User Profile Section - Premium */}
        <div className="px-4 py-4 border-t border-slate-700/30 bg-gradient-to-t from-slate-950 to-transparent">
          {user?.county && (
            <div className="px-4 py-3 mb-3 bg-gradient-to-r from-blue-600/10 to-blue-600/5 border border-blue-600/20 rounded-xl">
              <div className="text-xs text-blue-400 font-semibold flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5"/> Farm Location
              </div>
              <div className="text-slate-200 text-sm font-semibold mt-1">{user.county}</div>
              {user.constituency && <div className="text-slate-400 text-xs mt-0.5">{user.constituency}</div>}
            </div>
          )}
          <div className="flex items-center gap-3.5 px-3 py-3 mb-2 bg-slate-800/40 rounded-xl border border-slate-700/30">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-lg">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-semibold truncate">{user?.name}</div>
              <div className="text-slate-400 text-xs capitalize font-medium">{user?.role === 'admin' ? '👑 Administrator' : '🚜 Farmer'}</div>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-slate-300 hover:text-white bg-slate-800/40 hover:bg-red-600/20 border border-slate-700/30 hover:border-red-600/50 rounded-lg text-sm font-semibold transition-all duration-200">
            <LogOut className="w-4 h-4"/> Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="md:ml-72 flex-1 min-h-screen flex flex-col overflow-x-hidden">
        
        {/* PROFESSIONAL TOP BAR */}
        <header className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700/50 sticky top-0 z-10 shadow-lg">
          <div className="flex items-center justify-between px-6 py-4">
            
            {/* Left Section */}
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-300">
                {mobileMenuOpen ? <X className="w-5 h-5"/> : <Menu className="w-5 h-5"/>}
              </button>
              <div className="hidden md:block">
                <h1 className="text-slate-200 font-bold text-lg">Agricultural Decision Support System</h1>
                <p className="text-slate-400 text-xs mt-0.5">Kenya's Premier Farming Intelligence Platform</p>
              </div>
            </div>

            {/* Right Section - Actions */}
            <div className="flex items-center gap-4">
              <button className="p-2.5 hover:bg-slate-800 rounded-lg transition-colors text-slate-300 hover:text-white relative">
                <Bell className="w-5 h-5"/>
                <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              </button>
              <div className="hidden sm:flex items-center gap-3 px-3 py-2 bg-slate-800/40 rounded-lg border border-slate-700/30">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white text-xs font-bold">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
                <div className="text-sm">
                  <div className="text-slate-200 font-semibold">{user?.name?.split(' ')[0]}</div>
                  <div className="text-slate-400 text-xs">{user?.role}</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 md:p-8 max-w-7xl mx-auto">
            <Outlet/>
          </div>
        </div>
      </main>
    </div>
  )
}
