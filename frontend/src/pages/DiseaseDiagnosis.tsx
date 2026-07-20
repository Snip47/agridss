import { useState, useEffect } from 'react'
import api from '../lib/api'
import { Bug, Search, AlertTriangle, ShieldCheck, Stethoscope, Trash2 } from 'lucide-react'
import { useAuth } from '../lib/auth'
import { getDiseaseImage } from '../lib/itemImages'

interface Disease { id:number; name:string; type:string; affects:string; symptoms:string; causes:string; treatment:string; prevention:string; severity:string }

const SEV:Record<string,{bg:string;text:string;border:string}> = {
  low:     { bg:'rgba(34,197,94,0.15)',  text:'#4ade80', border:'rgba(34,197,94,0.3)' },
  medium:  { bg:'rgba(251,191,36,0.15)', text:'#fbbf24', border:'rgba(251,191,36,0.3)' },
  high:    { bg:'rgba(249,115,22,0.15)', text:'#fb923c', border:'rgba(249,115,22,0.3)' },
  critical:{ bg:'rgba(239,68,68,0.15)',  text:'#f87171', border:'rgba(239,68,68,0.3)' },
}

const G = ({ children, className='' }: { children:React.ReactNode; className?:string }) => (
  <div className={className} style={{ background:'rgba(0,0,0,0.38)', backdropFilter:'blur(18px)', border:'1px solid rgba(255,255,255,0.11)', borderRadius:'1rem' }}>{children}</div>
)

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
    const p:any = {}
    if (keyword) p.keyword = keyword
    if (type) p.type = type
    const r = await api.get('/diseases/', { params:p })
    setDiseases(r.data); setLoading(false)
  }

  useEffect(() => { search() }, [type])

  const deleteDisease = async (id:number) => {
    if (!confirm('Delete this disease?')) return
    setDeleting(id)
    await api.delete(`/diseases/${id}`)
    setDiseases(d=>d.filter(x=>x.id!==id))
    if (selected?.id===id) setSelected(null)
    setDeleting(null)
  }

  return (
    <div className="slide-up">
      <div className="mb-6">
        <h1 className="text-4xl font-black text-white flex items-center gap-3 drop-shadow-2xl">
          <Bug className="w-9 h-9 text-red-400"/> Disease Diagnosis
        </h1>
        <p className="text-white/55 mt-2">Describe symptoms or search by name. Covers crop and livestock diseases.</p>
      </div>

      {/* Search bar */}
      <G className="p-4 mb-5">
        <div className="flex gap-3 flex-wrap">
          <div className="flex-1 min-w-48 relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-white/35"/>
            <input placeholder="Describe symptoms or disease name..." value={keyword}
              onChange={e=>setKeyword(e.target.value)} onKeyDown={e=>e.key==='Enter'&&search()}
              className="w-full pl-9 rounded-xl px-3 py-2 text-sm"
              style={{ background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.18)', color:'white' }}/>
          </div>
          <div className="flex gap-2">
            {[['','All'],['crop','🌱 Crop'],['livestock','🐄 Livestock']].map(([val,label])=>(
              <button key={val} onClick={()=>setType(val)}
                className="px-3 py-2 rounded-xl text-xs font-bold transition-all"
                style={type===val
                  ?{background:'rgba(239,68,68,0.6)',color:'white',border:'1px solid rgba(239,68,68,0.5)'}
                  :{background:'rgba(255,255,255,0.07)',color:'rgba(255,255,255,0.6)',border:'1px solid rgba(255,255,255,0.12)'}}>
                {label}
              </button>
            ))}
          </div>
          <button onClick={search} className="px-4 py-2 rounded-xl text-sm font-bold text-white"
            style={{ background:'rgba(239,68,68,0.7)', border:'1px solid rgba(239,68,68,0.5)' }}>
            Search
          </button>
        </div>
      </G>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Disease list with images */}
        <div className="lg:col-span-2 space-y-2 max-h-[70vh] overflow-y-auto scrollbar-thin pr-1">
          {loading && <div className="text-center py-8 text-white/40 text-sm">Searching...</div>}
          {!loading && diseases.length===0 && (
            <G className="py-8 text-center text-white/40 text-sm">No diseases found.</G>
          )}
          {diseases.map(d=>{
            const s = SEV[d.severity]||SEV.low
            const img = getDiseaseImage(d.name)
            return (
              <div key={d.id} onClick={()=>setSelected(d)}
                className="rounded-xl cursor-pointer transition-all duration-200 overflow-hidden"
                style={selected?.id===d.id
                  ?{ background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.4)', backdropFilter:'blur(16px)' }
                  :{ background:'rgba(0,0,0,0.32)', border:'1px solid rgba(255,255,255,0.09)', backdropFilter:'blur(16px)' }}>

                {/* Disease image banner */}
                <div className="h-20 overflow-hidden relative">
                  <img src={img} alt={d.name} className="w-full h-full object-cover"
                    onError={e=>{(e.target as HTMLImageElement).src='https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=80'}}/>
                  <div className="absolute inset-0" style={{ background:'linear-gradient(to right, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.3) 100%)' }}/>
                  {/* Severity badge on image */}
                  <div className="absolute top-2 right-2">
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold capitalize"
                      style={{ background:s.bg, color:s.text, border:`1px solid ${s.border}` }}>
                      {d.severity}
                    </span>
                  </div>
                  {/* Type badge */}
                  <div className="absolute top-2 left-2">
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                      style={d.type==='crop'
                        ?{background:'rgba(34,197,94,0.7)',color:'white'}
                        :{background:'rgba(251,191,36,0.7)',color:'#000'}}>
                      {d.type==='crop'?'🌱 Crop':'🐄 Livestock'}
                    </span>
                  </div>
                </div>

                <div className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-white text-sm">{d.name}</div>
                      <div className="text-xs text-white/40 mb-1">Affects: {d.affects}</div>
                      <p className="text-xs text-white/50 line-clamp-2">{d.symptoms}</p>
                    </div>
                    {user?.role==='admin' && (
                      <button onClick={e=>{e.stopPropagation();deleteDisease(d.id)}} disabled={deleting===d.id}
                        className="p-1 text-red-400 hover:text-red-300 rounded flex-shrink-0">
                        <Trash2 className="w-3.5 h-3.5"/>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Detail panel */}
        <div className="lg:col-span-3">
          {selected ? (
            <G className="overflow-hidden sticky top-6">
              {/* Hero image */}
              <div className="h-48 relative overflow-hidden">
                <img
                  src={getDiseaseImage(selected.name)}
                  alt={selected.name}
                  className="w-full h-full object-cover"
                  onError={e=>{(e.target as HTMLImageElement).src='https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=80'}}
                />
                <div className="absolute inset-0" style={{ background:'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)' }}/>
                <div className="absolute bottom-4 left-5 right-5">
                  <h2 className="font-black text-white text-2xl drop-shadow-lg">{selected.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                      style={selected.type==='crop'?{background:'rgba(34,197,94,0.7)',color:'white'}:{background:'rgba(251,191,36,0.7)',color:'#000'}}>
                      {selected.type==='crop'?'🌱 Crop Disease':'🐄 Livestock Disease'}
                    </span>
                    <span className="text-xs text-white/60">Affects: <strong className="text-white/80">{selected.affects}</strong></span>
                    <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-bold capitalize"
                      style={{ background:(SEV[selected.severity]||SEV.low).bg, color:(SEV[selected.severity]||SEV.low).text, border:`1px solid ${(SEV[selected.severity]||SEV.low).border}` }}>
                      {selected.severity} severity
                    </span>
                  </div>
                </div>
              </div>

              {/* Detail sections */}
              <div className="p-5 space-y-3">
                {[
                  { icon:Stethoscope, label:'Symptoms', content:selected.symptoms, bg:'rgba(249,115,22,0.12)', border:'rgba(249,115,22,0.25)', color:'#fb923c' },
                  { icon:Bug, label:'Causes', content:selected.causes, bg:'rgba(239,68,68,0.12)', border:'rgba(239,68,68,0.25)', color:'#f87171' },
                  { icon:AlertTriangle, label:'Treatment', content:selected.treatment, bg:'rgba(96,165,250,0.12)', border:'rgba(96,165,250,0.25)', color:'#60a5fa' },
                  { icon:ShieldCheck, label:'Prevention', content:selected.prevention, bg:'rgba(34,197,94,0.12)', border:'rgba(34,197,94,0.25)', color:'#4ade80' },
                ].map(({ icon:Icon, label, content, bg, border, color })=>(
                  <div key={label} className="p-4 rounded-xl" style={{ background:bg, border:`1px solid ${border}` }}>
                    <h3 className="text-xs font-black uppercase flex items-center gap-1.5 mb-2" style={{ color }}>
                      <Icon className="w-3.5 h-3.5"/>{label}
                    </h3>
                    <p className="text-sm text-white/70 leading-relaxed">{content}</p>
                  </div>
                ))}
              </div>
            </G>
          ) : (
            <G className="py-24 text-center">
              <Bug className="w-20 h-20 mx-auto mb-4 text-white/10"/>
              <h3 className="font-bold text-white/35 text-lg mb-1">Select a Disease</h3>
              <p className="text-sm text-white/25 max-w-xs mx-auto">Click any disease card in the list to see full diagnosis, treatment and prevention details.</p>
            </G>
          )}
        </div>
      </div>
    </div>
  )
}
