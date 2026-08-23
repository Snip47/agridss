import { useState, useEffect } from 'react'
import api from '../lib/api'
import { Search, Trash2, Syringe, UtensilsCrossed, Home, Star, X } from 'lucide-react'
import { useAuth } from '../lib/auth'

interface Breed { name:string; origin:string; milk_production?:string; weight_kg?:string; eggs_year?:string; honey_kg_yr?:string; notes:string }
interface Animal { id:number; name:string; category:string; purpose:string; breeds:Breed[]; suitable_aez:string[]; description:string; feeding_guide:string; housing_requirements:string; vaccination_schedule:{vaccine:string;timing:string;dose:string}[]; common_diseases:string[]; breeding_info:string; market_info:string; water_requirement:string; space_required:string }

const CATS = ['cattle','goat','sheep','poultry','rabbit','pig','fish','bees','camel','donkey','duck','quail','ostrich']
const CAT_EMOJI:Record<string,string> = { cattle:'🐄',goat:'🐐',sheep:'🐑',poultry:'🐔',rabbit:'🐇',pig:'🐷',fish:'🐟',bees:'🐝',camel:'🐪',donkey:'🫏',duck:'🦆',quail:'🐦',ostrich:'🦜' }
const CAT_COLOR:Record<string,string> = { cattle:'rgba(251,191,36,0.2)',goat:'rgba(34,197,94,0.2)',sheep:'rgba(96,165,250,0.2)',poultry:'rgba(239,68,68,0.2)',rabbit:'rgba(168,85,247,0.2)',pig:'rgba(236,72,153,0.2)',fish:'rgba(34,211,238,0.2)',bees:'rgba(251,191,36,0.25)',camel:'rgba(180,83,9,0.25)',donkey:'rgba(107,114,128,0.25)',duck:'rgba(14,165,233,0.2)',quail:'rgba(132,204,22,0.2)',ostrich:'rgba(249,115,22,0.2)' }

const G = ({ children, className='' }: { children:React.ReactNode; className?:string }) => (
  <div className={className} style={{ background:'rgba(0,0,0,0.38)', backdropFilter:'blur(18px)', border:'1px solid rgba(255,255,255,0.11)', borderRadius:'1rem' }}>{children}</div>
)

const Badge = ({ children, color='rgba(255,255,255,0.1)', text='rgba(255,255,255,0.7)' }: any) => (
  <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background:color, color:text }}>{children}</span>
)

