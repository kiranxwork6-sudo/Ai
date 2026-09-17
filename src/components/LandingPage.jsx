import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap,
  BookOpen,
  CalendarCheck,
  RefreshCw,
  Users,
  Globe,
  MessageSquare,
  Bot,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  TrendingUp,
  Smartphone,
  Shield,
} from 'lucide-react';

/* ─── Brand tokens ─── */
const brand = {
  bg: '#080F0F',
  primary: '#00E676',
  secondary: '#00C56A',
  white: '#FFFFFF',
  text: '#E5E7EB',
  muted: '#6B7280',
  card: '#111919',
  cardBorder: '#1a2626',
};

/* ─── Feature data ─── */
const features = [
  { icon: Zap, title: 'Instant AI Replies', desc: 'Answer customer questions instantly, even outside business hours.' },
  { icon: BookOpen, title: 'Business Knowledge', desc: 'Teach Gereply about your services, prices, hours and FAQs.' },
  { icon: CalendarCheck, title: 'Bookings & Appointments', desc: 'Help customers schedule appointments without waiting for a human.' },
  { icon: RefreshCw, title: 'Automated Follow-ups', desc: 'Keep conversations moving with timely customer follow-ups.' },
  { icon: Users, title: 'Human Handoff', desc: 'Send important conversations to your team whenever human help is needed.' },
  { icon: Globe, title: 'Multilingual Support', desc: 'Communicate with customers in the language they prefer.' },
];

const benefits = [
  { icon: Clock, label: '24/7 Instant Replies' },
  { icon: TrendingUp, label: 'More Leads' },
  { icon: CalendarCheck, label: 'Automated Bookings' },
  { icon: Users, label: 'Human Handoff' },
];

const steps = [
  { num: '01', title: 'Connect WhatsApp', desc: 'Link your WhatsApp Business number to Gereply in just a few clicks.' },
  { num: '02', title: 'Teach Gereply', desc: 'Add your services, FAQs, pricing, and business hours so the AI knows your business.' },
  { num: '03', title: 'Let AI handle conversations', desc: 'Gereply responds to customers instantly — 24/7, in any language.' },
];

const plans = [
  { name: 'Starter', desc: 'For small businesses', features: ['1 WhatsApp number', 'AI replies', 'Business knowledge base', 'Basic analytics'] },
  { name: 'Growth', desc: 'For growing businesses', features: ['Everything in Starter', 'Automated follow-ups', 'Appointment booking', 'Priority support'], popular: true },
  { name: 'Business', desc: 'For teams', features: ['Everything in Growth', 'Multiple team members', 'Advanced analytics', 'Custom integrations'] },
];

const faqs = [
  { q: 'What is Gereply?', a: 'Gereply is an AI-powered receptionist for WhatsApp. It answers customer questions, captures leads, books appointments, and hands off conversations to your team when needed — all automatically.' },
  { q: 'How does Gereply work with WhatsApp?', a: 'Gereply connects to your WhatsApp Business number through the official WhatsApp Cloud API. Once connected, it reads incoming messages and responds intelligently based on your business information.' },
  { q: 'Can I control when AI hands conversations to a human?', a: 'Yes. You can configure handoff rules so the AI transfers conversations to your team based on keywords, topics, or customer requests. You can also manually take over any conversation at any time.' },
  { q: 'Can Gereply answer questions about my business?', a: 'Absolutely. You teach Gereply about your services, pricing, hours, FAQs, and policies. It uses this knowledge to give accurate, helpful answers to your customers.' },
  { q: 'Does Gereply support multiple languages?', a: 'Yes. Gereply can detect the language a customer is using and respond in that language, making it easy to serve a diverse customer base.' },
  { q: 'Can I connect my own WhatsApp number?', a: 'Yes. Gereply works with your own WhatsApp Business number through the official WhatsApp Cloud API. Your customers message your number, and Gereply handles the replies.' },
];

const footerLinks = {
  Product: [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'How it works', href: '#how-it-works' },
  ],
  Company: [
    { label: 'About', href: '#' },
    { label: 'Contact', href: '#' },
  ],
  Legal: [
    { label: 'Privacy', href: '#' },
    { label: 'Terms', href: '#' },
  ],
};

/* ─── Sub-components ─── */

function Logo({ size = 'md' }) {
  const sizes = { sm: 'text-lg', md: 'text-xl', lg: 'text-2xl' };
  return (
    <Link to="/" className="flex items-center gap-2 group">
      <div className="w-8 h-8 rounded-lg bg-[#00E676] flex items-center justify-center">
        <Bot className="w-4.5 h-4.5 text-[#080F0F]" strokeWidth={2.5} />
      </div>
      <span className={`font-extrabold tracking-tight ${sizes[size]}`} style={{ color: brand.white }}>
        Gereply
      </span>
    </Link>
  );
}

