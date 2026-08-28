import { useState, useRef, useEffect } from 'react'
import api from '../lib/api'
import { Send, Leaf, Loader2, Zap, Camera, X, User } from 'lucide-react'
import { useAuth } from '../lib/auth'

interface Message { role:'user'|'assistant'; content:string; image?:string }

const G = ({ children, className='' }: { children:React.ReactNode; className?:string }) => (
  <div className={className} style={{ background:'rgba(0,0,0,0.38)', backdropFilter:'blur(18px)', border:'1px solid rgba(255,255,255,0.11)', borderRadius:'1rem' }}>{children}</div>
)

function MsgBubble({ msg }: { msg:Message }) {
  const isUser = msg.role==='user'
  return (
    <div className={`flex gap-3 ${isUser?'flex-row-reverse':''}`}>
      <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-bold"
        style={isUser?{background:'rgba(251,191,36,0.8)'}:{background:'rgba(34,197,94,0.8)'}}>
        {isUser?<User className="w-4 h-4 text-white"/>:<Leaf className="w-4 h-4 text-white"/>}
      </div>
      <div className="max-w-2xl space-y-2">
        {msg.image && (
          <div className="rounded-2xl overflow-hidden" style={{ border:'1px solid rgba(255,255,255,0.2)', maxWidth:'240px' }}>
            <img src={msg.image} alt="uploaded" className="w-full h-40 object-cover"/>
          </div>
        )}
        {msg.content && (
          <div className="text-sm leading-relaxed whitespace-pre-wrap rounded-2xl px-4 py-3"
            style={isUser
              ?{ background:'rgba(251,191,36,0.18)', border:'1px solid rgba(251,191,36,0.3)', color:'white', borderTopRightRadius:'4px' }
              :{ background:'rgba(0,0,0,0.45)', border:'1px solid rgba(255,255,255,0.12)', backdropFilter:'blur(16px)', color:'rgba(255,255,255,0.88)', borderTopLeftRadius:'4px' }}>
            {msg.content}
          </div>
        )}
      </div>
    </div>
  )
}

