import { useState, useEffect } from 'react'
import api from '../lib/api'
import { Search, Trash2, Syringe, UtensilsCrossed, Home, Star, X } from 'lucide-react'
import { useAuth } from '../lib/auth'
import { getAnimalImage, getBreedImage } from '../lib/itemImages'

interface Breed { name:string; origin:string; milk_production?:string; weight_kg?:string; eggs_year?:string; honey_kg_yr?:string; notes:string }
interface Animal { id:number; name:string; category:string; purpose:string; breeds:Breed[]; suitable_aez:string[]; description:string; feeding_guide:string; housing_requirements:string; vaccination_schedule:{vaccine:string;timing:string;dose:string}[]; common_diseases:string[]; breeding_info:string; market_info:string; water_requirement:string; space_required:string }

const CATS = ['cattle','goat','sheep','poultry','rabbit','pig','fish','bees','camel','donkey','duck','quail','ostrich']
const CAT_EMOJI:Record<string,string> = { cattle:'🐄',goat:'🐐',sheep:'🐑',poultry:'🐔',rabbit:'🐇',pig:'🐷',fish:'🐟',bees:'🐝',camel:'🐪',donkey:'🫏',duck:'🦆',quail:'🐦',ostrich:'🦜' }
const FALLBACK = 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=800&q=80&fit=crop'

const Badge = ({ children, bg='#f3f4f6', text='#374151' }: any) => (
  <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background:bg, color:text }}>{children}</span>
)

