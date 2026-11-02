import { Outlet, NavLink, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { LayoutDashboard, CloudSun, Sprout, Beef, Bug, Bot, MessageSquare } from 'lucide-react'

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

      <main className="fade"><Outlet /></main>

      <footer className="footer">
        <div className="wrap footer-inner">
          <div><b>AgriDSS Kenya</b><br />Agricultural decision support for Kenyan smallholder farmers.</div>
          <div>Murang'a University of Technology</div>
        </div>
      </footer>

      {pathname !== '/ai' && <Link to="/ai" className="float-chat" aria-label="AI farm advisor"><MessageSquare size={24} /></Link>}

      <nav className="bottom-nav">
        {links.map(l => {
          const Icon = l.icon
          return (
            <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => (isActive ? 'active' : '')}>
              <Icon size={20} />{l.label}
            </NavLink>
          )
        })}
      </nav>
    </div>
  )
}
