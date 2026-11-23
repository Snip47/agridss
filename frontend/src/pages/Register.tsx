import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import LocationDetector from '../components/LocationDetector'
import type { DetectedLocation } from '../lib/useAutoLocation'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', farm_size_acres: '' })
  const [loc, setLoc] = useState<DetectedLocation | null>(null)
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    setForm(f => ({ ...f, [k]: v }))
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('')
    if (!loc) { setError('Please detect your location before creating an account.'); return }
    setLoading(true)
    try {
      await register({ ...form, county: loc?.county, constituency: loc?.constituency, ward: loc?.ward })
      navigate('/')
    }
    catch (err: any) { setError(err?.response?.data?.detail || 'Registration failed') }
    finally { setLoading(false) }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card wide fade">
        <div className="auth-brand">
          <div className="brand">AgriDSS Kenya</div>
          <p>Create your farmer account</p>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={submit} className="form-grid">
          <div>
            <label className="label">Full name</label>
            <input className="input" value={form.name} onChange={set('name')} required />
          </div>
          <div className="form-grid two">
            <div>
              <label className="label">Email address</label>
              <input className="input" type="email" value={form.email} onChange={set('email')} required />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="pw">
                <input className="input" type={show ? 'text' : 'password'} value={form.password} onChange={set('password')} required minLength={6} />
                <button type="button" onClick={() => setShow(s => !s)}>{show ? 'Hide' : 'Show'}</button>
              </div>
            </div>
          </div>
          <div className="block-title" style={{ margin: '6px 0 0' }}>Your farm location (required)</div>
          <LocationDetector value={loc} onDetected={setLoc} autoIfGranted />
          <div>
            <label className="label">Farm size (acres)</label>
            <input className="input" type="number" min="0" step="0.5" value={form.farm_size_acres} onChange={set('farm_size_acres')} />
          </div>
          <button className="btn btn-primary btn-block" disabled={loading || !loc}>{loading ? 'Creating account...' : 'Create account'}</button>
          {!loc && <p style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center', marginTop: -4 }}>Detect your location above to continue.</p>}
        </form>
        <p className="auth-foot">Already registered? <Link to="/login" className="link-green">Sign in</Link></p>
      </div>
    </div>
  )
}
