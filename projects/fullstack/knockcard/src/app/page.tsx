'use client'

import { useEffect, useRef, useState } from 'react'

// ─── Scroll reveal hook ───────────────────────────────────────────────────────

function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) {
      return
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          obs.unobserve(el)
        }
      },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])

  return { ref, visible }
}

function Reveal({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  const { ref, visible } = useReveal()
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(32px)',
        transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}s, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
      }}
    >
      {children}
    </div>
  )
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 backdrop-blur-xl shadow-[0_1px_0_rgba(0,0,0,0.06)]'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-[1280px] items-center justify-between px-6 py-4">
        {/* Logo */}
        <a href="/" className="flex items-center">
          <img src="/logo.png" alt="KnockCard" className="h-12" />
        </a>

        {/* Desktop nav */}
        <div className="hidden items-center gap-8 md:flex">
          <a
            href="#features"
            className="text-[14px] font-medium text-gray-600 transition-colors hover:text-black"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="text-[14px] font-medium text-gray-600 transition-colors hover:text-black"
          >
            How It Works
          </a>
          <a
            href="#testimonials"
            className="text-[14px] font-medium text-gray-600 transition-colors hover:text-black"
          >
            Customers
          </a>
          <a
            href="#pricing"
            className="text-[14px] font-medium text-gray-600 transition-colors hover:text-black"
          >
            Pricing
          </a>
        </div>

        {/* CTA */}
        <div className="hidden items-center gap-3 md:flex">
          <a
            href="/login"
            className="rounded-full px-4 py-2 text-[14px] font-medium text-gray-700 transition-colors hover:text-black"
          >
            Login
          </a>
          <a
            href="/login"
            className="rounded-lg bg-black px-5 py-2.5 text-[14px] font-medium text-white transition-all hover:bg-gray-800"
          >
            Get started free
          </a>
        </div>

        {/* Mobile menu button */}
        <button
          className="flex h-10 w-10 items-center justify-center rounded-lg md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            {mobileOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="4" y1="7" x2="20" y2="7" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="17" x2="20" y2="17" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-gray-100 bg-white/95 backdrop-blur-xl px-6 py-6 md:hidden">
          <div className="flex flex-col gap-4">
            <a
              href="#features"
              className="text-[15px] font-medium text-gray-700"
              onClick={() => setMobileOpen(false)}
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-[15px] font-medium text-gray-700"
              onClick={() => setMobileOpen(false)}
            >
              How It Works
            </a>
            <a
              href="#testimonials"
              className="text-[15px] font-medium text-gray-700"
              onClick={() => setMobileOpen(false)}
            >
              Customers
            </a>
            <a
              href="#pricing"
              className="text-[15px] font-medium text-gray-700"
              onClick={() => setMobileOpen(false)}
            >
              Pricing
            </a>
            <hr className="border-gray-200" />
            <a href="/login" className="text-[15px] font-medium text-gray-700">
              Login
            </a>
            <a
              href="/login"
              className="rounded-xl bg-black px-5 py-3 text-center text-[15px] font-medium text-white"
            >
              Get started free
            </a>
          </div>
        </div>
      )}
    </nav>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative flex min-h-[100vh] items-center justify-center overflow-hidden">
      {/* Background: static image on mobile, video on desktop */}
      <div
        className="absolute inset-0 bg-cover bg-center md:hidden"
        style={{
          backgroundImage:
            'url(https://www.appsflyer.com/wp-content/uploads/2025/10/background-video-png.avif)',
        }}
      />
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster="https://www.appsflyer.com/wp-content/uploads/2025/10/background-video-png.avif"
        className="absolute inset-0 hidden h-full w-full object-cover md:block"
      >
        <source
          src="https://www.appsflyer.com/wp-content/uploads/2025/10/01-1.mp4"
          type="video/mp4"
        />
      </video>
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-white/10 to-white/70" />

      <div className="relative z-10 mx-auto max-w-[900px] px-6 pt-24 pb-32 text-center">
        <Reveal>
          <p className="mb-6 text-[12px] font-semibold uppercase tracking-[3px] text-gray-500">
            The Modern Networking Platform
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <h1
            className="mx-auto max-w-[800px] text-[clamp(40px,6vw,72px)] font-normal leading-[1.15] tracking-[-0.01em] text-black"
            style={{ fontFamily: '"DM Serif Display", Georgia, serif' }}
          >
            Turn every handshake into a lasting connection
          </h1>
        </Reveal>

        <Reveal delay={0.2}>
          <p className="mx-auto mt-8 max-w-[520px] text-[17px] leading-[1.7] text-gray-500">
            Share your digital business card with a single tap. Capture leads, track engagement, and
            grow your network — all from one beautifully designed profile.
          </p>
        </Reveal>

        <Reveal delay={0.3}>
          <div className="mt-10 flex items-center justify-center gap-4">
            <a
              href="/login"
              className="rounded-xl bg-black px-9 py-4 text-[16px] font-medium text-white transition-all hover:bg-gray-800 hover:shadow-xl hover:shadow-black/10 hover:-translate-y-px"
            >
              Get started free
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

