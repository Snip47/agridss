import { useState, useRef, useEffect } from 'react'
import api from '../lib/api'
import { Bot, Send, User, Leaf, Loader2, ExternalLink, Info, Zap, Image, X, Camera } from 'lucide-react'

interface Message { role:'user'|'assistant'; content:string; image?:string }

const STARTERS = [
  "My maize leaves are turning yellow with brown edges — what disease?",
  "Best crop to plant in Nakuru during long rains?",
  "How do I control East Coast Fever in dairy cows?",
  "Vaccination schedule for broiler chickens in Kenya?",
  "Compare Hass avocado vs passion fruit in Murang'a",
  "Ninajali kuhusu ugonjwa wa viazi — dalili ni madoa meusi",
  "Best rabbit breeds for meat in Kenya?",
  "How to start zero-grazing dairy with 3 Friesian cows?",
]

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
        {/* Show uploaded image in message */}
        {msg.image && (
          <div className={`rounded-2xl overflow-hidden ${isUser?'rounded-tr-sm':'rounded-tl-sm'}`}
            style={{ border:'1px solid rgba(255,255,255,0.2)', maxWidth:'300px' }}>
            <img src={msg.image} alt="uploaded" className="w-full h-48 object-cover"/>
          </div>
        )}
        {msg.content && (
          <div className="text-sm leading-relaxed whitespace-pre-wrap rounded-2xl px-4 py-3"
            style={isUser
              ?{ background:'rgba(251,191,36,0.18)', border:'1px solid rgba(251,191,36,0.3)', color:'white', borderTopRightRadius: msg.image?'1rem':'4px' }
              :{ background:'rgba(0,0,0,0.45)', border:'1px solid rgba(255,255,255,0.12)', backdropFilter:'blur(16px)', color:'rgba(255,255,255,0.88)', borderTopLeftRadius: msg.image?'1rem':'4px' }}>
            {msg.content}
          </div>
        )}
      </div>
    </div>
  )
}

