import { useState, useEffect } from 'react'
import api from '../lib/api'
import { Beef, ChevronDown, ChevronUp, Syringe, UtensilsCrossed, Home, Search, Trash2, Star } from 'lucide-react'
import { useAuth } from '../lib/auth'

interface Breed { name:string; origin:string; milk_production?:string; weight_kg?:string; eggs_year?:string; honey_kg_yr?:string; notes:string }
interface Animal { id:number; name:string; category:string; purpose:string; breeds:Breed[]; suitable_aez:string[]; description:string; feeding_guide:string; housing_requirements:string; vaccination_schedule:{vaccine:string;timing:string;dose:string}[]; common_diseases:string[]; breeding_info:string; market_info:string; water_requirement:string; space_required:string }

const CATS = ['cattle','goat','sheep','poultry','rabbit','pig','fish','bees','camel','donkey']
const CAT_EMOJI:Record<string,string> = { cattle:'🐄',goat:'🐐',sheep:'🐑',poultry:'🐔',rabbit:'🐇',pig:'🐷',fish:'🐟',bees:'🐝',camel:'🐪',donkey:'🫏' }

const G = ({ children, className='' }: { children:React.ReactNode; className?:string }) => (
  <div className={className} style={{ background:'rgba(0,0,0,0.38)', backdropFilter:'blur(18px)', border:'1px solid rgba(255,255,255,0.11)', borderRadius:'1rem' }}>{children}</div>
)

