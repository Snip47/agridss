import { useState, useEffect } from 'react'
import api from '../lib/api'
import { Beef, ChevronDown, ChevronUp, Syringe, UtensilsCrossed, Home, Search, Trash2, Star } from 'lucide-react'
import { useAuth } from '../lib/auth'
import { getAnimalImage } from '../lib/itemImages'

interface Breed { name:string; origin:string; milk_production?:string; weight_kg?:string; eggs_year?:string; honey_kg_yr?:string; notes:string }
interface Animal { id:number; name:string; category:string; purpose:string; breeds:Breed[]; suitable_aez:string[]; description:string; feeding_guide:string; housing_requirements:string; vaccination_schedule:{vaccine:string;timing:string;dose:string}[]; common_diseases:string[]; breeding_info:string; market_info:string; water_requirement:string; space_required:string }

const CATS = ['cattle','goat','sheep','poultry','rabbit','pig','fish','bees','camel','donkey']
const CAT_EMOJI:Record<string,string> = { cattle:'🐄',goat:'🐐',sheep:'🐑',poultry:'🐔',rabbit:'🐇',pig:'🐷',fish:'🐟',bees:'🐝',camel:'🐪',donkey:'🫏' }

// Category cover images
const CAT_IMAGES:Record<string,string> = {
  cattle: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=600&q=80',
  goat: 'https://images.unsplash.com/photo-1524024973431-2ad916746881?w=600&q=80',
  sheep: 'https://images.unsplash.com/photo-1484557052118-f32bd25b45b5?w=600&q=80',
  poultry: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=600&q=80',
  rabbit: 'https://images.unsplash.com/photo-1535241749838-299277b6305f?w=600&q=80',
  pig: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=600&q=80',
  fish: 'https://images.unsplash.com/photo-1534482421-64566f976cfa?w=600&q=80',
  bees: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
  camel: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&q=80',
  donkey: 'https://images.unsplash.com/photo-1548445929-4f60a497f851?w=600&q=80',
}

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
    if (!confirm('Delete?')) return
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
        <p className="text-white/55 mt-2">{animals.length} livestock with breeds, feeding, housing and market info.</p>
      </div>

      {/* Filters */}
      <G className="p-4 mb-5">
        <div className="flex flex-wrap gap-2 mb-3">
          <button onClick={()=>setFilters(f=>({...f,category:''}))}
            className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
            style={!filters.category?{background:'rgba(251,191,36,0.7)',color:'white',border:'1px solid rgba(251,191,36,0.5)'}:{background:'rgba(255,255,255,0.07)',color:'rgba(255,255,255,0.6)',border:'1px solid rgba(255,255,255,0.12)'}}>
            All
          </button>
          {CATS.map(c=>(
            <button key={c} onClick={()=>setFilters(f=>({...f,category:c}))}
              className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all capitalize"
              style={filters.category===c?{background:'rgba(251,191,36,0.7)',color:'white',border:'1px solid rgba(251,191,36,0.5)'}:{background:'rgba(255,255,255,0.07)',color:'rgba(255,255,255,0.6)',border:'1px solid rgba(255,255,255,0.12)'}}>
              {CAT_EMOJI[c]} {c}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-white/35"/>
            <input placeholder="Search livestock..." value={filters.search}
              onChange={e=>setFilters(f=>({...f,search:e.target.value}))}
              onKeyDown={e=>e.key==='Enter'&&fetch()}
              className="w-full pl-9 rounded-xl px-3 py-2 text-sm"
              style={{ background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.18)', color:'white' }}/>
          </div>
          <button onClick={fetch} className="px-4 py-2 rounded-xl text-sm font-bold text-white"
            style={{ background:'rgba(251,191,36,0.7)', border:'1px solid rgba(251,191,36,0.5)' }}>
            Search
          </button>
        </div>
      </G>

      {loading ? (
        <div className="text-center py-16 text-white/50 text-lg">Loading livestock...</div>
      ) : (
        <div className="space-y-2">
          {animals.length===0 && <G className="py-16 text-center text-white/40">No livestock found.</G>}
          {animals.map(animal=>{
            const tab = activeTab[animal.id]||'breeds'
            const coverImg = CAT_IMAGES[animal.category]||CAT_IMAGES.cattle
            return (
              <G key={animal.id} className="overflow-hidden hover:border-white/20 transition-all">
                {/* Animal header with image */}
                <div className="flex items-center gap-3 px-4 py-3 cursor-pointer"
                  onClick={()=>setExpanded(expanded===animal.id?null:animal.id)}>
                  {/* Animal image */}
                  <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border border-white/15">
                    <img src={coverImg} alt={animal.name} className="w-full h-full object-cover"
                      onError={e=>{(e.target as HTMLImageElement).src=CAT_IMAGES.cattle}}/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-white">{animal.name}</div>
                    <div className="text-xs text-white/45 line-clamp-1 mb-1">{animal.description}</div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{CAT_EMOJI[animal.category]||'🐾'}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full capitalize"
                        style={{ background:'rgba(251,191,36,0.15)', color:'#fbbf24', border:'1px solid rgba(251,191,36,0.25)' }}>
                        {animal.purpose}
                      </span>
                      <span className="text-xs text-white/35">{animal.breeds?.length||0} breeds</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {user?.role==='admin' && (
                      <button onClick={e=>{e.stopPropagation();deleteAnimal(animal.id)}} disabled={deleting===animal.id}
                        className="p-1.5 rounded-lg text-red-400 hover:text-red-300"
                        style={{ background:'rgba(239,68,68,0.1)' }}>
                        <Trash2 className="w-3.5 h-3.5"/>
                      </button>
                    )}
                    {expanded===animal.id?<ChevronUp className="w-4 h-4 text-white/40"/>:<ChevronDown className="w-4 h-4 text-white/40"/>}
                  </div>
                </div>

                {expanded===animal.id && (
                  <div style={{ borderTop:'1px solid rgba(255,255,255,0.09)' }}>
                    {/* Tabs */}
                    <div className="flex overflow-x-auto" style={{ borderBottom:'1px solid rgba(255,255,255,0.09)' }}>
                      {[{id:'breeds',icon:Star,label:'Breeds'},{id:'feeding',icon:UtensilsCrossed,label:'Feeding'},{id:'housing',icon:Home,label:'Housing'},{id:'vaccines',icon:Syringe,label:'Vaccines'},{id:'market',icon:Beef,label:'Market'}].map(t=>(
                        <button key={t.id} onClick={()=>setTab(animal.id,t.id)}
                          className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold whitespace-nowrap transition-colors"
                          style={tab===t.id?{color:'#fbbf24',borderBottom:'2px solid #fbbf24'}:{color:'rgba(255,255,255,0.4)',borderBottom:'2px solid transparent'}}>
                          <t.icon className="w-3.5 h-3.5"/>{t.label}
                        </button>
                      ))}
                    </div>

                    <div className="p-5">
                      {/* BREEDS TAB - with images */}
                      {tab==='breeds' && (
                        <div>
                          <p className="text-sm text-white/60 mb-4 leading-relaxed">{animal.description}</p>
                          {animal.breeds?.length>0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {animal.breeds.map((b,i)=>(
                                <div key={i} className="rounded-xl overflow-hidden transition-all hover:border-amber-400/30"
                                  style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.09)' }}>
                                  {/* Breed image */}
                                  <div className="h-32 overflow-hidden relative">
                                    <img
                                      src={getAnimalImage(b.name)}
                                      alt={b.name}
                                      className="w-full h-full object-cover"
                                      onError={e=>{(e.target as HTMLImageElement).src=coverImg}}
                                    />
                                    <div className="absolute inset-0" style={{ background:'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 55%)' }}/>
                                    {/* Breed stats overlay */}
                                    <div className="absolute bottom-2 left-3 right-3">
                                      <div className="font-black text-white text-sm leading-tight">{b.name}</div>
                                      <div className="text-xs text-white/60">{b.origin}</div>
                                    </div>
                                    {/* Production badge */}
                                    {(b.milk_production||b.weight_kg||b.eggs_year||b.honey_kg_yr) && (
                                      <div className="absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full font-bold"
                                        style={{ background:'rgba(251,191,36,0.85)', color:'#000' }}>
                                        {b.milk_production&&`🥛 ${b.milk_production}`}
                                        {b.weight_kg&&`⚖️ ${b.weight_kg}kg`}
                                        {b.eggs_year&&`🥚 ${b.eggs_year}/yr`}
                                        {b.honey_kg_yr&&`🍯 ${b.honey_kg_yr}kg/yr`}
                                      </div>
                                    )}
                                  </div>
                                  <div className="p-3">
                                    <p className="text-xs text-white/55 leading-relaxed">{b.notes}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="mt-4 grid grid-cols-2 gap-3">
                            <div className="p-3 rounded-xl" style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.09)' }}>
                              <div className="text-xs text-white/40 mb-0.5">💧 Water/day</div>
                              <div className="text-sm font-bold text-white">{animal.water_requirement}</div>
                            </div>
                            <div className="p-3 rounded-xl" style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.09)' }}>
                              <div className="text-xs text-white/40 mb-0.5">📐 Space needed</div>
                              <div className="text-sm font-bold text-white">{animal.space_required}</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {tab==='feeding' && (
                        <div>
                          <p className="text-sm text-white/70 leading-relaxed mb-4">{animal.feeding_guide}</p>
                          {animal.common_diseases?.length>0 && (
                            <div>
                              <h4 className="text-xs font-black text-red-400 uppercase mb-2">⚠️ Watch Out For</h4>
                              <div className="flex flex-wrap gap-1">
                                {animal.common_diseases.map(d=>(
                                  <span key={d} className="text-xs px-2 py-0.5 rounded-full"
                                    style={{ background:'rgba(239,68,68,0.15)', color:'#fca5a5', border:'1px solid rgba(239,68,68,0.25)' }}>{d}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {tab==='housing' && (
                        <p className="text-sm text-white/70 leading-relaxed">{animal.housing_requirements}</p>
                      )}

                      {tab==='vaccines' && (
                        <div className="space-y-2">
                          {animal.vaccination_schedule?.map((v,i)=>(
                            <div key={i} className="flex items-start justify-between p-3 rounded-xl gap-3"
                              style={{ background:'rgba(96,165,250,0.1)', border:'1px solid rgba(96,165,250,0.2)' }}>
                              <div>
                                <div className="text-sm font-bold text-blue-300">{v.vaccine}</div>
                                <div className="text-xs text-white/50 mt-0.5">{v.timing}</div>
                              </div>
                              <span className="text-xs px-2 py-1 rounded-full font-medium flex-shrink-0"
                                style={{ background:'rgba(96,165,250,0.2)', color:'#93c5fd', border:'1px solid rgba(96,165,250,0.3)' }}>
                                {v.dose}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {tab==='market' && (
                        <div className="space-y-4">
                          <p className="text-sm text-white/70 leading-relaxed">{animal.breeding_info}</p>
                          {animal.market_info && (
                            <div className="p-4 rounded-xl" style={{ background:'rgba(34,197,94,0.1)', border:'1px solid rgba(34,197,94,0.2)' }}>
                              <h4 className="text-xs font-black text-green-400 uppercase mb-2">💰 Market Information</h4>
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
