import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { LayoutDashboard, Sprout, Beef, Bug, Bot, Settings, LogOut, Leaf, MapPin, Camera } from 'lucide-react'
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
  const { user, logout, updateProfile } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [bgImage, setBgImage] = useState('')
  const [opacity, setOpacity] = useState(1)
  const prevPath = useRef('')
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploadingPic, setUploadingPic] = useState(false)

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

  // Convert image to base64 and save as profile picture URL
  const handlePicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingPic(true)
    const reader = new FileReader()
    reader.onloadend = async () => {
      const base64 = reader.result as string
      try {
        await updateProfile({ profile_picture: base64 })
      } catch {}
      setUploadingPic(false)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="flex min-h-screen">
      {/* Background */}
      <div className="fixed inset-0 z-0" style={{ transition:'opacity 0.5s ease', opacity }}>
        {bgImage && <img src={bgImage} alt="" className="absolute inset-0 w-full h-full object-cover"/>}
        <div className="absolute inset-0" style={{ background:'rgba(0,0,0,0.58)' }}/>
      </div>

      {/* Sidebar */}
      <aside className="w-64 flex flex-col fixed h-full z-20"
        style={{ background:'rgba(0,0,0,0.42)', backdropFilter:'blur(24px)', borderRight:'1px solid rgba(255,255,255,0.09)' }}>

        {/* Logo */}
        <div className="px-5 py-5" style={{ borderBottom:'1px solid rgba(255,255,255,0.09)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background:'rgba(34,197,94,0.9)' }}>
              <Leaf className="w-5 h-5 text-white"/>
            </div>
            <div>
              <div className="text-white font-black text-sm leading-tight">AgriDSS Kenya</div>
              <div className="text-green-400 text-xs font-medium">Agricultural Advisor v2</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scrollbar-thin">
          {nav.map(({ to, icon:Icon, label, exact }) => (
            <NavLink key={to} to={to} end={exact}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive ? 'text-white' : 'text-white/60 hover:text-white'
                }`
              }
              style={({ isActive }) => isActive ? {
                background:'rgba(255,255,255,0.18)', backdropFilter:'blur(8px)',
                border:'1px solid rgba(255,255,255,0.22)',
              } : { border:'1px solid transparent' }}>
              <Icon className="w-4 h-4 flex-shrink-0"/>{label}
            </NavLink>
          ))}
          {user?.role === 'admin' && (
            <NavLink to="/admin"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive ? 'text-white' : 'text-white/60 hover:text-white'
                }`
              }
              style={({ isActive }) => isActive ? {
                background:'rgba(255,255,255,0.18)', border:'1px solid rgba(255,255,255,0.22)',
              } : { border:'1px solid transparent' }}>
              <Settings className="w-4 h-4 flex-shrink-0"/>Admin Panel
            </NavLink>
          )}
        </nav>

        {/* User profile */}
        <div className="px-3 py-4" style={{ borderTop:'1px solid rgba(255,255,255,0.09)' }}>
          {user?.county && (
            <div className="px-3 py-2 mb-3 rounded-xl" style={{ background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)' }}>
              <div className="text-xs text-white/40">📍 Location</div>
              <div className="text-white/80 text-xs font-bold mt-0.5">{user.county}</div>
              {(user as any).constituency && <div className="text-white/45 text-xs">{(user as any).constituency}</div>}
            </div>
          )}

          {/* Profile picture + name */}
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            {/* Clickable profile picture */}
            <div className="relative flex-shrink-0 cursor-pointer group" onClick={()=>fileRef.current?.click()}>
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/25 group-hover:border-green-400 transition-colors">
                {user?.profile_picture ? (
                  <img src={user.profile_picture} alt={user.name} className="w-full h-full object-cover"/>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-sm font-black"
                    style={{ background:'rgba(34,197,94,0.8)' }}>
                    {user?.name?.[0]?.toUpperCase()}
                  </div>
                )}
              </div>
              {/* Camera overlay */}
              <div className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background:'rgba(0,0,0,0.6)' }}>
                {uploadingPic ? (
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                ) : (
                  <Camera className="w-3.5 h-3.5 text-white"/>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePicUpload}/>
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-bold truncate">{user?.name}</div>
              <div className="text-white/40 text-xs capitalize">{user?.role}</div>
            </div>
          </div>

          <button onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-white/50 hover:text-white rounded-xl text-sm font-medium transition-all"
            style={{ border:'1px solid transparent' }}
            onMouseEnter={e=>(e.currentTarget.style.background='rgba(255,255,255,0.08)')}
            onMouseLeave={e=>(e.currentTarget.style.background='transparent')}>
            <LogOut className="w-4 h-4"/> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="ml-64 flex-1 min-h-screen relative z-10 overflow-y-auto scrollbar-thin">
        <div className="p-6 md:p-8 max-w-7xl">
          <Outlet/>
        </div>
      </main>

      <style>{`@keyframes fadeIn { from { opacity:0; } to { opacity:1; } }`}</style>
    </div>
  )
}
