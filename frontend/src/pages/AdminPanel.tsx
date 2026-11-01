import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import api from '../lib/api'
import { useAuth } from '../lib/auth'

interface U { id: number; name: string; email: string; role: string; county?: string; constituency?: string; created_at: string }

export default function AdminPanel() {
  const { user } = useAuth()
  const [tab, setTab] = useState('users')
  const [users, setUsers] = useState<U[]>([])
  const [stats, setStats] = useState<any>(null)
  const [confirm, setConfirm] = useState<U | null>(null)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  const [crop, setCrop] = useState({ name: '', category: 'cereal', description: '', care_tips: '', expected_yield: '', market_price_ksh: '' })
  const [animal, setAnimal] = useState({ name: '', category: 'cattle', purpose: 'dairy', description: '', feeding_guide: '', housing_requirements: '' })
  const [disease, setDisease] = useState({ name: '', type: 'crop', affects: '', symptoms: '', causes: '', treatment: '', prevention: '', severity: 'medium' })

  useEffect(() => {
    api.get('/dashboard/users').then(r => setUsers(r.data)).catch(() => setErr('Could not load users'))
    api.get('/dashboard/stats').then(r => setStats(r.data)).catch(() => {})
  }, [])

  if (user?.role !== 'admin') return <Navigate to="/" />

  const note = (m: string, bad = false) => { bad ? setErr(m) : setMsg(m); setTimeout(() => { setMsg(''); setErr('') }, 4000) }

  const del = async (u: U) => {
    try {
      await api.delete(`/dashboard/users/${u.id}`)
      setUsers(l => l.filter(x => x.id !== u.id)); setConfirm(null); note(`${u.name} was deleted.`)
    } catch (e: any) { note(e?.response?.data?.detail || 'Delete failed', true) }
  }

  const add = (path: string, body: any, reset: () => void, label: string) => async (e: React.FormEvent) => {
    e.preventDefault()
    try { await api.post(path, body); note(`${label} added.`); reset() }
    catch (x: any) { note(x?.response?.data?.detail || 'Failed to add', true) }
  }

  const addCrop = add('/crops/', { ...crop, varieties: [], suitable_aez: [], soil_types: [], planting_months: [], diseases: [], best_counties: [], rainfall_min_mm: 400, rainfall_max_mm: 1200, altitude_min_m: 0, altitude_max_m: 2000, water_requirement: 'moderate', maturity_days: 90, subcategory: '' }, () => setCrop({ name: '', category: 'cereal', description: '', care_tips: '', expected_yield: '', market_price_ksh: '' }), 'Crop')
  const addAnimal = add('/livestock/', { ...animal, breeds: [], suitable_aez: [], vaccination_schedule: [], common_diseases: [], breeding_info: '', market_info: '', water_requirement: '', space_required: '' }, () => setAnimal({ name: '', category: 'cattle', purpose: 'dairy', description: '', feeding_guide: '', housing_requirements: '' }), 'Livestock')
  const addDisease = add('/diseases/', disease, () => setDisease({ name: '', type: 'crop', affects: '', symptoms: '', causes: '', treatment: '', prevention: '', severity: 'medium' }), 'Disease')

  const tabs = [['users', 'Users'], ['crop', 'Add crop'], ['livestock', 'Add livestock'], ['disease', 'Add disease']]

  return (
    <div className="wrap">
      <div className="page-head"><h1>Admin</h1><p>Manage users and the knowledge base.</p></div>

      {stats && (
        <div className="grid-4" style={{ margin: '16px 0' }}>
          {[['Crops', stats.crops], ['Livestock', stats.animals], ['Diseases', stats.diseases], ['Users', stats.users]].map(([l, n]) => (
            <div key={l as string} className="card stat"><div className="n">{n}</div><div className="l">{l}</div></div>
          ))}
        </div>
      )}

      {msg && <div className="alert alert-ok">{msg}</div>}
      {err && <div className="alert alert-error">{err}</div>}

      <div className="tabs">{tabs.map(([id, l]) => <button key={id} className={'tab' + (tab === id ? ' active' : '')} onClick={() => setTab(id)}>{l}</button>)}</div>

      {tab === 'users' && (
        <div className="card scroll-x">
          <table className="table">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Location</th><th></th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 600 }}>{u.name}</td>
                  <td>{u.email}</td>
                  <td><span className={'badge ' + (u.role === 'admin' ? 'badge-blue' : 'badge-green')}>{u.role}</span></td>
                  <td>{[u.county, u.constituency].filter(Boolean).join(', ') || '-'}</td>
                  <td style={{ textAlign: 'right' }}>{u.role === 'admin' ? <span style={{ color: 'var(--muted)', fontSize: 13 }}>Protected</span> : <button className="btn btn-danger btn-sm" onClick={() => setConfirm(u)}>Delete</button>}</td>
                </tr>
              ))}
              {users.length === 0 && <tr><td colSpan={5} className="empty">No users found.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'crop' && (
        <form className="card card-pad form-grid" onSubmit={addCrop}>
          <div className="form-grid two">
            <div><label className="label">Crop name</label><input className="input" required value={crop.name} onChange={e => setCrop({ ...crop, name: e.target.value })} /></div>
            <div><label className="label">Category</label><select className="select" value={crop.category} onChange={e => setCrop({ ...crop, category: e.target.value })}>{['cereal', 'legume', 'vegetable', 'fruit', 'cash crop', 'flower'].map(c => <option key={c}>{c}</option>)}</select></div>
          </div>
          <div><label className="label">Description</label><textarea className="textarea" rows={3} value={crop.description} onChange={e => setCrop({ ...crop, description: e.target.value })} /></div>
          <div><label className="label">Care tips</label><textarea className="textarea" rows={3} value={crop.care_tips} onChange={e => setCrop({ ...crop, care_tips: e.target.value })} /></div>
          <div className="form-grid two">
            <div><label className="label">Expected yield</label><input className="input" value={crop.expected_yield} onChange={e => setCrop({ ...crop, expected_yield: e.target.value })} /></div>
            <div><label className="label">Market price (KSh)</label><input className="input" value={crop.market_price_ksh} onChange={e => setCrop({ ...crop, market_price_ksh: e.target.value })} /></div>
          </div>
          <div><button className="btn btn-primary">Add crop</button></div>
        </form>
      )}

      {tab === 'livestock' && (
        <form className="card card-pad form-grid" onSubmit={addAnimal}>
          <div className="form-grid three">
            <div><label className="label">Name</label><input className="input" required value={animal.name} onChange={e => setAnimal({ ...animal, name: e.target.value })} /></div>
            <div><label className="label">Category</label><select className="select" value={animal.category} onChange={e => setAnimal({ ...animal, category: e.target.value })}>{['cattle', 'goat', 'sheep', 'poultry', 'rabbit', 'pig', 'fish', 'bees', 'camel', 'donkey', 'duck', 'quail', 'ostrich'].map(c => <option key={c}>{c}</option>)}</select></div>
            <div><label className="label">Purpose</label><select className="select" value={animal.purpose} onChange={e => setAnimal({ ...animal, purpose: e.target.value })}>{['dairy', 'meat', 'dual', 'eggs', 'honey', 'draft'].map(c => <option key={c}>{c}</option>)}</select></div>
          </div>
          <div><label className="label">Description</label><textarea className="textarea" rows={3} value={animal.description} onChange={e => setAnimal({ ...animal, description: e.target.value })} /></div>
          <div><label className="label">Feeding guide</label><textarea className="textarea" rows={3} value={animal.feeding_guide} onChange={e => setAnimal({ ...animal, feeding_guide: e.target.value })} /></div>
          <div><label className="label">Housing requirements</label><textarea className="textarea" rows={3} value={animal.housing_requirements} onChange={e => setAnimal({ ...animal, housing_requirements: e.target.value })} /></div>
          <div><button className="btn btn-primary">Add livestock</button></div>
        </form>
      )}

      {tab === 'disease' && (
        <form className="card card-pad form-grid" onSubmit={addDisease}>
          <div className="form-grid three">
            <div><label className="label">Name</label><input className="input" required value={disease.name} onChange={e => setDisease({ ...disease, name: e.target.value })} /></div>
            <div><label className="label">Type</label><select className="select" value={disease.type} onChange={e => setDisease({ ...disease, type: e.target.value })}><option value="crop">Crop</option><option value="livestock">Livestock</option></select></div>
            <div><label className="label">Severity</label><select className="select" value={disease.severity} onChange={e => setDisease({ ...disease, severity: e.target.value })}>{['low', 'medium', 'high', 'critical'].map(c => <option key={c}>{c}</option>)}</select></div>
          </div>
          <div><label className="label">Affects</label><input className="input" value={disease.affects} onChange={e => setDisease({ ...disease, affects: e.target.value })} /></div>
          {(['symptoms', 'causes', 'treatment', 'prevention'] as const).map(k => (
            <div key={k}><label className="label" style={{ textTransform: 'capitalize' }}>{k}</label><textarea className="textarea" rows={3} value={disease[k]} onChange={e => setDisease({ ...disease, [k]: e.target.value })} /></div>
          ))}
          <div><button className="btn btn-primary">Add disease</button></div>
        </form>
      )}

      {confirm && (
        <div className="overlay" onClick={() => setConfirm(null)}>
          <div className="modal fade" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: 20, fontWeight: 800 }}>Delete user</h2>
            <p className="prose" style={{ marginTop: 10 }}>Permanently delete <b>{confirm.name}</b> ({confirm.email})? This cannot be undone.</p>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setConfirm(null)}>Cancel</button>
              <button className="btn btn-primary" style={{ flex: 1, background: 'var(--red)' }} onClick={() => del(confirm)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
