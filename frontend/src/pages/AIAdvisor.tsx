import { useState, useRef, useEffect } from 'react'
import api from '../lib/api'
import { Bot, Send, User, Leaf, Loader2, ExternalLink, Info } from 'lucide-react'

interface Message { role:'user'|'assistant'; content:string }

const STARTERS = [
  "My maize leaves are turning yellow with brown edges — what disease is this?",
  "What is the best crop to plant in Nakuru during the long rains?",
  "How do I control East Coast Fever in my dairy cows?",
  "What is the vaccination schedule for broiler chickens in Kenya?",
  "Compare Hass avocado vs passion fruit farming in Murang'a",
  "Ninajali kuhusu ugonjwa wa viazi vyangu — dalili ni madoa meusi",
  "Best rabbit breeds for meat production and their management in Kenya",
  "How do I start a zero-grazing dairy unit with 3 Friesian cows?",
]

const G = ({ children, className='' }: { children:React.ReactNode; className?:string }) => (
  <div className={className} style={{ background:'rgba(0,0,0,0.38)', backdropFilter:'blur(18px)', border:'1px solid rgba(255,255,255,0.11)', borderRadius:'1rem' }}>{children}</div>
)

function MsgBubble({ msg }: { msg:Message }) {
  const isUser = msg.role==='user'
  return (
    <div className={`flex gap-3 ${isUser?'flex-row-reverse':''}`}>
      <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm"
        style={isUser?{background:'rgba(251,191,36,0.7)'}:{background:'rgba(34,197,94,0.7)'}}>
        {isUser?<User className="w-4 h-4 text-white"/>:<Leaf className="w-4 h-4 text-white"/>}
      </div>
      <div className="max-w-2xl text-sm leading-relaxed whitespace-pre-wrap rounded-2xl px-4 py-3"
        style={isUser
          ? { background:'rgba(251,191,36,0.2)', border:'1px solid rgba(251,191,36,0.3)', color:'white', borderTopRightRadius:'4px' }
          : { background:'rgba(0,0,0,0.42)', border:'1px solid rgba(255,255,255,0.12)', backdropFilter:'blur(16px)', color:'rgba(255,255,255,0.88)', borderTopLeftRadius:'4px' }
        }>
        {msg.content}
      </div>
    </div>
  )
}

