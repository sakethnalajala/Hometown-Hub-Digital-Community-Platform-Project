import {
  Users, Briefcase, Calendar, Map, Newspaper, GraduationCap,
  ShoppingBag, Landmark, HeartPulse, Sprout, Building2, LayoutDashboard,
  type LucideIcon,
} from 'lucide-react'

/**
 * Central portal theme registry — the single source of truth for every
 * portal's visual identity. Each portal gets a unique palette so modules
 * feel distinct while sharing one design language.
 *
 * `gradient`    — tailwind classes for hero/CTA backgrounds (from/via/to)
 * `accent`      — hex used for inline styles, glows and SVG fills
 * `text`/`bg`/`border`/`ring` — tailwind utility classes for the accent
 * `glow`        — rgba shadow used on hover/active states
 * `softBg`      — subtle tinted surface for cards in this theme
 */
export interface PortalTheme {
  key: string
  label: string
  href: string
  description: string
  icon: LucideIcon
  gradient: string
  accent: string
  text: string
  bg: string
  border: string
  ring: string
  glow: string
  softBg: string
}

export const PORTAL_THEMES: Record<string, PortalTheme> = {
  dashboard: {
    key: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    description: 'Your hometown at a glance',
    icon: LayoutDashboard,
    gradient: 'from-violet-600 via-indigo-600 to-blue-600',
    accent: '#8b5cf6',
    text: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/30',
    ring: 'ring-violet-500/30',
    glow: 'rgba(139,92,246,0.35)',
    softBg: 'from-violet-500/15 to-indigo-500/5',
  },
  communities: {
    key: 'communities',
    label: 'Communities',
    href: '/communities',
    description: 'Find your people, build your tribe',
    icon: Users,
    gradient: 'from-purple-600 via-violet-600 to-indigo-600',
    accent: '#a855f7',
    text: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    ring: 'ring-purple-500/30',
    glow: 'rgba(168,85,247,0.35)',
    softBg: 'from-purple-500/15 to-indigo-500/5',
  },
  jobs: {
    key: 'jobs',
    label: 'Jobs',
    href: '/jobs',
    description: 'Careers close to home',
    icon: Briefcase,
    gradient: 'from-blue-600 via-sky-500 to-cyan-500',
    accent: '#3b82f6',
    text: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    ring: 'ring-blue-500/30',
    glow: 'rgba(59,130,246,0.35)',
    softBg: 'from-blue-500/15 to-cyan-500/5',
  },
  events: {
    key: 'events',
    label: 'Events',
    href: '/events',
    description: 'Gatherings, meetups & celebrations',
    icon: Calendar,
    gradient: 'from-orange-500 via-amber-500 to-yellow-500',
    accent: '#f97316',
    text: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    ring: 'ring-orange-500/30',
    glow: 'rgba(249,115,22,0.35)',
    softBg: 'from-orange-500/15 to-amber-500/5',
  },
  tourism: {
    key: 'tourism',
    label: 'Tourism',
    href: '/tourism',
    description: 'Explore the places around you',
    icon: Map,
    gradient: 'from-green-600 via-emerald-500 to-teal-500',
    accent: '#22c55e',
    text: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    ring: 'ring-emerald-500/30',
    glow: 'rgba(16,185,129,0.35)',
    softBg: 'from-emerald-500/15 to-teal-500/5',
  },
  news: {
    key: 'news',
    label: 'Local News',
    href: '/news',
    description: 'What’s happening right now',
    icon: Newspaper,
    gradient: 'from-red-600 via-rose-600 to-red-700',
    accent: '#ef4444',
    text: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    ring: 'ring-red-500/30',
    glow: 'rgba(239,68,68,0.35)',
    softBg: 'from-red-500/15 to-rose-500/5',
  },
  education: {
    key: 'education',
    label: 'Education',
    href: '/education',
    description: 'Schools, courses & scholarships',
    icon: GraduationCap,
    gradient: 'from-teal-500 via-cyan-500 to-sky-500',
    accent: '#14b8a6',
    text: 'text-teal-400',
    bg: 'bg-teal-500/10',
    border: 'border-teal-500/30',
    ring: 'ring-teal-500/30',
    glow: 'rgba(20,184,166,0.35)',
    softBg: 'from-teal-500/15 to-sky-500/5',
  },
  marketplace: {
    key: 'marketplace',
    label: 'Marketplace',
    href: '/marketplace',
    description: 'Buy & sell with neighbors',
    icon: ShoppingBag,
    gradient: 'from-cyan-500 via-teal-400 to-cyan-300',
    accent: '#06b6d4',
    text: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
    ring: 'ring-cyan-500/30',
    glow: 'rgba(6,182,212,0.35)',
    softBg: 'from-cyan-500/15 to-teal-400/5',
  },
  government: {
    key: 'government',
    label: 'Gov Services',
    href: '/government',
    description: 'Official services & departments',
    icon: Landmark,
    gradient: 'from-indigo-600 via-blue-700 to-blue-800',
    accent: '#6366f1',
    text: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/30',
    ring: 'ring-indigo-500/30',
    glow: 'rgba(99,102,241,0.35)',
    softBg: 'from-indigo-500/15 to-blue-700/5',
  },
  healthcare: {
    key: 'healthcare',
    label: 'Healthcare',
    href: '/healthcare',
    description: 'Hospitals, doctors & care',
    icon: HeartPulse,
    gradient: 'from-emerald-500 via-green-400 to-teal-300',
    accent: '#10b981',
    text: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    ring: 'ring-green-500/30',
    glow: 'rgba(16,185,129,0.35)',
    softBg: 'from-green-500/15 to-white/5',
  },
  agriculture: {
    key: 'agriculture',
    label: 'Agriculture',
    href: '/agriculture',
    description: 'Crops, schemes & market prices',
    icon: Sprout,
    gradient: 'from-lime-600 via-yellow-700 to-amber-800',
    accent: '#65a30d',
    text: 'text-lime-500',
    bg: 'bg-lime-600/10',
    border: 'border-lime-600/30',
    ring: 'ring-lime-600/30',
    glow: 'rgba(101,163,13,0.35)',
    softBg: 'from-lime-600/15 to-amber-800/5',
  },
  business: {
    key: 'business',
    label: 'Business Directory',
    href: '/business',
    description: 'Local companies & services',
    icon: Building2,
    gradient: 'from-yellow-500 via-amber-500 to-neutral-900',
    accent: '#eab308',
    text: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    ring: 'ring-yellow-500/30',
    glow: 'rgba(234,179,8,0.35)',
    softBg: 'from-yellow-500/15 to-neutral-900/40',
  },
}

/** Ordered list of the navigable portals for grids / nav. */
export const PORTAL_ORDER = [
  'communities', 'jobs', 'events', 'tourism', 'news', 'education',
  'marketplace', 'government', 'healthcare', 'agriculture', 'business',
] as const

export const PORTAL_LIST: PortalTheme[] = PORTAL_ORDER.map((k) => PORTAL_THEMES[k])

export function getTheme(key: string): PortalTheme {
  return PORTAL_THEMES[key] ?? PORTAL_THEMES.dashboard
}