// ─── Trust bar ────────────────────────────────────────────────────────────────

const TRUST_LOGOS = [
  'Salesforce',
  'HubSpot',
  'Stripe',
  'Notion',
  'Linear',
  'Figma',
  'Vercel',
  'Shopify',
]

function TrustBar() {
  return (
    <section className="border-b border-gray-100 bg-white py-12">
      <Reveal>
        <p className="text-center text-[13px] font-medium text-gray-400">
          Trusted by 500+ professionals and counting
        </p>
      </Reveal>
      <Reveal delay={0.1}>
        <div className="mx-auto mt-8 flex max-w-[1000px] flex-wrap items-center justify-center gap-x-12 gap-y-4 px-6">
          {TRUST_LOGOS.map(name => (
            <span
              key={name}
              className="text-[15px] font-bold tracking-tight text-gray-300 transition-colors hover:text-gray-400"
            >
              {name}
            </span>
          ))}
        </div>
      </Reveal>
    </section>
  )
}

// ─── Features tabs ────────────────────────────────────────────────────────────

const FEATURE_TABS = [
  {
    id: 'profiles',
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect width="18" height="18" x="3" y="3" rx="2" />
        <circle cx="12" cy="10" r="3" />
        <path d="M7 21v-2a4 4 0 014-4h2a4 4 0 014 4v2" />
      </svg>
    ),
    label: 'NFC Profiles',
    title: 'Beautiful digital profiles that leave an impression',
    desc: 'Design stunning profiles with custom themes, sections, and media. Every detail is crafted to represent your brand — from cover photos to social links, everything adapts to your identity.',
    features: [
      'Custom themes & branding',
      'Drag-and-drop sections',
      'Social links & galleries',
      'Dark & light modes',
    ],
  },
  {
    id: 'analytics',
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 3v18h18" />
        <path d="M18 17V9" />
        <path d="M13 17V5" />
        <path d="M8 17v-3" />
      </svg>
    ),
    label: 'Analytics',
    title: 'Measure every scan, click, and connection',
    desc: 'See who is viewing your profile, where they come from, and what they engage with. Real-time dashboards give you the insights to optimize your networking strategy.',
    features: [
      'Profile view tracking',
      'Click-through analytics',
      'Geographic insights',
      'Device breakdown',
    ],
  },
  {
    id: 'leads',
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <line x1="19" y1="8" x2="19" y2="14" />
        <line x1="22" y1="11" x2="16" y2="11" />
      </svg>
    ),
    label: 'Lead Capture',
    title: 'Never lose a contact again',
    desc: 'Built-in exchange forms let visitors share their info directly from your profile. Every lead is captured, organized, and ready for follow-up — no manual entry required.',
    features: [
      'Contact exchange forms',
      'Automatic vCard export',
      'Lead notifications',
      'CSV export',
    ],
  },
  {
    id: 'teams',
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
    label: 'Team Management',
    title: 'Scale networking across your entire team',
    desc: 'Equip your sales force, realtors, or agency team with consistent, branded digital cards. Manage templates, track performance, and maintain brand consistency at scale.',
    features: ['Branded templates', 'Team dashboard', 'Role-based access', 'Centralized analytics'],
  },
]

