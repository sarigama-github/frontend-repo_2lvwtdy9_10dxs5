import React, { useEffect, useMemo, useRef, useState } from 'react'
import Spline from '@splinetool/react-spline'
import { motion } from 'framer-motion'

const ACCENT = '#a3e635' // lime-400

const sections = [
  { id: 'home', label: 'Home' },
  { id: 'services', label: 'Services' },
  { id: 'portfolio', label: 'Portfolio' },
  { id: 'contact', label: 'Contact' },
]

function useActiveSection(ids) {
  const [active, setActive] = useState(ids[0])
  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) setActive(e.target.id)
        })
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: [0, 0.25, 0.5, 1] }
    )
    ids.forEach(id => {
      const el = document.getElementById(id)
      if (el) obs.observe(el)
    })
    return () => obs.disconnect()
  }, [ids])
  return active
}

const apiBase = import.meta.env.VITE_BACKEND_URL || `${window.location.origin.replace(':3000', ':8000')}`

function Navbar({ active }) {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const onScroll = () => setOpen(false)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <div className="fixed top-0 inset-x-0 z-50">
      <div className="backdrop-blur supports-[backdrop-filter]:bg-black/40 bg-black/70 border-b border-neutral-800">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
          <a href="#home" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md" style={{ background: ACCENT, boxShadow: `0 0 24px ${ACCENT}55` }} />
            <span className="text-white font-semibold tracking-wide">DDDzn</span>
          </a>
          <button className="lg:hidden text-neutral-200" onClick={() => setOpen(v => !v)} aria-label="Open menu">☰</button>
          <nav className={`$${open ? '' : 'hidden'} lg:block`}>
            <ul className="flex flex-col lg:flex-row gap-2 lg:gap-6">
              {sections.map(s => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      active === s.id ? 'text-black' : 'text-neutral-300 hover:text-white'
                    }`}
                    style={active === s.id ? { background: ACCENT, boxShadow: `0 0 18px ${ACCENT}55` } : {}}
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </div>
  )
}

function GlowingHeadline({ children }) {
  return (
    <motion.h1
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white"
      style={{ textShadow: `0 0 24px ${ACCENT}55, 0 0 60px ${ACCENT}22` }}
    >
      {children}
    </motion.h1>
  )
}

function Hero() {
  return (
    <section id="home" className="relative min-h-[90vh] w-full overflow-hidden bg-black">
      <div className="absolute inset-0">
        <Spline scene="https://prod.spline.design/Gt5HUob8aGDxOUep/scene.splinecode" style={{ width: '100%', height: '100%' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/60 to-black" />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-36 pb-24 grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <GlowingHeadline>
            Dreamscape, Development, & Designs
          </GlowingHeadline>
          <p className="mt-5 text-neutral-300 text-lg">
            High-fidelity 3D modeling and cinematic visualization for brands that want future-forward presence.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a href="#services" className="px-6 py-3 rounded-lg font-semibold" style={{ background: ACCENT, color: '#000', boxShadow: `0 0 24px ${ACCENT}55` }}>Explore Services</a>
            <a href="#contact" className="px-6 py-3 rounded-lg font-semibold border border-neutral-700 text-white hover:border-neutral-500 transition">Start a Project</a>
          </div>
        </div>
        <div className="hidden lg:block">
          <StatsPanel />
        </div>
      </div>
    </section>
  )
}

function Stat({ value, label }) {
  return (
    <div className="p-5 rounded-xl border border-neutral-800 bg-black/50">
      <div className="text-3xl font-bold text-white">{value}</div>
      <div className="text-neutral-400 text-sm mt-1">{label}</div>
    </div>
  )
}

function StatsPanel() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="grid grid-cols-2 gap-4">
      <Stat value="250+" label="Projects Delivered" />
      <Stat value="40%" label="Avg. Faster Approvals" />
      <Stat value="4K/8K" label="Render Ready" />
      <Stat value="24/7" label="Priority Support" />
    </motion.div>
  )
}

const PLANS = [
  { id: 'exterior', name: 'Exterior Design', price: '$499+', desc: 'Architectural exteriors, materials, lighting, and rapid turnarounds.' },
  { id: 'full-design', name: 'Full Design Package', price: '$2,499+', desc: 'Concept-to-final: modeling, texturing, lighting, and deliverables.' },
  { id: 'full-visualization', name: 'Full Visualization', price: '$3,999+', desc: 'Cinematic shots, animations, and multi-platform exports.' },
]

async function createCheckoutSession(pkg, email) {
  const res = await fetch(`${apiBase}/api/create-checkout-session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ package: pkg, email }),
  })
  if (!res.ok) throw new Error((await res.json()).detail || 'Failed to start checkout')
  const data = await res.json()
  if (data.url) window.location.href = data.url
}

