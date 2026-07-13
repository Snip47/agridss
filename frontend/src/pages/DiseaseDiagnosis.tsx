import { useState, useEffect } from 'react'
import api from '../lib/api'
import { Bug, Search, AlertTriangle, ShieldCheck, Stethoscope, Trash2 } from 'lucide-react'
import { useAuth } from '../lib/auth'
import PageBackdrop, { BACKDROPS } from '../components/PageBackdrop'

interface Disease { id:number; name:string; type:string; affects:string; symptoms:string; causes:string; treatment:string; prevention:string; severity:string }

const SEV: Record<string,{bg:string;text:string;border:string}> = {
  low:    { bg:'bg-green-50',  text:'text-green-700',  border:'border-green-200' },
  medium: { bg:'bg-yellow-50', text:'text-yellow-700', border:'border-yellow-200' },
  high:   { bg:'bg-orange-50', text:'text-orange-700', border:'border-orange-200' },
  critical:{ bg:'bg-red-50',   text:'text-red-700',    border:'border-red-200' },
}

export default function DiseaseDiagnosis() {
  const { user } = useAuth()
  const [diseases, setDiseases] = useState<Disease[]>([])
  const [keyword, setKeyword] = useState('')
  const [type, setType] = useState('')
  const [selected, setSelected] = useState<Disease|null>(null)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState<number|null>(null)

  const search = async () => {
    setLoading(true)
    const p: any = {}
    if (keyword) p.keyword = keyword
    if (type) p.type = type
    const r = await api.get('/diseases/', { params: p })
    setDiseases(r.data); setLoading(false)
  }

  useEffect(() => { search() }, [type])

  const deleteDisease = async (id: number) => {
    if (!confirm('Delete this disease entry?')) return
    setDeleting(id)
    await api.delete(`/diseases/${id}`)
    setDiseases(d => d.filter(x => x.id !== id))
    if (selected?.id === id) setSelected(null)
    setDeleting(null)
  }

  return (
    <>
      <PageBackdrop image={BACKDROPS.diseases} overlay="from-leaf-900/70 via-emerald-950/50 to-earth-900/75" />
      
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-earth-800 flex items-center gap-2"><Bug className="w-6 h-6 text-red-500"/> Disease Diagnosis</h1>
        <p className="text-earth-500 mt-1 text-sm">Describe symptoms or search by disease name. Covers both crop and livestock diseases.</p>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-earth-100 mb-5">
        <div className="flex gap-3 flex-wrap">
          <div className="flex-1 min-w-48 relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-earth-400"/>
            <input placeholder="Describe symptoms or search disease name..." value={keyword}
              onChange={e => setKeyword(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()}
              className="w-full pl-9 border border-earth-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-leaf-500"/>
          </div>
          <div className="flex gap-2">
            {[['', 'All'], ['crop', '🌱 Crop'], ['livestock', '🐄 Livestock']].map(([val, label]) => (
              <button key={val} onClick={() => setType(val)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${type === val ? 'bg-earth-700 text-white' : 'bg-earth-100 text-earth-600 hover:bg-earth-200'}`}>
                {label}
              </button>
            ))}
          </div>
          <button onClick={search} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">
            Search
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* List */}
        <div className="lg:col-span-2 space-y-2 max-h-[70vh] overflow-y-auto scrollbar-thin">
          {loading && <div className="text-center py-8 text-earth-400 text-sm">Searching...</div>}
          {!loading && diseases.length === 0 && (
            <div className="text-center py-8 text-earth-400 bg-white rounded-xl border border-earth-100 text-sm">No diseases found.</div>
          )}
          {diseases.map(d => {
            const s = SEV[d.severity] || SEV.low
            return (
              <div key={d.id} onClick={() => setSelected(d)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selected?.id === d.id ? 'border-earth-400 bg-earth-50 shadow-sm' : 'border-earth-100 bg-white hover:border-earth-200'
                }`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-semibold text-earth-800 text-sm">{d.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${s.bg} ${s.text}`}>{d.severity}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${d.type === 'crop' ? 'bg-leaf-100 text-leaf-700' : 'bg-earth-100 text-earth-600'}`}>{d.type}</span>
                      <span className="text-xs text-earth-400">{d.affects}</span>
                    </div>
                    <p className="text-xs text-earth-500 line-clamp-2">{d.symptoms}</p>
                  </div>
                  {user?.role === 'admin' && (
                    <button onClick={e => { e.stopPropagation(); deleteDisease(d.id) }} disabled={deleting === d.id}
                      className="p-1 text-red-400 hover:text-red-600 rounded flex-shrink-0">
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
            <div className="bg-white rounded-xl shadow-sm border border-earth-100 p-6 sticky top-6">
              <div className="flex items-start justify-between mb-3 gap-3">
                <div>
                  <h2 className="font-bold text-earth-800 text-lg">{selected.name}</h2>
                  <p className="text-xs text-earth-400 mt-0.5">
                    <span className={`px-2 py-0.5 rounded-full text-xs mr-2 ${selected.type==='crop'?'bg-leaf-100 text-leaf-700':'bg-earth-100 text-earth-600'}`}>{selected.type}</span>
                    Affects: <strong>{selected.affects}</strong>
                  </p>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-semibold capitalize flex-shrink-0 ${SEV[selected.severity]?.bg} ${SEV[selected.severity]?.text}`}>
                  {selected.severity} severity
                </span>
              </div>

              <div className="space-y-4">
                {[
                  { icon:Stethoscope, label:'Symptoms', content:selected.symptoms, color:'text-orange-600', bg:'bg-orange-50' },
                  { icon:Bug, label:'Causes', content:selected.causes, color:'text-red-600', bg:'bg-red-50' },
                  { icon:AlertTriangle, label:'Treatment', content:selected.treatment, color:'text-blue-600', bg:'bg-blue-50' },
                  { icon:ShieldCheck, label:'Prevention', content:selected.prevention, color:'text-leaf-600', bg:'bg-leaf-50' },
                ].map(({ icon:Icon, label, content, color, bg }) => (
                  <div key={label} className={`${bg} rounded-lg p-4`}>
                    <h3 className={`text-xs font-bold uppercase flex items-center gap-1.5 mb-2 ${color}`}>
                      <Icon className="w-3.5 h-3.5"/>{label}
                    </h3>
                    <p className="text-sm text-earth-700 leading-relaxed">{content}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-earth-100 p-16 text-center">
              <Bug className="w-14 h-14 mx-auto mb-4 text-earth-200"/>
              <h3 className="font-bold text-earth-600 mb-1">Select a Disease</h3>
              <p className="text-sm text-earth-400">Click any disease in the list to see full diagnosis details, treatment, and prevention.</p>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  )
}
