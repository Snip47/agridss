import { useState, useEffect } from 'react'
import api from '../lib/api'
import { Beef, ChevronDown, ChevronUp, Syringe, UtensilsCrossed, Home, Search, Trash2, Star } from 'lucide-react'
import { useAuth } from '../lib/auth'
import PageBackdrop, { BACKDROPS } from '../components/PageBackdrop'

interface Breed { name:string; origin:string; milk_production?:string; weight_kg?:string; eggs_year?:string; honey_kg_yr?:string; notes:string }
interface Animal { id:number; name:string; category:string; purpose:string; breeds:Breed[]; suitable_aez:string[]; description:string; feeding_guide:string; housing_requirements:string; vaccination_schedule:{vaccine:string;timing:string;dose:string}[]; common_diseases:string[]; breeding_info:string; market_info:string; water_requirement:string; space_required:string }

const CATS = ['cattle','goat','sheep','poultry','rabbit','pig','fish','bees','camel','donkey']
const PURPOSE = ['dairy','meat','eggs','dual','honey/pollination','draft/transport','meat/wool']

const CAT_EMOJI: Record<string,string> = {
  cattle:'🐄', goat:'🐐', sheep:'🐑', poultry:'🐔', rabbit:'🐇',
  pig:'🐷', fish:'🐟', bees:'🐝', camel:'🐪', donkey:'🫏'
}

