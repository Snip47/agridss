import { useState, useRef, useEffect } from 'react'
import api from '../lib/api'
import { Bot, Send, User, Leaf, Loader2, ExternalLink, Info } from 'lucide-react'
import { getBackgroundImage } from '../lib/backgroundImages'

interface Message { role:'user'|'assistant'; content:string }

const STARTERS = [
  "My maize leaves are turning yellow with brown edges — what disease is this?",
  "What is the best crop to plant in Nakuru during the long rains?",
  "How do I control East Coast Fever in my dairy cows?",
  "What is the vaccination schedule for broiler chickens in Kenya?",
  "Compare Hass avocado farming vs passion fruit for Murang'a county",
  "Ninajali kuhusu ugonjwa wa viazi vyangu — dalili ni madoa meusi",
  "Best rabbit breeds for meat production in Kenya and their management",
  "How do I start a zero-grazing dairy unit with 3 Friesian cows?",
]

function MsgBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm ${isUser ? 'bg-earth-500' : 'bg-leaf-600'}`}>
        {isUser ? <User className="w-4 h-4 text-white"/> : <Leaf className="w-4 h-4 text-white"/>}
      </div>
      <div className={`max-w-2xl text-sm leading-relaxed whitespace-pre-wrap rounded-2xl px-4 py-3 ${
        isUser
          ? 'bg-earth-600 text-white rounded-tr-sm'
          : 'bg-white text-earth-800 border border-earth-100 shadow-sm rounded-tl-sm'
      }`}>
        {msg.content}
      </div>
    </div>
  )
}

export default function AIAdvisor() {
  const [messages, setMessages] = useState<Message[]>([
    { role:'assistant', content:"Habari! Mimi ni AgriDSS AI Advisor 🌾\n\nNaweza kukusaidia na:\n• Mapendekezo ya mazao kwa eneo lako na aina ya udongo\n• Mwongozo wa ufugaji, chakula, na chinjuzi ya wanyama\n• Ushauri juu ya magonjwa, matatizo, na njia za kuzuia\n• Habari za soko na bei\n• Maswali kwa Kiingereza au Kiswahili\n\n Karibu kuanza!" }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [aiStatus, setAiStatus] = useState<any>(null)
  const [provider, setProvider] = useState('gemini')
  const [bgImage, setBgImage] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:'smooth' })
  }, [messages])

  useEffect(() => {
    api.get('/ai/status').then(r => setAiStatus(r.data)).catch(() => {})
    setBgImage(getBackgroundImage('ai'))
  }, [])

  const send = async (text?: string) => {
    const msg = text || input.trim()
    if (!msg || loading) return
    setInput('')
    const userMsg: Message = { role:'user', content:msg }
    const history = messages.slice(1).map(m => ({ role:m.role, content:m.content }))
    setMessages(prev => [...prev, userMsg])
    setLoading(true)
    try {
      const r = await api.post('/ai/chat', { message:msg, history, provider })
      setMessages(prev => [...prev, { role:'assistant', content:r.data.reply }])
    } catch (err: any) {
      const detail = err?.response?.data?.detail || 'AI service unavailable'
      setMessages(prev => [...prev, { role:'assistant', content:`⚠️ ${detail}` }])
    }
    setLoading(false)
  }

  const noKey = aiStatus && !aiStatus.gemini_configured && !aiStatus.groq_configured

  return (
    <div className="relative min-h-screen flex flex-col" style={{backgroundImage: `url('${bgImage}')`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed'}}>
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/35 backdrop-blur-sm"></div>
      
      <div className="relative z-10 flex flex-col h-[calc(100vh-8rem)]">
        <div className="mb-4 flex-shrink-0 px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white drop-shadow-lg flex items-center gap-2"><Bot className="w-6 h-6"/> AI Farm Advisor</h1>
              <p className="text-white/90 text-sm drop-shadow">Free AI — Google Gemini Flash or Groq Llama 3.3 · English & Swahili</p>
            </div>
            {aiStatus && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/80">AI Engine:</span>
                <div className="flex gap-1">
                  {aiStatus.gemini_configured && (
                    <button onClick={() => setProvider('gemini')}
                      className={`text-xs px-2 py-1 rounded-lg font-medium transition-colors ${provider==='gemini'?'bg-blue-600 text-white':'bg-white/20 text-white'}`}>
                      Gemini
                    </button>
                  )}
                  {aiStatus.groq_configured && (
                    <button onClick={() => setProvider('groq')}
                      className={`text-xs px-2 py-1 rounded-lg font-medium transition-colors ${provider==='groq'?'bg-purple-600 text-white':'bg-white/20 text-white'}`}>
                      Groq
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* No API key warning */}
        {noKey && (
          <div className="flex-shrink-0 mb-4 mx-4 bg-amber-50/95 border border-amber-200 rounded-xl p-4 shadow-lg">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5"/>
              <div>
                <div className="font-semibold text-amber-800 text-sm mb-2">AI Advisor needs a FREE API key</div>
                <div className="text-sm text-amber-700 space-y-1">
                  <div>Add one of these FREE keys to your backend <code className="bg-amber-100 px-1 rounded">.env</code> file:</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                    <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener"
                      className="flex items-center gap-2 bg-white border border-amber-200 rounded-lg p-2.5 hover:bg-amber-50 transition-colors">
                      <span className="text-xl">🔵</span>
                      <div>
                        <div className="font-semibold text-amber-800 text-xs">Google Gemini Flash</div>
                        <div className="text-xs text-amber-600">FREE — 1,500 req/day · No credit card</div>
                      </div>
                      <ExternalLink className="w-3 h-3 text-amber-500 ml-auto"/>
                    </a>
                    <a href="https://console.groq.com" target="_blank" rel="noopener"
                      className="flex items-center gap-2 bg-white border border-amber-200 rounded-lg p-2.5 hover:bg-amber-50 transition-colors">
                      <span className="text-xl">⚡</span>
                      <div>
                        <div className="font-semibold text-amber-800 text-xs">Groq (Llama 3.3 70B)</div>
                        <div className="text-xs text-amber-600">FREE — 14,400 req/day · No credit card</div>
                      </div>
                      <ExternalLink className="w-3 h-3 text-amber-500 ml-auto"/>
                    </a>
                  </div>
                  <div className="text-xs text-amber-600 mt-1">Then add <code className="bg-amber-100 px-1 rounded">GEMINI_API_KEY=your_key</code> or <code className="bg-amber-100 px-1 rounded">GROQ_API_KEY=your_key</code></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Chat */}
        <div className="flex-1 overflow-y-auto space-y-4 py-2 scrollbar-thin px-4">
          {messages.map((m, i) => <MsgBubble key={i} msg={m}/>)}
          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-leaf-600 flex items-center justify-center flex-shrink-0">
                <Leaf className="w-4 h-4 text-white"/>
              </div>
              <div className="bg-white/95 border border-earth-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-md">
                <Loader2 className="w-4 h-4 text-leaf-500 animate-spin"/>
              </div>
            </div>
          )}
          <div ref={bottomRef}/>
        </div>

        {/* Starters */}
        {messages.length < 3 && (
          <div className="flex-shrink-0 mb-3 px-4">
            <p className="text-xs text-white/80 mb-2 font-medium drop-shadow">💡 Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {STARTERS.map(s => (
                <button key={s} onClick={() => send(s)}
                  className="text-xs bg-white/90 border border-earth-200 text-earth-600 px-3 py-1.5 rounded-full hover:bg-white hover:border-leaf-300 hover:text-leaf-700 transition-colors text-left shadow-md"
                  title={s}>
                  {s.substring(0, 30)}...
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="flex-shrink-0 bg-white/95 border border-earth-200 rounded-xl flex gap-2 p-2 shadow-lg mx-4 mb-2">
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder="Ask your farming question in English or Swahili..." disabled={loading}
            className="flex-1 text-sm px-3 py-2 focus:outline-none text-earth-800 bg-transparent"/>
          <button onClick={() => send()} disabled={!input.trim() || loading}
            className="bg-leaf-600 hover:bg-leaf-700 disabled:opacity-40 text-white w-10 h-10 rounded-lg flex items-center justify-center transition-colors flex-shrink-0 shadow-md">
            <Send className="w-4 h-4"/>
          </button>
        </div>
      </div>
    </div>
  )
}