export default function LivestockAdvisor() {
  const { user } = useAuth()
  const [animals, setAnimals] = useState<Animal[]>([])
  const [filters, setFilters] = useState({ category:'', search:'' })
  const [selected, setSelected] = useState<Animal|null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [deleting, setDeleting] = useState<number|null>(null)
  const [loading, setLoading] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    const p:any = {}
    if (filters.category) p.category = filters.category
    if (filters.search) p.search = filters.search
    const r = await api.get('/livestock/', { params:p })
    setAnimals(r.data); setLoading(false)
  }

  useEffect(() => { fetchData() }, [filters.category])

  const deleteAnimal = async (id:number) => {
    if (!confirm('Delete?')) return
    setDeleting(id)
    await api.delete(`/livestock/${id}`)
    setAnimals(a=>a.filter(x=>x.id!==id))
    if (selected?.id===id) setSelected(null)
    setDeleting(null)
  }

  return (
    <div className="fade-in max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1" style={{ fontFamily:'Lora, serif', color:'var(--text)' }}>🐄 Livestock Advisor</h1>
        <p className="text-sm" style={{ color:'var(--text-muted)' }}>{animals.length} livestock types — breeds, feeding, housing and market info</p>
      </div>

      {/* Filters */}
      <div className="p-4 rounded-xl mb-5" style={{ background:'white', border:'1px solid var(--border)' }}>
        <div className="flex flex-wrap gap-2 mb-3">
          <button onClick={()=>setFilters(f=>({...f,category:''}))}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={!filters.category?{background:'var(--green)',color:'white',border:'1px solid var(--green)'}:{background:'white',color:'var(--text-muted)',border:'1px solid var(--border)'}}>
            All
          </button>
          {CATS.map(c=>(
            <button key={c} onClick={()=>setFilters(f=>({...f,category:c}))}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize"
              style={filters.category===c?{background:'var(--green)',color:'white',border:'1px solid var(--green)'}:{background:'white',color:'var(--text-muted)',border:'1px solid var(--border)'}}>
              {CAT_EMOJI[c]} {c}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4" style={{ color:'var(--text-muted)' }}/>
            <input placeholder="Search livestock..." value={filters.search}
              onChange={e=>setFilters(f=>({...f,search:e.target.value}))}
              onKeyDown={e=>e.key==='Enter'&&fetchData()}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg outline-none"
              style={{ border:'1px solid var(--border)', background:'var(--bg)', color:'var(--text)' }}
              onFocus={e=>(e.target.style.borderColor='#16a34a')}
              onBlur={e=>(e.target.style.borderColor='var(--border)')}/>
          </div>
          <button onClick={fetchData} className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ background:'var(--green)' }}>Search</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* List */}
        <div className="lg:col-span-2 space-y-2 max-h-[70vh] overflow-y-auto pr-1">
          {loading && <p className="text-center py-8 text-sm" style={{ color:'var(--text-muted)' }}>Loading...</p>}
          {!loading && animals.length===0 && <div className="text-center py-8 text-sm" style={{ color:'var(--text-muted)' }}>No livestock found.</div>}
          {animals.map(animal=>(
            <div key={animal.id} onClick={()=>{ setSelected(animal); setActiveTab('overview') }}
              className="rounded-xl cursor-pointer transition-all overflow-hidden"
              style={selected?.id===animal.id?{border:'2px solid var(--green)',background:'#f0fdf4'}:{border:'1px solid var(--border)',background:'white'}}
              onMouseEnter={e=>selected?.id!==animal.id&&(e.currentTarget.style.borderColor='#86efac')}
              onMouseLeave={e=>selected?.id!==animal.id&&(e.currentTarget.style.borderColor='var(--border)')}>
              <div className="flex items-center gap-3 p-3">
                {/* Real animal photo */}
                <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                  <img
                    src={getAnimalImage(animal.category)}
                    alt={animal.name}
                    className="w-full h-full object-cover"
                    onError={e=>{ (e.target as HTMLImageElement).src = FALLBACK }}
                    loading="lazy"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm" style={{ color:'var(--text)' }}>{animal.name}</div>
                  <div className="text-xs mt-0.5" style={{ color:'var(--text-muted)' }}>{CAT_EMOJI[animal.category]} {animal.category}</div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Badge bg="#dcfce7" text="#15803d">{animal.purpose}</Badge>
                    <span className="text-xs" style={{ color:'var(--text-muted)' }}>{animal.breeds?.length||0} breeds</span>
                  </div>
                </div>
                {user?.role==='admin' && (
                  <button onClick={e=>{e.stopPropagation();deleteAnimal(animal.id)}} disabled={deleting===animal.id}
                    className="p-1.5 rounded-lg flex-shrink-0" style={{ color:'#dc2626', background:'#fef2f2' }}>
                    <Trash2 className="w-3.5 h-3.5"/>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Detail */}
        <div className="lg:col-span-3">
          {selected ? (
            <div className="rounded-xl overflow-hidden" style={{ border:'1px solid var(--border)', background:'white' }}>
              {/* Hero photo */}
              <div className="relative h-52 overflow-hidden">
                <img
                  src={getAnimalImage(selected.category)}
                  alt={selected.name}
                  className="w-full h-full object-cover"
                  onError={e=>{ (e.target as HTMLImageElement).src = FALLBACK }}
                />
                <div className="absolute inset-0" style={{ background:'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)' }}/>
                <button onClick={()=>setSelected(null)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background:'rgba(255,255,255,0.9)' }}>
                  <X className="w-4 h-4" style={{ color:'var(--text)' }}/>
                </button>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h2 className="font-bold text-white text-xl">{selected.name}</h2>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Badge bg="rgba(22,163,74,0.85)" text="white">{CAT_EMOJI[selected.category]} {selected.category}</Badge>
                    <Badge bg="rgba(255,255,255,0.2)" text="white">{selected.purpose}</Badge>
                    <span className="text-xs text-white/70">{selected.breeds?.length||0} breeds</span>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b overflow-x-auto" style={{ borderColor:'var(--border)' }}>
                {[
                  { id:'overview', label:'Overview', icon:<Star className="w-3.5 h-3.5"/> },
                  { id:'feeding',  label:'Feeding',  icon:<UtensilsCrossed className="w-3.5 h-3.5"/> },
                  { id:'housing',  label:'Housing',  icon:<Home className="w-3.5 h-3.5"/> },
                  { id:'vaccines', label:'Vaccines', icon:<Syringe className="w-3.5 h-3.5"/> },
                  { id:'market',   label:'Market',   icon:<span className="text-xs">💰</span> },
                ].map(t=>(
                  <button key={t.id} onClick={()=>setActiveTab(t.id)}
                    className="flex items-center gap-1.5 px-4 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors"
                    style={activeTab===t.id?{color:'var(--green)',borderBottomColor:'var(--green)'}:{color:'var(--text-muted)',borderBottomColor:'transparent'}}>
                    {t.icon}{t.label}
                  </button>
                ))}
              </div>

              <div className="p-5 max-h-[45vh] overflow-y-auto space-y-4">
                {activeTab==='overview' && (
                  <>
                    <p className="text-sm leading-relaxed" style={{ color:'var(--text)' }}>{selected.description}</p>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label:'Water per day', val:selected.water_requirement, icon:'💧' },
                        { label:'Space needed',  val:selected.space_required,    icon:'📐' },
                      ].filter(x=>x.val).map(({ label, val, icon }) => (
                        <div key={label} className="p-3 rounded-lg" style={{ background:'var(--bg)', border:'1px solid var(--border)' }}>
                          <div className="text-xs mb-0.5" style={{ color:'var(--text-muted)' }}>{icon} {label}</div>
                          <div className="text-sm font-semibold" style={{ color:'var(--text)' }}>{val}</div>
                        </div>
                      ))}
                    </div>

                    {/* Breeds with real photos */}
                    {selected.breeds?.length>0 && (
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color:'var(--text-muted)' }}>Breeds</h4>
                        <div className="space-y-2">
                          {selected.breeds.map((b,i)=>(
                            <div key={i} className="rounded-lg overflow-hidden" style={{ border:'1px solid var(--border)' }}>
                              <div className="flex gap-3 p-3">
                                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                                  <img
                                    src={getBreedImage(b.name, selected.category)}
                                    alt={b.name}
                                    className="w-full h-full object-cover"
                                    onError={e=>{ (e.target as HTMLImageElement).src = getAnimalImage(selected.category) }}
                                    loading="lazy"
                                  />
                                </div>
                                <div className="flex-1">
                                  <div className="font-semibold text-sm" style={{ color:'var(--text)' }}>{b.name}</div>
                                  <div className="text-xs mb-1" style={{ color:'var(--text-muted)' }}>Origin: {b.origin}</div>
                                  {(b.milk_production||b.weight_kg||b.eggs_year||b.honey_kg_yr) && (
                                    <div className="text-xs font-semibold mb-1" style={{ color:'var(--amber)' }}>
                                      {b.milk_production&&`🥛 ${b.milk_production}`}
                                      {b.weight_kg&&`⚖️ ${b.weight_kg}kg`}
                                      {b.eggs_year&&`🥚 ${b.eggs_year} eggs/yr`}
                                      {b.honey_kg_yr&&`🍯 ${b.honey_kg_yr}kg/yr`}
                                    </div>
                                  )}
                                  <p className="text-xs leading-relaxed" style={{ color:'var(--text-muted)' }}>{b.notes}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selected.common_diseases?.length>0 && (
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color:'#dc2626' }}>⚠️ Common Diseases</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {selected.common_diseases.map(d=><Badge key={d} bg="#fef2f2" text="#dc2626">{d}</Badge>)}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {activeTab==='feeding' && <p className="text-sm leading-relaxed" style={{ color:'var(--text)' }}>{selected.feeding_guide}</p>}
                {activeTab==='housing' && <p className="text-sm leading-relaxed" style={{ color:'var(--text)' }}>{selected.housing_requirements}</p>}

                {activeTab==='vaccines' && (
                  <div className="space-y-2">
                    {selected.vaccination_schedule?.length>0 ? selected.vaccination_schedule.map((v,i)=>(
                      <div key={i} className="flex items-start justify-between gap-3 p-3 rounded-lg"
                        style={{ background:'#eff6ff', border:'1px solid #bfdbfe' }}>
                        <div>
                          <div className="text-sm font-semibold" style={{ color:'#1d4ed8' }}>{v.vaccine}</div>
                          <div className="text-xs mt-0.5" style={{ color:'var(--text-muted)' }}>{v.timing}</div>
                        </div>
                        <Badge bg="#dbeafe" text="#1d4ed8">{v.dose}</Badge>
                      </div>
                    )) : <p className="text-sm text-center py-4" style={{ color:'var(--text-muted)' }}>No vaccination schedule available.</p>}
                  </div>
                )}

                {activeTab==='market' && (
                  <div className="space-y-4">
                    <p className="text-sm leading-relaxed" style={{ color:'var(--text)' }}>{selected.breeding_info}</p>
                    {selected.market_info && (
                      <div className="p-4 rounded-lg" style={{ background:'#f0fdf4', border:'1px solid #bbf7d0' }}>
                        <h4 className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color:'var(--green)' }}>💰 Market Prices & Income</h4>
                        <p className="text-sm leading-relaxed" style={{ color:'var(--text)' }}>{selected.market_info}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-xl flex items-center justify-center py-24"
              style={{ border:'1px dashed var(--border)', background:'white' }}>
              <div className="text-center">
                <div className="text-5xl mb-3">🐄</div>
                <h3 className="font-semibold mb-1" style={{ color:'var(--text)' }}>Select a Livestock</h3>
                <p className="text-sm" style={{ color:'var(--text-muted)' }}>Click any animal to see breeds, feeding and market info</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