export default function LivestockAdvisor() {
  const { user } = useAuth()
  const [animals, setAnimals] = useState<Animal[]>([])
  const [filters, setFilters] = useState({ category:'', purpose:'', search:'' })
  const [expanded, setExpanded] = useState<number|null>(null)
  const [activeTab, setActiveTab] = useState<Record<number,string>>({})
  const [deleting, setDeleting] = useState<number|null>(null)
  const [loading, setLoading] = useState(false)

  const fetch = async () => {
    setLoading(true)
    const p: any = {}
    if (filters.category) p.category = filters.category
    if (filters.purpose) p.purpose = filters.purpose
    if (filters.search) p.search = filters.search
    const r = await api.get('/livestock/', { params: p })
    setAnimals(r.data); setLoading(false)
  }

  useEffect(() => { fetch() }, [filters.category, filters.purpose])

  const setTab = (id: number, tab: string) => setActiveTab(t => ({ ...t, [id]: tab }))

  const deleteAnimal = async (id: number) => {
    if (!confirm('Delete this livestock entry?')) return
    setDeleting(id)
    await api.delete(`/livestock/${id}`)
    setAnimals(a => a.filter(x => x.id !== id))
    setDeleting(null)
  }

  return (
    <>
      <PageBackdrop image={BACKDROPS.livestock} overlay="from-leaf-900/70 via-emerald-950/50 to-earth-900/75" />
      
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-earth-800 flex items-center gap-2"><Beef className="w-6 h-6 text-earth-600"/> Livestock Advisor</h1>
        <p className="text-earth-500 mt-1 text-sm">{animals.length} livestock types with specific breeds, feeding, housing, vaccination and market info.</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-earth-100 mb-5">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setFilters(f => ({ ...f, category:'' }))}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${!filters.category ? 'bg-earth-600 text-white' : 'bg-earth-100 text-earth-600 hover:bg-earth-200'}`}>
              All
            </button>
            {CATS.map(c => (
              <button key={c} onClick={() => setFilters(f => ({ ...f, category:c }))}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${filters.category === c ? 'bg-earth-600 text-white' : 'bg-earth-100 text-earth-600 hover:bg-earth-200'}`}>
                {CAT_EMOJI[c] || ''} {c}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <Search className="w-4 h-4 text-earth-400"/>
            <input placeholder="Search..." value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && fetch()}
              className="border border-earth-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-leaf-500 w-40"/>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-earth-400">Loading livestock...</div>
      ) : (
        <div className="space-y-2">
          {animals.length === 0 && (
            <div className="text-center py-16 text-earth-400 bg-white rounded-xl border border-earth-100">No livestock found.</div>
          )}
          {animals.map(animal => {
            const tab = activeTab[animal.id] || 'breeds'
            return (
              <div key={animal.id} className="bg-white rounded-xl shadow-sm border border-earth-100 overflow-hidden">
                <div className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-earth-50 transition-colors"
                  onClick={() => setExpanded(expanded === animal.id ? null : animal.id)}>
                  <div className="w-9 h-9 rounded-lg bg-earth-100 flex items-center justify-center flex-shrink-0 text-lg">
                    {CAT_EMOJI[animal.category] || '🐾'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-earth-800 text-sm">{animal.name}</div>
                    <div className="text-xs text-earth-400 line-clamp-1">{animal.description}</div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs bg-earth-100 text-earth-600 px-2 py-0.5 rounded-full capitalize hidden md:block">{animal.purpose}</span>
                    <span className="text-xs text-earth-400 hidden md:block">{animal.breeds?.length || 0} breeds</span>
                    {user?.role === 'admin' && (
                      <button onClick={e => { e.stopPropagation(); deleteAnimal(animal.id) }} disabled={deleting === animal.id}
                        className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                        <Trash2 className="w-4 h-4"/>
                      </button>
                    )}
                    {expanded === animal.id ? <ChevronUp className="w-4 h-4 text-earth-400"/> : <ChevronDown className="w-4 h-4 text-earth-400"/>}
                  </div>
                </div>

                {expanded === animal.id && (
                  <div className="border-t border-earth-100">
                    {/* Tab bar */}
                    <div className="flex border-b border-earth-100 overflow-x-auto">
                      {[
                        { id:'breeds', icon:Star, label:'Breeds' },
                        { id:'feeding', icon:UtensilsCrossed, label:'Feeding' },
                        { id:'housing', icon:Home, label:'Housing' },
                        { id:'vaccines', icon:Syringe, label:'Vaccines' },
                        { id:'breeding', icon:Beef, label:'Breeding & Market' },
                      ].map(t => (
                        <button key={t.id} onClick={() => setTab(animal.id, t.id)}
                          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 whitespace-nowrap transition-colors ${
                            tab === t.id ? 'border-earth-500 text-earth-700' : 'border-transparent text-earth-400 hover:text-earth-600'
                          }`}>
                          <t.icon className="w-3.5 h-3.5"/>{t.label}
                        </button>
                      ))}
                    </div>

                    <div className="p-5">
                      {/* Breeds tab */}
                      {tab === 'breeds' && (
                        <div>
                          <p className="text-sm text-earth-600 mb-3 leading-relaxed">{animal.description}</p>
                          {animal.breeds?.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {animal.breeds.map((b, i) => (
                                <div key={i} className="bg-earth-50 border border-earth-100 rounded-lg p-3">
                                  <div className="flex items-start justify-between mb-1">
                                    <div>
                                      <span className="font-semibold text-earth-800 text-sm">{b.name}</span>
                                      <span className="text-xs text-earth-400 ml-2">({b.origin})</span>
                                    </div>
                                    {(b.milk_production || b.weight_kg || b.eggs_year || b.honey_kg_yr) && (
                                      <div className="text-xs bg-leaf-100 text-leaf-700 px-2 py-0.5 rounded-full font-medium">
                                        {b.milk_production && `🥛 ${b.milk_production}`}
                                        {b.weight_kg && `⚖️ ${b.weight_kg}kg`}
                                        {b.eggs_year && `🥚 ${b.eggs_year} eggs/yr`}
                                        {b.honey_kg_yr && `🍯 ${b.honey_kg_yr}kg/yr`}
                                      </div>
                                    )}
                                  </div>
                                  <p className="text-xs text-earth-600">{b.notes}</p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-earth-400">No breed details available.</p>
                          )}
                          <div className="mt-3 grid grid-cols-2 gap-3">
                            <div className="bg-earth-50 rounded-lg p-3">
                              <div className="text-xs text-earth-500 mb-0.5">Water Requirement</div>
                              <div className="text-sm font-medium text-earth-700">{animal.water_requirement}</div>
                            </div>
                            <div className="bg-earth-50 rounded-lg p-3">
                              <div className="text-xs text-earth-500 mb-0.5">Space Required</div>
                              <div className="text-sm font-medium text-earth-700">{animal.space_required}</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {tab === 'feeding' && (
                        <div>
                          <p className="text-sm text-earth-700 leading-relaxed">{animal.feeding_guide}</p>
                          {animal.common_diseases?.length > 0 && (
                            <div className="mt-4">
                              <h4 className="text-xs font-bold text-red-500 uppercase mb-2">⚠️ Watch Out For</h4>
                              <div className="flex flex-wrap gap-1">
                                {animal.common_diseases.map(d => (
                                  <span key={d} className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full">{d}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {tab === 'housing' && (
                        <p className="text-sm text-earth-700 leading-relaxed">{animal.housing_requirements}</p>
                      )}

                      {tab === 'vaccines' && (
                        <div className="space-y-2">
                          {animal.vaccination_schedule?.map((v, i) => (
                            <div key={i} className="flex items-start justify-between p-3 bg-sky-50 border border-sky-100 rounded-lg gap-3">
                              <div>
                                <div className="text-sm font-semibold text-sky-800">{v.vaccine}</div>
                                <div className="text-xs text-sky-600 mt-0.5">{v.timing}</div>
                              </div>
                              <div className="text-xs bg-white text-sky-700 px-2 py-1 rounded-full border border-sky-200 flex-shrink-0 font-medium">
                                {v.dose}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {tab === 'breeding' && (
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-xs font-bold text-earth-600 uppercase mb-2">Breeding Information</h4>
                            <p className="text-sm text-earth-700 leading-relaxed">{animal.breeding_info}</p>
                          </div>
                          {animal.market_info && (
                            <div className="bg-leaf-50 border border-leaf-100 rounded-lg p-4">
                              <h4 className="text-xs font-bold text-leaf-700 uppercase mb-2">💰 Market Information</h4>
                              <p className="text-sm text-earth-700 leading-relaxed">{animal.market_info}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
    </>
  )
}
