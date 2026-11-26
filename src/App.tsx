import { useEffect, useRef, useState, FormEvent, ReactNode } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import Lenis from 'lenis'
import { useForm, ValidationError } from '@formspree/react'
import { siGithub, siInstagram, siWhatsapp } from 'simple-icons'
import { Volume2, VolumeX, Menu, X, Send, Sparkles } from 'lucide-react'

/* ---------- sound (Web Audio, synthesized, off by default) ---------- */
let ctx: AudioContext | null = null
let soundOn = false
try { soundOn = localStorage.getItem('cw-sound') === '1' } catch {}
const tone = (f: number, d = 0.09, v = 0.025) => {
  if (!soundOn) return
  ctx ??= new AudioContext()
  const o = ctx.createOscillator(), g = ctx.createGain()
  o.frequency.value = f; g.gain.setValueAtTime(v, ctx.currentTime)
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + d)
  o.connect(g).connect(ctx.destination); o.start(); o.stop(ctx.currentTime + d)
}
const hover = () => tone(660, 0.05, 0.012), click = () => tone(440, 0.1), whoosh = () => tone(220, 0.25, 0.02)

/* ---------- data ---------- */
const NAV = ['home', 'work', 'services', 'about', 'reviews', 'contact']
type P = { shot?: string; s: string; n: string; cat: string; url: string; d: string; k: string; cta: string; big?: boolean; pts?: string[] }
const PROJECTS: P[] = [
  { s: 'trust', n: 'Trust Credit Solutions', cat: 'Financial Services Website', url: 'https://trustcreditsolutions.in/', k: 'fin', big: true, cta: 'EXPLORE LIVE WEBSITE ↗',
    d: 'A professional financial services website designed to present business information, financial services, and customer inquiry functionality.',
    pts: ['Service and business information pages', 'Customer inquiry flow', 'Responsive across devices'] },
  { s: 'kundapura', n: 'Kundapura Edits Studio', cat: 'Creative Digital Experience', url: 'https://kundapura-edits-studio.onrender.com/', k: 'vid', big: true, cta: 'EXPLORE LIVE WEBSITE ↗',
    d: 'A creative website showcasing editing services, visual storytelling, portfolio content, and contact features.',
    pts: ['Editing services showcase', 'Portfolio content', 'Contact features'] },
  { s: 'hotel', n: 'Hotel Udupi Upachar', cat: 'Restaurant Website', url: 'https://devadigasampath238-hue.github.io/Hotel-Udupi-Upachar/', k: 'food', cta: 'VIEW LIVE WEBSITE ↗', d: 'A restaurant website for Hotel Udupi Upachar.' },
  { s: 'erp', n: 'Student ERP', cat: 'Education / ERP Platform', url: 'https://devadigasampath238-hue.github.io/student-erp/', k: 'erp', cta: 'VIEW LIVE WEBSITE ↗', d: 'A student ERP website featuring academic and student management interfaces.' },
  { s: 'temple', n: 'Sri Bramhalingeshwar Temple', cat: 'Temple Website', url: 'https://devadigasampath238-hue.github.io/SriBramhaLingeshwara/', k: 'tmp', cta: 'VIEW LIVE WEBSITE ↗', d: 'A digital temple website showcasing temple information and seva-related features.' },
]
const SERVICES = [
  ['Website Design & Development', 'Fast, responsive websites designed around your brand.'],
  ['Full-Stack Web Applications', 'Frontends, APIs and databases built as one system.'],
  ['Business Website Solutions', 'Clear, professional sites that present your business well.'],
  ['E-Commerce Development', 'Online stores with smooth browsing and checkout flows.'],
  ['UI/UX Design', 'Interfaces planned around how people actually use them.'],
  ['Website Redesign', 'Modernise an existing site without losing what works.'],
]
const STACK = ['React', 'Next.js', 'JavaScript', 'Node.js', 'Express', 'MongoDB', 'PostgreSQL', 'Java', 'Spring Boot', 'Flutter', 'Tailwind CSS', 'Framer Motion']
const STEPS = [['Discover', 'Understand the business and objectives.'], ['Design', 'Create the visual direction and user experience.'], ['Develop', 'Build a responsive, functional website.'], ['Launch', 'Deploy, test, and optimize.'], ['Evolve', 'Improve and scale the experience.']]
const API = ((import.meta.env.VITE_API_URL as string) || '').trim().replace(/\/+$/, '').replace(/^(?!https?:\/\/)(.+)$/, 'https://$1')
const KINDS = ['fin', 'vid', 'food', 'erp', 'tmp']
const WA = (import.meta.env.VITE_WHATSAPP_NUMBER as string) || ''
const FS = (import.meta.env.VITE_API_URL as string) || ''

