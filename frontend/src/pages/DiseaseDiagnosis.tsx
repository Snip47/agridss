import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import { useAuth } from '../lib/auth'

interface Disease { id: number; name: string; type: string; affects: string; symptoms: string; causes: string; treatment: string; prevention: string; severity: string }
const sev: Record<string, string> = { low: 'badge-green', medium: 'badge-amber', high: 'badge-red', critical: 'badge-red' }

export default function DiseaseDiagnosis() {
  const { user } = useAuth()
  const [list, setList] = useState<Disease[]>([])
  const [loading, setLoading] = useState(true)
  const [type, setType] = useState('')
  const [q, setQ] = useState('')
  const [sel, setSel] = useState<Disease | null>(null)

  useEffect(() => {
    api.get('/diseases/').then(r => setList(Array.isArray(r.data) ? r.data : [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const shown = list.filter(d => (!type || d.type === type) && (!q || (d.name + ' ' + d.affects + ' ' + d.symptoms).toLowerCase().includes(q.toLowerCase())))

  const remove = async (d: Disease) => {
    if (!confirm(`Delete ${d.name}?`)) return
    await api.delete(`/diseases/${d.id}`)
    setList(l => l.filter(x => x.id !== d.id)); setSel(null)
  }

  return (
    <div className="wrap">
      <div className="page-head">
        <h1>Disease diagnosis</h1>
        <p>{list.length} crop and livestock diseases with symptoms, treatment and prevention.</p>
      </div>
      <div className="section" style={{ paddingTop: 12 }}>
        <div className="notice" style={{ marginBottom: 14 }}>Have a photo of the problem? <Link to="/ai" className="link-green">Open the AI farm advisor</Link> for an instant diagnosis.</div>
        <input className="input search" placeholder="Search by disease, crop, animal or symptom" value={q} onChange={e => setQ(e.target.value)} />
        <div className="chips" style={{ marginTop: 12 }}>
          {[['', 'All'], ['crop', 'Crop diseases'], ['livestock', 'Livestock diseases']].map(([v, l]) => (
            <button key={v} className={'chip' + (type === v ? ' active' : '')} onClick={() => setType(v)}>{l}</button>
          ))}
        </div>
      </div>

      {loading ? <div className="empty">Loading diseases...</div> : shown.length === 0 ? <div className="empty card">No diseases match your search.</div> : (
        <div className="grid-3">
          {shown.map(d => (
            <div key={d.id} className="card card-pad card-hover" onClick={() => setSel(d)}>
              <div className="badges" style={{ marginBottom: 8 }}>
                <span className={'badge ' + (sev[d.severity] || '')} style={{ textTransform: 'capitalize' }}>{d.severity}</span>
                <span className="badge" style={{ textTransform: 'capitalize' }}>{d.type}</span>
              </div>
              <h3>{d.name}</h3>
              <p className="sub">Affects {d.affects}</p>
            </div>
          ))}
        </div>
      )}

      {sel && (
        <div className="overlay" onClick={() => setSel(null)}>
          <div className="modal fade" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <h2>{sel.name}</h2>
                <div className="badges" style={{ marginTop: 8 }}>
                  <span className={'badge ' + (sev[sel.severity] || '')} style={{ textTransform: 'capitalize' }}>{sel.severity} severity</span>
                  <span className="badge" style={{ textTransform: 'capitalize' }}>{sel.type}</span>
                  <span className="badge badge-blue">Affects {sel.affects}</span>
                </div>
              </div>
              <button className="btn btn-outline btn-sm" onClick={() => setSel(null)}>Close</button>
            </div>
            <div className="block-title">Symptoms</div><p className="prose">{sel.symptoms}</p>
            <div className="block-title">Causes</div><p className="prose">{sel.causes}</p>
            <div className="block-title">Treatment</div><p className="prose">{sel.treatment}</p>
            <div className="block-title">Prevention</div><p className="prose">{sel.prevention}</p>
            {user?.role === 'admin' && <div style={{ marginTop: 22 }}><button className="btn btn-danger btn-sm" onClick={() => remove(sel)}>Delete disease</button></div>}
          </div>
        </div>
      )}
    </div>
  )
}