export default function AIAdvisor() {
  const [messages, setMessages] = useState<Message[]>([
    { role:'assistant', content:"Habari! Mimi ni AgriDSS AI Advisor 🌾\n\nNaweza kukusaidia na:\n• Mapendekezo ya mazao kwa eneo lako\n• Mwongozo wa ufugaji na chanjo\n• Utambuzi wa magonjwa ya mazao na mifugo\n• Ushauri wa kilimo wa Kenya\n\nI can help you with:\n• Crop recommendations (40+ crops with varieties)\n• Livestock management (14 species, specific breeds)\n• Disease diagnosis and treatment\n• Kenya-specific farming advice in English & Swahili 🇰🇪" }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [aiStatus, setAiStatus] = useState<any>(null)
  const [provider, setProvider] = useState('gemini')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }) }, [messages])
  useEffect(() => { api.get('/ai/status').then(r=>setAiStatus(r.data)).catch(()=>{}) }, [])

  const send = async (text?: string) => {
    const msg = text || input.trim()
    if (!msg || loading) return
    setInput('')
    const userMsg: Message = { role:'user', content:msg }
    const history = messages.slice(1).map(m=>({ role:m.role, content:m.content }))
    setMessages(prev=>[...prev, userMsg])
    setLoading(true)
    try {
      const r = await api.post('/ai/chat', { message:msg, history, provider })
      setMessages(prev=>[...prev, { role:'assistant', content:r.data.reply }])
    } catch (err:any) {
      const detail = err?.response?.data?.detail || 'AI service unavailable'
      setMessages(prev=>[...prev, { role:'assistant', content:`⚠️ ${detail}` }])
    }
    setLoading(false)
  }

  const noKey = aiStatus && !aiStatus.gemini_configured && !aiStatus.groq_configured

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] slide-up">
      {/* Header */}
      <div className="mb-4 flex-shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-white flex items-center gap-3 drop-shadow-2xl">
            <Bot className="w-9 h-9 text-purple-400"/> AI Farm Advisor
          </h1>
          <p className="text-white/55 mt-1 text-sm">Free AI — Google Gemini Flash or Groq Llama 3.3 · English & Swahili</p>
        </div>
        {aiStatus && (
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs text-white/40">Engine:</span>
            <div className="flex gap-1">
              {aiStatus.gemini_configured && (
                <button onClick={()=>setProvider('gemini')}
                  className="text-xs px-3 py-1.5 rounded-xl font-semibold transition-all"
                  style={provider==='gemini'?{background:'rgba(59,130,246,0.6)',color:'white',border:'1px solid rgba(59,130,246,0.5)'}:{background:'rgba(255,255,255,0.08)',color:'rgba(255,255,255,0.5)',border:'1px solid rgba(255,255,255,0.12)'}}>
                  Gemini
                </button>
              )}
              {aiStatus.groq_configured && (
                <button onClick={()=>setProvider('groq')}
                  className="text-xs px-3 py-1.5 rounded-xl font-semibold transition-all"
                  style={provider==='groq'?{background:'rgba(168,85,247,0.6)',color:'white',border:'1px solid rgba(168,85,247,0.5)'}:{background:'rgba(255,255,255,0.08)',color:'rgba(255,255,255,0.5)',border:'1px solid rgba(255,255,255,0.12)'}}>
                  Groq
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* No API key warning */}
      {noKey && (
        <div className="flex-shrink-0 mb-4 p-4 rounded-2xl" style={{ background:'rgba(251,191,36,0.12)', border:'1px solid rgba(251,191,36,0.3)' }}>
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5"/>
            <div>
              <div className="font-bold text-amber-300 text-sm mb-2">AI Advisor needs a FREE API key</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener"
                  className="flex items-center gap-2 p-2.5 rounded-xl transition-all"
                  style={{ background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.12)' }}>
                  <span className="text-xl">🔵</span>
                  <div>
                    <div className="font-bold text-white text-xs">Google Gemini Flash</div>
                    <div className="text-white/45 text-xs">FREE · 1,500 req/day · No credit card</div>
                  </div>
                  <ExternalLink className="w-3 h-3 text-white/30 ml-auto"/>
                </a>
                <a href="https://console.groq.com" target="_blank" rel="noopener"
                  className="flex items-center gap-2 p-2.5 rounded-xl transition-all"
                  style={{ background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.12)' }}>
                  <span className="text-xl">⚡</span>
                  <div>
                    <div className="font-bold text-white text-xs">Groq Llama 3.3 70B</div>
                    <div className="text-white/45 text-xs">FREE · 14,400 req/day · No credit card</div>
                  </div>
                  <ExternalLink className="w-3 h-3 text-white/30 ml-auto"/>
                </a>
              </div>
              <p className="text-xs text-amber-300/70">Add <code className="bg-white/10 px-1 rounded">GEMINI_API_KEY</code> or <code className="bg-white/10 px-1 rounded">GROQ_API_KEY</code> to <code className="bg-white/10 px-1 rounded">backend/.env</code> and restart.</p>
            </div>
          </div>
        </div>
      )}

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto space-y-4 py-2 scrollbar-thin">
        {messages.map((m,i)=><MsgBubble key={i} msg={m}/>)}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background:'rgba(34,197,94,0.7)' }}>
              <Leaf className="w-4 h-4 text-white"/>
            </div>
            <div className="px-4 py-3 rounded-2xl rounded-tl-sm" style={{ background:'rgba(0,0,0,0.42)', border:'1px solid rgba(255,255,255,0.12)', backdropFilter:'blur(16px)' }}>
              <Loader2 className="w-4 h-4 text-green-400 animate-spin"/>
            </div>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      {/* Starter suggestions */}
      {messages.length < 3 && (
        <div className="flex-shrink-0 mb-3">
          <p className="text-xs text-white/35 mb-2 font-medium">💡 Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {STARTERS.map(s=>(
              <button key={s} onClick={()=>send(s)}
                className="text-xs text-white/65 hover:text-white px-3 py-1.5 rounded-full text-left transition-all"
                style={{ background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)' }}
                onMouseEnter={e=>(e.currentTarget.style.background='rgba(255,255,255,0.13)')}
                onMouseLeave={e=>(e.currentTarget.style.background='rgba(255,255,255,0.07)')}>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="flex-shrink-0 flex gap-2 p-2 rounded-2xl" style={{ background:'rgba(0,0,0,0.45)', backdropFilter:'blur(20px)', border:'1px solid rgba(255,255,255,0.12)' }}>
        <input value={input} onChange={e=>setInput(e.target.value)}
          onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&send()}
          placeholder="Ask your farming question in English or Swahili..."
          disabled={loading}
          className="flex-1 text-sm px-3 py-2 bg-transparent focus:outline-none text-white placeholder-white/30"/>
        <button onClick={()=>send()} disabled={!input.trim()||loading}
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-all disabled:opacity-30"
          style={{ background:'rgba(34,197,94,0.7)', border:'1px solid rgba(34,197,94,0.5)' }}>
          <Send className="w-4 h-4 text-white"/>
        </button>
      </div>
    </div>
  )
}