export default function LivestockAdvisor() {
  const { user } = useAuth()
  const [animals, setAnimals] = useState<Animal[]>([])
  const [filters, setFilters] = useState({ category:'', search:'' })
  const [expanded, setExpanded] = useState<number|null>(null)
  const [activeTab, setActiveTab] = useState<Record<number,string>>({})
  const [deleting, setDeleting] = useState<number|null>(null)
  const [loading, setLoading] = useState(false)

  const fetch = async () => {
    setLoading(true)
    const p:any = {}
    if (filters.category) p.category = filters.category
    if (filters.search) p.search = filters.search
    const r = await api.get('/livestock/', { params:p })
    setAnimals(r.data); setLoading(false)
  }

  useEffect(() => { fetch() }, [filters.category])

  const setTab = (id:number, tab:string) => setActiveTab(t=>({...t,[id]:tab}))

  const deleteAnimal = async (id:number) => {
    if (!confirm('Delete this livestock entry?')) return
    setDeleting(id)
    await api.delete(`/livestock/${id}`)
    setAnimals(a=>a.filter(x=>x.id!==id))
    setDeleting(null)
  }

  return (
    <div className="slide-up">
      <div className="mb-6">
        <h1 className="text-4xl font-black text-white flex items-center gap-3 drop-shadow-2xl">
          <Beef className="w-9 h-9 text-amber-400"/> Livestock Advisor
        </h1>
        <p className="text-white/55 mt-2">{animals.length} livestock with breeds, feeding, housing, vaccines and market info.</p>
      </div>

      <G className="p-4 mb-5">
        <div className="flex flex-wrap gap-2 mb-3">
          <button onClick={()=>setFilters(f=>({...f,category:''}))}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
            style={!filters.category?{background:'rgba(251,191,36,0.7)',color:'white',border:'1px solid rgba(251,191,36,0.8)'}:{background:'rgba(255,255,255,0.07)',color:'rgba(255,255,255,0.6)',border:'1px solid rgba(255,255,255,0.12)'}}>
            All
          </button>
          {CATS.map(c=>(
            <button key={c} onClick={()=>setFilters(f=>({...f,category:c}))}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all capitalize"
              style={filters.category===c?{background:'rgba(251,191,36,0.7)',color:'white',border:'1px solid rgba(251,191,36,0.8)'}:{background:'rgba(255,255,255,0.07)',color:'rgba(255,255,255,0.6)',border:'1px solid rgba(255,255,255,0.12)'}}>
              {CAT_EMOJI[c]||''} {c}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-white/35"/>
            <input placeholder="Search livestock..." value={filters.search} onChange={e=>setFilters(f=>({...f,search:e.target.value}))}
              onKeyDown={e=>e.key==='Enter'&&fetch()}
              className="w-full pl-9 rounded-xl px-3 py-2 text-sm" style={{ background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.18)', color:'white' }}/>
          </div>
          <button onClick={fetch} className="px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{ background:'rgba(251,191,36,0.7)', border:'1px solid rgba(251,191,36,0.5)' }}>Search</button>
        </div>
      </G>

      {loading ? <div className="text-center py-16 text-white/50 text-lg">Loading livestock...</div> : (
        <div className="space-y-2">
          {animals.length===0 && <G className="py-16 text-center text-white/40">No livestock found.</G>}
          {animals.map(animal => {
            const tab = activeTab[animal.id] || 'breeds'
            return (
              <G key={animal.id} className="overflow-hidden">
                <div className="flex items-center gap-3 px-5 py-4 cursor-pointer" onClick={()=>setExpanded(expanded===animal.id?null:animal.id)}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background:'rgba(251,191,36,0.15)', border:'1px solid rgba(251,191,36,0.3)' }}>
                    {CAT_EMOJI[animal.category]||'🐾'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-white text-sm">{animal.name}</div>
                    <div className="text-xs text-white/45 line-clamp-1">{animal.description}</div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs px-2 py-0.5 rounded-full capitalize" style={{ background:'rgba(251,191,36,0.15)', color:'rgba(251,191,36,0.9)', border:'1px solid rgba(251,191,36,0.25)' }}>{animal.purpose}</span>
                    {user?.role==='admin' && (
                      <button onClick={e=>{e.stopPropagation();deleteAnimal(animal.id)}} disabled={deleting===animal.id}
                        className="p-1 text-red-400 hover:text-red-300 rounded transition-colors">
                        <Trash2 className="w-4 h-4"/>
                      </button>
                    )}
                    {expanded===animal.id?<ChevronUp className="w-4 h-4 text-white/40"/>:<ChevronDown className="w-4 h-4 text-white/40"/>}
                  </div>
                </div>

                {expanded===animal.id && (
                  <div style={{ borderTop:'1px solid rgba(255,255,255,0.09)' }}>
                    <div className="flex overflow-x-auto" style={{ borderBottom:'1px solid rgba(255,255,255,0.09)' }}>
                      {[{id:'breeds',icon:Star,label:'Breeds'},{id:'feeding',icon:UtensilsCrossed,label:'Feeding'},{id:'housing',icon:Home,label:'Housing'},{id:'vaccines',icon:Syringe,label:'Vaccines'},{id:'breeding',icon:Beef,label:'Market'}].map(t=>(
                        <button key={t.id} onClick={()=>setTab(animal.id,t.id)}
                          className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors"
                          style={tab===t.id?{color:'#fbbf24',borderBottom:'2px solid #fbbf24'}:{color:'rgba(255,255,255,0.4)',borderBottom:'2px solid transparent'}}>
                          <t.icon className="w-3.5 h-3.5"/>{t.label}
                        </button>
                      ))}
                    </div>

                    <div className="p-5">
                      {tab==='breeds' && (
                        <div>
                          <p className="text-sm text-white/65 mb-4 leading-relaxed">{animal.description}</p>
                          {animal.breeds?.length>0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {animal.breeds.map((b,i)=>(
                                <div key={i} className="p-3 rounded-xl" style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.09)' }}>
                                  <div className="flex items-start justify-between mb-1">
                                    <div>
                                      <span className="font-bold text-white text-sm">{b.name}</span>
                                      <span className="text-xs text-white/40 ml-2">({b.origin})</span>
                                    </div>
                                    {(b.milk_production||b.weight_kg||b.eggs_year||b.honey_kg_yr) && (
                                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background:'rgba(34,197,94,0.15)', color:'#4ade80', border:'1px solid rgba(34,197,94,0.25)' }}>
                                        {b.milk_production&&`🥛${b.milk_production}`}{b.weight_kg&&`⚖️${b.weight_kg}kg`}{b.eggs_year&&`🥚${b.eggs_year}/yr`}{b.honey_kg_yr&&`🍯${b.honey_kg_yr}kg/yr`}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-white/55">{b.notes}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      {tab==='feeding' && <p className="text-sm text-white/70 leading-relaxed">{animal.feeding_guide}</p>}
                      {tab==='housing' && <p className="text-sm text-white/70 leading-relaxed">{animal.housing_requirements}</p>}
                      {tab==='vaccines' && (
                        <div className="space-y-2">
                          {animal.vaccination_schedule?.map((v,i)=>(
                            <div key={i} className="flex items-start justify-between p-3 rounded-xl" style={{ background:'rgba(96,165,250,0.1)', border:'1px solid rgba(96,165,250,0.2)' }}>
                              <div>
                                <div className="text-sm font-bold text-blue-300">{v.vaccine}</div>
                                <div className="text-xs text-white/50 mt-0.5">{v.timing}</div>
                              </div>
                              <span className="text-xs px-2 py-1 rounded-full text-blue-300 flex-shrink-0" style={{ background:'rgba(96,165,250,0.15)', border:'1px solid rgba(96,165,250,0.25)' }}>{v.dose}</span>
                            </div>
                          ))}
                          {animal.common_diseases?.length>0 && (
                            <div className="mt-4">
                              <h4 className="text-xs font-bold text-red-400 uppercase mb-2">⚠️ Watch Out For</h4>
                              <div className="flex flex-wrap gap-1">
                                {animal.common_diseases.map(d=><span key={d} className="text-xs px-2 py-0.5 rounded-full" style={{ background:'rgba(239,68,68,0.15)', color:'#fca5a5', border:'1px solid rgba(239,68,68,0.25)' }}>{d}</span>)}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      {tab==='breeding' && (
                        <div className="space-y-4">
                          <p className="text-sm text-white/70 leading-relaxed">{animal.breeding_info}</p>
                          {animal.market_info && (
                            <div className="p-4 rounded-xl" style={{ background:'rgba(34,197,94,0.1)', border:'1px solid rgba(34,197,94,0.2)' }}>
                              <h4 className="text-xs font-bold text-green-400 uppercase mb-2">💰 Market Information</h4>
                              <p className="text-sm text-white/70 leading-relaxed">{animal.market_info}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </G>
            )
          })}
        </div>
      )}
    </div>
  )
}