export default function LivestockAdvisor() {
  const { user } = useAuth()
  const [animals, setAnimals] = useState<Animal[]>([])
  const [filters, setFilters] = useState({ category:'', search:'' })
  const [selected, setSelected] = useState<Animal|null>(null)
  const [activeTab, setActiveTab] = useState('overview')
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

  const deleteAnimal = async (id:number) => {
    if (!confirm('Delete?')) return
    setDeleting(id)
    await api.delete(`/livestock/${id}`)
    setAnimals(a=>a.filter(x=>x.id!==id))
    if (selected?.id===id) setSelected(null)
    setDeleting(null)
  }

  const tabs = [
    { id:'overview', icon:Star, label:'Overview' },
    { id:'feeding', icon:UtensilsCrossed, label:'Feeding' },
    { id:'housing', icon:Home, label:'Housing' },
    { id:'vaccines', icon:Syringe, label:'Vaccines' },
    { id:'market', label:'💰', icon:null as any, labelOnly:true },
  ]

  return (
    <div className="slide-up">
      <div className="mb-5">
        <h1 className="text-3xl font-black text-white drop-shadow-2xl">🐄 Livestock Advisor</h1>
        <p className="text-white/45 mt-1 text-sm">{animals.length} livestock types with breeds, feeding, housing and market info</p>
      </div>

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
            style={{ background:'rgba(251,191,36,0.7)', border:'1px solid rgba(251,191,36,0.5)' }}>Search</button>
        </div>
      </G>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-1 space-y-2 max-h-[75vh] overflow-y-auto scrollbar-thin pr-1">
          {loading && <div className="text-center py-8 text-white/40">Loading...</div>}
          {!loading && animals.length===0 && <G className="py-8 text-center text-white/40">No livestock found.</G>}
          {animals.map(animal=>(
            <div key={animal.id} onClick={()=>{ setSelected(animal); setActiveTab('overview') }}
              className="rounded-xl cursor-pointer transition-all duration-200 hover:scale-[1.02]"
              style={selected?.id===animal.id
                ?{border:'2px solid rgba(251,191,36,0.7)',backdropFilter:'blur(16px)',background:'rgba(251,191,36,0.08)'}
                :{border:'1px solid rgba(255,255,255,0.1)',backdropFilter:'blur(16px)',background:'rgba(0,0,0,0.32)'}}>
              <div className="flex items-center gap-3 p-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: CAT_COLOR[animal.category]||'rgba(255,255,255,0.1)' }}>
                  {CAT_EMOJI[animal.category]||'🐾'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-white text-sm">{animal.name}</div>
                  <div className="text-xs text-white/45">{CAT_EMOJI[animal.category]} {animal.category}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge color="rgba(251,191,36,0.2)" text="#fbbf24">{animal.purpose}</Badge>
                    <span className="text-xs text-white/30">{animal.breeds?.length||0} breeds</span>
                  </div>
                </div>
                {user?.role==='admin' && (
                  <button onClick={e=>{e.stopPropagation();deleteAnimal(animal.id)}} disabled={deleting===animal.id}
                    className="p-1.5 rounded-lg text-red-400 flex-shrink-0" style={{ background:'rgba(239,68,68,0.1)' }}>
                    <Trash2 className="w-3.5 h-3.5"/>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-2">
          {selected ? (
            <G className="overflow-hidden">
              {/* Header with emoji */}
              <div className="relative p-6 flex items-center gap-5"
                style={{ background:`linear-gradient(135deg, ${CAT_COLOR[selected.category]||'rgba(251,191,36,0.15)'}, rgba(0,0,0,0.3))`, borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-5xl flex-shrink-0"
                  style={{ background:'rgba(0,0,0,0.3)', border:'1px solid rgba(255,255,255,0.15)' }}>
                  {CAT_EMOJI[selected.category]||'🐾'}
                </div>
                <div className="flex-1">
                  <h2 className="font-black text-white text-2xl">{selected.name}</h2>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Badge color="rgba(251,191,36,0.3)" text="#fbbf24">{selected.category}</Badge>
                    <Badge color="rgba(255,255,255,0.15)" text="white">{selected.purpose}</Badge>
                    <span className="text-xs text-white/35">{selected.breeds?.length||0} breeds</span>
                  </div>
                </div>
                <button onClick={()=>setSelected(null)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background:'rgba(0,0,0,0.4)' }}>
                  <X className="w-4 h-4 text-white"/>
                </button>
              </div>

              {/* Tabs */}
              <div className="flex overflow-x-auto" style={{ borderBottom:'1px solid rgba(255,255,255,0.09)' }}>
                {[
                  { id:'overview', label:'Overview', icon:<Star className="w-3.5 h-3.5"/> },
                  { id:'feeding', label:'Feeding', icon:<UtensilsCrossed className="w-3.5 h-3.5"/> },
                  { id:'housing', label:'Housing', icon:<Home className="w-3.5 h-3.5"/> },
                  { id:'vaccines', label:'Vaccines', icon:<Syringe className="w-3.5 h-3.5"/> },
                  { id:'market', label:'Market', icon:<span>💰</span> },
                ].map(t=>(
                  <button key={t.id} onClick={()=>setActiveTab(t.id)}
                    className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold whitespace-nowrap transition-colors"
                    style={activeTab===t.id?{color:'#fbbf24',borderBottom:'2px solid #fbbf24'}:{color:'rgba(255,255,255,0.4)',borderBottom:'2px solid transparent'}}>
                    {t.icon}{t.label}
                  </button>
                ))}
              </div>

              <div className="p-5 max-h-[45vh] overflow-y-auto scrollbar-thin space-y-4">
                {activeTab==='overview' && (
                  <div className="space-y-4">
                    <p className="text-sm text-white/70 leading-relaxed">{selected.description}</p>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label:'Water per day', val:selected.water_requirement, icon:'💧' },
                        { label:'Space needed', val:selected.space_required, icon:'📐' },
                      ].map(({ label, val, icon }) => val ? (
                        <div key={label} className="p-3 rounded-xl" style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)' }}>
                          <div className="text-xs text-white/40 mb-0.5">{icon} {label}</div>
                          <div className="text-sm font-bold text-white">{val}</div>
                        </div>
                      ) : null)}
                    </div>
                    {selected.breeds?.length>0 && (
                      <div>
                        <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider mb-3">🐾 Breeds</h4>
                        <div className="space-y-2">
                          {selected.breeds.map((b,i)=>(
                            <div key={i} className="p-3 rounded-xl" style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.09)' }}>
                              <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                                  style={{ background:CAT_COLOR[selected.category]||'rgba(255,255,255,0.1)' }}>
                                  {CAT_EMOJI[selected.category]||'🐾'}
                                </div>
                                <div className="flex-1">
                                  <div className="font-bold text-white text-sm">{b.name}</div>
                                  <div className="text-xs text-white/40 mb-1">Origin: {b.origin}</div>
                                  {(b.milk_production||b.weight_kg||b.eggs_year||b.honey_kg_yr) && (
                                    <div className="text-xs font-bold mb-1 text-amber-400">
                                      {b.milk_production&&`🥛 ${b.milk_production}`}
                                      {b.weight_kg&&`⚖️ ${b.weight_kg}kg`}
                                      {b.eggs_year&&`🥚 ${b.eggs_year} eggs/yr`}
                                      {b.honey_kg_yr&&`🍯 ${b.honey_kg_yr}kg/yr`}
                                    </div>
                                  )}
                                  <p className="text-xs text-white/55 leading-relaxed">{b.notes}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {selected.common_diseases?.length>0 && (
                      <div>
                        <h4 className="text-xs font-black text-red-400 uppercase tracking-wider mb-2">⚠️ Watch Out For</h4>
                        <div className="flex flex-wrap gap-1">
                          {selected.common_diseases.map(d=><Badge key={d} color="rgba(239,68,68,0.15)" text="#fca5a5">{d}</Badge>)}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {activeTab==='feeding' && <p className="text-sm text-white/70 leading-relaxed">{selected.feeding_guide}</p>}
                {activeTab==='housing' && <p className="text-sm text-white/70 leading-relaxed">{selected.housing_requirements}</p>}
                {activeTab==='vaccines' && (
                  <div className="space-y-2">
                    {selected.vaccination_schedule?.length>0 ? selected.vaccination_schedule.map((v,i)=>(
                      <div key={i} className="flex items-start justify-between p-3 rounded-xl gap-3"
                        style={{ background:'rgba(96,165,250,0.1)', border:'1px solid rgba(96,165,250,0.2)' }}>
                        <div>
                          <div className="text-sm font-bold text-blue-300">{v.vaccine}</div>
                          <div className="text-xs text-white/50 mt-0.5">{v.timing}</div>
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full font-medium flex-shrink-0"
                          style={{ background:'rgba(96,165,250,0.2)', color:'#93c5fd' }}>{v.dose}</span>
                      </div>
                    )) : <p className="text-sm text-white/40 text-center py-4">No vaccination schedule available.</p>}
                  </div>
                )}
                {activeTab==='market' && (
                  <div className="space-y-4">
                    <p className="text-sm text-white/70 leading-relaxed">{selected.breeding_info}</p>
                    {selected.market_info && (
                      <div className="p-4 rounded-xl" style={{ background:'rgba(34,197,94,0.1)', border:'1px solid rgba(34,197,94,0.2)' }}>
                        <h4 className="text-xs font-black text-green-400 uppercase mb-2">💰 Market Information</h4>
                        <p className="text-sm text-white/70 leading-relaxed">{selected.market_info}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </G>
          ) : (
            <G className="h-full flex items-center justify-center py-24">
              <div className="text-center">
                <div className="text-6xl mb-4">🐄</div>
                <h3 className="font-bold text-white/40 text-lg">Select a Livestock</h3>
                <p className="text-white/25 text-sm mt-1">Click any animal to see breeds, feeding and market info</p>
              </div>
            </G>
          )}
        </div>
      </div>
    </div>
  )
}