export default function AIAdvisor() {
  const { user } = useAuth()
  const firstName = user?.name?.split(' ')[0] || 'Farmer'

  const [messages, setMessages] = useState<Message[]>([
    { role:'assistant', content:`Welcome, ${firstName}! 🌾\n\nAsk me anything about farming — or upload a photo of your crop or animal for instant diagnosis.\n\nNinaweza pia kukusaidia kwa Kiswahili.` }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [aiStatus, setAiStatus] = useState<any>(null)
  const [provider, setProvider] = useState('gemini')
  const [selectedImage, setSelectedImage] = useState<string|null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }) }, [messages])
  useEffect(() => {
    api.get('/ai/status').then(r=>{
      setAiStatus(r.data)
      if (!r.data.gemini_configured && r.data.groq_configured) setProvider('groq')
    }).catch(()=>{})
  }, [])

  // Update welcome message when user loads
  useEffect(() => {
    if (user?.name) {
      setMessages([{ role:'assistant', content:`Welcome, ${firstName}! 🌾\n\nAsk me anything about farming — or upload a photo of your crop or animal for instant diagnosis.\n\nNinaweza pia kukusaidia kwa Kiswahili.` }])
    }
  }, [user?.name])

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => setSelectedImage(reader.result as string)
    reader.readAsDataURL(file); e.target.value = ''
  }

  const send = async (text?: string) => {
    const msg = text || input.trim()
    if ((!msg && !selectedImage) || loading) return
    setInput('')
    const capturedImage = selectedImage; setSelectedImage(null)
    const userMsg: Message = { role:'user', content:msg||'Please analyze this image.', image:capturedImage||undefined }
    const history = messages.slice(1).map(m=>({ role:m.role, content:m.content }))
    setMessages(prev=>[...prev, userMsg]); setLoading(true)
    try {
      let reply = ''
      if (capturedImage) {
        const r = await api.post('/ai/analyze-image', { image:capturedImage, message:msg||'Analyze this crop/animal image. Identify any disease, pest damage or health issue. Give diagnosis, treatment with Kenya product names, and prevention.', provider })
        reply = r.data.reply
      } else {
        const r = await api.post('/ai/chat', { message:msg, history, provider })
        reply = r.data.reply
      }
      setMessages(prev=>[...prev, { role:'assistant', content:reply }])
    } catch (err:any) {
      setMessages(prev=>[...prev, { role:'assistant', content:`⚠️ ${err?.response?.data?.detail||'Service unavailable. Check API key in backend/.env'}` }])
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] slide-up">
      {/* Minimal header */}
      <div className="mb-3 flex-shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">AI Farm Advisor</h1>
          <p className="text-white/35 text-xs mt-0.5">Kenya · English & Swahili</p>
        </div>

        {/* AI engine toggle */}
        {aiStatus && (aiStatus.gemini_configured || aiStatus.groq_configured) && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/40 mr-1">Engine:</span>
            {aiStatus.gemini_configured && (
              <button onClick={()=>setProvider('gemini')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer"
                style={provider==='gemini'
                  ?{background:'rgba(59,130,246,0.7)',color:'white',border:'2px solid rgba(59,130,246,0.8)',boxShadow:'0 0 12px rgba(59,130,246,0.3)'}
                  :{background:'rgba(255,255,255,0.07)',color:'rgba(255,255,255,0.45)',border:'2px solid rgba(255,255,255,0.1)'}}>
                🔵 Gemini {provider==='gemini'&&'✓'}
              </button>
            )}
            {aiStatus.groq_configured && (
              <button onClick={()=>setProvider('groq')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer"
                style={provider==='groq'
                  ?{background:'rgba(168,85,247,0.7)',color:'white',border:'2px solid rgba(168,85,247,0.8)',boxShadow:'0 0 12px rgba(168,85,247,0.3)'}
                  :{background:'rgba(255,255,255,0.07)',color:'rgba(255,255,255,0.45)',border:'2px solid rgba(255,255,255,0.1)'}}>
                <Zap className="w-3 h-3"/> Groq {provider==='groq'&&'✓'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto space-y-4 py-2 scrollbar-thin">
        {messages.map((m,i)=><MsgBubble key={i} msg={m}/>)}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background:'rgba(34,197,94,0.8)' }}>
              <Leaf className="w-4 h-4 text-white"/>
            </div>
            <div className="px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-2"
              style={{ background:'rgba(0,0,0,0.45)', border:'1px solid rgba(255,255,255,0.12)' }}>
              <Loader2 className="w-4 h-4 text-green-400 animate-spin"/>
              <span className="text-xs text-white/40">{selectedImage?'Analyzing photo...':'Thinking...'}</span>
            </div>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      {/* Image preview */}
      {selectedImage && (
        <div className="flex-shrink-0 mb-2 flex items-center gap-3 p-3 rounded-xl"
          style={{ background:'rgba(34,197,94,0.1)', border:'1px solid rgba(34,197,94,0.25)' }}>
          <div className="relative flex-shrink-0">
            <img src={selectedImage} alt="preview" className="w-14 h-14 rounded-lg object-cover border border-white/20"/>
            <button onClick={()=>setSelectedImage(null)}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-white"
              style={{ background:'rgba(239,68,68,0.9)' }}>
              <X className="w-3 h-3"/>
            </button>
          </div>
          <p className="text-sm text-green-300 font-medium">Photo ready — add a message or press Send</p>
        </div>
      )}

      {/* Input bar */}
      <div className="flex-shrink-0 flex gap-2 p-2 rounded-2xl"
        style={{ background:'rgba(0,0,0,0.45)', backdropFilter:'blur(20px)', border:'1px solid rgba(255,255,255,0.12)' }}>
        {/* Photo upload button */}
        <button onClick={()=>fileRef.current?.click()}
          title="Upload photo for diagnosis"
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-110 flex-shrink-0 cursor-pointer"
          style={{ background:'rgba(34,197,94,0.2)', border:'1px solid rgba(34,197,94,0.3)' }}>
          <Camera className="w-4 h-4 text-green-400"/>
        </button>

        <input value={input} onChange={e=>setInput(e.target.value)}
          onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&send()}
          placeholder="Ask about crops, livestock, diseases..."
          disabled={loading}
          className="flex-1 text-sm px-3 py-2 focus:outline-none text-white placeholder-white/30"
          style={{ background:'transparent', border:'none' }}/>

        <button onClick={()=>send()} disabled={(!input.trim()&&!selectedImage)||loading}
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-110 disabled:opacity-30 flex-shrink-0 cursor-pointer"
          style={{ background:'rgba(34,197,94,0.8)', border:'1px solid rgba(34,197,94,0.5)' }}>
          <Send className="w-4 h-4 text-white"/>
        </button>
      </div>

      <input ref={fileRef} type="file" accept="image/*" capture="environment"
        className="hidden" onChange={handleImageSelect}/>
    </div>
  )
}
