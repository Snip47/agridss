import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { KENYA_LOCATIONS, COUNTY_NAMES } from '../lib/kenyaLocations'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', county: '', constituency: '', ward: '', village: '', farm_size_acres: '' })
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const constituencies = form.county && KENYA_LOCATIONS[form.county] ? Object.keys(KENYA_LOCATIONS[form.county]).sort() : []
  const wards = form.county && form.constituency && KENYA_LOCATIONS[form.county]?.[form.constituency] ? [...KENYA_LOCATIONS[form.county][form.constituency]].sort() : []

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const v = e.target.value
    setForm(f => {
      const next: any = { ...f, [k]: v }
      if (k === 'county') { next.constituency = ''; next.ward = '' }
      if (k === 'constituency') { next.ward = '' }
      return next
    })
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true)
    try { await register(form); navigate('/') }
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
          <div className="block-title" style={{ margin: '6px 0 0' }}>Your farm location</div>
          <div className="form-grid three">
            <div>
              <label className="label">County</label>
              <select className="select" value={form.county} onChange={set('county')}>
                <option value="">Select county</option>
                {COUNTY_NAMES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Constituency</label>
              <select className="select" value={form.constituency} onChange={set('constituency')} disabled={!form.county}>
                <option value="">Select constituency</option>
                {constituencies.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Ward</label>
              <select className="select" value={form.ward} onChange={set('ward')} disabled={!form.constituency}>
                <option value="">Select ward</option>
                {wards.map(w => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>
          </div>
          <div className="form-grid two">
            <div>
              <label className="label">Village or area</label>
              <input className="input" value={form.village} onChange={set('village')} />
            </div>
            <div>
              <label className="label">Farm size (acres)</label>
              <input className="input" type="number" min="0" step="0.5" value={form.farm_size_acres} onChange={set('farm_size_acres')} />
            </div>
          </div>
          <button className="btn btn-primary btn-block" disabled={loading}>{loading ? 'Creating account...' : 'Create account'}</button>
        </form>
        <p className="auth-foot">Already registered? <Link to="/login" className="link-green">Sign in</Link></p>
      </div>
    </div>
  )
}
