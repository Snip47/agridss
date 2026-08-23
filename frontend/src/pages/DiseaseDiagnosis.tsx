import { useState, useEffect } from 'react'
import api from '../lib/api'
import { Search, Trash2, X, AlertTriangle } from 'lucide-react'
import { useAuth } from '../lib/auth'

interface Disease { id:number; name:string; type:string; affects:string; symptoms:string; causes:string; treatment:string; prevention:string; severity:string }

const SEV_STYLE:Record<string,{bg:string;border:string;text:string;label:string}> = {
  critical: { bg:'#fef2f2', border:'#fecaca', text:'#dc2626', label:'Critical' },
  high:     { bg:'#fff7ed', border:'#fed7aa', text:'#ea580c', label:'High' },
  medium:   { bg:'#fffbeb', border:'#fde68a', text:'#d97706', label:'Medium' },
  low:      { bg:'#f0fdf4', border:'#bbf7d0', text:'#16a34a', label:'Low' },
}

export default function DiseaseDiagnosis() {
  const { user } = useAuth()
  const [diseases, setDiseases] = useState<Disease[]>([])
  const [filters, setFilters] = useState({ type:'', search:'' })
  const [selected, setSelected] = useState<Disease|null>(null)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState<number|null>(null)

  const fetch = async () => {
    setLoading(true)
    const p:any = {}
    if (filters.type) p.type = filters.type
    if (filters.search) p.search = filters.search
    const r = await api.get('/diseases/', { params:p })
    setDiseases(r.data); setLoading(false)
  }

  useEffect(() => { fetch() }, [filters.type])

  const del = async (id:number) => {
    if (!confirm('Delete?')) return
    setDeleting(id)
    await api.delete(`/diseases/${id}`)
    setDiseases(d=>d.filter(x=>x.id!==id))
    if (selected?.id===id) setSelected(null)
    setDeleting(null)
  }

  return (
    <div className="fade-in max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1" style={{ fontFamily:'Lora, serif', color:'var(--text)' }}>🦠 Disease Diagnosis</h1>
        <p className="text-sm" style={{ color:'var(--text-muted)' }}>{diseases.length} diseases — symptoms, causes, treatment and prevention</p>
      </div>

      {/* Filters */}
      <div className="p-4 rounded-xl mb-5" style={{ background:'white', border:'1px solid var(--border)' }}>
        <div className="flex gap-2 mb-3 flex-wrap">
          {['','crop','livestock'].map(t=>(
            <button key={t} onClick={()=>setFilters(f=>({...f,type:t}))}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize"
              style={filters.type===t
                ?{background:'var(--green)',color:'white',border:'1px solid var(--green)'}
                :{background:'white',color:'var(--text-muted)',border:'1px solid var(--border)'}}>
              {t==='crop'?'🌱 Crop diseases':t==='livestock'?'🐄 Livestock diseases':'All diseases'}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4" style={{ color:'var(--text-muted)' }}/>
            <input placeholder="Search diseases..." value={filters.search}
              onChange={e=>setFilters(f=>({...f,search:e.target.value}))}
              onKeyDown={e=>e.key==='Enter'&&fetch()}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg outline-none"
              style={{ border:'1px solid var(--border)', background:'var(--bg)', color:'var(--text)' }}
              onFocus={e=>(e.target.style.borderColor='#16a34a')}
              onBlur={e=>(e.target.style.borderColor='var(--border)')}/>
          </div>
          <button onClick={fetch} className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ background:'var(--green)' }}>Search</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* List */}
        <div className="lg:col-span-2 space-y-2 max-h-[70vh] overflow-y-auto pr-1">
          {loading && <p className="text-center py-8 text-sm" style={{ color:'var(--text-muted)' }}>Loading...</p>}
          {!loading && diseases.length===0 && (
            <div className="text-center py-8" style={{ color:'var(--text-muted)' }}>No diseases found.</div>
          )}
          {diseases.map(d=>{
            const sev = SEV_STYLE[d.severity]||SEV_STYLE.medium
            return (
              <div key={d.id} onClick={()=>setSelected(d)}
                className="p-3 rounded-xl cursor-pointer transition-all"
                style={selected?.id===d.id
                  ?{border:'2px solid var(--green)',background:'#f0fdf4'}
                  :{border:'1px solid var(--border)',background:'white'}}
                onMouseEnter={e=>selected?.id!==d.id&&(e.currentTarget.style.borderColor='#86efac')}
                onMouseLeave={e=>selected?.id!==d.id&&(e.currentTarget.style.borderColor='var(--border)')}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm mb-0.5" style={{ color:'var(--text)' }}>{d.name}</div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background:sev.bg, color:sev.text, border:`1px solid ${sev.border}` }}>
                        {sev.label}
                      </span>
                      <span className="text-xs capitalize" style={{ color:'var(--text-muted)' }}>
                        {d.type==='crop'?'🌱':'🐄'} {d.affects}
                      </span>
                    </div>
                  </div>
                  {user?.role==='admin' && (
                    <button onClick={e=>{e.stopPropagation();del(d.id)}} disabled={deleting===d.id}
                      className="p-1.5 rounded-lg transition-colors flex-shrink-0"
                      style={{ color:'#dc2626', background:'#fef2f2' }}>
                      <Trash2 className="w-3.5 h-3.5"/>
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Detail */}
        <div className="lg:col-span-3">
          {selected ? (
            <div className="rounded-xl overflow-hidden" style={{ border:'1px solid var(--border)', background:'white' }}>
              {/* Header */}
              <div className="p-5 border-b relative" style={{ borderColor:'var(--border)' }}>
                <button onClick={()=>setSelected(null)} className="absolute top-4 right-4 p-1.5 rounded-lg"
                  style={{ background:'var(--bg)', color:'var(--text-muted)' }}>
                  <X className="w-4 h-4"/>
                </button>
                <div className="flex items-start gap-3 pr-10">
                  <AlertTriangle className="w-6 h-6 mt-0.5 flex-shrink-0" style={{ color:(SEV_STYLE[selected.severity]||SEV_STYLE.medium).text }}/>
                  <div>
                    <h2 className="font-bold text-lg" style={{ fontFamily:'Lora, serif', color:'var(--text)' }}>{selected.name}</h2>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ background:(SEV_STYLE[selected.severity]||SEV_STYLE.medium).bg, color:(SEV_STYLE[selected.severity]||SEV_STYLE.medium).text, border:`1px solid ${(SEV_STYLE[selected.severity]||SEV_STYLE.medium).border}` }}>
                        {(SEV_STYLE[selected.severity]||SEV_STYLE.medium).label} severity
                      </span>
                      <span className="text-xs" style={{ color:'var(--text-muted)' }}>
                        {selected.type==='crop'?'🌱 Crop disease':'🐄 Livestock disease'} · Affects: {selected.affects}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
                {[
                  { label:'Symptoms', content:selected.symptoms, color:'#dc2626', bg:'#fef2f2', border:'#fecaca', emoji:'🔍' },
                  { label:'Causes', content:selected.causes, color:'#d97706', bg:'#fffbeb', border:'#fde68a', emoji:'🧬' },
                  { label:'Treatment', content:selected.treatment, color:'#16a34a', bg:'#f0fdf4', border:'#bbf7d0', emoji:'💊' },
                  { label:'Prevention', content:selected.prevention, color:'#0369a1', bg:'#f0f9ff', border:'#bae6fd', emoji:'🛡️' },
                ].map(({ label, content, color, bg, border, emoji }) => content ? (
                  <div key={label} className="p-4 rounded-xl" style={{ background:bg, border:`1px solid ${border}` }}>
                    <h4 className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color }}>{emoji} {label}</h4>
                    <p className="text-sm leading-relaxed" style={{ color:'var(--text)' }}>{content}</p>
                  </div>
                ) : null)}
              </div>
            </div>
          ) : (
            <div className="rounded-xl flex items-center justify-center py-24"
              style={{ border:'1px dashed var(--border)', background:'white' }}>
              <div className="text-center">
                <div className="text-5xl mb-3">🦠</div>
                <h3 className="font-semibold mb-1" style={{ color:'var(--text)' }}>Select a Disease</h3>
                <p className="text-sm" style={{ color:'var(--text-muted)' }}>Click any disease to see full details and treatment guide</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