/* ---------- small pieces ---------- */
const Logo = ({ h = 52 }: { h?: number }) => {
  const [ok, setOk] = useState(true)
  // Drop your original logo at /public/logo.png — it is rendered untouched.
  return ok ? <img className="logo" style={{ height: h }} src="/logo.png" alt="CreavixWorld" onError={() => setOk(false)} /> : <span className="wm">CREAVIXWORLD</span>
}

function Tilt({ children }: { children: ReactNode }) {
  const r = useRef<HTMLDivElement>(null)
  return <div ref={r} className="bw" data-cursor="view"
    onMouseMove={e => { const b = r.current!.getBoundingClientRect(); r.current!.style.setProperty('--ry', ((e.clientX - b.left) / b.width - .5) * 10 + 'deg'); r.current!.style.setProperty('--rx', -((e.clientY - b.top) / b.height - .5) * 8 + 'deg') }}
    onMouseLeave={() => { r.current!.style.setProperty('--ry', '0deg'); r.current!.style.setProperty('--rx', '0deg') }}>{children}</div>
}
const Mock = ({ p, open }: { p: P; open: (p: P) => void }) => {
  // tries: backend screenshot -> local file -> live screenshot services -> CSS placeholder
  const srcs = [p.shot, `/previews/${p.s}.png`,
    `https://api.microlink.io/?url=${encodeURIComponent(p.url)}&screenshot=true&meta=false&embed=screenshot.url&viewport.width=1440&viewport.height=900`,
    `https://image.thum.io/get/width/1280/crop/800/noanimate/${p.url}`].filter(Boolean) as string[]
  const [i, setI] = useState(0)
  useEffect(() => setI(0), [p.shot])
  return <Tilt><div className="bar"><b /><b /><b /><span style={{ marginLeft: 10 }}>{p.url.replace('https://', '')}</span></div>
    {i < srcs.length ? <button className="shot" onClick={() => { open({ ...p, shot: srcs[i] }); whoosh() }} aria-label={`Open ${p.n} preview`}><img key={srcs[i]} src={srcs[i]} alt={`${p.n} website`} loading="lazy" onError={() => setI(i + 1)} /></button>
      : <div className={`scr k-${p.k}`}><i /><i /><i /><i /><i /><i /><i /><i /></div>}</Tilt>
}
const Brand = ({ i }: { i: { path: string } }) => <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden><path d={i.path} /></svg>
const GH = 'https://github.com/devadigasampath238-hue'
const openWA = () => { click(); if (!WA) { dispatchEvent(new Event('wa-missing')); return } window.open(`https://wa.me/${WA}?text=${encodeURIComponent('Hi Sampath, I visited CreavixWorld and would like to discuss a website project.')}`, '_blank', 'noopener') }
const Socials = ({ btn }: { btn?: boolean }) => <div className="soc">
  <a href="https://www.instagram.com/creavixworld/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" onMouseEnter={hover} onClick={click}><Brand i={siInstagram} /></a>
  <a href={GH} target="_blank" rel="noopener noreferrer" aria-label="GitHub" onMouseEnter={hover} onClick={click}><Brand i={siGithub} /></a>
  <button onClick={openWA} aria-label="WhatsApp" onMouseEnter={hover}><Brand i={siWhatsapp} /></button>
  {btn && <a className="ghost" href={GH} target="_blank" rel="noopener noreferrer" onClick={click}>EXPLORE MY GITHUB ↗</a>}</div>
function Portrait({ small }: { small?: boolean }) {
  const r = useRef<HTMLDivElement>(null)
  useEffect(() => { const m = (e: MouseEvent) => { r.current?.style.setProperty('--mx', (e.clientX / innerWidth - .5) * 16 + 'px'); r.current?.style.setProperty('--my', (e.clientY / innerHeight - .5) * 16 + 'px') }; addEventListener('mousemove', m); return () => removeEventListener('mousemove', m) }, [])
  const ring = (n: number, rad: number, dr: number, c: string) => Array.from({ length: n }, (_, i) => { const t = i / n * Math.PI * 2; return <circle key={i} cx={50 + rad * Math.cos(t)} cy={50 + rad * Math.sin(t)} r={dr} fill={c} /> })
  return <motion.div ref={r} className={`pt ${small ? 'sm' : ''}`} initial={{ opacity: 0, scale: .85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.1, delay: .3, ease: [.2, .7, .2, 1] }}>
    <svg className="dr" viewBox="0 0 100 100" aria-hidden>{ring(small ? 40 : 72, 48.5, .7, '#2878FF')}</svg>
    <svg className="dr b" viewBox="0 0 100 100" aria-hidden>{ring(small ? 28 : 48, 48.5, .5, '#8B42F5')}</svg>
    <div className="pg"><div className="pc"><img src="/sampath-dots.png" alt="Dotted portrait of Sampath Devadiga, founder of CreavixWorld" /></div></div></motion.div>
}
const Reveal = ({ children, d = 0 }: { children: ReactNode; d?: number }) => {
  const rm = useReducedMotion()
  return <motion.div initial={rm ? false : { opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: .8, delay: d, ease: [.2, .7, .2, 1] }}>{children}</motion.div>
}