function Features() {
  const [activeTab, setActiveTab] = useState(0)

  return (
    <section id="features" className="bg-white py-28">
      <div className="mx-auto max-w-[1280px] px-6">
        <Reveal>
          <h2
            className="mx-auto max-w-[600px] text-center text-[clamp(28px,4vw,48px)] font-bold leading-[1.1] tracking-[-0.02em] text-black"
            style={{ fontFamily: '"DM Serif Display", Georgia, serif' }}
          >
            Everything you need to stand out.{' '}
            <span className="text-gray-300">All in one place.</span>
          </h2>
        </Reveal>

        {/* Tabs */}
        <Reveal delay={0.1}>
          <div className="mx-auto mt-14 flex max-w-[800px] flex-wrap items-center justify-center gap-2">
            {FEATURE_TABS.map((tab, i) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(i)}
                className={`flex items-center gap-2.5 rounded-xl px-5 py-2.5 text-[14px] font-medium transition-all ${
                  activeTab === i
                    ? 'bg-black text-white shadow-lg shadow-black/10'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </Reveal>

        {/* Active tab content */}
        <div className="mt-16">
          {FEATURE_TABS.map((tab, i) => (
            <div
              key={tab.id}
              className={`transition-all duration-500 ${activeTab === i ? 'block' : 'hidden'}`}
            >
              <div className="mx-auto grid max-w-[1100px] items-center gap-16 lg:grid-cols-2">
                {/* Text */}
                <div>
                  <h3 className="text-[clamp(24px,3vw,36px)] font-bold leading-[1.15] tracking-[-0.02em] text-black">
                    {tab.title}
                  </h3>
                  <p className="mt-5 text-[16px] leading-[1.7] text-gray-500">{tab.desc}</p>
                  <ul className="mt-8 space-y-3">
                    {tab.features.map(f => (
                      <li key={f} className="flex items-center gap-3 text-[14px] text-gray-600">
                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50">
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Mock UI card */}
                <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-1 shadow-xl shadow-gray-200/50">
                  <div className="overflow-hidden rounded-xl bg-white">
                    <div className="h-3 border-b border-gray-100 bg-gray-50 flex items-center gap-1.5 px-3">
                      <div className="h-1.5 w-1.5 rounded-full bg-gray-200" />
                      <div className="h-1.5 w-1.5 rounded-full bg-gray-200" />
                      <div className="h-1.5 w-1.5 rounded-full bg-gray-200" />
                    </div>
                    <div className="p-8">
                      {/* Mock content based on tab */}
                      {i === 0 && <MockProfile />}
                      {i === 1 && <MockAnalytics />}
                      {i === 2 && <MockLeads />}
                      {i === 3 && <MockTeam />}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function MockProfile() {
  return (
    <div className="space-y-4">
      <div className="h-24 rounded-xl bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400" />
      <div className="-mt-8 ml-4 flex items-end gap-3">
        <div className="h-14 w-14 rounded-xl border-4 border-white bg-gradient-to-br from-indigo-500 to-purple-600 shadow" />
        <div>
          <div className="h-3 w-24 rounded bg-gray-200" />
          <div className="mt-1 h-2 w-16 rounded bg-gray-100" />
        </div>
      </div>
      <div className="space-y-2 pt-2">
        <div className="h-2 w-full rounded bg-gray-100" />
        <div className="h-2 w-3/4 rounded bg-gray-100" />
      </div>
      <div className="flex gap-2 pt-2">
        {['bg-blue-100', 'bg-pink-100', 'bg-green-100', 'bg-amber-100'].map((c, j) => (
          <div key={j} className={`h-8 w-8 rounded-lg ${c}`} />
        ))}
      </div>
    </div>
  )
}

function MockAnalytics() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Views', val: '2.4K', change: '+18%' },
          { label: 'Saves', val: '342', change: '+24%' },
          { label: 'Clicks', val: '1.1K', change: '+12%' },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-gray-100 p-3">
            <p className="text-[10px] text-gray-400">{s.label}</p>
            <p className="mt-1 text-lg font-bold text-gray-900">{s.val}</p>
            <span className="text-[10px] font-medium text-emerald-500">{s.change}</span>
          </div>
        ))}
      </div>
      <div className="flex items-end gap-1.5 pt-2">
        {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, j) => (
          <div
            key={j}
            className="flex-1 rounded-t bg-gradient-to-t from-indigo-400 to-purple-300"
            style={{ height: h }}
          />
        ))}
      </div>
    </div>
  )
}

function MockLeads() {
  return (
    <div className="space-y-3">
      {[
        { name: 'Sarah Chen', role: 'VP Sales, Acme Inc', time: '2m ago' },
        { name: 'Mark Rodriguez', role: 'Founder, StartupXYZ', time: '15m ago' },
        { name: 'Lisa Park', role: 'Realtor, RE/MAX', time: '1h ago' },
        { name: 'James Wu', role: 'Director, TechCorp', time: '3h ago' },
      ].map(l => (
        <div key={l.name} className="flex items-center gap-3 rounded-xl border border-gray-100 p-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-[11px] font-bold text-white">
            {l.name
              .split(' ')
              .map(n => n[0])
              .join('')}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-medium text-gray-900">{l.name}</p>
            <p className="text-[11px] text-gray-400">{l.role}</p>
          </div>
          <span className="text-[10px] text-gray-300">{l.time}</span>
        </div>
      ))}
    </div>
  )
}

function MockTeam() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-3 w-20 rounded bg-gray-200" />
        <div className="flex -space-x-2">
          {[
            'from-blue-400 to-cyan-400',
            'from-pink-400 to-rose-400',
            'from-amber-400 to-orange-400',
            'from-emerald-400 to-teal-400',
          ].map((g, j) => (
            <div
              key={j}
              className={`h-7 w-7 rounded-full border-2 border-white bg-gradient-to-br ${g}`}
            />
          ))}
          <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-[9px] font-bold text-gray-500">
            +8
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[
          { name: 'Sales Team', count: '12 members', color: 'border-blue-200 bg-blue-50' },
          { name: 'Realtors', count: '8 members', color: 'border-emerald-200 bg-emerald-50' },
          { name: 'Marketing', count: '6 members', color: 'border-purple-200 bg-purple-50' },
          { name: 'Executives', count: '4 members', color: 'border-amber-200 bg-amber-50' },
        ].map(t => (
          <div key={t.name} className={`rounded-xl border p-3 ${t.color}`}>
            <p className="text-[12px] font-semibold text-gray-800">{t.name}</p>
            <p className="mt-0.5 text-[10px] text-gray-500">{t.count}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── How it works (alternating sections) ──────────────────────────────────────

const HOW_SECTIONS = [
  {
    tag: 'Step 01',
    title: 'One tap, infinite possibilities',
    desc: 'Replace stacks of paper cards with a single NFC-enabled profile. Tap your card or share a QR code — your contact instantly has your full digital presence. No app required, works on any smartphone.',
    callout:
      'NFC technology means zero friction. Your new contact gets your profile instantly — no typing, no searching, no forgotten cards in desk drawers.',
    mockType: 'tap' as const,
  },
  {
    tag: 'Step 02',
    title: 'Know exactly who is engaging',
    desc: 'Every profile view, button click, and contact save is tracked in real time. Understand which connections are most engaged and prioritize your follow-ups with data, not guesswork.',
    callout:
      'AI-powered insights surface your hottest leads automatically, so you never miss a high-value connection window.',
    mockType: 'engage' as const,
  },
  {
    tag: 'Step 03',
    title: 'Capture every lead, effortlessly',
    desc: 'Built-in exchange forms let visitors share their contact details directly from your profile. Every lead is automatically captured, organized, and exportable — turning casual meetings into pipeline.',
    callout:
      'Two-way contact exchange means both parties walk away with each other\'s details. No more "I\'ll send you my info" that never happens.',
    mockType: 'capture' as const,
  },
]

function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-[#fafafa] py-28">
      <div className="mx-auto max-w-[1280px] px-6">
        <Reveal>
          <h2
            className="mx-auto max-w-[700px] text-center text-[clamp(28px,4vw,48px)] font-bold leading-[1.1] tracking-[-0.02em] text-black"
            style={{ fontFamily: '"DM Serif Display", Georgia, serif' }}
          >
            Clarity for every team.{' '}
            <span className="text-gray-300">Confidence in every connection.</span>
          </h2>
        </Reveal>

        <div className="mt-24 space-y-32">
          {HOW_SECTIONS.map((section, i) => (
            <div
              key={section.tag}
              className={`grid items-center gap-16 lg:grid-cols-2 ${
                i % 2 === 1 ? 'lg:direction-rtl' : ''
              }`}
              style={{ direction: i % 2 === 1 ? 'rtl' : 'ltr' }}
            >
              {/* Text */}
              <div style={{ direction: 'ltr' }}>
                <Reveal>
                  <p className="text-[12px] font-semibold uppercase tracking-[3px] text-gray-400">
                    {section.tag}
                  </p>
                  <h3 className="mt-4 text-[clamp(24px,3vw,40px)] font-bold leading-[1.1] tracking-[-0.02em] text-black">
                    {section.title}
                  </h3>
                  <p className="mt-5 text-[16px] leading-[1.7] text-gray-500">{section.desc}</p>
                </Reveal>

                <Reveal delay={0.15}>
                  <div className="mt-8 rounded-2xl bg-[#111] p-5">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white/10">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#a78bfa"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M12 3l1.912 5.813a2 2 0 001.272 1.272L21 12l-5.813 1.912a2 2 0 00-1.272 1.272L12 21l-1.912-5.813a2 2 0 00-1.272-1.272L3 12l5.813-1.912a2 2 0 001.272-1.272L12 3z" />
                        </svg>
                      </div>
                      <p className="text-[14px] leading-[1.6] text-gray-300">{section.callout}</p>
                    </div>
                  </div>
                </Reveal>
              </div>

              {/* Visual */}
              <Reveal delay={0.1}>
                <div style={{ direction: 'ltr' }}>
                  <HowMock type={section.mockType} />
                </div>
              </Reveal>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function HowMock({ type }: { type: 'tap' | 'engage' | 'capture' }) {
  if (type === 'tap') {
    return (
      <div className="relative mx-auto w-[280px]">
        <div className="overflow-hidden rounded-[32px] border-[6px] border-gray-900 bg-white shadow-2xl">
          <div className="relative flex justify-center bg-gray-900 py-1">
            <div className="h-4 w-20 rounded-full bg-gray-800" />
          </div>
          <div className="p-4">
            <div className="h-28 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500" />
            <div className="-mt-6 ml-3 flex items-end gap-2">
              <div className="h-12 w-12 rounded-xl border-4 border-white bg-gradient-to-br from-indigo-600 to-purple-700 shadow-lg" />
              <div className="pb-1">
                <div className="h-2.5 w-20 rounded bg-gray-200" />
                <div className="mt-1 h-2 w-14 rounded bg-gray-100" />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="h-2 w-full rounded bg-gray-100" />
              <div className="h-2 w-2/3 rounded bg-gray-100" />
            </div>
            <div className="mt-4 flex gap-2">
              <div className="flex-1 rounded-xl bg-black py-2.5 text-center text-[10px] font-medium text-white">
                Save contact
              </div>
              <div className="flex-1 rounded-xl bg-black py-2.5 text-center text-[10px] font-medium text-white">
                Exchange
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {['Phone', 'Email', 'Website'].map(l => (
                <div key={l} className="flex items-center gap-2 rounded-lg bg-gray-50 p-2">
                  <div className="h-6 w-6 rounded-md bg-gray-200" />
                  <div>
                    <div className="h-2 w-12 rounded bg-gray-200" />
                    <div className="mt-1 h-1.5 w-20 rounded bg-gray-100" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* NFC ripple */}
        <div className="absolute -right-8 -top-4 flex h-20 w-20 items-center justify-center">
          <div className="absolute h-20 w-20 animate-ping rounded-full bg-indigo-400/10" />
          <div
            className="absolute h-14 w-14 animate-ping rounded-full bg-indigo-400/20"
            style={{ animationDelay: '0.3s' }}
          />
          <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500 shadow-lg shadow-indigo-500/30">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M6 8.32a7.43 7.43 0 0 1 0 7.36" />
              <path d="M9.46 6.21a11.76 11.76 0 0 1 0 11.58" />
              <path d="M12.91 4.1a15.91 15.91 0 0 1 .01 15.8" />
              <path d="M16.37 2a20.16 20.16 0 0 1 0 20" />
            </svg>
          </div>
        </div>
      </div>
    )
  }

  if (type === 'engage') {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xl shadow-gray-200/50">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-[11px] text-gray-400">Last 30 days</p>
            <p className="text-2xl font-bold text-gray-900">2,847 views</p>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-[12px] font-semibold text-emerald-600">
            +23%
          </span>
        </div>
        <div className="flex items-end gap-1 h-32">
          {[30, 45, 35, 60, 50, 75, 55, 80, 65, 90, 70, 95, 75, 85].map((h, j) => (
            <div
              key={j}
              className="flex-1 rounded-t bg-gradient-to-t from-indigo-500 to-purple-400 transition-all hover:from-indigo-600 hover:to-purple-500"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
        <div className="mt-6 grid grid-cols-3 gap-3">
          {[
            { label: 'Save rate', val: '14.2%', icon: '↑' },
            { label: 'Avg. time', val: '45s', icon: '◷' },
            { label: 'Top source', val: 'NFC', icon: '◉' },
          ].map(s => (
            <div key={s.label} className="rounded-xl bg-gray-50 p-3 text-center">
              <p className="text-[10px] text-gray-400">{s.label}</p>
              <p className="mt-1 text-[16px] font-bold text-gray-900">{s.val}</p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // capture
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xl shadow-gray-200/50">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[14px] font-semibold text-gray-900">Recent Leads</p>
        <span className="rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-semibold text-indigo-600">
          12 new today
        </span>
      </div>
      {[
        { name: 'Alex Thompson', co: 'Tesla', time: 'Just now', hot: true },
        { name: 'Maria Garcia', co: 'Google', time: '5m ago', hot: true },
        { name: 'David Kim', co: 'Apple', time: '22m ago', hot: false },
        { name: 'Emma Wilson', co: 'Meta', time: '1h ago', hot: false },
        { name: 'Ryan Lee', co: 'Netflix', time: '3h ago', hot: false },
      ].map(l => (
        <div key={l.name} className="flex items-center gap-3 border-t border-gray-50 py-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200 text-[11px] font-bold text-gray-500">
            {l.name
              .split(' ')
              .map(n => n[0])
              .join('')}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-[13px] font-medium text-gray-900">{l.name}</p>
              {l.hot && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />}
            </div>
            <p className="text-[11px] text-gray-400">{l.co}</p>
          </div>
          <span className="text-[10px] text-gray-300">{l.time}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Testimonials ─────────────────────────────────────────────────────────────

const TESTIMONIALS = [
  {
    company: 'RE/MAX Pacific',
    stat1: { value: '3x', label: 'more follow-ups from open houses' },
    stat2: { value: '67%', label: 'of leads saved contact within 24h' },
    quote:
      'KnockCard completely changed how our agents connect with potential buyers. The NFC tap is a conversation starter every time.',
    name: 'Jennifer Tran',
    role: 'Managing Broker',
  },
  {
    company: 'Velocity Sales',
    stat1: { value: '52%', label: 'increase in lead capture rate' },
    stat2: { value: '4.2x', label: 'ROI within first quarter' },
    quote:
      'Our sales team loves the analytics. Knowing who viewed your card and when — that is a game changer for timing your outreach.',
    name: 'Marcus Chen',
    role: 'VP of Sales',
  },
  {
    company: 'Studio Nørd',
    stat1: { value: '89%', label: 'of clients save contact on first tap' },
    stat2: { value: '200+', label: 'paper cards eliminated per month' },
    quote:
      'As a design agency, first impressions are everything. KnockCard profiles are gorgeous and perfectly represent our brand.',
    name: 'Elina Korhonen',
    role: 'Creative Director',
  },
  {
    company: 'TechBridge Ventures',
    stat1: { value: '140%', label: 'increase in conference lead capture' },
    stat2: { value: '28s', label: 'average time to exchange contacts' },
    quote:
      'We deployed KnockCard across our entire portfolio. Founders love it — clean, fast, and it actually makes people remember you.',
    name: 'David Park',
    role: 'Partner',
  },
]

function Testimonials() {
  return (
    <section id="testimonials" className="bg-white py-28">
      <div className="mx-auto max-w-[1280px] px-6">
        <Reveal>
          <h2
            className="mx-auto max-w-[700px] text-center text-[clamp(28px,4vw,48px)] font-bold leading-[1.1] tracking-[-0.02em] text-black"
            style={{ fontFamily: '"DM Serif Display", Georgia, serif' }}
          >
            Powering connections for the world&apos;s best teams
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-6 text-center">
            <a
              href="#"
              className="inline-flex items-center gap-2 rounded-xl bg-black px-6 py-3 text-[14px] font-medium text-white transition-all hover:bg-gray-800"
            >
              Explore success stories
            </a>
          </div>
        </Reveal>

        {/* Scrollable cards */}
        <div className="mt-16 -mx-6 px-6">
          <div
            className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
            style={{ scrollbarWidth: 'none' }}
          >
            {TESTIMONIALS.map(t => (
              <div
                key={t.company}
                className="min-w-[320px] max-w-[360px] shrink-0 snap-start rounded-2xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-lg"
              >
                <p className="text-[13px] font-bold tracking-wide text-gray-900">{t.company}</p>

                <div className="mt-5 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[32px] font-bold tracking-tight text-black">
                      {t.stat1.value}
                    </p>
                    <p className="mt-1 text-[11px] leading-tight text-gray-400">{t.stat1.label}</p>
                  </div>
                  <div>
                    <p className="text-[32px] font-bold tracking-tight text-black">
                      {t.stat2.value}
                    </p>
                    <p className="mt-1 text-[11px] leading-tight text-gray-400">{t.stat2.label}</p>
                  </div>
                </div>

                <div className="mt-6 border-t border-gray-100 pt-5">
                  <p className="text-[13px] leading-[1.6] text-gray-500 italic">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-gray-200 to-gray-300 text-[11px] font-bold text-gray-600">
                      {t.name
                        .split(' ')
                        .map(n => n[0])
                        .join('')}
                    </div>
                    <div>
                      <p className="text-[13px] font-medium text-gray-900">{t.name}</p>
                      <p className="text-[11px] text-gray-400">{t.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Pricing ──────────────────────────────────────────────────────────────────

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    desc: 'Perfect for trying out KnockCard',
    features: [
      '1 digital card',
      '3 sections per card',
      '7-day analytics',
      'Basic themes',
      'KnockCard watermark',
    ],
    cta: 'Get started',
    featured: false,
  },
  {
    name: 'Pro',
    price: '$5',
    period: '/month',
    desc: 'For professionals who network seriously',
    features: [
      'Unlimited cards',
      'Unlimited sections',
      'Full analytics & insights',
      'Premium themes',
      'No watermark',
      'Lead capture & CSV export',
      'Custom domain',
    ],
    cta: 'Start free trial',
    featured: true,
  },
  {
    name: 'Team',
    price: '$12',
    period: '/user/month',
    desc: 'For teams that need scale & control',
    features: [
      'Everything in Pro',
      'Team dashboard',
      'Branded templates',
      'Role-based access',
      'Centralized analytics',
      'CRM integrations',
      'Priority support',
    ],
    cta: 'Contact sales',
    featured: false,
  },
]

function Pricing() {
  return (
    <section id="pricing" className="bg-[#fafafa] py-28">
      <div className="mx-auto max-w-[1100px] px-6">
        <Reveal>
          <h2
            className="mx-auto max-w-[600px] text-center text-[clamp(28px,4vw,48px)] font-bold leading-[1.1] tracking-[-0.02em] text-black"
            style={{ fontFamily: '"DM Serif Display", Georgia, serif' }}
          >
            Simple pricing, <span className="text-gray-300">no surprises</span>
          </h2>
          <p className="mx-auto mt-5 max-w-[400px] text-center text-[16px] text-gray-500">
            Start free. Upgrade when you are ready.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-5 md:grid-cols-3">
          {PLANS.map((plan, i) => (
            <Reveal key={plan.name} delay={i * 0.1}>
              <div
                className={`relative rounded-2xl border p-7 transition-shadow hover:shadow-lg ${
                  plan.featured
                    ? 'border-black bg-white shadow-xl shadow-gray-200/50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                {plan.featured && (
                  <span className="absolute -top-3 left-7 rounded-full bg-black px-3 py-1 text-[11px] font-semibold text-white">
                    Most popular
                  </span>
                )}
                <p className="text-[14px] font-semibold text-gray-900">{plan.name}</p>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-[40px] font-bold tracking-tight text-black">
                    {plan.price}
                  </span>
                  <span className="text-[14px] text-gray-400">{plan.period}</span>
                </div>
                <p className="mt-2 text-[14px] text-gray-500">{plan.desc}</p>

                <a
                  href="/login"
                  className={`mt-6 block rounded-xl py-3.5 text-center text-[14px] font-medium transition-all ${
                    plan.featured
                      ? 'bg-black text-white hover:bg-gray-800'
                      : 'border border-gray-200 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {plan.cta}
                </a>

                <ul className="mt-7 space-y-3">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2.5 text-[13px] text-gray-600">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={plan.featured ? '#10b981' : '#d1d5db'}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── CTA Banner ───────────────────────────────────────────────────────────────

function CtaBanner() {
  return (
    <section className="relative overflow-hidden py-28">
      {/* Gradient background matching AppsFlyer's ethereal pastel */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(135deg, #e0e7ff 0%, #f0e6ff 25%, #fce7f3 50%, #e0f2fe 75%, #d1fae5 100%)',
        }}
      />
      <div className="absolute inset-0 bg-white/30" />

      <div className="relative z-10 mx-auto max-w-[800px] px-6 text-center">
        <Reveal>
          <h2
            className="text-[clamp(28px,4.5vw,52px)] font-bold leading-[1.1] tracking-[-0.02em] text-black"
            style={{ fontFamily: '"DM Serif Display", Georgia, serif' }}
          >
            Ready to make every connection count?
          </h2>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <a
              href="/login"
              className="rounded-xl bg-black px-9 py-4 text-[16px] font-medium text-white transition-all hover:bg-gray-800 hover:shadow-xl hover:shadow-black/10 hover:-translate-y-px"
            >
              Get started free
            </a>
            <a
              href="/login"
              className="rounded-xl border border-gray-300 bg-white px-9 py-4 text-[16px] font-medium text-gray-700 transition-all hover:border-gray-500"
            >
              Login
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────

const FOOTER_LINKS = [
  {
    title: 'Product',
    links: ['NFC Profiles', 'Analytics', 'Lead Capture', 'Team Management', 'NFC Cards'],
  },
  {
    title: 'Solutions',
    links: ['For Sales Teams', 'For Realtors', 'For Founders', 'For Agencies', 'For Events'],
  },
  {
    title: 'Resources',
    links: ['Blog', 'Help Center', 'Guides', 'API Docs', 'Status'],
  },
  {
    title: 'Company',
    links: ['About', 'Careers', 'Contact', 'Privacy', 'Terms'],
  },
]

function Footer() {
  return (
    <footer className="bg-[#0a0a0a] pt-20 pb-12">
      <div className="mx-auto max-w-[1280px] px-6">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <div className="flex items-center">
              <img src="/logo.png" alt="KnockCard" className="h-12 brightness-0 invert" />
            </div>
            <p className="mt-4 max-w-[240px] text-[13px] leading-relaxed text-gray-500">
              The modern networking platform. Share your digital identity with a single tap.
            </p>
            {/* Social icons */}
            <div className="mt-6 flex gap-3">
              {['X', 'LI', 'IG', 'YT'].map(s => (
                <div
                  key={s}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-[11px] font-bold text-gray-500 transition-colors hover:bg-white/10 hover:text-gray-400"
                >
                  {s}
                </div>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {FOOTER_LINKS.map(col => (
            <div key={col.title}>
              <p className="text-[12px] font-semibold uppercase tracking-wider text-gray-500">
                {col.title}
              </p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map(link => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-[13px] text-gray-500 transition-colors hover:text-gray-300"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="mt-16 border-t border-white/10 pt-8 flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-[12px] text-gray-600">
            &copy; {new Date().getFullYear()} KnockCard. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-[12px] text-gray-600 hover:text-gray-400">
              Privacy Policy
            </a>
            <a href="#" className="text-[12px] text-gray-600 hover:text-gray-400">
              Terms of Service
            </a>
            <a href="#" className="text-[12px] text-gray-600 hover:text-gray-400">
              Cookies
            </a>
          </div>
        </div>

        {/* Large brand text */}
        <div className="mt-16 text-center">
          <p
            className="text-[clamp(48px,12vw,160px)] font-bold leading-none tracking-tighter text-white/[0.03]"
            style={{ fontFamily: '"DM Serif Display", Georgia, serif' }}
          >
            KnockCard
          </p>
        </div>
      </div>
    </footer>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <>
      {/* Load DM Serif Display for display headings */}
      {/* eslint-disable-next-line */}
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&display=swap"
        rel="stylesheet"
      />
      <style>{`
        html { scroll-behavior: smooth; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>

      <Navbar />
      <Hero />
      <TrustBar />
      <Features />
      <HowItWorks />
      <Testimonials />
      <Pricing />
      <CtaBanner />
      <Footer />
    </>
  )
}