function Services() {
  const [loading, setLoading] = useState('')
  const emailRef = useRef(null)
  return (
    <section id="services" className="relative bg-black py-24">
      <div className="max-w-7xl mx-auto px-4">
        <motion.h2 initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-3xl sm:text-4xl font-bold text-white">Services & Packages</motion.h2>
        <p className="mt-2 text-neutral-400">Choose a package to begin. You can also request a custom quote in Contact.</p>
        <div className="mt-10 grid md:grid-cols-3 gap-6">
          {PLANS.map(p => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }} className="rounded-2xl border border-neutral-800 bg-gradient-to-b from-neutral-900 to-black p-6">
              <div className="text-white text-xl font-semibold">{p.name}</div>
              <div className="mt-2 text-neutral-400 min-h-[48px]">{p.desc}</div>
              <div className="mt-6 text-3xl font-extrabold" style={{ color: ACCENT }}>{p.price}</div>
              <div className="mt-6">
                <input ref={emailRef} type="email" placeholder="Email for receipt (optional)" className="w-full bg-black/60 border border-neutral-800 rounded-md px-3 py-2 text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-neutral-600" />
              </div>
              <button
                onClick={async () => {
                  try {
                    setLoading(p.id)
                    await createCheckoutSession(p.id, emailRef.current?.value || undefined)
                  } catch (e) {
                    alert(e.message)
                  } finally {
                    setLoading('')
                  }
                }}
                className="mt-4 w-full px-4 py-3 rounded-lg font-semibold disabled:opacity-60"
                style={{ background: ACCENT, color: '#000', boxShadow: `0 0 20px ${ACCENT}55` }}
                disabled={loading === p.id}
              >
                {loading === p.id ? 'Processing…' : 'Buy Now'}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Portfolio() {
  const items = new Array(6).fill(0).map((_, i) => ({ id: i + 1 }))
  return (
    <section id="portfolio" className="bg-black py-24">
      <div className="max-w-7xl mx-auto px-4">
        <motion.h2 initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-3xl sm:text-4xl font-bold text-white">Portfolio</motion.h2>
        <p className="mt-2 text-neutral-400">A glimpse into recent visualization work. Replace with live projects.</p>
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(card => (
            <motion.div key={card.id} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.4 }} className="group relative overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950">
              <div className="aspect-[4/3] bg-gradient-to-br from-neutral-800 to-neutral-900" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: `radial-gradient(600px circle at var(--x,50%) var(--y,50%), ${ACCENT}22, transparent 40%)` }} />
              <div className="p-4">
                <div className="text-white font-semibold">Project {card.id}</div>
                <div className="text-neutral-400 text-sm">High-poly, PBR materials, raytraced lighting</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Contact() {
  const [status, setStatus] = useState('')
  const [form, setForm] = useState({ name: '', email: '', company: '', service: '', budget: '', phone: '', message: '' })
  async function submit(e) {
    e.preventDefault()
    setStatus('Sending…')
    try {
      const res = await fetch(`${apiBase}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error((await res.json()).detail || 'Failed to send')
      setStatus('Thanks! We will reach out shortly.')
      setForm({ name: '', email: '', company: '', service: '', budget: '', phone: '', message: '' })
    } catch (e) {
      setStatus(e.message)
    }
  }
  return (
    <section id="contact" className="bg-black py-24">
      <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-10">
        <div>
          <motion.h2 initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-3xl sm:text-4xl font-bold text-white">Contact</motion.h2>
          <p className="mt-2 text-neutral-400">Tell us about your project or ask anything. For highly technical details, the assistant will direct you to email.</p>
          <div className="mt-6 space-y-3 text-neutral-300">
            <div>Email: <a href="mailto:hello@dddzn.studio" className="underline" style={{ color: ACCENT }}>hello@dddzn.studio</a></div>
            <div>Availability: Mon–Fri, 9am–6pm (UTC)</div>
          </div>
          <Assistant />
        </div>
        <form onSubmit={submit} className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Name" value={form.name} onChange={v => setForm({ ...form, name: v })} required />
            <Input label="Email" type="email" value={form.email} onChange={v => setForm({ ...form, email: v })} required />
            <Input label="Company" value={form.company} onChange={v => setForm({ ...form, company: v })} />
            <Input label="Service" value={form.service} onChange={v => setForm({ ...form, service: v })} placeholder="Exterior / Full / Visualization" />
            <Input label="Budget" value={form.budget} onChange={v => setForm({ ...form, budget: v })} />
            <Input label="Phone" value={form.phone} onChange={v => setForm({ ...form, phone: v })} />
          </div>
          <div className="mt-4">
            <Label>Message</Label>
            <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} className="mt-2 w-full h-28 bg-black/60 border border-neutral-800 rounded-md px-3 py-2 text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-neutral-600" placeholder="Describe your goals, timeline, and references" />
          </div>
          <button type="submit" className="mt-5 w-full px-4 py-3 rounded-lg font-semibold" style={{ background: ACCENT, color: '#000', boxShadow: `0 0 20px ${ACCENT}55` }}>
            Send Message
          </button>
          {status && <div className="mt-3 text-sm text-neutral-300">{status}</div>}
        </form>
      </div>
    </section>
  )
}

function Input({ label, onChange, value, type = 'text', placeholder, required }) {
  return (
    <label className="block">
      <Label>{label}{required ? ' *' : ''}</Label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="mt-2 w-full bg-black/60 border border-neutral-800 rounded-md px-3 py-2 text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-neutral-600"
      />
    </label>
  )
}

function Label({ children }) {
  return <span className="text-xs uppercase tracking-wider text-neutral-400">{children}</span>
}

function Assistant() {
  const [q, setQ] = useState('')
  const [email, setEmail] = useState('')
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)

  async function ask() {
    if (!q.trim()) return
    setLoading(true)
    setAnswer('')
    try {
      const res = await fetch(`${apiBase}/api/assistant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, email: email || undefined }),
      })
      const data = await res.json()
      setAnswer(data.answer || 'I did not catch that.')
    } catch (e) {
      setAnswer('There was an error. Please email us at hello@dddzn.studio')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-10 rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
      <div className="text-white font-semibold">AI Assistant</div>
      <div className="text-neutral-400 text-sm">Ask quick questions. For advanced topics, we’ll direct you to email.</div>
      <div className="mt-3 grid sm:grid-cols-[1fr_auto] gap-2">
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Ask about services, pricing, timelines…" className="w-full bg-black/60 border border-neutral-800 rounded-md px-3 py-2 text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-neutral-600" />
        <button onClick={ask} disabled={loading} className="px-4 py-2 rounded-md font-semibold disabled:opacity-60" style={{ background: ACCENT, color: '#000' }}>{loading ? 'Thinking…' : 'Ask'}</button>
      </div>
      <div className="mt-2 grid sm:grid-cols-2 gap-2">
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Your email (optional)" className="w-full bg-black/60 border border-neutral-800 rounded-md px-3 py-2 text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-neutral-600" />
      </div>
      {answer && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-neutral-200">
          {answer}
        </motion.div>
      )}
    </div>
  )
}

function Footer() {
  return (
    <footer className="bg-black border-t border-neutral-900">
      <div className="max-w-7xl mx-auto px-4 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-neutral-400 text-sm">© {new Date().getFullYear()} DDDzn — Dreamscape, Development, & Designs</div>
        <a href="#home" className="px-4 py-2 rounded-md text-sm font-semibold" style={{ background: ACCENT, color: '#000' }}>Back to top</a>
      </div>
    </footer>
  )
}

export default function App() {
  const active = useActiveSection(sections.map(s => s.id))
  useEffect(() => {
    const cards = document.querySelectorAll('#portfolio .group')
    cards.forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect()
        card.style.setProperty('--x', `${e.clientX - rect.left}px`)
        card.style.setProperty('--y', `${e.clientY - rect.top}px`)
      })
    })
  }, [])

  return (
    <div className="min-h-screen bg-black">
      <Navbar active={active} />
      <Hero />
      <Services />
      <Portfolio />
      <Contact />
      <Footer />
    </div>
  )
}