/* ---------- loader ---------- */
function Loader({ done }: { done: () => void }) {
  const [n, setN] = useState(0)
  useEffect(() => { const t = setInterval(() => setN(v => Math.min(100, v + 4)), 55); return () => clearInterval(t) }, [])
  useEffect(() => { if (n === 100) { tone(520, .3); setTimeout(done, 350) } }, [n, done])
  return <motion.div className="ld" exit={{ clipPath: 'inset(0 0 100% 0)' }} transition={{ duration: .9, ease: [.7, 0, .2, 1] }}>
    <div><motion.div className="ln" initial={{ width: 0 }} animate={{ width: 220 }} transition={{ duration: 1 }} />
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .5 }}><Logo h={140} /></motion.div>
      <motion.p className="mu" style={{ letterSpacing: '.3em', fontSize: 12, margin: '18px 0' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>DIGITAL EXPERIENCES</motion.p>
      <div className="cnt">{n}</div>
      <button className="mu" style={{ marginTop: 20, fontSize: 12 }} onClick={done}>SKIP INTRO</button></div>
  </motion.div>
}

function BrandOrb() {
  const items = ['React', 'Next.js', 'Node.js', 'MongoDB', 'PostgreSQL', 'Java', 'Spring Boot', 'Flutter', 'Tailwind', 'Gemini AI']
  return <div className="orb" aria-hidden><div className="orb-r">{items.map((s, i) => <span key={s} style={{ '--a': `${i * 36}deg` } as React.CSSProperties}><b>{s}</b></span>)}</div><div className="orb-c"><Logo h={120} /></div></div>
}
type Plan = { summary: string; pages: string[]; features: string[]; tech: string[]; next_step: string }
const IDEAS = ['Restaurant in Udupi', 'Diagnostic centre', 'Real estate agency', 'Online clothing store', 'Coaching institute']
function Planner() {
  const [txt, setTxt] = useState(''), [busy, setBusy] = useState(false), [plan, setPlan] = useState<Plan | null>(null), [err, setErr] = useState('')
  const run = async (t = txt) => {
    t = t.trim(); if (t.length < 5 || busy) { setErr('Describe your business in a few words.'); return }
    setErr(''); setBusy(true); setPlan(null); click()
    try {
      if (!API) throw new Error('The AI planner is not connected yet.')
      const r = await fetch(`${API}/api/plan`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ business: t }) }); const j = await r.json()
      if (!r.ok) throw new Error(j.error || 'Could not generate a plan.'); setPlan(j); tone(600, .25)
    } catch (e) { const m = (e as Error).message; setErr(m === 'Failed to fetch' ? 'Could not reach the server. Please try again.' : m) }
    setBusy(false)
  }
  const discuss = () => { const ta = document.querySelector<HTMLTextAreaElement>('textarea[name=message]'); if (ta && plan) ta.value = `AI plan for: ${txt}\nPages: ${plan.pages.join(', ')}\nFeatures: ${plan.features.join(', ')}\nI’d like to discuss this website plan.`; document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }) }
  return <section id="planner" className="w">
    <Reveal><span className="tag">✨ AI WEBSITE PLANNER</span><h2>Imagine your business online.</h2><p className="mu" style={{ marginTop: 12, maxWidth: 560 }}>Describe your business and our AI drafts a website plan in seconds. It’s a starting point: Sampath confirms scope and pricing personally.</p></Reveal>
    <div className="pl"><div className="pl-in"><textarea value={txt} onChange={e => setTxt(e.target.value)} maxLength={400} rows={4} placeholder="e.g. A family restaurant in Udupi that wants online table booking and a digital menu" aria-label="Describe your business" />
      <div className="pl-ch">{IDEAS.map(x => <button key={x} onClick={() => { setTxt(x); run(x) }}>{x}</button>)}</div>
      <button className="fill" onClick={() => run()} disabled={busy}>{busy ? 'THINKING…' : 'GENERATE MY WEBSITE PLAN ✨'}</button>{err && <div className="er" role="alert">{err}</div>}</div>
      {busy && <div className="pl-out sk" aria-label="Generating"><i /><i /><i /><i /><i /></div>}
      {plan && !busy && <motion.div className="pl-out" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <p>{plan.summary}</p>
        {([['Pages', plan.pages], ['Key features', plan.features], ['Suggested tech', plan.tech]] as [string, string[]][]).map(([h, l]) => <div key={h}><b>{h}</b><div className="st">{l.map((x, i) => <motion.span key={x} initial={{ opacity: 0, scale: .8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * .05 }}>{x}</motion.span>)}</div></div>)}
        <p className="mu">{plan.next_step}</p><div><button className="fill" onClick={discuss}>DISCUSS THIS PLAN ↗</button></div></motion.div>}
    </div></section>
}
type Msg = { role: 'user' | 'model'; text: string; err?: boolean }
const QUICK = ['What services do you offer?', 'Show me your best work', 'How do I start a project?']
function Chatbot() {
  const [open, setOpen] = useState(false), [msgs, setMsgs] = useState<Msg[]>([]), [txt, setTxt] = useState(''), [busy, setBusy] = useState(false)
  const end = useRef<HTMLDivElement>(null)
  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs, busy, open])
  const send = async (t: string) => {
    t = t.trim(); if (!t || busy) return
    const next: Msg[] = [...msgs, { role: 'user', text: t }]; setMsgs(next); setTxt(''); setBusy(true); tone(520, .06)
    try {
      if (!API) throw new Error('The assistant is not connected yet.')
      const r = await fetch(`${API}/api/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: next.filter(m => !m.err) }) }); const j = await r.json()
      if (!r.ok) throw new Error(j.error || 'Something went wrong.')
      setMsgs([...next, { role: 'model', text: j.reply }])
    } catch (e) { const m = (e as Error).message; setMsgs([...next, { role: 'model', err: true, text: m === 'Failed to fetch' ? 'I couldn’t reach the server. Please try again, or use the contact form.' : m }]) }
    setBusy(false)
  }
  return <>
    <button className="cb-f" onClick={() => { setOpen(!open); click() }} aria-label={open ? 'Close assistant' : 'Open assistant'} aria-expanded={open}>{open ? <X size={20} /> : <Sparkles size={20} />}<span>{open ? 'Close' : 'Ask AI'}</span></button>
    <AnimatePresence>{open && <motion.div className="cb" role="dialog" aria-label="CreavixWorld assistant" initial={{ opacity: 0, y: 20, scale: .96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: .96 }} transition={{ duration: .25 }}>
      <div className="cb-h"><Logo h={36} /><div><b>CreavixWorld Assistant</b><small>Powered by Gemini · services, projects, pricing help</small></div></div>
      <div className="cb-b" data-lenis-prevent>
        <div className="cb-m bot">Hi! I’m the CreavixWorld assistant. Ask me about our services, our projects, or how to start your website.</div>
        {msgs.map((m, i) => <motion.div key={i} className={`cb-m ${m.role === 'user' ? 'me' : 'bot'}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>{m.text}</motion.div>)}
        {!msgs.length && <div className="cb-q">{QUICK.map(q => <button key={q} onClick={() => send(q)}>{q}</button>)}</div>}
        {busy && <div className="cb-m bot cb-t" aria-label="Typing"><i /><i /><i /></div>}<div ref={end} /></div>
      <form className="cb-i" onSubmit={e => { e.preventDefault(); send(txt) }}><input value={txt} onChange={e => setTxt(e.target.value)} placeholder="Type your question…" maxLength={500} aria-label="Message" /><button aria-label="Send" disabled={busy || !txt.trim()}><Send size={18} /></button></form>
    </motion.div>}</AnimatePresence></>
}
function Glow() {
  const r = useRef<HTMLDivElement>(null)
  useEffect(() => { const m = (e: MouseEvent) => { r.current && (r.current.style.transform = `translate(${e.clientX - 300}px,${e.clientY - 300}px)`) }; addEventListener('mousemove', m); return () => removeEventListener('mousemove', m) }, [])
  return <div ref={r} className="glow" aria-hidden />
}
type Rv = { id: number; name: string; role: string; rating: number; text: string }
function Reviews() {
  const [list, setList] = useState<Rv[]>([]), [s, setS] = useState<'idle' | 'load' | 'ok' | 'err'>('idle'), [msg, setMsg] = useState('')
  useEffect(() => { if (!API) return; const l = () => fetch(`${API}/api/reviews`).then(r => r.json()).then(setList).catch(e => console.warn('[CreavixWorld] reviews unreachable', e)); l(); const t = setInterval(l, 30000); return () => clearInterval(t) }, [])
  const send = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); const f = e.currentTarget, d = Object.fromEntries(new FormData(f)); setS('load')
    try {
      if (!API) throw new Error('Reviews backend is not connected (set VITE_API_URL).')
      const r = await fetch(`${API}/api/reviews`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }); const j = await r.json()
      if (!r.ok) throw new Error(j.error || 'Could not submit your review.'); setS('ok'); f.reset(); tone(600, .3)
    } catch (x) { setS('err'); setMsg((x as Error).message === 'Failed to fetch' ? 'Could not reach the server. Check VITE_API_URL and FRONTEND_ORIGIN.' : (x as Error).message || 'Could not submit your review.') }
  }
  return <section id="reviews" className="w">
    <Reveal><h2>Client reviews.</h2></Reveal>
    {list.length ? <div className="rv">{list.map((r, i) => <Reveal key={r.id} d={i * .08}><figure><div className="stars" aria-label={`${r.rating} out of 5`}>{'★'.repeat(r.rating)}</div><blockquote>{r.text}</blockquote><figcaption>{r.name}{r.role && <span className="mu"> · {r.role}</span>}</figcaption></figure></Reveal>)}</div>
      : <p className="mu" style={{ marginTop: 16 }}>No reviews yet. Worked with me? Be the first.</p>}
    <form onSubmit={send} aria-label="Write a review">
      <label>Name<input name="name" required maxLength={80} /></label><label>Business / role (optional)<input name="role" maxLength={80} /></label>
      <label className="f">Rating<select name="rating" defaultValue="5">{[5, 4, 3, 2, 1].map(n => <option key={n}>{n}</option>)}</select></label>
      <label className="f">Your review<textarea name="text" rows={4} required minLength={10} maxLength={600} /></label>
      <div className="f"><button className="fill" disabled={s === 'load'}>{s === 'load' ? 'SENDING…' : 'SUBMIT REVIEW'}</button></div>
      {s === 'ok' && <div className="msg" role="status">Thank you. Your review will appear after approval.</div>}{s === 'err' && <div className="msg er" role="alert">{msg}</div>}
    </form></section>
}

