import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true)
    try { await login(email, password); navigate('/') }
    catch { setError('Invalid email or password') }
    finally { setLoading(false) }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card fade">
        <div className="auth-brand">
          <div className="brand">AgriDSS Kenya</div>
          <p>Agricultural decision support for Kenyan farmers</p>
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Sign in to your account</h2>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={submit} className="form-grid">
          <div>
            <label className="label">Email address</label>
            <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="label">Password</label>
            <div className="pw">
              <input className="input" type={show ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required />
              <button type="button" onClick={() => setShow(s => !s)}>{show ? 'Hide' : 'Show'}</button>
            </div>
          </div>
          <button className="btn btn-primary btn-block" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button>
        </form>
        <p className="auth-foot">No account? <Link to="/register" className="link-green">Register as a farmer</Link></p>
      </div>
    </div>
  )
}
