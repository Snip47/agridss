import { useEffect, useMemo, useState } from 'react'
import api from '../lib/api'
import { useAuth } from '../lib/auth'
import PhotoHero from '../components/PhotoHero'

interface Breed { name: string; origin: string; milk_production?: string; weight_kg?: string; eggs_year?: string; honey_kg_yr?: string; notes: string }
interface Animal { id: number; name: string; category: string; purpose: string; breeds: Breed[]; description: string; feeding_guide: string; housing_requirements: string; vaccination_schedule: { vaccine: string; timing: string; dose: string }[]; common_diseases: string[]; breeding_info: string; market_info: string; water_requirement: string; space_required: string }

export default function LivestockAdvisor() {
  const { user } = useAuth()
  const [list, setList] = useState<Animal[]>([])
  const [loading, setLoading] = useState(true)
  const [cat, setCat] = useState('')
  const [q, setQ] = useState('')
  const [sel, setSel] = useState<Animal | null>(null)
  const [tab, setTab] = useState('overview')

  useEffect(() => {
    api.get('/livestock/').then(r => setList(Array.isArray(r.data) ? r.data : [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const cats = useMemo(() => Array.from(new Set(list.map(a => a.category))).sort(), [list])
  const shown = list.filter(a => (!cat || a.category === cat) && (!q || a.name.toLowerCase().includes(q.toLowerCase())))
  const open = (a: Animal) => { setSel(a); setTab('overview') }

  const remove = async (a: Animal) => {
    if (!confirm(`Delete ${a.name}?`)) return
    await api.delete(`/livestock/${a.id}`)
    setList(l => l.filter(x => x.id !== a.id)); setSel(null)
  }

  const tabs = [['overview', 'Overview'], ['feeding', 'Feeding'], ['housing', 'Housing'], ['vaccines', 'Vaccines'], ['market', 'Market']]

  return (
    <div className="wrap">
      <PhotoHero compact image="/images/livestock.jpg" title="Livestock advisor" subtitle={`${list.length} livestock types with breeds, feeding, housing and market information.`} />
      <div className="section" style={{ paddingTop: 12 }}>
        <input className="input search" placeholder="Search livestock" value={q} onChange={e => setQ(e.target.value)} />
        <div className="chips" style={{ marginTop: 12 }}>
          <button className={'chip' + (!cat ? ' active' : '')} onClick={() => setCat('')}>All</button>
          {cats.map(c => <button key={c} className={'chip' + (cat === c ? ' active' : '')} onClick={() => setCat(c)} style={{ textTransform: 'capitalize' }}>{c}</button>)}
        </div>
      </div>

      {loading ? <div className="empty">Loading livestock...</div> : shown.length === 0 ? <div className="empty card">No livestock match your search.</div> : (
        <div className="grid-3">
          {shown.map(a => (
            <div key={a.id} className="card card-pad card-hover" onClick={() => open(a)}>
              <div className="badges" style={{ marginBottom: 8 }}>
                <span className="badge badge-amber" style={{ textTransform: 'capitalize' }}>{a.category}</span>
                <span className="badge">{a.purpose}</span>
              </div>
              <h3>{a.name}</h3>
              <p className="sub">{a.breeds?.length || 0} breeds</p>
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
                  <span className="badge badge-amber" style={{ textTransform: 'capitalize' }}>{sel.category}</span>
                  <span className="badge">{sel.purpose}</span>
                </div>
              </div>
              <button className="btn btn-outline btn-sm" onClick={() => setSel(null)}>Close</button>
            </div>
            <div className="tabs">
              {tabs.map(([id, label]) => <button key={id} className={'tab' + (tab === id ? ' active' : '')} onClick={() => setTab(id)}>{label}</button>)}
            </div>

            {tab === 'overview' && (<>
              <p className="prose">{sel.description}</p>
              <div className="kv" style={{ marginTop: 16 }}>
                {sel.water_requirement && <div><div className="k">Water per day</div><div className="v">{sel.water_requirement}</div></div>}
                {sel.space_required && <div><div className="k">Space needed</div><div className="v">{sel.space_required}</div></div>}
              </div>
              {sel.breeds?.length > 0 && (<><div className="block-title">Breeds</div>{sel.breeds.map((b, i) => (
                <div key={i} className="row-item">
                  <div className="t">{b.name}</div>
                  <div className="d">Origin: {b.origin}</div>
                  {(b.milk_production || b.weight_kg || b.eggs_year || b.honey_kg_yr) && (
                    <div className="badges" style={{ marginTop: 6 }}>
                      {b.milk_production && <span className="badge badge-green">Milk {b.milk_production}</span>}
                      {b.weight_kg && <span className="badge badge-green">{b.weight_kg} kg</span>}
                      {b.eggs_year && <span className="badge badge-green">{b.eggs_year} eggs/yr</span>}
                      {b.honey_kg_yr && <span className="badge badge-green">{b.honey_kg_yr} kg honey/yr</span>}
                    </div>
                  )}
                  <div className="d" style={{ marginTop: 6 }}>{b.notes}</div>
                </div>
              ))}</>)}
              {sel.common_diseases?.length > 0 && (<><div className="block-title">Common diseases</div><div className="badges">{sel.common_diseases.map(d => <span key={d} className="badge badge-red">{d}</span>)}</div></>)}
            </>)}

            {tab === 'feeding' && <p className="prose">{sel.feeding_guide || 'No feeding guide available.'}</p>}
            {tab === 'housing' && <p className="prose">{sel.housing_requirements || 'No housing information available.'}</p>}
            {tab === 'vaccines' && (sel.vaccination_schedule?.length ? sel.vaccination_schedule.map((v, i) => (
              <div key={i} className="row-item"><div className="t">{v.vaccine}</div><div className="d">{v.timing}</div>{v.dose && <div className="badges" style={{ marginTop: 6 }}><span className="badge badge-blue">{v.dose}</span></div>}</div>
            )) : <p className="prose">No vaccination schedule available.</p>)}
            {tab === 'market' && (<>
              <p className="prose">{sel.breeding_info}</p>
              {sel.market_info && (<><div className="block-title">Market prices and income</div><p className="prose">{sel.market_info}</p></>)}
            </>)}

            {user?.role === 'admin' && <div style={{ marginTop: 22 }}><button className="btn btn-danger btn-sm" onClick={() => remove(sel)}>Delete livestock</button></div>}
          </div>
        </div>
      )}
    </div>
  )
}
