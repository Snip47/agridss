import { useEffect, useRef, useState } from 'react'
import api from '../lib/api'
import { useAuth } from '../lib/auth'
import PhotoHero from '../components/PhotoHero'

interface Message { role: 'user' | 'assistant'; content: string; image?: string }

export default function AIAdvisor() {
  const { user } = useAuth()
  const first = user?.name?.split(' ')[0] || 'Farmer'
  const welcome = `Welcome, ${first}.\n\nAsk me anything about farming, or upload a photo of your crop or animal for a diagnosis.\n\nNinaweza pia kukusaidia kwa Kiswahili.`

  const [messages, setMessages] = useState<Message[]>([{ role: 'assistant', content: welcome }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [provider, setProvider] = useState('gemini')
  const [hasGroq, setHasGroq] = useState(false)
  const [image, setImage] = useState<string | null>(null)
  const bottom = useRef<HTMLDivElement>(null)
  const file = useRef<HTMLInputElement>(null)

  useEffect(() => { bottom.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, loading])
  useEffect(() => { api.get('/ai/status').then(r => setHasGroq(!!r.data.groq_configured)).catch(() => {}) }, [])
  useEffect(() => { if (user?.name) setMessages([{ role: 'assistant', content: welcome }]) }, [user?.name])

  const pick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return
    const rd = new FileReader()
    rd.onloadend = () => setImage(rd.result as string)
    rd.readAsDataURL(f); e.target.value = ''
  }

  const send = async () => {
    const text = input.trim()
    if ((!text && !image) || loading) return
    const img = image
    const history = messages.slice(1).map(m => ({ role: m.role, content: m.content }))
    setMessages(m => [...m, { role: 'user', content: text || 'Please diagnose this image.', image: img || undefined }])
    setInput(''); setImage(null); setLoading(true)
    try {
      let reply = ''
      if (img) {
        const r = await api.post('/ai/analyze-image', { image: img, message: text || 'Diagnose this image. Identify the crop or animal and any disease or pest visible.', provider: 'gemini' })
        reply = r.data.reply
      } else {
        const r = await api.post('/ai/chat', { message: text, history, provider })
        reply = r.data.reply
      }
      setMessages(m => [...m, { role: 'assistant', content: reply }])
    } catch (err: any) {
      const status = err?.response?.status
      const detail = err?.response?.data?.detail || err?.message || 'Unknown error'
      setMessages(m => [...m, { role: 'assistant', content: status === 401 ? 'Session expired. Please sign out and sign in again.' : `AI error: ${typeof detail === 'string' ? detail : JSON.stringify(detail)}` }])
    }
    setLoading(false)
  }

  return (
    <div className="wrap">
      <PhotoHero compact image="/images/ai.jpg" title="AI farm advisor" subtitle="English and Swahili. Upload a photo of a sick crop or animal for a diagnosis." />

      <div className="chips" style={{ marginTop: 16 }}>
        <span style={{ alignSelf: 'center', fontSize: 13, color: 'var(--muted)', paddingRight: 4 }}>Chat engine</span>
        <button className={'chip' + (provider === 'gemini' ? ' active' : '')} onClick={() => setProvider('gemini')}>Gemini</button>
        {hasGroq && <button className={'chip' + (provider === 'groq' ? ' active' : '')} onClick={() => setProvider('groq')}>Groq</button>}
      </div>

      <div className="card chat" style={{ marginTop: 16 }}>
        <div className="chat-log">
          {messages.map((m, i) => (
            <div key={i} className={'msg ' + (m.role === 'user' ? 'msg-user' : 'msg-bot')}>
              {m.image && <img src={m.image} alt="uploaded" />}
              {m.content}
            </div>
          ))}
          {loading && <div className="msg msg-bot">{image ? 'Analyzing photo...' : `Thinking via ${provider}...`}</div>}
          <div ref={bottom} />
        </div>
        {image && (
          <div className="preview">
            <img src={image} alt="preview" />
            <span>Photo ready. Press Send to diagnose.</span>
            <button className="btn btn-outline btn-sm" style={{ marginLeft: 'auto' }} onClick={() => setImage(null)}>Remove</button>
          </div>
        )}
        <div className="chat-bar">
          <button className="btn btn-outline" onClick={() => file.current?.click()}>Photo</button>
          <input className="input" placeholder="Ask about crops, livestock or diseases" value={input} disabled={loading}
            onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()} />
          <button className="btn btn-primary" onClick={send} disabled={(!input.trim() && !image) || loading}>Send</button>
        </div>
        <input ref={file} type="file" accept="image/*" style={{ display: 'none' }} onChange={pick} />
      </div>
    </div>
  )
}
