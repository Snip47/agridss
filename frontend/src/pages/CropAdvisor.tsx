import { useEffect, useMemo, useState } from 'react'
import api from '../lib/api'
import { useAuth } from '../lib/auth'
import PhotoHero from '../components/PhotoHero'

interface Variety { name: string; type: string; maturity_days?: number; notes: string }
interface Crop { id: number; name: string; category: string; subcategory: string; varieties: Variety[]; suitable_aez: string[]; rainfall_min_mm: number; rainfall_max_mm: number; altitude_min_m: number; altitude_max_m: number; water_requirement: string; soil_types: string[]; planting_months: string[]; maturity_days: number; description: string; care_tips: string; expected_yield: string; market_price_ksh: string; diseases: string[]; best_counties: string[] }

export default function CropAdvisor() {
  const { user } = useAuth()
  const [crops, setCrops] = useState<Crop[]>([])
  const [loading, setLoading] = useState(true)
  const [cat, setCat] = useState('')
  const [q, setQ] = useState('')
  const [sel, setSel] = useState<Crop | null>(null)

  useEffect(() => {
    api.get('/crops/').then(r => setCrops(Array.isArray(r.data) ? r.data : [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const cats = useMemo(() => Array.from(new Set(crops.map(c => c.category))).sort(), [crops])
  const shown = crops.filter(c => (!cat || c.category === cat) && (!q || c.name.toLowerCase().includes(q.toLowerCase())))

  const remove = async (c: Crop) => {
    if (!confirm(`Delete ${c.name}?`)) return
    await api.delete(`/crops/${c.id}`)
    setCrops(list => list.filter(x => x.id !== c.id)); setSel(null)
  }

  return (
    <div className="wrap">
      <PhotoHero compact image="/images/crops.jpg" title="Crop advisor" subtitle={`${crops.length} crops with varieties, planting guides, soil needs and market prices.`} />
      <div className="section" style={{ paddingTop: 12 }}>
        <input className="input search" placeholder="Search crops" value={q} onChange={e => setQ(e.target.value)} />
        <div className="chips" style={{ marginTop: 12 }}>
          <button className={'chip' + (!cat ? ' active' : '')} onClick={() => setCat('')}>All</button>
          {cats.map(c => <button key={c} className={'chip' + (cat === c ? ' active' : '')} onClick={() => setCat(c)} style={{ textTransform: 'capitalize' }}>{c}</button>)}
        </div>
      </div>

      {loading ? <div className="empty">Loading crops...</div> : shown.length === 0 ? <div className="empty card">No crops match your search.</div> : (
        <div className="grid-3">
          {shown.map(c => (
            <div key={c.id} className="card card-pad card-hover" onClick={() => setSel(c)}>
              <div className="badges" style={{ marginBottom: 8 }}>
                <span className="badge badge-green" style={{ textTransform: 'capitalize' }}>{c.category}</span>
                <span className="badge">{c.water_requirement} water</span>
              </div>
              <h3>{c.name}</h3>
              <p className="sub">{c.maturity_days} days to maturity</p>
              {c.market_price_ksh && <p style={{ marginTop: 10, fontWeight: 700, color: 'var(--g)', fontSize: 14 }}>KSh {c.market_price_ksh}</p>}
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
                  <span className="badge badge-green" style={{ textTransform: 'capitalize' }}>{sel.category}</span>
                  {sel.subcategory && <span className="badge">{sel.subcategory}</span>}
                </div>
              </div>
              <button className="btn btn-outline btn-sm" onClick={() => setSel(null)}>Close</button>
            </div>
            <p className="prose">{sel.description}</p>
            <div className="kv" style={{ marginTop: 16 }}>
              <div><div className="k">Maturity</div><div className="v">{sel.maturity_days} days</div></div>
              <div><div className="k">Water need</div><div className="v" style={{ textTransform: 'capitalize' }}>{sel.water_requirement}</div></div>
              <div><div className="k">Rainfall</div><div className="v">{sel.rainfall_min_mm}-{sel.rainfall_max_mm} mm</div></div>
              <div><div className="k">Altitude</div><div className="v">{sel.altitude_min_m}-{sel.altitude_max_m} m</div></div>
              {sel.expected_yield && <div><div className="k">Expected yield</div><div className="v">{sel.expected_yield}</div></div>}
              {sel.market_price_ksh && <div><div className="k">Market price</div><div className="v">KSh {sel.market_price_ksh}</div></div>}
            </div>
            {sel.planting_months?.length > 0 && (<><div className="block-title">Planting months</div><div className="badges">{sel.planting_months.map(m => <span key={m} className="badge badge-green">{m}</span>)}</div></>)}
            {sel.soil_types?.length > 0 && (<><div className="block-title">Soil types</div><div className="badges">{sel.soil_types.map(s => <span key={s} className="badge badge-amber">{s}</span>)}</div></>)}
            {sel.varieties?.length > 0 && (<><div className="block-title">Varieties</div>{sel.varieties.map((v, i) => (
              <div key={i} className="row-item"><div className="t">{v.name} <span className="badge badge-blue" style={{ marginLeft: 6 }}>{v.type}</span>{v.maturity_days ? <span className="badge" style={{ marginLeft: 6 }}>{v.maturity_days} days</span> : null}</div><div className="d">{v.notes}</div></div>
            ))}</>)}
            {sel.care_tips && (<><div className="block-title">Care tips</div><p className="prose">{sel.care_tips}</p></>)}
            {sel.diseases?.length > 0 && (<><div className="block-title">Common diseases</div><div className="badges">{sel.diseases.map(d => <span key={d} className="badge badge-red">{d}</span>)}</div></>)}
            {sel.best_counties?.length > 0 && (<><div className="block-title">Best counties</div><div className="badges">{sel.best_counties.map(d => <span key={d} className="badge">{d}</span>)}</div></>)}
            {user?.role === 'admin' && <div style={{ marginTop: 22 }}><button className="btn btn-danger btn-sm" onClick={() => remove(sel)}>Delete crop</button></div>}
          </div>
        </div>
      )}
    </div>
  )
}