/* ---------- app ---------- */
export default function App() {
  const [intro, setIntro] = useState(() => { try { return !sessionStorage.getItem('cw-intro') } catch { return true } })
  const [menu, setMenu] = useState(false), [snd, setSnd] = useState(soundOn), [scrolled, setScrolled] = useState(false), [active, setActive] = useState('home')
  const [open, setOpen] = useState<number | null>(null), [modal, setModal] = useState<P | null>(null), [projects, setProjects] = useState<P[]>(PROJECTS), [dbg, setDbg] = useState(''), [cur, setCur] = useState('')
  const [st, setSt] = useState<{ s: 'idle' | 'load' | 'ok' | 'err'; m?: string }>({ s: 'idle' }), [errs, setErrs] = useState<Record<string, string>>({})
  const progRef = useRef<HTMLDivElement>(null), dot = useRef<HTMLDivElement>(null), prRef = useRef<HTMLDivElement>(null), lenis = useRef<Lenis | null>(null)
  const rm = useReducedMotion()
  const [fs, sendFs] = useForm('mqppovvy'), formRef = useRef<HTMLFormElement>(null)
  useEffect(() => { if (fs.succeeded) { tone(600, .3); formRef.current?.reset() } }, [fs.succeeded])

  const finish = () => { try { sessionStorage.setItem('cw-intro', '1') } catch {}; setIntro(false) }
  const go = (id: string) => { setMenu(false); whoosh(); const el = document.getElementById(id); if (el) lenis.current ? lenis.current.scrollTo(el, { offset: -60 }) : el.scrollIntoView() }
  const toggleSound = () => { soundOn = !soundOn; try { localStorage.setItem('cw-sound', soundOn ? '1' : '0') } catch {}; setSnd(soundOn); click() }

  useEffect(() => {
    if (rm) return
    const l = new Lenis(); lenis.current = l
    let raf = 0; const loop = (t: number) => { l.raf(t); raf = requestAnimationFrame(loop) }; raf = requestAnimationFrame(loop)
    return () => { cancelAnimationFrame(raf); l.destroy() }
  }, [rm])
  useEffect(() => {
    const on = () => { setScrolled(scrollY > 30); progRef.current && (progRef.current.style.transform = `scaleX(${scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight)})`) }; on(); addEventListener('scroll', on, { passive: true })
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { setActive(e.target.id); if (e.target.id === 'about') prRef.current?.classList.add('in') } }), { threshold: .35 })
    NAV.forEach(i => { const el = document.getElementById(i); el && io.observe(el) })
    return () => { removeEventListener('scroll', on); io.disconnect() }
  }, [])
  useEffect(() => { if (!API) { setDbg('API ERROR: VITE_API_URL is not set in this build (set it, then redeploy)'); return } const load = () => fetch(`${API}/api/projects`).then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json() }).then((l: any[]) => { setDbg(`API ok: ${API} · ${l.length} websites`); return l.length && setProjects(l.map((x, i) => ({ s: String(x.id), n: x.title, cat: x.category, url: x.url, d: x.description, k: KINDS[i % 5], big: !!x.featured, cta: x.featured ? 'EXPLORE LIVE WEBSITE ↗' : 'VIEW LIVE WEBSITE ↗', shot: x.shot_url ? API + x.shot_url : undefined }))) }).catch(e => { console.warn('[CreavixWorld] backend unreachable:', API, e); setDbg(`API ERROR ${API}: ${e.message} (check CORS / https)`) }); load(); const t = setInterval(load, 20000); return () => clearInterval(t) }, [])
  useEffect(() => { const w = () => { go('contact'); setSt({ s: 'err', m: 'WhatsApp is not configured yet. Set VITE_WHATSAPP_NUMBER in .env, then rebuild.' }) }; addEventListener('wa-missing', w); const k = (e: KeyboardEvent) => e.key === 'Escape' && setModal(null); addEventListener('keydown', k); return () => { removeEventListener('wa-missing', w); removeEventListener('keydown', k) } }, [])
  useEffect(() => { // magnetic buttons
    if (!matchMedia('(pointer:fine)').matches) return
    const mv = (e: MouseEvent) => document.querySelectorAll<HTMLElement>('.fill,.pill,.soc a,.soc button').forEach(el => { const b = el.getBoundingClientRect(), dx = e.clientX - b.left - b.width / 2, dy = e.clientY - b.top - b.height / 2; el.style.transform = Math.hypot(dx, dy) < 90 ? `translate(${dx * .25}px,${dy * .25}px)` : '' })
    addEventListener('mousemove', mv); return () => removeEventListener('mousemove', mv)
  }, [])
  useEffect(() => { // custom cursor (fine pointers only)
    if (!matchMedia('(pointer:fine)').matches) return
    let x = 0, y = 0, cx = 0, cy = 0, raf = 0
    const mv = (e: MouseEvent) => {
      x = e.clientX; y = e.clientY
      const t = (e.target as HTMLElement).closest('[data-cursor],a,button,input,select,textarea') as HTMLElement | null
      setCur(!t ? '' : t.dataset.cursor === 'view' ? 'v' : 'h')
    }
    const loop = () => { cx += (x - cx) * .18; cy += (y - cy) * .18; if (dot.current) dot.current.style.transform = `translate(${cx}px,${cy}px)`; raf = requestAnimationFrame(loop) }
    addEventListener('mousemove', mv); raf = requestAnimationFrame(loop)
    return () => { removeEventListener('mousemove', mv); cancelAnimationFrame(raf) }
  }, [])
  const hero = (e: React.MouseEvent<HTMLElement>) => { const o = e.currentTarget.querySelector('.obj') as HTMLElement | null; if (!o) return; o.style.setProperty('--ry', (e.clientX / innerWidth - .5) * 50 + 'deg'); o.style.setProperty('--rx', -(e.clientY / innerHeight - .5) * 40 + 'deg') }

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); const f = e.currentTarget, d = Object.fromEntries(new FormData(f)) as Record<string, string>, er: Record<string, string> = {}
    if (!d.name?.trim()) er.name = 'Enter your name.'
    if (!/^\S+@\S+\.\S+$/.test(d.email || '')) er.email = 'Enter a valid email address.'
    if ((d.message || '').trim().length < 10) er.message = 'Tell me a little more (10+ characters).'
    setErrs(er); if (Object.keys(er).length) return
    setSt({ s: 'idle' })
    if (API) fetch(`${API}/api/enquiries`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...d, skip_email: true }) }).catch(e => console.warn('[CreavixWorld] could not save enquiry copy to backend', e)) // copy for the admin dashboard
    await sendFs(e) // Formspree (React SDK) sends the form
  }
  const field = (k: string, label: string, props: object = {}, cls = '') => <label className={cls}>{label}<input name={k} {...props} aria-invalid={!!errs[k]} />{errs[k] && <span className="er" role="alert">{errs[k]}</span>}<ValidationError field={k} errors={fs.errors} className="er" /></label>
  const big = projects.filter(p => p.big), small = projects.filter(p => !p.big)
  const hl: ReactNode[] = ['HEY, I’M SAMPATH.', <>I BUILD <span className="ac">DIGITAL</span></>, <span className="ac">EXPERIENCES.</span>]

  return <>
    <a href="#home" className="pill" style={{ position: 'fixed', left: -999, zIndex: 99 }} onFocus={e => (e.currentTarget.style.left = '12px')}>Skip to content</a>
    <AnimatePresence>{intro && <Loader done={finish} />}</AnimatePresence>
    {dbg && /debug/.test(location.search) && <div style={{ position: 'fixed', left: 10, top: 70, zIndex: 99, background: '#11121A', color: '#fff', padding: '8px 12px', borderRadius: 8, font: '12px monospace' }}>{dbg}</div>}<Chatbot /><Glow /><div className="prog" ref={progRef} /><button className="wa-f" onClick={openWA} aria-label="Chat on WhatsApp"><Brand i={siWhatsapp} /></button>
    <div ref={dot} className={`cd ${cur}`} aria-hidden><span>{cur === 'v' ? 'VIEW PROJECT ↗' : ''}</span></div>
    <nav className={scrolled ? 's' : ''} aria-label="Main">
      <a href="#home" onClick={e => { e.preventDefault(); go('home') }} aria-label="CreavixWorld home"><Logo /></a>
      <div className="links">{NAV.slice(0, 4).map(i => <a key={i} href={'#' + i} className={active === i ? 'on' : ''} onMouseEnter={hover} onClick={e => { e.preventDefault(); go(i) }}>{i.toUpperCase()}</a>)}</div>
      <div className="r">
        <button onClick={toggleSound} aria-pressed={snd} aria-label={snd ? 'Mute sound' : 'Enable sound'}>{snd ? <Volume2 size={18} /> : <VolumeX size={18} />}</button>
        <a className="pill" href="#contact" onMouseEnter={hover} onClick={e => { e.preventDefault(); go('contact') }}>LET’S TALK ↗</a>
        <button onClick={() => { setMenu(true); click() }} aria-label="Open menu"><Menu size={22} /></button>
      </div>
    </nav>
    <AnimatePresence>{menu && <motion.div className="ov" role="dialog" aria-modal="true" aria-label="Menu" initial={{ clipPath: 'inset(0 0 100% 0)' }} animate={{ clipPath: 'inset(0 0 0% 0)' }} exit={{ clipPath: 'inset(0 0 100% 0)' }} transition={{ duration: .6, ease: [.7, 0, .2, 1] }}>
      <button style={{ position: 'absolute', top: 22, right: 24 }} onClick={() => { setMenu(false); click() }} aria-label="Close menu"><X size={26} /></button>
      {NAV.map((i, k) => <motion.a key={i} href={'#' + i} onMouseEnter={hover} onClick={e => { e.preventDefault(); go(i) }} initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: .15 + k * .07 }}><small>0{k + 1}</small>{i.toUpperCase()}</motion.a>)}
    </motion.div>}</AnimatePresence>

    <AnimatePresence>{modal && <motion.div className="mod" role="dialog" aria-modal="true" aria-label={modal.n} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModal(null)}>
      <motion.div className="mc" initial={{ scale: .94, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: .96, opacity: 0 }} onClick={e => e.stopPropagation()}>
        <div className="bar"><b /><b /><b /><span style={{ marginLeft: 10 }}>{modal.url.replace('https://', '')}</span><button style={{ marginLeft: 'auto' }} onClick={() => setModal(null)} aria-label="Close preview"><X size={18} /></button></div>
        <div className="ms"><img src={(modal.shot || `/previews/${modal.s}.png`)} alt={`${modal.n} full preview`} /></div>
        <a className="fill" href={modal.url} target="_blank" rel="noopener noreferrer">OPEN LIVE WEBSITE ↗</a></motion.div></motion.div>}</AnimatePresence>
    <main>
      <section id="home" className="hero w" style={{ padding: '110px clamp(20px,5vw,72px) 0' }} onMouseMove={hero}>
        <div>
          <div className="badge"><i />AVAILABLE FOR WEB DEVELOPMENT PROJECTS</div>
          <h1>{hl.map((l, i) => <motion.span key={i} style={{ display: 'block', overflow: 'hidden' }}><motion.span style={{ display: 'block' }} initial={rm ? false : { y: '110%' }} animate={{ y: 0 }} transition={{ delay: (intro ? 1.6 : .1) + i * .12, duration: .9, ease: [.2, .7, .2, 1] }} className="">{l}</motion.span></motion.span>)}</h1>
          <p>I’m a developer and creator behind CreavixWorld, building modern websites and digital experiences that help businesses stand out in the digital world.</p>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <a className="fill" href="#work" onMouseEnter={hover} onClick={e => { e.preventDefault(); go('work') }}>EXPLORE MY WORK ↘</a>
            <a className="ghost" href="#contact" onMouseEnter={hover} onClick={e => { e.preventDefault(); go('contact') }}>LET’S BUILD SOMETHING ↗</a><a className="ghost" href="#planner" onMouseEnter={hover} onClick={e => { e.preventDefault(); go('planner') }}>✨ PLAN MY WEBSITE WITH AI</a></div><Socials />
        </div>
        <Portrait />
      </section>

      <div className="mq" aria-hidden><div>{[...STACK, ...STACK].map((s, i) => <span key={i}>{s}</span>)}</div></div>
      <section id="work" className="w" style={{ paddingBottom: 0 }}>
        <Reveal><h2>My work.<br />My digital craft.</h2><p className="mu" style={{ marginTop: 16 }}>Five live websites I built.</p></Reveal>
        {big.map((p, i) => <article key={p.n} className={`pj-big ${i % 2 ? 'rev' : ''}`}>
          <Reveal><div className="txt"><span className="tag">FEATURED PROJECT</span><h3>{p.n.toUpperCase()}</h3><p className="mu">{p.cat}</p>
            <p style={{ margin: '16px 0', maxWidth: 480 }}>{p.d}</p><div className="cs">{p.pts?.map(t => <span key={t}>— {t}</span>)}</div>
            <a className="fill" href={p.url} target="_blank" rel="noopener noreferrer" onMouseEnter={hover} onClick={click}>{p.cta}</a></div></Reveal>
          <Reveal d={.15}><Mock p={p} open={setModal} /></Reveal></article>)}
        <div className="small">{small.map((p, i) => <Reveal key={p.n} d={i * .1}><div><Mock p={p} open={setModal} /><h3>{p.n}</h3><span className="tag">{p.cat}</span><p>{p.d}</p>
          <a className="ac" href={p.url} target="_blank" rel="noopener noreferrer" onMouseEnter={hover} onClick={click}>{p.cta}</a></div></Reveal>)}</div>
      </section>

      <section id="services" className="w">
        <Reveal><h2>From ideas<br />to digital reality.</h2></Reveal>
        <div className="sv">{SERVICES.map(([t, d], i) => <button key={t} aria-expanded={open === i} onMouseEnter={hover} onClick={() => { setOpen(open === i ? null : i); click() }}>
          <h3>{t}</h3><AnimatePresence initial={false}>{open === i && <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>{d}</motion.p>}</AnimatePresence></button>)}</div>
      </section>

      <Planner />
      <section id="about" className="w">
        <Reveal><h2>Sampath Devadiga</h2><p className="mu" style={{ marginTop: 12 }}>Developer & Founder of CreavixWorld</p></Reveal>
        <div className="ab"><Reveal><p>I’m a passionate developer focused on building modern, visually engaging, and functional digital experiences.</p>
          <p>From business websites to full-stack applications, I transform ideas into digital products that combine thoughtful design with powerful technology.</p>
          <p>My mission is to help businesses establish a strong digital presence through exceptional website development.</p></Reveal>
          <Reveal d={.1}><BrandOrb /><div className="st" style={{ marginTop: 32 }}>{STACK.map(s => <span key={s}>{s}</span>)}</div><Socials btn /></Reveal></div>
        <div className="pr" ref={prRef}>{STEPS.map(([t, d], i) => <div key={t}><span className="tag">0{i + 1}</span><h3>{t}</h3><p>{d}</p></div>)}</div>
      </section>

      <Reviews />
      <section id="contact" className="w">
        <Reveal><h2>Let’s build<br />something<br /><span className="ac">amazing.</span></h2><p className="d" style={{ marginTop: 24, fontSize: 20 }}>LET’S DISCUSS YOUR WEBSITE PROJECT.</p><Socials btn /></Reveal>
        <form ref={formRef} onSubmit={submit} noValidate aria-label="Contact form">
          <input type="hidden" name="_subject" value="New CreavixWorld enquiry" />
          {field('name', 'Name')}{field('email', 'Email', { type: 'email' })}{field('business', 'Business name')}
          <label>Project type<select name="type"><option>Business website</option><option>Full-stack web app</option><option>E-commerce</option><option>Redesign</option><option>Other</option></select></label>
          <label className="f">Budget range<select name="budget"><option>Not sure yet</option><option>Under ₹25,000</option><option>₹25,000 – ₹75,000</option><option>₹75,000+</option></select></label>
          <label className="f">Message<textarea name="message" rows={5} aria-invalid={!!errs.message} />{errs.message && <span className="er" role="alert">{errs.message}</span>}<ValidationError field="message" errors={fs.errors} className="er" /></label>
          <div className="f" style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <button className="fill" disabled={fs.submitting} onMouseEnter={hover}>{fs.submitting ? 'SENDING…' : 'SEND PROJECT INQUIRY'}</button>
            <button type="button" className="ghost wa" onClick={openWA}><Brand i={siWhatsapp} /> CONTACT VIA WHATSAPP</button></div>
          <AnimatePresence>{fs.succeeded && <motion.div className="msg ac" role="status" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>Message sent. I’ll reply by email.</motion.div>}
            {(st.s === 'err' || !!fs.errors) && <motion.div className="msg er" role="alert" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{st.s === 'err' ? st.m : 'Message could not be sent. Check the fields and try again.'}</motion.div>}</AnimatePresence>
        </form>
      </section>
    </main>

    <footer className="w"><Logo h={96} /><div className="big">CREAVIXWORLD®</div>
      <p className="mu">Building digital experiences for ambitious businesses.</p><button className="fill" style={{ marginTop: 16 }} onClick={openWA}>LET’S DISCUSS YOUR WEBSITE PROJECT ↗</button>
      <div className="fl" style={{ margin: '24px 0' }}>{NAV.map(i => <a key={i} href={'#' + i} onClick={e => { e.preventDefault(); go(i) }}>{i[0].toUpperCase() + i.slice(1)}</a>)}
        </div><Socials />
      <p className="mu" style={{ fontSize: 13 }}>© 2026 CreavixWorld. Crafted with purpose.</p></footer>
  </>
}