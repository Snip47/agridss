import { Outlet, NavLink, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { LayoutDashboard, CloudSun, Sprout, Beef, Bug, Bot, MessageSquare, ShieldCheck } from 'lucide-react'
import LocationRequired from './LocationRequired'

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/climate', label: 'Climate', icon: CloudSun },
  { to: '/crops', label: 'Crops', icon: Sprout },
  { to: '/livestock', label: 'Livestock', icon: Beef },
  { to: '/diseases', label: 'Diseases', icon: Bug },
  { to: '/ai', label: 'AI Advisor', icon: Bot },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const signOut = () => { logout(); navigate('/login') }
  const isAdmin = user?.role === 'admin'
  // Farmers must have a detected location before they can use the app.
  const needsLocation = !!user && !isAdmin && !user.county
  const mobileLinks = [
    ...links.map(l => ({ ...l, short: l.to === '/ai' ? 'AI' : l.label })),
    ...(isAdmin ? [{ to: '/admin', label: 'Admin', short: 'Admin', icon: ShieldCheck, end: false }] : []),
  ]

  return (
    <div>
      <header className="nav">
        <div className="wrap nav-inner">
          <Link to="/" className="brand">AgriDSS Kenya</Link>
          <nav className="nav-links">
            {links.map(l => (
              <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>{l.label}</NavLink>
            ))}
            {user?.role === 'admin' && (
              <NavLink to="/admin" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>Admin</NavLink>
            )}
          </nav>
          <div className="nav-right">
            <span className="nav-user">{user?.name}</span>
            <button className="btn btn-outline btn-sm" onClick={signOut}>Sign out</button>
          </div>
        </div>
      </header>

      <main className="fade">{needsLocation ? <LocationRequired /> : <Outlet />}</main>

      <footer className="footer">
        <div className="wrap footer-inner">
          <div><b>AgriDSS Kenya</b><br />Agricultural decision support for Kenyan smallholder farmers.</div>
        </div>
      </footer>

      {!needsLocation && pathname !== '/ai' && <Link to="/ai" className="float-chat" aria-label="AI farm advisor"><MessageSquare size={24} /></Link>}

      {!needsLocation && (
        <nav className={'bottom-nav' + (mobileLinks.length > 6 ? ' many' : '')}>
          {mobileLinks.map(l => {
            const Icon = l.icon
            return (
              <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => (isActive ? 'active' : '')}>
                <Icon size={20} />{l.short}
              </NavLink>
            )
          })}
        </nav>
      )}
    </div>
  )
}