export default function AIAdvisor() {
  const [messages, setMessages] = useState<Message[]>([
    { role:'assistant', content:"Habari! Mimi ni AgriDSS AI Advisor 🌾\n\nI can help you with:\n• 📸 **Photo diagnosis** — Upload a photo of your sick crop or animal and I'll diagnose it!\n• 🌱 Crop recommendations for your location\n• 🐄 Livestock management and breeds\n• 🦠 Disease identification and treatment\n• 🇰🇪 Kenya-specific farming advice in English & Swahili\n\nUpload a photo or type your farming question!" }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [aiStatus, setAiStatus] = useState<any>(null)
  const [provider, setProvider] = useState('gemini')
  const [selectedImage, setSelectedImage] = useState<string|null>(null)
  const [imageFile, setImageFile] = useState<File|null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }) }, [messages])
  useEffect(() => {
    api.get('/ai/status').then(r=>{
      setAiStatus(r.data)
      if (!r.data.gemini_configured && r.data.groq_configured) setProvider('groq')
    }).catch(()=>{})
  }, [])

  // Convert file to base64
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setSelectedImage(reader.result as string)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const removeImage = () => { setSelectedImage(null); setImageFile(null) }

  const send = async (text?: string) => {
    const msg = text || input.trim()
    if ((!msg && !selectedImage) || loading) return
    setInput('')

    const userMsg: Message = {
      role: 'user',
      content: msg || (selectedImage ? 'Please analyze this image of my crop/animal and diagnose any problems.' : ''),
      image: selectedImage || undefined
    }

    const capturedImage = selectedImage
    setSelectedImage(null); setImageFile(null)
    const history = messages.slice(1).map(m=>({ role:m.role, content:m.content }))
    setMessages(prev=>[...prev, userMsg])
    setLoading(true)

    try {
      let reply = ''

      if (capturedImage) {
        // Send image to backend for AI vision analysis
        const r = await api.post('/ai/analyze-image', {
          image: capturedImage,
          message: msg || 'Please analyze this image of my crop or animal. Identify any disease, pest damage, nutritional deficiency, or health issue you can see. Provide diagnosis, severity, treatment and prevention advice specific to Kenya.',
          provider
        })
        reply = r.data.reply
      } else {
        // Regular text chat
        const r = await api.post('/ai/chat', { message: msg, history, provider })
        reply = r.data.reply
      }

      setMessages(prev=>[...prev, { role:'assistant', content:reply }])
    } catch (err:any) {
      const detail = err?.response?.data?.detail || 'AI service unavailable. Check your API key in backend/.env'
      setMessages(prev=>[...prev, { role:'assistant', content:`⚠️ ${detail}` }])
    }
    setLoading(false)
  }

  const noKey = aiStatus && !aiStatus.gemini_configured && !aiStatus.groq_configured

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] slide-up">

      {/* Header */}
      <div className="mb-4 flex-shrink-0">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-4xl font-black text-white flex items-center gap-3 drop-shadow-2xl">
              <Bot className="w-9 h-9 text-purple-400"/> AI Farm Advisor
            </h1>
            <p className="text-white/55 mt-1 text-sm">Upload crop/animal photos for instant AI diagnosis · English & Swahili</p>
          </div>

          {/* Provider selector */}
          {aiStatus && (aiStatus.gemini_configured || aiStatus.groq_configured) && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/40">Engine:</span>
              {aiStatus.gemini_configured && (
                <button onClick={()=>setProvider('gemini')}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-sm transition-all"
                  style={provider==='gemini'
                    ?{background:'rgba(59,130,246,0.7)',color:'white',border:'2px solid rgba(59,130,246,0.9)',boxShadow:'0 0 16px rgba(59,130,246,0.4)'}
                    :{background:'rgba(255,255,255,0.07)',color:'rgba(255,255,255,0.5)',border:'2px solid rgba(255,255,255,0.12)'}}>
                  🔵 Gemini {provider==='gemini'&&<span className="text-xs bg-white/20 px-1 rounded-full">✓</span>}
                </button>
              )}
              {aiStatus.groq_configured && (
                <button onClick={()=>setProvider('groq')}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-sm transition-all"
                  style={provider==='groq'
                    ?{background:'rgba(168,85,247,0.7)',color:'white',border:'2px solid rgba(168,85,247,0.9)',boxShadow:'0 0 16px rgba(168,85,247,0.4)'}
                    :{background:'rgba(255,255,255,0.07)',color:'rgba(255,255,255,0.5)',border:'2px solid rgba(255,255,255,0.12)'}}>
                  <Zap className="w-3.5 h-3.5"/> Groq {provider==='groq'&&<span className="text-xs bg-white/20 px-1 rounded-full">✓</span>}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Photo diagnosis banner */}
        <div className="mt-3 flex items-center gap-3 px-4 py-3 rounded-xl"
          style={{ background:'rgba(34,197,94,0.12)', border:'1px solid rgba(34,197,94,0.25)' }}>
          <Camera className="w-5 h-5 text-green-400 flex-shrink-0"/>
          <p className="text-sm text-green-200">
            <strong>📸 Photo Diagnosis:</strong> Take or upload a photo of your sick crop, diseased leaf, or unwell animal — the AI will identify the problem and suggest treatment!
          </p>
          <button onClick={()=>fileRef.current?.click()}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs text-white transition-all hover:scale-105"
            style={{ background:'rgba(34,197,94,0.7)', border:'1px solid rgba(34,197,94,0.5)' }}>
            <Image className="w-3.5 h-3.5"/> Upload Photo
          </button>
        </div>
      </div>

      {/* No key warning */}
      {noKey && (
        <div className="flex-shrink-0 mb-3 p-4 rounded-2xl" style={{ background:'rgba(251,191,36,0.12)', border:'1px solid rgba(251,191,36,0.3)' }}>
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5"/>
            <div>
              <div className="font-bold text-amber-300 text-sm mb-2">AI Advisor needs a FREE API key</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener"
                  className="flex items-center gap-2 p-2.5 rounded-xl"
                  style={{ background:'rgba(59,130,246,0.15)', border:'1px solid rgba(59,130,246,0.3)' }}>
                  <span className="text-xl">🔵</span>
                  <div>
                    <div className="font-bold text-white text-xs">Google Gemini Flash</div>
                    <div className="text-white/45 text-xs">FREE · 1,500 req/day · Supports image analysis</div>
                  </div>
                  <ExternalLink className="w-3 h-3 text-white/30 ml-auto"/>
                </a>
                <a href="https://console.groq.com" target="_blank" rel="noopener"
                  className="flex items-center gap-2 p-2.5 rounded-xl"
                  style={{ background:'rgba(168,85,247,0.15)', border:'1px solid rgba(168,85,247,0.3)' }}>
                  <span className="text-xl">⚡</span>
                  <div>
                    <div className="font-bold text-white text-xs">Groq Llama 3.3 70B</div>
                    <div className="text-white/45 text-xs">FREE · 14,400 req/day · Text only</div>
                  </div>
                  <ExternalLink className="w-3 h-3 text-white/30 ml-auto"/>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

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
              <span className="text-xs text-white/40">
                {selectedImage ? 'Analyzing your photo...' : provider==='gemini'?'Gemini thinking...':'Groq thinking...'}
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      {/* Starter suggestions */}
      {messages.length < 3 && (
        <div className="flex-shrink-0 mb-3">
          <p className="text-xs text-white/35 mb-2">💡 Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {STARTERS.map(s=>(
              <button key={s} onClick={()=>send(s)}
                className="text-xs text-white/60 hover:text-white px-3 py-1.5 rounded-full transition-all"
                style={{ background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)' }}>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Image preview */}
      {selectedImage && (
        <div className="flex-shrink-0 mb-2 flex items-center gap-3 p-3 rounded-xl"
          style={{ background:'rgba(34,197,94,0.1)', border:'1px solid rgba(34,197,94,0.25)' }}>
          <div className="relative flex-shrink-0">
            <img src={selectedImage} alt="selected" className="w-16 h-16 rounded-lg object-cover border border-white/20"/>
            <button onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-white"
              style={{ background:'rgba(239,68,68,0.9)' }}>
              <X className="w-3 h-3"/>
            </button>
          </div>
          <div>
            <div className="text-sm font-bold text-green-300">📸 Photo ready for diagnosis</div>
            <div className="text-xs text-white/50">Add a message or press send — AI will analyze your photo</div>
          </div>
        </div>
      )}

      {/* Input bar */}
      <div className="flex-shrink-0 flex gap-2 p-2 rounded-2xl"
        style={{ background:'rgba(0,0,0,0.45)', backdropFilter:'blur(20px)', border:'1px solid rgba(255,255,255,0.12)' }}>
        {/* Upload image button */}
        <button onClick={()=>fileRef.current?.click()}
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-110 flex-shrink-0"
          style={{ background:'rgba(34,197,94,0.2)', border:'1px solid rgba(34,197,94,0.3)' }}
          title="Upload crop/animal photo for diagnosis">
          <Camera className="w-4 h-4 text-green-400"/>
        </button>

        <input value={input} onChange={e=>setInput(e.target.value)}
          onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&send()}
          placeholder={selectedImage ? "Add a message about this photo (optional)..." : "Ask a question or upload a photo of your crop/animal..."}
          disabled={loading}
          className="flex-1 text-sm px-3 py-2 focus:outline-none text-white placeholder-white/30"
          style={{ background:'transparent', border:'none' }}/>

        <button onClick={()=>send()} disabled={(!input.trim()&&!selectedImage)||loading}
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-110 disabled:opacity-30 flex-shrink-0"
          style={{ background:'rgba(34,197,94,0.8)', border:'1px solid rgba(34,197,94,0.5)' }}>
          <Send className="w-4 h-4 text-white"/>
        </button>
      </div>

      <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageSelect}/>
    </div>
  )
}