function NavLink({ href, children }) {
  return (
    <a
      href={href}
      className="text-sm font-medium transition-colors hover:text-white"
      style={{ color: brand.muted }}
    >
      {children}
    </a>
  );
}

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="border-b transition-colors"
      style={{ borderColor: brand.cardBorder }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-5 text-left"
      >
        <span className="text-base font-semibold pr-4" style={{ color: brand.white }}>{q}</span>
        {open
          ? <ChevronUp className="w-5 h-5 shrink-0" style={{ color: brand.muted }} />
          : <ChevronDown className="w-5 h-5 shrink-0" style={{ color: brand.muted }} />
        }
      </button>
      {open && (
        <p className="pb-5 text-sm leading-relaxed" style={{ color: brand.text }}>
          {a}
        </p>
      )}
    </div>
  );
}

/* ─── Chat mockup ─── */
function DashboardMockup() {
  return (
    <div
      className="rounded-2xl border shadow-2xl shadow-emerald-500/5 overflow-hidden"
      style={{ background: brand.card, borderColor: brand.cardBorder }}
    >
      {/* Title bar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: brand.cardBorder }}>
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-500/80" />
          <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <span className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        <span className="text-xs font-medium ml-2" style={{ color: brand.muted }}>Gereply Dashboard</span>
      </div>

      <div className="p-4 space-y-3">
        {/* Customer message */}
        <div className="flex gap-3 items-start">
          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-blue-400">JD</span>
          </div>
          <div className="rounded-xl px-4 py-2.5 max-w-[260px]" style={{ background: '#1a2626' }}>
            <p className="text-xs font-medium text-blue-400 mb-1">John D.</p>
            <p className="text-sm" style={{ color: brand.text }}>Hi, I'd like to book an appointment for tomorrow afternoon. Do you have availability?</p>
            <p className="text-[10px] mt-1.5" style={{ color: brand.muted }}>2:34 PM</p>
          </div>
        </div>

        {/* AI response */}
        <div className="flex gap-3 items-start justify-end">
          <div className="rounded-xl px-4 py-2.5 max-w-[260px]" style={{ background: '#00E676', color: brand.bg }}>
            <p className="text-xs font-medium mb-1" style={{ color: '#065f46' }}>
              <Bot className="w-3 h-3 inline mr-1" />
              Gereply AI
            </p>
            <p className="text-sm font-medium">Hi John! I'd be happy to help you book an appointment. Tomorrow I have slots at 1:00 PM, 2:30 PM, or 4:00 PM. Which works best for you?</p>
            <p className="text-[10px] mt-1.5" style={{ color: '#065f46' }}>2:34 PM · AI Reply</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#00E676]/20 flex items-center justify-center shrink-0">
            <Bot className="w-4 h-4" style={{ color: brand.primary }} />
          </div>
        </div>

        {/* Booking confirmation */}
        <div className="rounded-xl p-3 border" style={{ background: '#0d1a1a', borderColor: '#1a3333' }}>
          <div className="flex items-center gap-2 mb-2">
            <CalendarCheck className="w-4 h-4" style={{ color: brand.primary }} />
            <span className="text-xs font-bold" style={{ color: brand.primary }}>Appointment Booked</span>
          </div>
          <p className="text-xs" style={{ color: brand.text }}>Tomorrow · 2:30 PM · John D.</p>
        </div>

        {/* Handoff indicator */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#1a1f2e' }}>
          <Shield className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs font-medium text-amber-400">Human handoff available</span>
          <span className="text-[10px] ml-auto" style={{ color: brand.muted }}>Tap to take over</span>
        </div>

        {/* Status row */}
        <div className="flex items-center gap-4 pt-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#00E676] animate-pulse" />
            <span className="text-[10px] font-medium" style={{ color: brand.muted }}>3 active conversations</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <span className="text-[10px] font-medium" style={{ color: brand.muted }}>AI handling</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Landing Page ─── */
export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: brand.bg, color: brand.text }}>

      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 backdrop-blur-md border-b" style={{ background: `${brand.bg}e6`, borderColor: brand.cardBorder }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Logo />
          <nav className="hidden md:flex items-center gap-8">
            <NavLink href="#features">Product</NavLink>
            <NavLink href="#features">Features</NavLink>
            <NavLink href="#pricing">Pricing</NavLink>
            <NavLink href="#faq">FAQ</NavLink>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="hidden sm:inline-flex text-sm font-semibold px-4 py-2 rounded-lg transition-colors hover:text-white"
              style={{ color: brand.muted }}
            >
              Sign in
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-xl transition-all hover:brightness-110 active:scale-[0.98]"
              style={{ background: brand.primary, color: brand.bg }}
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        {/* Subtle glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-15 blur-[120px] pointer-events-none" style={{ background: brand.primary }} />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 lg:pt-28 lg:pb-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left */}
            <div>
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6 border"
                style={{ background: `${brand.primary}12`, color: brand.primary, borderColor: `${brand.primary}25` }}
              >
                <Bot className="w-3.5 h-3.5" />
                AI-powered WhatsApp receptionist
              </div>

              <h1
                className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold leading-[1.1] tracking-tight mb-6"
                style={{ color: brand.white }}
              >
                Your AI Receptionist{' '}
                <span style={{ color: brand.primary }}>for WhatsApp</span>
              </h1>

              <p className="text-lg leading-relaxed mb-8 max-w-lg" style={{ color: brand.text }}>
                Reply instantly, capture leads, book appointments, and follow up with customers — automatically.
              </p>

              <div className="flex flex-wrap gap-3">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-sm font-bold px-6 py-3 rounded-xl transition-all hover:brightness-110 active:scale-[0.98] shadow-lg"
                  style={{ background: brand.primary, color: brand.bg, boxShadow: `0 8px 30px ${brand.primary}30` }}
                >
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-3 rounded-xl border transition-colors hover:border-[#00E676]/40"
                  style={{ borderColor: brand.cardBorder, color: brand.text }}
                >
                  See how it works
                </a>
              </div>
            </div>

            {/* Right — Mockup */}
            <div className="relative">
              <DashboardMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ── Benefit strip ── */}
      <section className="border-y" style={{ borderColor: brand.cardBorder }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {benefits.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${brand.primary}12` }}
                >
                  <Icon className="w-5 h-5" style={{ color: brand.primary }} />
                </div>
                <span className="text-sm font-semibold" style={{ color: brand.white }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-20 lg:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4" style={{ color: brand.white }}>
              Everything your WhatsApp receptionist needs
            </h2>
            <p className="text-base max-w-xl mx-auto" style={{ color: brand.muted }}>
              Powerful features that help you serve customers better, capture more leads, and save time.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="rounded-2xl border p-6 transition-colors hover:border-[#00E676]/30"
                style={{ background: brand.card, borderColor: brand.cardBorder }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${brand.primary}12` }}
                >
                  <Icon className="w-5 h-5" style={{ color: brand.primary }} />
                </div>
                <h3 className="text-base font-bold mb-2" style={{ color: brand.white }}>{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: brand.muted }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="py-20 lg:py-28 border-t" style={{ borderColor: brand.cardBorder }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4" style={{ color: brand.white }}>
              Get started in minutes
            </h2>
            <p className="text-base max-w-xl mx-auto" style={{ color: brand.muted }}>
              Three simple steps to transform your WhatsApp into an AI-powered receptionist.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-10 left-[20%] right-[20%] h-0.5" style={{ background: `linear-gradient(to right, ${brand.primary}40, ${brand.primary}, ${brand.primary}40)` }} />

            {steps.map(({ num, title, desc }) => (
              <div key={num} className="relative text-center">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 text-lg font-extrabold border-2 relative z-10"
                  style={{ background: brand.bg, borderColor: brand.primary, color: brand.primary }}
                >
                  {num}
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: brand.white }}>{title}</h3>
                <p className="text-sm leading-relaxed max-w-xs mx-auto" style={{ color: brand.muted }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Dashboard preview ── */}
      <section className="py-20 lg:py-28 border-t" style={{ borderColor: brand.cardBorder }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4" style={{ color: brand.white }}>
              See what's happening across your WhatsApp
            </h2>
            <p className="text-base max-w-xl mx-auto" style={{ color: brand.muted }}>
              Monitor conversations, track AI responses, and step in when your customers need a human touch.
            </p>
          </div>

          {/* Browser frame */}
          <div
            className="rounded-2xl border overflow-hidden shadow-2xl shadow-emerald-500/5"
            style={{ borderColor: brand.cardBorder }}
          >
            <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ background: '#0d1414', borderColor: brand.cardBorder }}>
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500/80" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <span className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="flex-1 mx-4">
                <div className="rounded-md px-3 py-1 text-xs text-center max-w-xs mx-auto" style={{ background: brand.bg, color: brand.muted }}>
                  app.gereply.com/dashboard
                </div>
              </div>
            </div>
            <div className="p-6 sm:p-8" style={{ background: brand.card }}>
              {/* Simplified dashboard preview */}
              <div className="grid sm:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Active Conversations', value: '12', color: brand.primary },
                  { label: 'AI Responses Today', value: '48', color: '#60a5fa' },
                  { label: 'Appointments Booked', value: '5', color: '#c084fc' },
                  { label: 'Human Handoffs', value: '2', color: '#fbbf24' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="rounded-xl border p-4" style={{ borderColor: brand.cardBorder }}>
                    <p className="text-[10px] font-medium mb-1" style={{ color: brand.muted }}>{label}</p>
                    <p className="text-2xl font-extrabold" style={{ color }}>{value}</p>
                  </div>
                ))}
              </div>

              {/* Conversation list preview */}
              <div className="rounded-xl border" style={{ borderColor: brand.cardBorder }}>
                <div className="px-4 py-3 border-b" style={{ borderColor: brand.cardBorder }}>
                  <p className="text-xs font-bold" style={{ color: brand.white }}>Recent Conversations</p>
                </div>
                {[
                  { name: 'Sarah M.', msg: 'What are your business hours?', status: 'AI Replied', statusColor: brand.primary },
                  { name: 'Ahmed K.', msg: 'I want to book for Friday', status: 'Booked', statusColor: '#c084fc' },
                  { name: 'Lisa R.', msg: 'I need to speak with someone', status: 'Human', statusColor: '#fbbf24' },
                ].map(({ name, msg, status, statusColor }, i) => (
                  <div
                    key={name}
                    className="flex items-center gap-3 px-4 py-3 border-b last:border-0"
                    style={{ borderColor: brand.cardBorder }}
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ background: `${statusColor}20`, color: statusColor }}>
                      {name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate" style={{ color: brand.white }}>{name}</p>
                      <p className="text-[11px] truncate" style={{ color: brand.muted }}>{msg}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0" style={{ background: `${statusColor}15`, color: statusColor }}>
                      {status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-20 lg:py-28 border-t" style={{ borderColor: brand.cardBorder }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4" style={{ color: brand.white }}>
              Simple, transparent pricing
            </h2>
            <p className="text-base max-w-xl mx-auto" style={{ color: brand.muted }}>
              Choose the plan that fits your business. No hidden fees.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {plans.map(({ name, desc, features: f, popular }) => (
              <div
                key={name}
                className={`rounded-2xl border p-6 relative transition-colors ${popular ? 'border-[#00E676]/50' : ''}`}
                style={{ background: brand.card, borderColor: popular ? undefined : brand.cardBorder }}
              >
                {popular && (
                  <span
                    className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold px-3 py-1 rounded-full"
                    style={{ background: brand.primary, color: brand.bg }}
                  >
                    Most Popular
                  </span>
                )}
                <h3 className="text-lg font-bold mb-1" style={{ color: brand.white }}>{name}</h3>
                <p className="text-sm mb-5" style={{ color: brand.muted }}>{desc}</p>
                <p className="text-2xl font-extrabold mb-6" style={{ color: brand.white }}>
                  Coming soon
                </p>
                <ul className="space-y-2.5 mb-6">
                  {f.map(item => (
                    <li key={item} className="flex items-center gap-2 text-sm" style={{ color: brand.text }}>
                      <Check className="w-4 h-4 shrink-0" style={{ color: brand.primary }} />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/login"
                  className={`block w-full text-center text-sm font-bold py-2.5 rounded-xl transition-all hover:brightness-110 ${popular ? '' : 'border'}`}
                  style={popular
                    ? { background: brand.primary, color: brand.bg }
                    : { borderColor: brand.cardBorder, color: brand.text }
                  }
                >
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-20 lg:py-28 border-t" style={{ borderColor: brand.cardBorder }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4" style={{ color: brand.white }}>
              Frequently asked questions
            </h2>
          </div>
          <div>
            {faqs.map(({ q, a }) => (
              <FAQItem key={q} q={q} a={a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-20 lg:py-28 border-t" style={{ borderColor: brand.cardBorder }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4" style={{ color: brand.white }}>
            Ready to make your WhatsApp work 24/7?
          </h2>
          <p className="text-base mb-8 max-w-lg mx-auto" style={{ color: brand.muted }}>
            Let Gereply handle customer conversations while you focus on your business.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm font-bold px-8 py-3.5 rounded-xl transition-all hover:brightness-110 active:scale-[0.98] shadow-lg"
            style={{ background: brand.primary, color: brand.bg, boxShadow: `0 8px 30px ${brand.primary}30` }}
          >
            Get Started
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t py-12" style={{ borderColor: brand.cardBorder }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div>
              <Logo size="sm" />
              <p className="mt-3 text-xs leading-relaxed" style={{ color: brand.muted }}>
                Your AI receptionist for WhatsApp. Turn every message into a customer.
              </p>
            </div>
            {Object.entries(footerLinks).map(([heading, links]) => (
              <div key={heading}>
                <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: brand.muted }}>{heading}</p>
                <ul className="space-y-2">
                  {links.map(({ label, href }) => (
                    <li key={label}>
                      <a href={href} className="text-sm transition-colors hover:text-white" style={{ color: brand.text }}>
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-3" style={{ borderColor: brand.cardBorder }}>
            <p className="text-xs" style={{ color: brand.muted }}>© {new Date().getFullYear()} Gereply. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
